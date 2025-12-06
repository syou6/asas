import dotenv from "dotenv";

dotenv.config({ override: true });

export type RagConfig = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  bucket: string;
  embedModel: string;
  ragTopK: number;
  ragMatchThreshold: number;
};

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getRagConfig(): RagConfig {
  return {
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    bucket: process.env.SUPABASE_BUCKET ?? "documents",
    embedModel: process.env.EMBED_MODEL ?? "text-embedding-3-small",
    ragTopK: parseNumber(process.env.RAG_TOP_K, 5),
    ragMatchThreshold: Number.parseFloat(
      process.env.RAG_MATCH_THRESHOLD ?? "0.5",
    ),
  };
}

export function assertSupabaseConfig(): RagConfig {
  const config = getRagConfig();
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error(
      "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return config;
}

export function assertOpenAIConfig(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is required for RAG embeddings and responses.",
    );
  }
}
