<template>
  <slot :on-mouse-up="handleTextSelection" />

  <!-- Selection popup menu -->
  <div
    v-if="showMenu"
    :style="{
      position: 'fixed',
      left: menuPosition.x + 'px',
      top: menuPosition.y + 'px',
      zIndex: 1000,
    }"
    class="bg-white shadow-2xl rounded-lg border-2 border-blue-500 selection-menu"
    @mousedown.stop
  >
    <button
      @click="handleReadAloud"
      class="block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm whitespace-nowrap font-medium text-gray-700 hover:text-blue-600 transition-colors"
    >
      Read aloud
    </button>
    <button
      @click="handleTranslate"
      class="block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm whitespace-nowrap border-t border-gray-200 font-medium text-gray-700 hover:text-blue-600 transition-colors"
    >
      Translate
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  sendTextMessage: (text?: string) => void;
}>();

const showMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const selectedText = ref("");

function handleTextSelection(event: MouseEvent): void {
  // Use setTimeout to let the selection finish before checking
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && selection && selection.rangeCount > 0) {
      selectedText.value = text;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      menuPosition.value = {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 5,
      };
      showMenu.value = true;
    } else {
      // Hide menu if no text is selected
      showMenu.value = false;
    }
  }, 10);
}

function handleGlobalClick(event: MouseEvent): void {
  // Hide menu if clicking outside the menu itself
  const target = event.target as HTMLElement;
  if (showMenu.value && !target.closest(".selection-menu")) {
    showMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleGlobalClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleGlobalClick);
});

function handleReadAloud(): void {
  if (selectedText.value) {
    props.sendTextMessage(
      `Read aloud as-is (no translation): "${selectedText.value}"`,
    );
  }
  showMenu.value = false;
}

function handleTranslate(): void {
  if (selectedText.value) {
    props.sendTextMessage(
      `Translate into my native language: "${selectedText.value}"`,
    );
  }
  showMenu.value = false;
}
</script>
