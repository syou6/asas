<template>
  <div class="p-4 space-y-4">
    <div role="toolbar" class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">
        MulmoChat
        <span class="text-sm text-gray-500 font-normal">{{ statusLine }}</span>
      </h1>
      <div class="flex gap-2">
        <button
          @click="toggleDocumentsPanel"
          class="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center justify-center transition-colors"
          :title="documentsVisible ? 'ドキュメントを隠す' : 'ドキュメント管理（RAG）'"
        >
          <span class="material-icons text-base">
            {{ documentsVisible ? "folder_open" : "folder" }}
          </span>
        </button>
        <button
          @click="ragEnabled = !ragEnabled"
          :disabled="!!ragDisabledReason"
          :class="
            ragDisabledReason
              ? 'px-2 py-1 bg-gray-100 text-gray-400 rounded border border-gray-200 flex items-center justify-center transition-colors cursor-not-allowed'
              : ragEnabled
                ? 'px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border border-blue-300 flex items-center justify-center transition-colors'
                : 'px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center justify-center transition-colors'
          "
          :title="
            ragDisabledReason
              ? ragDisabledReason
              : ragEnabled
                ? 'RAG モードオン（テキストはドキュメントを利用）'
                : 'RAG モードオフ'
          "
        >
          <span class="material-icons text-base">
            {{ ragEnabled ? "link" : "link_off" }}
          </span>
        </button>
        <button
          @click="toggleSidebar"
          class="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center justify-center transition-colors"
          :title="sidebarVisible ? 'サイドバーを隠す' : 'サイドバーを表示'"
        >
          <span class="material-icons text-base">{{
            sidebarVisible ? "menu_open" : "menu"
          }}</span>
        </button>
        <button
          @click="toggleRightSidebar"
          :class="
            rightSidebarVisible
              ? 'px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border border-blue-300 flex items-center justify-center transition-colors'
              : 'px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center justify-center transition-colors'
          "
          :title="rightSidebarVisible ? 'デバッグパネルを隠す' : 'デバッグパネルを表示'"
        >
          <span class="material-icons text-base">build</span>
        </button>
      </div>
    </div>

    <!-- Main content area with sidebar -->
    <div class="flex space-x-4" style="height: calc(100vh - 80px)">
      <Sidebar
        v-if="sidebarVisible"
        ref="sidebarRef"
        :chat-active="!!chatActive"
        :connecting="!!connecting"
        :plugin-results="toolResults"
        :is-generating-image="!!isGeneratingImage"
        :generating-message="generatingMessage"
        :selected-result="selectedResult"
        :user-input="userInput"
        :is-muted="!!isMuted"
        :user-language="userPreferences.userLanguage"
        :suppress-instructions="userPreferences.suppressInstructions"
        :role-id="userPreferences.roleId"
        :is-conversation-active="!!conversationActive"
        :enabled-plugins="userPreferences.enabledPlugins"
        :custom-instructions="userPreferences.customInstructions"
        :model-id="userPreferences.modelId"
        :model-kind="userPreferences.modelKind"
        :text-model-id="userPreferences.textModelId"
        :text-model-options="textModelOptions"
        :supports-audio-input="!!supportsAudioInput"
        :supports-audio-output="!!supportsAudioOutput"
        :plugin-configs="userPreferences.pluginConfigs"
        :text-send-disabled-reason="textSendDisabledReason"
        @start-chat="startChat"
        @stop-chat="stopChat"
        @set-mute="setMute"
        @select-result="handleSelectResult"
        @send-text-message="sendTextMessage($event)"
        @clear-results="clearResults"
        @update:user-input="userInput = $event"
        @update:user-language="userPreferences.userLanguage = $event"
        @update:suppress-instructions="
          userPreferences.suppressInstructions = $event
        "
        @update:role-id="userPreferences.roleId = $event"
        @update:enabled-plugins="userPreferences.enabledPlugins = $event"
        @update:custom-instructions="
          userPreferences.customInstructions = $event
        "
        @update:model-id="userPreferences.modelId = $event"
        @update:model-kind="userPreferences.modelKind = $event"
        @update:text-model-id="userPreferences.textModelId = $event"
        @update:plugin-configs="userPreferences.pluginConfigs = $event"
        @upload-files="handleUploadFiles"
      />

      <!-- Main content -->
      <div class="flex-1 flex flex-col">
        <div class="flex-1 border rounded bg-gray-50 overflow-hidden">
          <component
            v-if="selectedViewComponent && selectedResult"
            :is="selectedViewComponent"
            :key="selectedResult.uuid"
            :selected-result="selectedResult"
            :send-text-message="sendTextMessage"
            :google-map-key="startResponse?.googleMapKey || null"
            :set-mute="setMute"
            @update-result="handleUpdateResult"
          />
          <div
            v-if="!selectedResult"
            class="w-full h-full flex items-center justify-center"
          >
            <div class="text-gray-400 text-lg">キャンバス</div>
          </div>
        </div>
      </div>

      <!-- Right sidebar for debugging -->
      <RightSidebar
        v-if="rightSidebarVisible"
        ref="rightSidebarRef"
        :tool-call-history="toolCallHistory"
      />

      <DocumentsPanel
        v-if="documentsVisible"
        @close="documentsVisible = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { toolExecute, getToolPlugin } from "./tools";
import type { ToolResult } from "./tools";
import Sidebar from "./components/Sidebar.vue";
import RightSidebar from "./components/RightSidebar.vue";
import DocumentsPanel from "./components/DocumentsPanel.vue";
import { useSessionTransport } from "./composables/useSessionTransport";
import { useUserPreferences } from "./composables/useUserPreferences";
import { useToolResults } from "./composables/useToolResults";
import { useScrolling } from "./composables/useScrolling";
import { SESSION_CONFIG } from "./config/session";
import { DEFAULT_TEXT_MODEL, resolveTextModelId } from "./config/textModels";
import {
  DEFAULT_GOOGLE_LIVE_MODEL_ID,
  GOOGLE_LIVE_MODELS,
  REALTIME_MODELS,
} from "./config/models";
import { getRole } from "./config/roles";
import { getLanguageName } from "./config/languages";
import type { TextProvidersResponse } from "../server/types";
import { generateUUID } from "./utils/uuid";

const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null);
const rightSidebarRef = ref<InstanceType<typeof RightSidebar> | null>(null);
const preferences = useUserPreferences();
const {
  state: userPreferences,
  buildInstructions: buildPreferenceInstructions,
  buildTools: buildPreferenceTools,
} = preferences;

async function sleep(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const messages = ref<string[]>([]);
const currentText = ref("");
const userInput = ref("");

// Sidebar visibility state (persisted to localStorage)
const SIDEBAR_VISIBLE_KEY = "sidebar_visible_v1";
const sidebarVisible = ref<boolean>(
  localStorage.getItem(SIDEBAR_VISIBLE_KEY) !== "false",
);

const documentsVisible = ref<boolean>(false);

function toggleSidebar(): void {
  sidebarVisible.value = !sidebarVisible.value;
  localStorage.setItem(
    SIDEBAR_VISIBLE_KEY,
    sidebarVisible.value ? "true" : "false",
  );
}

function toggleDocumentsPanel(): void {
  documentsVisible.value = !documentsVisible.value;
}

// Right sidebar (debug panel) visibility state (persisted to localStorage)
const RIGHT_SIDEBAR_VISIBLE_KEY = "right_sidebar_visible_v1";
const rightSidebarVisible = ref<boolean>(
  localStorage.getItem(RIGHT_SIDEBAR_VISIBLE_KEY) === "true",
);

function toggleRightSidebar(): void {
  rightSidebarVisible.value = !rightSidebarVisible.value;
  localStorage.setItem(
    RIGHT_SIDEBAR_VISIBLE_KEY,
    rightSidebarVisible.value ? "true" : "false",
  );
}

// Tool call history for debugging
interface ToolCallHistoryItem {
  toolName: string;
  args: any;
  timestamp: number;
  result?: ToolResult;
  error?: string;
}

const toolCallHistory = ref<ToolCallHistoryItem[]>([]);

function addToolCallToHistory(toolName: string, args: any): void {
  toolCallHistory.value.push({
    toolName,
    args,
    timestamp: Date.now(),
  });
  // Auto-scroll right sidebar to bottom when new item added
  setTimeout(() => {
    rightSidebarRef.value?.scrollToBottom();
  }, 100);
}

function updateToolCallResult(toolName: string, result: ToolResult): void {
  // Find the most recent call with this tool name that doesn't have a result
  for (let i = toolCallHistory.value.length - 1; i >= 0; i--) {
    if (
      toolCallHistory.value[i].toolName === toolName &&
      !toolCallHistory.value[i].result
    ) {
      toolCallHistory.value[i].result = result;
      break;
    }
  }
}

interface TextModelOption {
  id: string;
  label: string;
  disabled?: boolean;
}

type TextMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const textModelOptions = ref<TextModelOption[]>([
  {
    id: DEFAULT_TEXT_MODEL.rawId,
    label: "OpenAI — gpt-4o-mini（デフォルト）",
  },
]);
const textSendDisabledReason = ref<string | null>(null);
const ragDisabledReason = ref<string | null>(null);

const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google Gemini",
  ollama: "Ollama",
  grok: "xAI Grok",
};

const scrolling = useScrolling({
  sidebarRef: () => sidebarRef.value,
});

const transportKind = computed(() => userPreferences.modelKind);
const ragEnabled = ref(false);
const ragHistory = ref<TextMessage[]>([]);

const session = useSessionTransport({
  transportKind,
  buildInstructions: (context) => buildPreferenceInstructions(context),
  buildTools: (context) => buildPreferenceTools(context),
  getModelId: () => {
    if (userPreferences.modelKind === "voice-realtime") {
      return userPreferences.modelId;
    }
    if (userPreferences.modelKind === "voice-google-live") {
      // Check if current modelId is a valid Google model
      const isValidGoogleModel = GOOGLE_LIVE_MODELS.some(
        (m) => m.id === userPreferences.modelId,
      );
      return isValidGoogleModel
        ? userPreferences.modelId
        : DEFAULT_GOOGLE_LIVE_MODEL_ID;
    }
    return userPreferences.textModelId;
  },
});

const {
  chatActive,
  conversationActive,
  connecting,
  isMuted,
  startResponse,
  isDataChannelOpen,
  startChat: startTransportChat,
  stopChat: stopTransportChat,
  sendUserMessage: sendUserMessageInternal,
  sendFunctionCallOutput,
  sendInstructions,
  setMute: sessionSetMute,
  setLocalAudioEnabled,
  attachRemoteAudioElement,
  registerEventHandlers,
  capabilities,
} = session;

const supportsAudioInput = computed(
  () => Boolean(capabilities.value.supportsAudioInput),
);
const supportsAudioOutput = computed(
  () => Boolean(capabilities.value.supportsAudioOutput),
);

// Status line showing Model / Mode / Language
const statusLine = computed(() => {
  // Get model name
  let modelName = "不明";
  if (userPreferences.modelKind === "voice-realtime") {
    const model = REALTIME_MODELS.find((m) => m.id === userPreferences.modelId);
    const label = model?.label || "GPT Realtime";
    modelName = `音声 / ${label}`;
  } else if (userPreferences.modelKind === "voice-google-live") {
    const model = GOOGLE_LIVE_MODELS.find(
      (m) => m.id === userPreferences.modelId,
    );
    const label = model?.label || "Gemini Live";
    modelName = `音声 / ${label}`;
  } else if (userPreferences.modelKind === "text-rest") {
    if (textSendDisabledReason.value) {
      modelName = "テキスト / 無効（APIキー未設定）";
    } else {
      // For text models, extract the model name from textModelId
      const textModelId = userPreferences.textModelId;
      if (textModelId) {
        const parts = textModelId.split(":");
        if (parts.length === 2) {
          const provider = parts[0];
          const model = parts[1];
          const providerLabel = PROVIDER_LABELS[provider] || provider;
          modelName = `テキスト / ${providerLabel} ${model}`;
        } else {
          // Handle case where textModelId doesn't have the expected format
          modelName = `テキスト / ${textModelId}`;
        }
      } else {
        modelName = "テキストモード";
      }
    }
  }

  // Get role name
  const role = getRole(userPreferences.roleId);
  const roleName = role.name;

  // Get language name
  const languageName = getLanguageName(userPreferences.userLanguage);

  return `${modelName} / ${roleName} / ${languageName}`;
});

async function loadTextProviders(): Promise<void> {
  try {
    const response = await fetch("/api/text/providers");
    if (!response.ok) {
      throw new Error(`Failed to load text providers: ${response.statusText}`);
    }
    const payload = (await response.json()) as TextProvidersResponse;
    const providers = payload.providers ?? [];
    const options: TextModelOption[] = [];

    const hasOpenAIProvider = providers.some(
      (provider) => provider.provider === "openai",
    );
    if (!hasOpenAIProvider) {
      ragEnabled.value = false;
      ragDisabledReason.value =
        "RAG は OPENAI_API_KEY が設定されているときのみ利用できます。";
      textSendDisabledReason.value =
        "OPENAI_API_KEY が設定されていないためテキスト生成を無効化しています。";
    } else {
      ragDisabledReason.value = null;
    }

    for (const provider of providers) {
      const providerLabel =
        PROVIDER_LABELS[provider.provider] ?? provider.provider;
      const models = new Set<string>();
      if (provider.models?.length) {
        provider.models.forEach((model) => models.add(model));
      }
      if (provider.defaultModel) {
        models.add(provider.defaultModel);
      }
      if (models.size === 0) {
        continue;
      }
      for (const model of models) {
        const isDefault = provider.defaultModel === model;
        options.push({
          id: `${provider.provider}:${model}`,
          label: `${providerLabel} — ${model}${isDefault ? "（デフォルト）" : ""}`,
        });
      }
    }

    if (options.length === 0) {
      textSendDisabledReason.value =
        "テキスト生成が無効です。サーバーに API キーを設定してください。";
      textModelOptions.value = [
        {
          id: DEFAULT_TEXT_MODEL.rawId,
          label:
            "利用可能なテキストモデルがありません（API キーを設定してください）",
          disabled: true,
        },
      ];
      userPreferences.textModelId = DEFAULT_TEXT_MODEL.rawId;
      return;
    }

    if (hasOpenAIProvider) {
      textSendDisabledReason.value = null;
    }
    textModelOptions.value = options;
    const preferred = options.find(
      (option) => option.id === userPreferences.textModelId,
    );
    const fallback =
      preferred || options.find((option) => !option.disabled) || options[0];
    if (fallback && fallback.id !== userPreferences.textModelId) {
      userPreferences.textModelId = fallback.id;
    }
  } catch (error) {
    console.warn("Failed to load text model providers", error);
    textSendDisabledReason.value =
      "テキストプロバイダーの取得に失敗しました。接続と API キーを確認してください。";
    ragDisabledReason.value =
      ragDisabledReason.value ??
      "RAG の利用可否を確認できませんでした。API キー設定を確認してください。";
    ragEnabled.value = false;
    textModelOptions.value = [
      {
        id: DEFAULT_TEXT_MODEL.rawId,
        label: "OpenAI — gpt-4o-mini（デフォルト）",
      },
    ];
    if (!userPreferences.textModelId) {
      userPreferences.textModelId = DEFAULT_TEXT_MODEL.rawId;
    }
  }
}

onMounted(() => {
  void loadTextProviders();
});

// Helper function to get plugin config values
const getPluginConfig = <T = any,>(key: string): T | undefined => {
  return userPreferences.pluginConfigs[key] as T | undefined;
};

const {
  toolResults,
  selectedResult,
  isGeneratingImage,
  generatingMessage,
  handleToolCall: originalHandleToolCall,
  handleSelectResult,
  handleUpdateResult,
  handleUploadFiles,
} = useToolResults({
  toolExecute,
  getToolPlugin,
  suppressInstructions: computed(() => userPreferences.suppressInstructions),
  userPreferences: computed(() => userPreferences),
  getPluginConfig,
  sleep,
  sendInstructions,
  sendFunctionCallOutput,
  conversationActive: () => !!conversationActive.value,
  isDataChannelOpen: () => !!isDataChannelOpen(),
  scrollToBottomOfSideBar: scrolling.scrollSidebarToBottom,
  scrollCurrentResultToTop: scrolling.scrollCanvasToTop,
  onToolCallError: (toolName: string, error: string) => {
    updateToolCallError({ name: toolName }, error);
  },
});

const selectedViewComponent = computed(() => {
  const result = selectedResult.value;
  if (!result) return null;
  const plugin = getToolPlugin(result.toolName || "");
  return plugin?.viewComponent ?? null;
});

// Wrapper to track results immediately
async function handleToolCall(params: any): Promise<void> {
  try {
    await originalHandleToolCall(params);
    // After tool execution, update the history with the result
    if (toolResults.value.length > 0) {
      const latestResult = toolResults.value[toolResults.value.length - 1];
      if (latestResult && latestResult.toolName) {
        updateToolCallResult(latestResult.toolName, latestResult);
      }
    }
  } catch (error) {
    // Mark the tool call as failed in history
    const errorMessage = error instanceof Error ? error.message : String(error);
    updateToolCallError(params.msg, errorMessage);
  }
}

function updateToolCallError(msg: any, errorMessage: string): void {
  const toolName = typeof msg === "string" ? msg : msg.name || msg;
  // Find the most recent call with this tool name that doesn't have a result or error
  for (let i = toolCallHistory.value.length - 1; i >= 0; i--) {
    if (
      toolCallHistory.value[i].toolName === toolName &&
      !toolCallHistory.value[i].result &&
      !toolCallHistory.value[i].error
    ) {
      toolCallHistory.value[i].error = errorMessage;
      break;
    }
  }
}

const isListenerMode = computed(
  () => userPreferences.modelKind === "voice-realtime",
);
const lastSpeechStartedTime = ref<number | null>(null);

registerEventHandlers({
  onToolCall: (msg, id, argStr) => {
    // Track tool call in history for debugging
    const toolName =
      typeof msg === "string" ? msg : (msg as any)?.name || String(msg);
    try {
      const args = JSON.parse(argStr);
      addToolCallToHistory(String(toolName), args);
    } catch {
      addToolCallToHistory(String(toolName), argStr);
    }
    void handleToolCall({ msg, rawArgs: argStr });
  },
  onTextDelta: (delta) => {
    currentText.value += delta;
  },
  onTextCompleted: () => {
    if (currentText.value.trim()) {
      messages.value.push(currentText.value);
    }
    currentText.value = "";
  },
  onSpeechStarted: () => {
    if (isListenerMode.value) {
      console.log("MSG: Speech started");
    }
  },
  onSpeechStopped: () => {
    if (!isListenerMode.value) {
      return;
    }
    console.log("MSG: Speech stopped");
    const timeSinceLastStart = lastSpeechStartedTime.value
      ? Date.now() - lastSpeechStartedTime.value
      : 0;

      if (timeSinceLastStart > SESSION_CONFIG.LISTENER_MODE_SPEECH_THRESHOLD_MS) {
        console.log("MSG: Speech stopped for a long time");
        setLocalAudioEnabled(false);
        setTimeout(() => {
          setMute(Boolean(isMuted.value));
          lastSpeechStartedTime.value = Date.now();
        }, SESSION_CONFIG.LISTENER_MODE_AUDIO_GAP_MS);
      }
    },
  onError: (error) => {
    console.error("Session error", error);
  },
});

watch(
  () =>
    supportsAudioOutput.value ? (sidebarRef.value?.audioEl ?? null) : null,
  (audioEl) => {
    attachRemoteAudioElement(audioEl);
  },
  { immediate: true },
);

watch(
  () => ragEnabled.value,
  (enabled) => {
    if (!enabled) {
      ragHistory.value = [];
    }
  },
);

watch(
  () => ragDisabledReason.value,
  (reason) => {
    if (reason) {
      ragEnabled.value = false;
    }
  },
);

async function startChat(): Promise<void> {
  // Gard against double start
  if (chatActive.value || connecting.value) return;

  if (supportsAudioInput.value) {
    lastSpeechStartedTime.value = Date.now();
  }
  await startTransportChat();
}

async function sendTextMessage(providedText?: string): Promise<void> {
  const text = (providedText || userInput.value).trim();
  if (!text) return;

  if (ragEnabled.value) {
    await handleRagTextMessage(text);
    return;
  }

  // Block sending if text generation is disabled
  if (textSendDisabledReason.value) {
    const userMessageResult: ToolResult = {
      uuid: generateUUID(),
      toolName: "text-response",
      message: text,
      title: "あなた",
      data: {
        text: text,
        role: "user",
        transportKind: transportKind.value,
      },
    };
    toolResults.value.push(userMessageResult);

    const blockedResult: ToolResult = {
      uuid: generateUUID(),
      toolName: "text-response",
      message: textSendDisabledReason.value,
      title: "テキスト送信不可",
      data: {
        text: textSendDisabledReason.value,
        role: "system",
        transportKind: "text-rest",
      },
    };
    toolResults.value.push(blockedResult);
    scrolling.scrollSidebarToBottom();
    return;
  }

  // In text-rest mode, auto-start the session if not active
  if (
    transportKind.value === "text-rest" &&
    !chatActive.value &&
    !connecting.value
  ) {
    await startChat();
  }

  // Add user message as a tool result for conversation history
  const userMessageResult: ToolResult = {
    uuid: generateUUID(),
    toolName: "text-response",
    message: text,
    title: "あなた",
    data: {
      text: text,
      role: "user",
      transportKind: transportKind.value,
    },
  };
  toolResults.value.push(userMessageResult);
  scrolling.scrollSidebarToBottom();

  // Wait for conversation to be inactive
  for (
    let i = 0;
    i < SESSION_CONFIG.MESSAGE_SEND_RETRY_ATTEMPTS && conversationActive.value;
    i++
  ) {
    console.log(`WAIT:${i} \n`, text);
    await sleep(SESSION_CONFIG.MESSAGE_SEND_RETRY_DELAY_MS);
  }

  const sent = await sendUserMessageInternal(text);
  if (!sent) {
    return;
  }

  messages.value.push(`あなた: ${text}`);
}

async function handleRagTextMessage(text: string): Promise<void> {
  const resolvedModel = resolveTextModelId(userPreferences.textModelId);
  const provider = resolvedModel.provider;
  const model = resolvedModel.model;

  const userMessage: TextMessage = {
    role: "user",
    content: text,
  };

  ragHistory.value.push(userMessage);

  // Add user message to the UI
  const userMessageResult: ToolResult = {
    uuid: generateUUID(),
    toolName: "text-response",
    message: text,
    title: "あなた",
    data: {
      text,
      role: "user",
      transportKind: "text-rag",
    },
  };
  toolResults.value.push(userMessageResult);
  scrolling.scrollSidebarToBottom();

  const gatingReason = ragDisabledReason.value || textSendDisabledReason.value;
  if (gatingReason) {
    const disabledResult: ToolResult = {
      uuid: generateUUID(),
      toolName: "rag-response",
      message: gatingReason,
      title: "RAG 無効",
      data: { text: gatingReason, docTitles: [] },
    };
    toolResults.value.push(disabledResult);
    scrolling.scrollSidebarToBottom();
    return;
  }

  try {
    const response = await fetch("/api/rag/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: ragHistory.value,
        provider,
        model,
      }),
    });

    const body = (await response.json()) as {
      success: boolean;
      result?: { text?: string };
      context?: unknown;
      thresholdsTried?: number[];
      error?: string;
      details?: string;
    };

    if (!response.ok || !body.success) {
      throw new Error(
        body.error ?? body.details ?? "RAG リクエストに失敗しました",
      );
    }

    const context = (Array.isArray(body.context) ? body.context : []) as any[];
    const hasContext = context.length > 0;
    const docTitles = hasContext
      ? Array.from(
          new Set(
            context
              .map((c: any) =>
                typeof c?.document_title === "string"
                  ? c.document_title
                  : undefined,
              )
              .filter(Boolean) as string[],
          ),
        )
      : [];
    const assistantText =
      body.result?.text ??
      (hasContext
        ? "（応答なし）"
        : "アップロードされたドキュメントに一致する情報が見つかりませんでした。質問を具体的にしてください。");
    ragHistory.value.push({
      role: "assistant",
      content: assistantText,
    });

    const assistantResult: ToolResult = {
      uuid: generateUUID(),
      toolName: "rag-response",
      message: assistantText,
      title: "RAG",
      data: {
        text: assistantText,
        role: "assistant",
        transportKind: "text-rag",
        context,
        docTitles,
        thresholdsTried: Array.isArray(body.thresholdsTried)
          ? body.thresholdsTried
          : undefined,
      },
    };
    toolResults.value.push(assistantResult);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "RAG リクエストに失敗しました";
    const errorResult: ToolResult = {
      uuid: generateUUID(),
      toolName: "rag-response",
      message,
      title: "RAG エラー",
      data: { text: message, docTitles: [] },
    };
    toolResults.value.push(errorResult);
  } finally {
    scrolling.scrollSidebarToBottom();
  }
}

function stopChat(): void {
  stopTransportChat();
}

function setMute(muted: boolean): void {
  if (!supportsAudioInput.value) {
    return;
  }
  sessionSetMute(muted);
}

function clearResults(): void {
  toolResults.value = [];
  toolCallHistory.value = [];
  selectedResult.value = null;
}

async function switchRole(newRoleId: string): Promise<void> {
  // Step 1: Disconnect if connected
  if (chatActive.value) {
    stopChat();
  }

  // Step 2: Switch to the specified role
  userPreferences.roleId = newRoleId;

  // Wait a brief moment to ensure cleanup is complete
  await sleep(500);

  // Step 3: Connect to the remote LLM
  await startChat();
}

// Expose the API globally for external access
if (typeof window !== "undefined") {
  (window as any).switchRole = switchRole;
}

watch(
  () => userPreferences.modelKind,
  (newKind, previousKind) => {
    if (newKind !== previousKind && chatActive.value) {
      stopChat();
    }
  },
);

// Watch tool results and update history with results
watch(
  () => toolResults.value.length,
  () => {
    // When a new result is added, update the corresponding history entry
    if (toolResults.value.length > 0) {
      const latestResult = toolResults.value[toolResults.value.length - 1];
      if (latestResult && latestResult.toolName) {
        updateToolCallResult(latestResult.toolName, latestResult);
      }
    }
  },
);
</script>

<style scoped></style>
