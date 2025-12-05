import { ref, computed, watch, onMounted } from "vue";
import { toolExecute, getToolPlugin } from "./tools";
import Sidebar from "./components/Sidebar.vue";
import RightSidebar from "./components/RightSidebar.vue";
import DocumentsPanel from "./components/DocumentsPanel.vue";
import { useSessionTransport } from "./composables/useSessionTransport";
import { useUserPreferences } from "./composables/useUserPreferences";
import { useToolResults } from "./composables/useToolResults";
import { useScrolling } from "./composables/useScrolling";
import { SESSION_CONFIG } from "./config/session";
import { DEFAULT_TEXT_MODEL, resolveTextModelId } from "./config/textModels";
import { DEFAULT_GOOGLE_LIVE_MODEL_ID, GOOGLE_LIVE_MODELS, REALTIME_MODELS, } from "./config/models";
import { getRole } from "./config/roles";
import { getLanguageName } from "./config/languages";
import { generateUUID } from "./utils/uuid";
const sidebarRef = ref(null);
const rightSidebarRef = ref(null);
const preferences = useUserPreferences();
const { state: userPreferences, buildInstructions: buildPreferenceInstructions, buildTools: buildPreferenceTools, } = preferences;
async function sleep(milliseconds) {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
const messages = ref([]);
const currentText = ref("");
const userInput = ref("");
// Sidebar visibility state (persisted to localStorage)
const SIDEBAR_VISIBLE_KEY = "sidebar_visible_v1";
const sidebarVisible = ref(localStorage.getItem(SIDEBAR_VISIBLE_KEY) !== "false");
const documentsVisible = ref(false);
function toggleSidebar() {
    sidebarVisible.value = !sidebarVisible.value;
    localStorage.setItem(SIDEBAR_VISIBLE_KEY, sidebarVisible.value ? "true" : "false");
}
function toggleDocumentsPanel() {
    documentsVisible.value = !documentsVisible.value;
}
// Right sidebar (debug panel) visibility state (persisted to localStorage)
const RIGHT_SIDEBAR_VISIBLE_KEY = "right_sidebar_visible_v1";
const rightSidebarVisible = ref(localStorage.getItem(RIGHT_SIDEBAR_VISIBLE_KEY) === "true");
function toggleRightSidebar() {
    rightSidebarVisible.value = !rightSidebarVisible.value;
    localStorage.setItem(RIGHT_SIDEBAR_VISIBLE_KEY, rightSidebarVisible.value ? "true" : "false");
}
const toolCallHistory = ref([]);
function addToolCallToHistory(toolName, args) {
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
function updateToolCallResult(toolName, result) {
    // Find the most recent call with this tool name that doesn't have a result
    for (let i = toolCallHistory.value.length - 1; i >= 0; i--) {
        if (toolCallHistory.value[i].toolName === toolName &&
            !toolCallHistory.value[i].result) {
            toolCallHistory.value[i].result = result;
            break;
        }
    }
}
const textModelOptions = ref([
    {
        id: DEFAULT_TEXT_MODEL.rawId,
        label: "OpenAI — gpt-4o-mini (default)",
    },
]);
const PROVIDER_LABELS = {
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
const ragHistory = ref([]);
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
            const isValidGoogleModel = GOOGLE_LIVE_MODELS.some((m) => m.id === userPreferences.modelId);
            return isValidGoogleModel
                ? userPreferences.modelId
                : DEFAULT_GOOGLE_LIVE_MODEL_ID;
        }
        return userPreferences.textModelId;
    },
});
const { chatActive, conversationActive, connecting, isMuted, startResponse, isDataChannelOpen, startChat: startTransportChat, stopChat: stopTransportChat, sendUserMessage: sendUserMessageInternal, sendFunctionCallOutput, sendInstructions, setMute: sessionSetMute, setLocalAudioEnabled, attachRemoteAudioElement, registerEventHandlers, capabilities, } = session;
const supportsAudioInput = computed(() => capabilities.value.supportsAudioInput);
const supportsAudioOutput = computed(() => capabilities.value.supportsAudioOutput);
// Status line showing Model / Mode / Language
const statusLine = computed(() => {
    // Get model name
    let modelName = "Unknown";
    if (userPreferences.modelKind === "voice-realtime") {
        const model = REALTIME_MODELS.find((m) => m.id === userPreferences.modelId);
        const label = model?.label || "GPT Realtime";
        modelName = `Voice / ${label}`;
    }
    else if (userPreferences.modelKind === "voice-google-live") {
        const model = GOOGLE_LIVE_MODELS.find((m) => m.id === userPreferences.modelId);
        const label = model?.label || "Gemini Live";
        modelName = `Voice / ${label}`;
    }
    else if (userPreferences.modelKind === "text-rest") {
        // For text models, extract the model name from textModelId
        const textModelId = userPreferences.textModelId;
        if (textModelId) {
            const parts = textModelId.split(":");
            if (parts.length === 2) {
                const provider = parts[0];
                const model = parts[1];
                const providerLabel = PROVIDER_LABELS[provider] || provider;
                modelName = `Text / ${providerLabel} ${model}`;
            }
            else {
                // Handle case where textModelId doesn't have the expected format
                modelName = `Text / ${textModelId}`;
            }
        }
        else {
            modelName = "Text Mode";
        }
    }
    // Get role name
    const role = getRole(userPreferences.roleId);
    const roleName = role.name;
    // Get language name
    const languageName = getLanguageName(userPreferences.userLanguage);
    return `${modelName} / ${roleName} / ${languageName}`;
});
async function loadTextProviders() {
    try {
        const response = await fetch("/api/text/providers");
        if (!response.ok) {
            throw new Error(`Failed to load text providers: ${response.statusText}`);
        }
        const payload = (await response.json());
        const options = [];
        for (const provider of payload.providers ?? []) {
            const providerLabel = PROVIDER_LABELS[provider.provider] ?? provider.provider;
            const models = new Set();
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
                const credentialNote = provider.hasCredentials
                    ? ""
                    : " (credentials required)";
                options.push({
                    id: `${provider.provider}:${model}`,
                    label: `${providerLabel} — ${model}${isDefault ? " (default)" : ""}${credentialNote}`,
                    disabled: !provider.hasCredentials,
                });
            }
        }
        if (options.length === 0) {
            options.push({
                id: DEFAULT_TEXT_MODEL.rawId,
                label: "OpenAI — gpt-4o-mini (default)",
            });
        }
        textModelOptions.value = options;
        const preferred = options.find((option) => option.id === userPreferences.textModelId && !option.disabled);
        const fallback = preferred || options.find((option) => !option.disabled) || options[0];
        if (fallback && fallback.id !== userPreferences.textModelId) {
            userPreferences.textModelId = fallback.id;
        }
    }
    catch (error) {
        console.warn("Failed to load text model providers", error);
        textModelOptions.value = [
            {
                id: DEFAULT_TEXT_MODEL.rawId,
                label: "OpenAI — gpt-4o-mini (default)",
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
const getPluginConfig = (key) => {
    return userPreferences.pluginConfigs[key];
};
const { toolResults, selectedResult, isGeneratingImage, generatingMessage, handleToolCall: originalHandleToolCall, handleSelectResult, handleUpdateResult, handleUploadFiles, } = useToolResults({
    toolExecute,
    getToolPlugin,
    suppressInstructions: computed(() => userPreferences.suppressInstructions),
    userPreferences: computed(() => userPreferences),
    getPluginConfig,
    sleep,
    sendInstructions,
    sendFunctionCallOutput,
    conversationActive,
    isDataChannelOpen,
    scrollToBottomOfSideBar: scrolling.scrollSidebarToBottom,
    scrollCurrentResultToTop: scrolling.scrollCanvasToTop,
    onToolCallError: (toolName, error) => {
        updateToolCallError({ name: toolName }, error);
    },
});
// Wrapper to track results immediately
async function handleToolCall(params) {
    try {
        await originalHandleToolCall(params);
        // After tool execution, update the history with the result
        if (toolResults.value.length > 0) {
            const latestResult = toolResults.value[toolResults.value.length - 1];
            if (latestResult && latestResult.toolName) {
                updateToolCallResult(latestResult.toolName, latestResult);
            }
        }
    }
    catch (error) {
        // Mark the tool call as failed in history
        const errorMessage = error instanceof Error ? error.message : String(error);
        updateToolCallError(params.msg, errorMessage);
    }
}
function updateToolCallError(msg, errorMessage) {
    const toolName = typeof msg === "string" ? msg : msg.name || msg;
    // Find the most recent call with this tool name that doesn't have a result or error
    for (let i = toolCallHistory.value.length - 1; i >= 0; i--) {
        if (toolCallHistory.value[i].toolName === toolName &&
            !toolCallHistory.value[i].result &&
            !toolCallHistory.value[i].error) {
            toolCallHistory.value[i].error = errorMessage;
            break;
        }
    }
}
const isListenerMode = computed(() => userPreferences.modeId === "listener");
const lastSpeechStartedTime = ref(null);
registerEventHandlers({
    onToolCall: (msg, id, argStr) => {
        // Track tool call in history for debugging
        const toolName = typeof msg === "string" ? msg : msg.name || msg;
        try {
            const args = JSON.parse(argStr);
            addToolCallToHistory(toolName, args);
        }
        catch {
            addToolCallToHistory(toolName, argStr);
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
                setMute(isMuted.value);
                lastSpeechStartedTime.value = Date.now();
            }, SESSION_CONFIG.LISTENER_MODE_AUDIO_GAP_MS);
        }
    },
    onError: (error) => {
        console.error("Session error", error);
    },
});
watch(() => supportsAudioOutput.value ? (sidebarRef.value?.audioEl ?? null) : null, (audioEl) => {
    attachRemoteAudioElement(audioEl);
}, { immediate: true });
watch(() => ragEnabled.value, (enabled) => {
    if (!enabled) {
        ragHistory.value = [];
    }
});
async function startChat() {
    // Gard against double start
    if (chatActive.value || connecting.value)
        return;
    if (supportsAudioInput.value) {
        lastSpeechStartedTime.value = Date.now();
    }
    await startTransportChat();
}
async function sendTextMessage(providedText) {
    const text = (providedText || userInput.value).trim();
    if (!text)
        return;
    if (ragEnabled.value) {
        await handleRagTextMessage(text);
        return;
    }
    // In text-rest mode, auto-start the session if not active
    if (transportKind.value === "text-rest" &&
        !chatActive.value &&
        !connecting.value) {
        await startChat();
    }
    // Add user message as a tool result for conversation history
    const userMessageResult = {
        uuid: generateUUID(),
        toolName: "text-response",
        message: text,
        title: "You",
        data: {
            text: text,
            role: "user",
            transportKind: transportKind.value,
        },
    };
    toolResults.value.push(userMessageResult);
    scrolling.scrollSidebarToBottom();
    // Wait for conversation to be inactive
    for (let i = 0; i < SESSION_CONFIG.MESSAGE_SEND_RETRY_ATTEMPTS && conversationActive.value; i++) {
        console.log(`WAIT:${i} \n`, text);
        await sleep(SESSION_CONFIG.MESSAGE_SEND_RETRY_DELAY_MS);
    }
    const sent = await sendUserMessageInternal(text);
    if (!sent) {
        return;
    }
    messages.value.push(`You: ${text}`);
}
async function handleRagTextMessage(text) {
    const resolvedModel = resolveTextModelId(userPreferences.textModelId);
    const provider = resolvedModel.provider;
    const model = resolvedModel.model;
    const userMessage = {
        role: "user",
        content: text,
    };
    ragHistory.value.push(userMessage);
    // Add user message to the UI
    const userMessageResult = {
        uuid: generateUUID(),
        toolName: "text-response",
        message: text,
        title: "You",
        data: {
            text,
            role: "user",
            transportKind: "text-rag",
        },
    };
    toolResults.value.push(userMessageResult);
    scrolling.scrollSidebarToBottom();
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
        const body = (await response.json());
        if (!response.ok || !body.success) {
            throw new Error(body.error ?? body.details ?? "RAG request failed");
        }
        const assistantText = body.result?.text ?? "(no response)";
        ragHistory.value.push({
            role: "assistant",
            content: assistantText,
        });
        const assistantResult = {
            uuid: generateUUID(),
            toolName: "rag-response",
            message: assistantText,
            title: "RAG",
            data: {
                text: assistantText,
                context: body.context ?? [],
            },
        };
        toolResults.value.push(assistantResult);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "RAG request failed";
        const errorResult = {
            uuid: generateUUID(),
            toolName: "rag-response",
            message,
            title: "RAG Error",
            data: { text: message },
        };
        toolResults.value.push(errorResult);
    }
    finally {
        scrolling.scrollSidebarToBottom();
    }
}
function stopChat() {
    stopTransportChat();
}
function setMute(muted) {
    if (!supportsAudioInput.value) {
        return;
    }
    sessionSetMute(muted);
}
function clearResults() {
    toolResults.value = [];
    toolCallHistory.value = [];
    selectedResult.value = null;
}
async function switchRole(newRoleId) {
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
    window.switchRole = switchRole;
}
watch(() => userPreferences.modelKind, (newKind, previousKind) => {
    if (newKind !== previousKind && chatActive.value) {
        stopChat();
    }
});
// Watch tool results and update history with results
watch(() => toolResults.value.length, () => {
    // When a new result is added, update the corresponding history entry
    if (toolResults.value.length > 0) {
        const latestResult = toolResults.value[toolResults.value.length - 1];
        if (latestResult && latestResult.toolName) {
            updateToolCallResult(latestResult.toolName, latestResult);
        }
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "p-4 space-y-4" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    role: "toolbar",
    ...{ class: "flex justify-between items-center" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
    ...{ class: "text-2xl font-bold" },
});
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "text-sm text-gray-500 font-normal" },
});
(__VLS_ctx.statusLine);
// @ts-ignore
[statusLine,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex gap-2" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleDocumentsPanel) },
    ...{ class: "px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center justify-center transition-colors" },
    title: (__VLS_ctx.documentsVisible ? 'Hide documents' : 'Manage documents (RAG)'),
});
// @ts-ignore
[toggleDocumentsPanel, documentsVisible,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons text-base" },
});
(__VLS_ctx.documentsVisible ? "folder_open" : "folder");
// @ts-ignore
[documentsVisible,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.ragEnabled = !__VLS_ctx.ragEnabled;
            // @ts-ignore
            [ragEnabled, ragEnabled,];
        } },
    ...{ class: (__VLS_ctx.ragEnabled
            ? 'px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border border-blue-300 flex items-center justify-center transition-colors'
            : 'px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center justify-center transition-colors') },
    title: (__VLS_ctx.ragEnabled ? 'RAG mode on (text messages use docs)' : 'RAG mode off'),
});
// @ts-ignore
[ragEnabled, ragEnabled,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons text-base" },
});
(__VLS_ctx.ragEnabled ? "link" : "link_off");
// @ts-ignore
[ragEnabled,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleSidebar) },
    ...{ class: "px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center justify-center transition-colors" },
    title: (__VLS_ctx.sidebarVisible ? 'Hide sidebar' : 'Show sidebar'),
});
// @ts-ignore
[toggleSidebar, sidebarVisible,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons text-base" },
});
(__VLS_ctx.sidebarVisible ? "menu_open" : "menu");
// @ts-ignore
[sidebarVisible,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleRightSidebar) },
    ...{ class: (__VLS_ctx.rightSidebarVisible
            ? 'px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border border-blue-300 flex items-center justify-center transition-colors'
            : 'px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center justify-center transition-colors') },
    title: (__VLS_ctx.rightSidebarVisible ? 'Hide debug panel' : 'Show debug panel'),
});
// @ts-ignore
[toggleRightSidebar, rightSidebarVisible, rightSidebarVisible,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons text-base" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex space-x-4" },
    ...{ style: {} },
});
if (__VLS_ctx.sidebarVisible) {
    // @ts-ignore
    [sidebarVisible,];
    /** @type {[typeof Sidebar, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(Sidebar, new Sidebar({
        ...{ 'onStartChat': {} },
        ...{ 'onStopChat': {} },
        ...{ 'onSetMute': {} },
        ...{ 'onSelectResult': {} },
        ...{ 'onSendTextMessage': {} },
        ...{ 'onClearResults': {} },
        ...{ 'onUpdate:userInput': {} },
        ...{ 'onUpdate:userLanguage': {} },
        ...{ 'onUpdate:suppressInstructions': {} },
        ...{ 'onUpdate:roleId': {} },
        ...{ 'onUpdate:enabledPlugins': {} },
        ...{ 'onUpdate:customInstructions': {} },
        ...{ 'onUpdate:modelId': {} },
        ...{ 'onUpdate:modelKind': {} },
        ...{ 'onUpdate:textModelId': {} },
        ...{ 'onUpdate:pluginConfigs': {} },
        ...{ 'onUploadFiles': {} },
        ref: "sidebarRef",
        chatActive: (__VLS_ctx.chatActive),
        connecting: (__VLS_ctx.connecting),
        pluginResults: (__VLS_ctx.toolResults),
        isGeneratingImage: (__VLS_ctx.isGeneratingImage),
        generatingMessage: (__VLS_ctx.generatingMessage),
        selectedResult: (__VLS_ctx.selectedResult),
        userInput: (__VLS_ctx.userInput),
        isMuted: (__VLS_ctx.isMuted),
        userLanguage: (__VLS_ctx.userPreferences.userLanguage),
        suppressInstructions: (__VLS_ctx.userPreferences.suppressInstructions),
        roleId: (__VLS_ctx.userPreferences.roleId),
        isConversationActive: (__VLS_ctx.conversationActive),
        enabledPlugins: (__VLS_ctx.userPreferences.enabledPlugins),
        customInstructions: (__VLS_ctx.userPreferences.customInstructions),
        modelId: (__VLS_ctx.userPreferences.modelId),
        modelKind: (__VLS_ctx.userPreferences.modelKind),
        textModelId: (__VLS_ctx.userPreferences.textModelId),
        textModelOptions: (__VLS_ctx.textModelOptions),
        supportsAudioInput: (__VLS_ctx.supportsAudioInput),
        supportsAudioOutput: (__VLS_ctx.supportsAudioOutput),
        pluginConfigs: (__VLS_ctx.userPreferences.pluginConfigs),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onStartChat': {} },
        ...{ 'onStopChat': {} },
        ...{ 'onSetMute': {} },
        ...{ 'onSelectResult': {} },
        ...{ 'onSendTextMessage': {} },
        ...{ 'onClearResults': {} },
        ...{ 'onUpdate:userInput': {} },
        ...{ 'onUpdate:userLanguage': {} },
        ...{ 'onUpdate:suppressInstructions': {} },
        ...{ 'onUpdate:roleId': {} },
        ...{ 'onUpdate:enabledPlugins': {} },
        ...{ 'onUpdate:customInstructions': {} },
        ...{ 'onUpdate:modelId': {} },
        ...{ 'onUpdate:modelKind': {} },
        ...{ 'onUpdate:textModelId': {} },
        ...{ 'onUpdate:pluginConfigs': {} },
        ...{ 'onUploadFiles': {} },
        ref: "sidebarRef",
        chatActive: (__VLS_ctx.chatActive),
        connecting: (__VLS_ctx.connecting),
        pluginResults: (__VLS_ctx.toolResults),
        isGeneratingImage: (__VLS_ctx.isGeneratingImage),
        generatingMessage: (__VLS_ctx.generatingMessage),
        selectedResult: (__VLS_ctx.selectedResult),
        userInput: (__VLS_ctx.userInput),
        isMuted: (__VLS_ctx.isMuted),
        userLanguage: (__VLS_ctx.userPreferences.userLanguage),
        suppressInstructions: (__VLS_ctx.userPreferences.suppressInstructions),
        roleId: (__VLS_ctx.userPreferences.roleId),
        isConversationActive: (__VLS_ctx.conversationActive),
        enabledPlugins: (__VLS_ctx.userPreferences.enabledPlugins),
        customInstructions: (__VLS_ctx.userPreferences.customInstructions),
        modelId: (__VLS_ctx.userPreferences.modelId),
        modelKind: (__VLS_ctx.userPreferences.modelKind),
        textModelId: (__VLS_ctx.userPreferences.textModelId),
        textModelOptions: (__VLS_ctx.textModelOptions),
        supportsAudioInput: (__VLS_ctx.supportsAudioInput),
        supportsAudioOutput: (__VLS_ctx.supportsAudioOutput),
        pluginConfigs: (__VLS_ctx.userPreferences.pluginConfigs),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    const __VLS_5 = ({ startChat: {} },
        { onStartChat: (__VLS_ctx.startChat) });
    const __VLS_6 = ({ stopChat: {} },
        { onStopChat: (__VLS_ctx.stopChat) });
    const __VLS_7 = ({ setMute: {} },
        { onSetMute: (__VLS_ctx.setMute) });
    const __VLS_8 = ({ selectResult: {} },
        { onSelectResult: (__VLS_ctx.handleSelectResult) });
    const __VLS_9 = ({ sendTextMessage: {} },
        { onSendTextMessage: (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.sendTextMessage($event);
                // @ts-ignore
                [chatActive, connecting, toolResults, isGeneratingImage, generatingMessage, selectedResult, userInput, isMuted, userPreferences, userPreferences, userPreferences, userPreferences, userPreferences, userPreferences, userPreferences, userPreferences, userPreferences, conversationActive, textModelOptions, supportsAudioInput, supportsAudioOutput, startChat, stopChat, setMute, handleSelectResult, sendTextMessage,];
            } });
    const __VLS_10 = ({ clearResults: {} },
        { onClearResults: (__VLS_ctx.clearResults) });
    const __VLS_11 = ({ 'update:userInput': {} },
        { 'onUpdate:userInput': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userInput = $event;
                // @ts-ignore
                [userInput, clearResults,];
            } });
    const __VLS_12 = ({ 'update:userLanguage': {} },
        { 'onUpdate:userLanguage': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userPreferences.userLanguage = $event;
                // @ts-ignore
                [userPreferences,];
            } });
    const __VLS_13 = ({ 'update:suppressInstructions': {} },
        { 'onUpdate:suppressInstructions': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userPreferences.suppressInstructions = $event;
                // @ts-ignore
                [userPreferences,];
            } });
    const __VLS_14 = ({ 'update:roleId': {} },
        { 'onUpdate:roleId': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userPreferences.roleId = $event;
                // @ts-ignore
                [userPreferences,];
            } });
    const __VLS_15 = ({ 'update:enabledPlugins': {} },
        { 'onUpdate:enabledPlugins': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userPreferences.enabledPlugins = $event;
                // @ts-ignore
                [userPreferences,];
            } });
    const __VLS_16 = ({ 'update:customInstructions': {} },
        { 'onUpdate:customInstructions': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userPreferences.customInstructions = $event;
                // @ts-ignore
                [userPreferences,];
            } });
    const __VLS_17 = ({ 'update:modelId': {} },
        { 'onUpdate:modelId': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userPreferences.modelId = $event;
                // @ts-ignore
                [userPreferences,];
            } });
    const __VLS_18 = ({ 'update:modelKind': {} },
        { 'onUpdate:modelKind': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userPreferences.modelKind = $event;
                // @ts-ignore
                [userPreferences,];
            } });
    const __VLS_19 = ({ 'update:textModelId': {} },
        { 'onUpdate:textModelId': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userPreferences.textModelId = $event;
                // @ts-ignore
                [userPreferences,];
            } });
    const __VLS_20 = ({ 'update:pluginConfigs': {} },
        { 'onUpdate:pluginConfigs': (...[$event]) => {
                if (!(__VLS_ctx.sidebarVisible))
                    return;
                __VLS_ctx.userPreferences.pluginConfigs = $event;
                // @ts-ignore
                [userPreferences,];
            } });
    const __VLS_21 = ({ uploadFiles: {} },
        { onUploadFiles: (__VLS_ctx.handleUploadFiles) });
    /** @type {typeof __VLS_ctx.sidebarRef} */ ;
    var __VLS_22 = {};
    // @ts-ignore
    [handleUploadFiles, sidebarRef,];
    var __VLS_2;
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex-1 flex flex-col" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex-1 border rounded bg-gray-50 overflow-hidden" },
});
if (__VLS_ctx.selectedResult &&
    __VLS_ctx.getToolPlugin(__VLS_ctx.selectedResult.toolName)?.viewComponent) {
    // @ts-ignore
    [selectedResult, selectedResult, getToolPlugin,];
    const __VLS_25 = ((__VLS_ctx.getToolPlugin(__VLS_ctx.selectedResult.toolName).viewComponent));
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        ...{ 'onUpdateResult': {} },
        key: (__VLS_ctx.selectedResult.uuid),
        selectedResult: (__VLS_ctx.selectedResult),
        sendTextMessage: (__VLS_ctx.sendTextMessage),
        googleMapKey: (__VLS_ctx.startResponse?.googleMapKey || null),
        setMute: (__VLS_ctx.setMute),
    }));
    const __VLS_27 = __VLS_26({
        ...{ 'onUpdateResult': {} },
        key: (__VLS_ctx.selectedResult.uuid),
        selectedResult: (__VLS_ctx.selectedResult),
        sendTextMessage: (__VLS_ctx.sendTextMessage),
        googleMapKey: (__VLS_ctx.startResponse?.googleMapKey || null),
        setMute: (__VLS_ctx.setMute),
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = ({ updateResult: {} },
        { onUpdateResult: (__VLS_ctx.handleUpdateResult) });
    // @ts-ignore
    [selectedResult, selectedResult, selectedResult, setMute, sendTextMessage, getToolPlugin, startResponse, handleUpdateResult,];
    var __VLS_28;
}
if (!__VLS_ctx.selectedResult) {
    // @ts-ignore
    [selectedResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-full h-full flex items-center justify-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-gray-400 text-lg" },
    });
}
if (__VLS_ctx.rightSidebarVisible) {
    // @ts-ignore
    [rightSidebarVisible,];
    /** @type {[typeof RightSidebar, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(RightSidebar, new RightSidebar({
        ref: "rightSidebarRef",
        toolCallHistory: (__VLS_ctx.toolCallHistory),
    }));
    const __VLS_34 = __VLS_33({
        ref: "rightSidebarRef",
        toolCallHistory: (__VLS_ctx.toolCallHistory),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    /** @type {typeof __VLS_ctx.rightSidebarRef} */ ;
    var __VLS_36 = {};
    // @ts-ignore
    [toolCallHistory, rightSidebarRef,];
    var __VLS_35;
}
if (__VLS_ctx.documentsVisible) {
    // @ts-ignore
    [documentsVisible,];
    /** @type {[typeof DocumentsPanel, ]} */ ;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent(DocumentsPanel, new DocumentsPanel({
        ...{ 'onClose': {} },
    }));
    const __VLS_40 = __VLS_39({
        ...{ 'onClose': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    let __VLS_42;
    let __VLS_43;
    const __VLS_44 = ({ close: {} },
        { onClose: (...[$event]) => {
                if (!(__VLS_ctx.documentsVisible))
                    return;
                __VLS_ctx.documentsVisible = false;
                // @ts-ignore
                [documentsVisible,];
            } });
    var __VLS_41;
}
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-base']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
// @ts-ignore
var __VLS_23 = __VLS_22, __VLS_37 = __VLS_36;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        getToolPlugin: getToolPlugin,
        Sidebar: Sidebar,
        RightSidebar: RightSidebar,
        DocumentsPanel: DocumentsPanel,
        sidebarRef: sidebarRef,
        rightSidebarRef: rightSidebarRef,
        userPreferences: userPreferences,
        userInput: userInput,
        sidebarVisible: sidebarVisible,
        documentsVisible: documentsVisible,
        toggleSidebar: toggleSidebar,
        toggleDocumentsPanel: toggleDocumentsPanel,
        rightSidebarVisible: rightSidebarVisible,
        toggleRightSidebar: toggleRightSidebar,
        toolCallHistory: toolCallHistory,
        textModelOptions: textModelOptions,
        ragEnabled: ragEnabled,
        chatActive: chatActive,
        conversationActive: conversationActive,
        connecting: connecting,
        isMuted: isMuted,
        startResponse: startResponse,
        supportsAudioInput: supportsAudioInput,
        supportsAudioOutput: supportsAudioOutput,
        statusLine: statusLine,
        toolResults: toolResults,
        selectedResult: selectedResult,
        isGeneratingImage: isGeneratingImage,
        generatingMessage: generatingMessage,
        handleSelectResult: handleSelectResult,
        handleUpdateResult: handleUpdateResult,
        handleUploadFiles: handleUploadFiles,
        startChat: startChat,
        sendTextMessage: sendTextMessage,
        stopChat: stopChat,
        setMute: setMute,
        clearResults: clearResults,
    }),
});
export default (await import('vue')).defineComponent({});
; /* PartiallyEnd: #4569/main.vue */
