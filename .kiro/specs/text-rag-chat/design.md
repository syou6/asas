# Design Document: Text + RAG Chat

## Overview

MulmoChatにテキストチャットとRAG（Retrieval-Augmented Generation）機能を実装する。ユーザーはMarkdown/テキストドキュメントをアップロードしてナレッジベースを構築し、RAGモードを有効にすることでドキュメントに基づいた回答を得られる。

既存の実装（`server/rag/`、`server/routes/`）を活用し、フロントエンドUIとの統合を完成させる。

## Architecture

```mermaid
graph TB
    subgraph Frontend
        UI[Vue App]
        Toggle[RAG Toggle]
        Upload[Document Upload]
    end
    
    subgraph Backend
        TextAPI[/api/text/generate]
        DocsAPI[/api/docs]
        RagAPI[/api/rag/chat]
        
        subgraph LLM Service
            TextService[textService.ts]
            Providers[OpenAI/Anthropic/Google/Ollama/Grok]
        end
        
        subgraph RAG Service
            Embedding[embedding.ts]
            Repository[repository.ts]
            Storage[storage.ts]
            Markdown[markdown.ts]
        end
    end
    
    subgraph Supabase
        SupaStorage[(Storage Bucket)]
        RagDocs[(rag_documents)]
        RagChunks[(rag_chunks)]
        MatchFunc[match_rag_chunks]
    end
    
    UI --> Toggle
    UI --> Upload
    Toggle -->|RAG OFF| TextAPI
    Toggle -->|RAG ON| RagAPI
    Upload --> DocsAPI
    
    TextAPI --> TextService
    TextService --> Providers
    
    DocsAPI --> Storage
    DocsAPI --> Markdown
    DocsAPI --> Embedding
    DocsAPI --> Repository
    
    RagAPI --> Embedding
    RagAPI --> Repository
    RagAPI --> TextService
    
    Storage --> SupaStorage
    Repository --> RagDocs
    Repository --> RagChunks
    Repository --> MatchFunc
    Embedding -->|OpenAI API| Providers
```

## Components and Interfaces

### 1. Text Chat API (`/api/text/generate`)

既存実装を使用。プロバイダー選択とモデル指定をサポート。

```typescript
interface TextGenerationRequest {
  provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'grok';
  model: string;
  messages: TextMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  tools?: ToolDefinition[];
}

interface TextGenerationResult {
  text: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

### 2. Document Management API (`/api/docs`)

既存実装を使用。アップロード、一覧、削除をサポート。

```typescript
// GET /api/docs
interface ListDocsResponse {
  success: boolean;
  documents: RagDocument[];
}

// POST /api/docs/upload
interface UploadRequest {
  file: File; // multipart/form-data
  userId?: string;
  maxSectionLength?: number;
}

interface UploadResponse {
  success: boolean;
  document: RagDocument & { chunkCount: number };
}

// DELETE /api/docs/:id
interface DeleteResponse {
  success: boolean;
}
```

### 3. RAG Chat API (`/api/rag/chat`)

既存実装を使用。ベクトル検索とコンテキスト付き生成を実行。

```typescript
interface RagChatRequest {
  messages: TextMessage[];
  docIds?: string[];
  topK?: number;
  matchThreshold?: number;
  provider?: TextLLMProviderId;
  model?: string;
}

interface RagChatResponse {
  success: boolean;
  result: TextGenerationResult;
  context: RagMatchResult[];
}
```

### 4. Provider Availability API (`/api/text/providers`)

既存実装を使用。設定済みプロバイダーの一覧を返す。

```typescript
interface ProviderAvailability {
  provider: TextLLMProviderId;
  hasCredentials: boolean;
  defaultModel?: string;
  models?: string[];
}
```

## Data Models

### Supabase Tables

```sql
-- rag_documents: ドキュメントメタデータ
CREATE TABLE rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- rag_chunks: チャンクと埋め込みベクトル
CREATE TABLE rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES rag_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- match_rag_chunks: ベクトル類似度検索関数
CREATE OR REPLACE FUNCTION match_rag_chunks(
  query_embedding vector(1536),
  match_count INT,
  match_threshold FLOAT,
  doc_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT,
  document_title TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity,
    d.title AS document_title
  FROM rag_chunks c
  JOIN rag_documents d ON c.document_id = d.id
  WHERE
    (doc_ids IS NULL OR c.document_id = ANY(doc_ids))
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### TypeScript Types

```typescript
// server/rag/repository.ts
interface RagDocument {
  id: string;
  title: string;
  path: string;
  size_bytes: number;
  user_id: string;
  created_at?: string;
}

interface RagChunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
  created_at?: string;
}

interface RagMatchResult {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  document_title?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following correctness properties are defined:

### Property 1: Text generation returns valid response
*For any* valid text generation request with a configured provider and non-empty messages, the system SHALL return a response containing either text content or tool calls.
**Validates: Requirements 1.1**

### Property 2: Provider selection is respected
*For any* text generation request specifying a provider, the system SHALL route the request to that provider (verifiable via response metadata or mock).
**Validates: Requirements 1.2**

### Property 3: Unsupported file extensions are rejected
*For any* file upload with an extension other than .md, .markdown, or .txt, the system SHALL return an error response with status 400.
**Validates: Requirements 2.3**

### Property 4: Document upload produces stored chunks with embeddings
*For any* valid document upload (.md/.markdown/.txt, ≤15MB, non-empty), the system SHALL create a document record and store chunks with 1536-dimensional embeddings in the database.
**Validates: Requirements 2.4, 2.5**

### Property 5: Document list reflects stored documents
*For any* sequence of document uploads, the GET /api/docs endpoint SHALL return all uploaded documents that have not been deleted.
**Validates: Requirements 3.1**

### Property 6: Document deletion removes all related data
*For any* document deletion request, the system SHALL remove the document from storage, rag_documents, and all associated chunks from rag_chunks.
**Validates: Requirements 3.2**

### Property 7: RAG query flow produces context-enhanced response
*For any* RAG chat request with RAG-enabled and existing documents, the system SHALL:
1. Generate an embedding for the user message
2. Search chunks with similarity threshold 0.5
3. Include matched chunks as context in the LLM prompt
4. Return the response with context references
**Validates: Requirements 5.1, 5.2, 5.4**

### Property 8: RAG fallback threshold on empty results
*For any* RAG chat request where initial search (threshold 0.5) returns zero results, the system SHALL retry with threshold 0.3.
**Validates: Requirements 5.3**

### Property 9: Provider availability reflects API key configuration
*For any* call to /api/text/providers, the hasCredentials field SHALL be true only for providers with valid API keys in environment variables.
**Validates: Requirements 6.5**

### Property 10: RAG response includes source references
*For any* RAG chat request that finds matching chunks, the response SHALL include the context array with document_title for each matched chunk.
**Validates: Requirements 7.5**

### Property 11: Markdown chunking round-trip preserves content
*For any* valid Markdown content, chunking then concatenating the chunks SHALL produce content that contains all original text (modulo whitespace normalization).
**Validates: Requirements 2.4 (parsing correctness)**

## Error Handling

### API Error Responses

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}
```

### Error Categories

| Category | HTTP Status | Example |
|----------|-------------|---------|
| Validation | 400 | Invalid file type, empty content |
| Not Found | 404 | Document not found |
| Configuration | 500 | Missing API key, Supabase not configured |
| External Service | 500 | LLM provider error, embedding API error |

### Error Handling Strategy

1. **Validation errors**: Return immediately with 400 status
2. **Configuration errors**: Check at startup, throw descriptive errors
3. **External service errors**: Wrap in try-catch, return 500 with details
4. **Partial failures**: For document deletion, attempt all steps and report any failures

## Testing Strategy

### Property-Based Testing Library

**fast-check** (TypeScript) を使用。100回以上のイテレーションで各プロパティをテスト。

### Test Structure

```typescript
// Example property test annotation format
/**
 * **Feature: text-rag-chat, Property 3: Unsupported file extensions are rejected**
 * **Validates: Requirements 2.3**
 */
```

### Unit Tests

- API endpoint validation (request parsing, error responses)
- Markdown chunking edge cases (empty content, very long sections)
- Provider availability logic

### Property-Based Tests

Each correctness property above will have a corresponding property-based test:

1. **Property 1**: Generate random valid messages, verify response structure
2. **Property 2**: Generate random provider selections, verify routing
3. **Property 3**: Generate random invalid extensions, verify rejection
4. **Property 4**: Generate random valid documents, verify chunks created
5. **Property 5**: Generate random upload sequences, verify list consistency
6. **Property 6**: Generate random documents, delete, verify cleanup
7. **Property 7**: Generate random queries with documents, verify context flow
8. **Property 8**: Generate queries with no matches, verify fallback
9. **Property 9**: Generate random API key configurations, verify availability
10. **Property 10**: Generate RAG queries, verify source references
11. **Property 11**: Generate random Markdown, verify round-trip

### Integration Tests

- Full upload → query → response flow
- Provider switching during conversation
- RAG toggle behavior

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: ['**/*.test.ts', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```
