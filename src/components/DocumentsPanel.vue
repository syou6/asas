<template>
  <div class="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-end">
    <div
      class="w-full max-w-xl h-full bg-white shadow-xl border-l flex flex-col"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <div class="flex flex-col">
          <h2 class="text-lg font-semibold">ドキュメント</h2>
          <p class="text-sm text-gray-500">
            Markdown/TXT をアップロードして Supabase に埋め込み保存します。
          </p>
        </div>
        <button
          class="text-gray-500 hover:text-gray-800"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="p-4 space-y-4 overflow-y-auto flex-1">
        <div class="border rounded-lg p-4 space-y-3 bg-gray-50">
          <label class="text-sm font-medium text-gray-700">ファイルをアップロード</label>
          <input
            ref="fileInput"
            type="file"
            accept=".md,.markdown,.txt"
            class="block w-full text-sm text-gray-700"
            @change="handleUpload"
          />
          <p class="text-xs text-gray-500">
            API: /api/docs/upload → Supabase Storage + Embeddings
          </p>
          <p v-if="uploadError" class="text-xs text-red-600">
            {{ uploadError }}
          </p>
          <p v-if="uploading" class="text-xs text-blue-600">
            アップロードと埋め込みを実行中...
          </p>
        </div>

        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-800">保存済みドキュメント</h3>
          <button
            class="text-sm text-blue-600 hover:text-blue-800"
            @click="fetchDocuments"
          >
            再読み込み
          </button>
        </div>

        <div v-if="loadError" class="text-sm text-red-600">
          {{ loadError }}
        </div>

        <div v-if="loading && documents.length === 0" class="text-sm text-gray-500">
          読み込み中...
        </div>

        <div
          v-if="!loading && documents.length === 0 && !loadError"
          class="text-sm text-gray-500"
        >
          ドキュメントがありません。
        </div>

        <ul class="space-y-3">
          <li
            v-for="doc in documents"
            :key="doc.id"
            class="border rounded-md p-3 flex items-start justify-between gap-3"
          >
            <div class="space-y-1">
              <div class="font-medium text-gray-900 truncate">
                {{ doc.title }}
              </div>
              <div class="text-xs text-gray-500">
                {{ formatBytes(doc.size_bytes) }} ·
                {{ formatDate(doc.created_at) }}
              </div>
              <div class="text-xs text-gray-500 break-all">
                {{ doc.path }}
              </div>
            </div>
            <button
              class="text-xs text-red-600 hover:text-red-800"
              @click="handleDelete(doc.id)"
              :disabled="deletingId === doc.id"
            >
              {{ deletingId === doc.id ? "削除中..." : "削除" }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();

type RagDocument = {
  id: string;
  title: string;
  path: string;
  size_bytes: number;
  user_id: string;
  created_at?: string;
};

const documents = ref<RagDocument[]>([]);
const loading = ref(false);
const loadError = ref<string | null>(null);
const uploading = ref(false);
const uploadError = ref<string | null>(null);
const deletingId = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const DEFAULT_TIMEOUT_MS = 30000;
const UPLOAD_TIMEOUT_MS = 60000;

async function fetchDocuments(): Promise<void> {
  loading.value = true;
  loadError.value = null;
  try {
    const response = await fetchWithTimeout("/api/docs", undefined, DEFAULT_TIMEOUT_MS);
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const body = (await response.json()) as {
      success: boolean;
      documents: RagDocument[];
      error?: string;
    };
    if (!body.success) {
      throw new Error(body.error ?? "Failed to fetch documents");
    }
    documents.value = body.documents;
  } catch (error: unknown) {
    loadError.value = formatErrorMessage(error, "ドキュメントの取得に失敗しました");
  } finally {
    loading.value = false;
  }
}

async function handleUpload(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploading.value = true;
  uploadError.value = null;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchWithTimeout(
      "/api/docs/upload",
      {
        method: "POST",
        body: formData,
      },
      UPLOAD_TIMEOUT_MS,
    );

    const isJsonResponse = response.headers
      .get("content-type")
      ?.includes("application/json");

    if (!response.ok) {
      if (isJsonResponse) {
        const errorBody = (await response.json()) as {
          error?: string;
          details?: string;
        };
        throw new Error(errorBody.error ?? errorBody.details ?? "Upload failed");
      }
      throw new Error(await response.text());
    }

    const body = (await response.json()) as {
      success: boolean;
      error?: string;
    };

    if (!body.success) {
      throw new Error(body.error ?? "Upload failed");
    }

    // refresh list
    await fetchDocuments();
  } catch (error: unknown) {
    uploadError.value = formatErrorMessage(error, "アップロードに失敗しました");
  } finally {
    uploading.value = false;
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
}

async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function formatErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  if (error.name === "AbortError") {
    return "タイムアウトしました。ネットワークや Supabase 設定を確認してください。";
  }
  if (error.message.includes("Supabase is not configured")) {
    return "Supabase の設定が不足しています（SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を確認）。";
  }
  return error.message || fallback;
}

async function handleDelete(id: string): Promise<void> {
  deletingId.value = id;
  try {
    const response = await fetch(`/api/docs/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const body = (await response.json()) as { success: boolean; error?: string };
    if (!body.success) {
      throw new Error(body.error ?? "Delete failed");
    }
    documents.value = documents.value.filter((doc) => doc.id !== id);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Delete failed";
    loadError.value = message;
  } finally {
    deletingId.value = null;
  }
}

function formatBytes(bytes: number | undefined): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** idx;
  return `${value.toFixed(1)} ${units[idx]}`;
}

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

onMounted(fetchDocuments);
</script>
