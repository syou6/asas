import path from "path";
import { randomUUID } from "crypto";
import { getSupabaseClient } from "./supabaseClient";
import { assertSupabaseConfig } from "./config";

export async function uploadDocumentFile(
  fileBuffer: Buffer,
  originalName: string,
  userId: string,
): Promise<{ storagePath: string; sizeBytes: number }> {
  const supabase = getSupabaseClient();
  const { bucket } = assertSupabaseConfig();

  const safeName = path.basename(originalName).replace(/\s+/g, "_");
  const objectPath = `${userId}/${randomUUID()}-${safeName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, fileBuffer, {
      contentType: inferContentType(originalName),
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
  }

  return { storagePath: objectPath, sizeBytes: fileBuffer.byteLength };
}

export async function deleteDocumentFile(storagePath: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { bucket } = assertSupabaseConfig();
  const { error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) {
    throw new Error(`Failed to delete from Supabase Storage: ${error.message}`);
  }
}

function inferContentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    return "text/markdown";
  }
  if (lower.endsWith(".txt")) {
    return "text/plain";
  }
  return "application/octet-stream";
}
