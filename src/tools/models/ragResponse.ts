import type { ToolPlugin } from "../types";
import RagResponseView from "../views/RagResponseView.vue";
import RagResponsePreview from "../previews/RagResponsePreview.vue";

export interface RagContextItem {
  chunk_id?: string;
  document_id?: string;
  content?: string;
  similarity?: number;
  document_title?: string;
}

export interface RagResponseData {
  text: string;
  docTitles?: string[];
  context?: RagContextItem[];
  transportKind?: string;
  thresholdsTried?: number[];
}

export const plugin: ToolPlugin<RagResponseData> = {
  toolDefinition: {
    name: "rag-response",
    description:
      "Render a RAG response with referenced document titles and matched chunks.",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string" },
        docTitles: {
          type: "array",
          items: { type: "string" },
        },
        context: {
          type: "array",
          items: {
            type: "object",
          },
        },
        thresholdsTried: {
          type: "array",
          items: { type: "number" },
        },
      },
      required: ["text"],
    },
  },
  isEnabled: () => false,
  viewComponent: RagResponseView,
  previewComponent: RagResponsePreview,
  execute: async (_context, args) => ({
    data: args,
    message: args.text,
  }),
};
