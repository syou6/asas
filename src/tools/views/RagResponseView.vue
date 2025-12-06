<template>
  <div class="h-full w-full overflow-y-auto p-6">
    <div class="max-w-4xl mx-auto space-y-4">
      <div class="flex items-center gap-3">
        <span
          class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wide"
        >
          RAG
        </span>
        <span class="text-sm text-gray-600" v-if="docSubtitle">
          {{ docSubtitle }}
        </span>
      </div>

      <div class="rounded-lg border border-amber-200 bg-white shadow-sm p-5">
        <div
          class="markdown-content prose prose-slate max-w-none leading-relaxed text-gray-900"
          v-html="renderedHtml"
        ></div>
        <div v-if="docTitles.length" class="flex flex-wrap gap-2 mt-3">
          <span
            v-for="title in docTitles"
            :key="title"
            class="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 truncate max-w-[220px]"
            :title="title"
          >
            {{ title }}
          </span>
        </div>
      </div>

      <div class="rounded-lg border bg-gray-50 border-gray-200 p-4 space-y-3">
        <div class="flex items-center justify-between text-sm text-gray-700">
          <span class="font-semibold">参照コンテキスト</span>
          <span v-if="thresholdsText" class="text-xs text-gray-500">
            {{ thresholdsText }}
          </span>
        </div>

        <div v-if="!context.length" class="text-sm text-gray-500">
          参照できるドキュメントがありません。
        </div>

        <ul v-else class="space-y-3">
          <li
            v-for="(item, index) in context"
            :key="item.chunk_id ?? item.document_id ?? index"
            class="bg-white border border-gray-200 rounded p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <div class="flex items-center justify-between text-xs text-gray-600">
              <span class="font-semibold text-gray-800">
                [{{ index + 1 }}]
                {{ item.document_title || "無題ドキュメント" }}
              </span>
              <span
                v-if="item.similarity !== undefined"
                class="text-emerald-600"
              >
                sim {{ formatSimilarity(item.similarity) }}
              </span>
            </div>
            <p class="text-sm text-gray-700 whitespace-pre-wrap mt-1">
              {{ item.content }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import type { ToolResultComplete } from "../types";
import type { RagContextItem, RagResponseData } from "../models/ragResponse";

const props = defineProps<{
  selectedResult: ToolResultComplete<RagResponseData>;
}>();

const rawText = computed(
  () =>
    props.selectedResult.data?.text ??
    props.selectedResult.message ??
    "",
);
const renderedHtml = computed(() => marked.parse(rawText.value));
const docTitles = computed(() => props.selectedResult.data?.docTitles ?? []);
const context = computed<RagContextItem[]>(
  () => props.selectedResult.data?.context ?? [],
);
const thresholdsText = computed(() => {
  const thresholds = props.selectedResult.data?.thresholdsTried ?? [];
  return thresholds.length ? `thresholds: ${thresholds.join(" → ")}` : "";
});
const docSubtitle = computed(() => {
  if (!docTitles.value.length) return "参照ドキュメント: なし";
  return `参照ドキュメント: ${docTitles.value.join(", ")}`;
});

function formatSimilarity(value: number): string {
  return value.toFixed(3);
}
</script>

<style scoped>
.markdown-content :deep(p) {
  margin-bottom: 0.85em;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 1.25em;
  margin-bottom: 0.75em;
}

.markdown-content :deep(li) {
  margin-bottom: 0.35em;
}
</style>
