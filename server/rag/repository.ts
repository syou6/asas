import { randomUUID } from "crypto";
import { getSupabaseClient } from "./supabaseClient.js";
import { RagSection } from "./markdown.js";

export type RagDocument = {
  id: string;
  title: string;
  path: string;
  size_bytes: number;
  user_id: string;
  created_at?: string;
};

export type RagChunk = {
  id: string;
  document_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
  created_at?: string;
};

export type RagMatchResult = {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  document_title?: string;
};

const DOCUMENTS_TABLE = "rag_documents";
const CHUNKS_TABLE = "rag_chunks";
const MATCH_FUNCTION = "match_rag_chunks";

export async function createDocumentRecord(
  title: string,
  path: string,
  sizeBytes: number,
  userId: string,
): Promise<RagDocument> {
  const supabase = getSupabaseClient();
  const id = randomUUID();

  const { data, error } = await supabase
    .from(DOCUMENTS_TABLE)
    .insert({
      id,
      title,
      path,
      size_bytes: sizeBytes,
      user_id: userId,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to create document record: ${error?.message ?? "unknown error"}`,
    );
  }

  return data as RagDocument;
}

export async function insertChunksForDocument(
  documentId: string,
  sections: RagSection[],
  embeddings: number[][],
): Promise<number> {
  if (sections.length !== embeddings.length) {
    throw new Error(
      `Sections (${sections.length}) and embeddings (${embeddings.length}) length mismatch`,
    );
  }

  const supabase = getSupabaseClient();
  const payload: RagChunk[] = sections.map((section, index) => ({
    id: randomUUID(),
    document_id: documentId,
    content: section.content,
    embedding: embeddings[index],
    chunk_index: index,
  }));

  const { error } = await supabase.from(CHUNKS_TABLE).insert(payload);

  if (error) {
    throw new Error(
      `Failed to insert document chunks: ${error.message ?? "unknown error"}`,
    );
  }

  return payload.length;
}

export async function listDocuments(userId?: string): Promise<RagDocument[]> {
  const supabase = getSupabaseClient();
  const query = supabase.from(DOCUMENTS_TABLE).select().order("created_at", {
    ascending: false,
  });

  if (userId) {
    query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error || !data) {
    throw new Error(
      `Failed to fetch documents: ${error?.message ?? "unknown error"}`,
    );
  }

  return data as RagDocument[];
}

export async function getDocumentById(
  documentId: string,
): Promise<RagDocument | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(DOCUMENTS_TABLE)
    .select()
    .eq("id", documentId)
    .single();

  if (error) {
    if (
      error.code === "PGRST116" ||
      error.code === "PGRST123" ||
      error.message?.toLowerCase().includes("0 rows")
    ) {
      return null;
    }
    throw new Error(
      `Failed to fetch document: ${error.message ?? "unknown error"}`,
    );
  }

  return data as RagDocument;
}

export async function deleteDocumentRecord(documentId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(DOCUMENTS_TABLE)
    .delete()
    .eq("id", documentId);

  if (error) {
    throw new Error(
      `Failed to delete document: ${error.message ?? "unknown error"}`,
    );
  }
}

export async function deleteChunksForDocument(
  documentId: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(CHUNKS_TABLE)
    .delete()
    .eq("document_id", documentId);

  if (error) {
    throw new Error(
      `Failed to delete document chunks: ${error.message ?? "unknown error"}`,
    );
  }
}

export async function matchChunks(
  embedding: number[],
  topK: number,
  matchThreshold: number,
  docIds?: string[],
): Promise<RagMatchResult[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc(MATCH_FUNCTION, {
    query_embedding: embedding,
    match_count: topK,
    match_threshold: matchThreshold,
    doc_ids: docIds ?? null,
  });

  if (error) {
    throw new Error(
      `Failed to run vector search: ${error.message ?? "unknown error"}`,
    );
  }

  return (data ?? []) as RagMatchResult[];
}
