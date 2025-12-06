<template>
  <div
    class="border border-amber-200 bg-amber-50 rounded-md p-3 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
  >
    <div class="flex items-center justify-between text-xs font-semibold">
      <span class="uppercase tracking-wide text-amber-700">RAG</span>
      <span
        v-if="docTitles.length"
        class="text-[11px] text-amber-600"
      >
        {{ docTitles.length }} docs
      </span>
      <span v-else class="text-[11px] text-gray-500">No docs</span>
    </div>
    <p class="text-sm text-gray-800 line-clamp-4 whitespace-pre-wrap">
      {{ previewText }}
    </p>
    <div v-if="docTitles.length" class="flex flex-wrap gap-1">
      <span
        v-for="title in docTitles"
        :key="title"
        class="text-[11px] px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700 truncate max-w-[140px]"
        :title="title"
      >
        {{ title }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ToolResultComplete } from "../types";
import type { RagResponseData } from "../models/ragResponse";

const props = defineProps<{
  result: ToolResultComplete<RagResponseData>;
}>();

const docTitles = computed(() => props.result.data?.docTitles ?? []);
const previewText = computed(
  () => props.result.data?.text ?? props.result.message ?? "",
);
</script>
