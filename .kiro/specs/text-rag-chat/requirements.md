# Requirements Document

## Introduction

MulmoChatにおけるテキストチャット＋RAG（Retrieval-Augmented Generation）機能の要件定義書。ユーザーがアップロードしたドキュメント（Markdown/テキスト）を検索可能なナレッジベースとして活用し、コンテキストに基づいた回答を生成するシステムを構築する。音声リアルタイムや画像生成などの高コスト機能はデモ時のみ有効とし、常設機能としてはテキストチャットとRAGに絞る。

## Glossary

- **RAG (Retrieval-Augmented Generation)**: ユーザーの質問に対し、関連ドキュメントを検索してコンテキストとして付与し、LLMで回答を生成する手法
- **Chunk**: ドキュメントを分割した単位。埋め込みベクトル生成と検索の基本単位
- **Embedding**: テキストを数値ベクトルに変換したもの。意味的類似度の計算に使用
- **Supabase**: PostgreSQLベースのBaaS。Storage（ファイル保存）とDB（ベクトル検索）を提供
- **text-embedding-3-small**: OpenAIの埋め込みモデル。1536次元のベクトルを生成
- **gpt-4o-mini**: OpenAIの軽量LLMモデル。コスト効率が高い
- **match_rag_chunks**: Supabase上のベクトル類似度検索関数

## Requirements

### Requirement 1

**User Story:** As a user, I want to send text messages and receive AI-generated responses, so that I can have conversations without using voice features.

#### Acceptance Criteria

1. WHEN a user submits a text message THEN the Text_Chat_System SHALL send the message to the configured LLM provider and display the generated response
2. WHEN a user selects a different LLM provider THEN the Text_Chat_System SHALL use the selected provider for subsequent message generation
3. WHEN the LLM provider returns an error THEN the Text_Chat_System SHALL display an error message to the user and maintain the conversation state
4. WHEN the system starts THEN the Text_Chat_System SHALL default to gpt-4o-mini as the LLM model

### Requirement 2

**User Story:** As a user, I want to upload documents to build a knowledge base, so that the AI can reference my documents when answering questions.

#### Acceptance Criteria

1. WHEN a user uploads a document with .md, .markdown, or .txt extension THEN the Document_Upload_System SHALL accept the file and store it in Supabase Storage
2. WHEN a user uploads a file exceeding 15MB THEN the Document_Upload_System SHALL reject the upload and display a file size error message
3. WHEN a user uploads a file with an unsupported extension THEN the Document_Upload_System SHALL reject the upload and display a file type error message
4. WHEN a document is successfully uploaded THEN the Document_Upload_System SHALL split the document into chunks and generate embeddings using text-embedding-3-small
5. WHEN chunk embeddings are generated THEN the Document_Upload_System SHALL store the chunks and embeddings in the rag_chunks table

### Requirement 3

**User Story:** As a user, I want to manage my uploaded documents, so that I can view and delete documents from my knowledge base.

#### Acceptance Criteria

1. WHEN a user requests the document list THEN the Document_Management_System SHALL return all documents stored in rag_documents table
2. WHEN a user deletes a document THEN the Document_Management_System SHALL remove the document from Supabase Storage, rag_documents table, and all associated chunks from rag_chunks table
3. WHEN a document deletion fails THEN the Document_Management_System SHALL display an error message and maintain the document in its current state

### Requirement 4

**User Story:** As a user, I want to toggle RAG mode on or off, so that I can choose whether to use my knowledge base for answers.

#### Acceptance Criteria

1. WHEN a user enables the RAG toggle THEN the RAG_System SHALL use document search for subsequent queries
2. WHEN a user disables the RAG toggle THEN the RAG_System SHALL generate responses without document search
3. WHEN the RAG toggle state changes THEN the UI SHALL visually indicate the current RAG mode status

### Requirement 5

**User Story:** As a user, I want the AI to search my documents and provide contextual answers, so that I get accurate responses based on my knowledge base.

#### Acceptance Criteria

1. WHEN a user sends a message with RAG enabled THEN the RAG_Chat_System SHALL generate an embedding for the user message using text-embedding-3-small
2. WHEN the user message embedding is generated THEN the RAG_Chat_System SHALL search rag_chunks using match_rag_chunks function with similarity threshold 0.5
3. WHEN the initial search returns zero results THEN the RAG_Chat_System SHALL retry with similarity threshold 0.3
4. WHEN relevant chunks are found THEN the RAG_Chat_System SHALL include the chunk content as context in the LLM prompt
5. WHEN the RAG response is generated THEN the UI SHALL display the response with a "RAG" indicator and list the referenced document names

### Requirement 6

**User Story:** As a system administrator, I want to control which features are available based on API keys, so that I can manage costs and feature availability.

#### Acceptance Criteria

1. WHEN the server starts without OPENAI_API_KEY THEN the System SHALL disable text generation and RAG features
2. WHEN the server starts without GEMINI_API_KEY THEN the System SHALL disable image generation and editing features
3. WHEN the server starts without EXA_API_KEY THEN the System SHALL disable Exa search features
4. WHEN the server starts without GOOGLE_MAP_API_KEY THEN the System SHALL disable map features
5. WHEN the /api/text/providers endpoint is called THEN the System SHALL return only providers with valid API keys configured

### Requirement 7

**User Story:** As a developer, I want clear API endpoints for text and RAG operations, so that the frontend can reliably communicate with the backend.

#### Acceptance Criteria

1. WHEN the /api/text/generate endpoint receives a valid request THEN the API SHALL return a generated text response within 30 seconds
2. WHEN the /api/docs endpoint receives a GET request THEN the API SHALL return the list of uploaded documents
3. WHEN the /api/docs endpoint receives a POST request with a valid file THEN the API SHALL process the upload and return success status
4. WHEN the /api/docs endpoint receives a DELETE request with a valid document ID THEN the API SHALL delete the document and return success status
5. WHEN the /api/rag/chat endpoint receives a valid request THEN the API SHALL return a RAG-enhanced response with source references

### Requirement 8

**User Story:** As a user, I want the UI to clearly show RAG-related information, so that I understand when and how my documents are being used.

#### Acceptance Criteria

1. WHEN a RAG response is displayed THEN the UI SHALL show a distinct "RAG" card style differentiating it from regular responses
2. WHEN a RAG response includes document references THEN the UI SHALL display the names of referenced documents
3. WHEN the RAG toggle is visible THEN the UI SHALL display it as a link icon in the top-right area of the interface
4. WHEN the document upload button is visible THEN the UI SHALL display it as a folder icon in the top-right area of the interface
