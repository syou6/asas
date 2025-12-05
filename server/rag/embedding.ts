import { assertOpenAIConfig, getRagConfig } from "./config";

type EmbeddingResponse = {
  data: Array<{
    embedding: number[];
  }>;
};

export async function embedTexts(
  texts: string[],
  modelOverride?: string,
): Promise<number[][]> {
  assertOpenAIConfig();
  const trimmed = texts.map((text) => text.trim()).filter(Boolean);
  if (trimmed.length === 0) {
    throw new Error("No text provided for embedding.");
  }

  const { embedModel } = getRagConfig();
  const model = modelOverride ?? embedModel;
  const apiKey = process.env.OPENAI_API_KEY as string;

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: trimmed,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI embedding error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const body = (await response.json()) as EmbeddingResponse;
  return body.data.map((item) => item.embedding);
}
