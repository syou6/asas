import { Router, Request, Response } from "express";
import multer from "multer";
import { assertSupabaseConfig, assertOpenAIConfig } from "../rag/config";
import { chunkContent } from "../rag/markdown";
import {
  createDocumentRecord,
  deleteDocumentRecord,
  getDocumentById,
  insertChunksForDocument,
  listDocuments,
} from "../rag/repository";
import { deleteDocumentFile, uploadDocumentFile } from "../rag/storage";
import { embedTexts } from "../rag/embedding";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

router.get("/docs", async (req: Request, res: Response) => {
  try {
    assertSupabaseConfig();
    const userId =
      typeof req.query.userId === "string"
        ? req.query.userId
        : undefined;

    const documents = await listDocuments(userId);
    res.json({ success: true, documents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

router.post(
  "/docs/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      assertSupabaseConfig();
      assertOpenAIConfig();

      if (!req.file) {
        res.status(400).json({ success: false, error: "file is required" });
        return;
      }

      const userId =
        typeof req.body?.userId === "string" && req.body.userId.trim()
          ? req.body.userId.trim()
          : "anonymous";

      const originalName = req.file.originalname || "document.txt";
      if (!isAcceptedFile(originalName)) {
        res.status(400).json({
          success: false,
          error: "Only .md, .markdown, .txt files are supported for now.",
        });
        return;
      }

      const textContent = req.file.buffer.toString("utf-8");
      if (!textContent.trim()) {
        res.status(400).json({
          success: false,
          error: "Uploaded file is empty.",
        });
        return;
      }

      const maxSectionLength =
        typeof req.body?.maxSectionLength === "string"
          ? Number.parseInt(req.body.maxSectionLength, 10)
          : undefined;

      const sections = chunkContent(
        textContent,
        originalName,
        maxSectionLength,
      );

      if (sections.length === 0) {
        res.status(400).json({
          success: false,
          error: "No content found after processing the file.",
        });
        return;
      }

      const { storagePath, sizeBytes } = await uploadDocumentFile(
        req.file.buffer,
        originalName,
        userId,
      );

      const document = await createDocumentRecord(
        originalName,
        storagePath,
        sizeBytes,
        userId,
      );

      const embeddings = await embedTexts(sections.map((s) => s.content));
      const chunkCount = await insertChunksForDocument(
        document.id,
        sections,
        embeddings,
      );

      res.status(201).json({
        success: true,
        document: { ...document, chunkCount },
      });
    } catch (error: unknown) {
      console.error("docs/upload failed", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: "Failed to upload document",
        details: message,
      });
    }
  },
);

router.delete(
  "/docs/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      assertSupabaseConfig();
      const documentId = req.params.id;
      const document = await getDocumentById(documentId);

      if (!document) {
        res.status(404).json({ success: false, error: "Document not found" });
        return;
      }

      await deleteDocumentFile(document.path);
      await deleteDocumentRecord(documentId);

      res.json({ success: true });
    } catch (error: unknown) {
      console.error("docs delete failed", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: "Failed to delete document",
        details: message,
      });
    }
  },
);

function isAcceptedFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    lower.endsWith(".md") ||
    lower.endsWith(".markdown") ||
    lower.endsWith(".txt")
  );
}

export default router;
