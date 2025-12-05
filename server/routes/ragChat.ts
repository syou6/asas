import { Router, Request, Response } from "express";
import { embedTexts } from "../rag/embedding";
import { matchChunks, RagMatchResult } from "../rag/repository";
import {
  assertOpenAIConfig,
  assertSupabaseConfig,
  getRagConfig,
} from "../rag/config";
import {
  TextGenerationError,
  TextGenerationRequest,
  TextMessage,
  TextLLMProviderId,
} from "../llm/types";
import { generateText } from "../llm/textService";

const router = Router();

router.post("/rag/chat", async (req: Request, res: Response) => {
  try {
    assertSupabaseConfig();
    assertOpenAIConfig();

    const {
      messages,
      docIds,
      topK,
      matchThreshold,
      provider,
      model,
    } = req.body as {
      messages: unknown;
      docIds?: unknown;
      topK?: unknown;
      matchThreshold?: unknown;
      provider?: unknown;
      model?: unknown;
    };

    const parsedMessages = parseMessages(messages);
    const lastUserMessage = findLastUserMessage(parsedMessages);
    if (!lastUserMessage) {
      throw new TextGenerationError(
        "At least one user message is required to run RAG.",
        400,
      );
    }

    const { ragTopK, ragMatchThreshold } = getRagConfig();
    const effectiveTopK =
      typeof topK === "number" && Number.isFinite(topK) ? topK : ragTopK;
    const effectiveThreshold =
      typeof matchThreshold === "number" && Number.isFinite(matchThreshold)
        ? matchThreshold
        : ragMatchThreshold;

    const embedding = (await embedTexts([lastUserMessage.content]))[0];

    const matchedChunks = await matchChunks(
      embedding,
      effectiveTopK,
      effectiveThreshold,
      parseDocIds(docIds),
    );

    const augmentedMessages = buildMessagesWithContext(
      parsedMessages,
      matchedChunks,
    );

    const providerId = isProviderId(provider) ? provider : "openai";
    const modelId =
      typeof model === "string" && model.trim() ? model.trim() : "gpt-4o-mini";

    const requestPayload: TextGenerationRequest = {
      provider: providerId,
      model: modelId,
      messages: augmentedMessages,
    };

    const result = await generateText(requestPayload);

    res.json({
      success: true,
      result,
      context: matchedChunks,
    });
  } catch (error: unknown) {
    if (error instanceof TextGenerationError) {
      res.status(error.statusCode ?? 400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: "Failed to run RAG chat",
      details: message,
    });
  }
});

function parseDocIds(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function isProviderId(value: unknown): value is TextLLMProviderId {
  return (
    value === "openai" ||
    value === "anthropic" ||
    value === "google" ||
    value === "ollama" ||
    value === "grok"
  );
}

function parseMessages(value: unknown): TextMessage[] {
  if (!Array.isArray(value)) {
    throw new TextGenerationError("messages must be an array", 400);
  }

  return value.map((message, index) => {
    if (!message || typeof message !== "object") {
      throw new TextGenerationError(
        `messages[${index}] must be an object`,
        400,
      );
    }

    const role = (message as { role?: unknown }).role;
    const content = (message as { content?: unknown }).content;

    if (typeof role !== "string" || typeof content !== "string") {
      throw new TextGenerationError(
        `messages[${index}] must include string role and content`,
        400,
      );
    }

    if (
      role !== "system" &&
      role !== "user" &&
      role !== "assistant" &&
      role !== "tool"
    ) {
      throw new TextGenerationError(
        `Unsupported message role: ${role}`,
        400,
      );
    }

    return {
      role: role as TextMessage["role"],
      content,
    };
  });
}

function findLastUserMessage(messages: TextMessage[]): TextMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user" && messages[i].content.trim()) {
      return messages[i];
    }
  }
  return undefined;
}

function buildMessagesWithContext(
  messages: TextMessage[],
  matchedChunks: RagMatchResult[],
): TextMessage[] {
  const contextText =
    matchedChunks.length > 0
      ? matchedChunks
          .map((match, index) => {
            const title = match.document_title
              ? ` (${match.document_title})`
              : "";
            return `[${index + 1}${title}] ${match.content}`;
          })
          .join("\n\n")
      : "No matching documents were found.";

  const systemPrompt = `You are a helpful assistant that answers using the provided document context.
Use only the supplied context blocks. If the context does not contain an answer, say you could not find relevant information.
Context:
${contextText}`;

  return [
    {
      role: "system" as const,
      content: systemPrompt,
    },
    ...messages,
  ];
}

export default router;
