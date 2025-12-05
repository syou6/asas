import { ref, nextTick, defineProps, defineEmits, computed, onUnmounted, } from "vue";
import { getToolPlugin, getAcceptedFileTypes, getFileUploadPlugins, getPluginList, getPluginsWithConfig, hasAnyPluginConfig, isRoleCustomizable, getAvailablePluginsForRole, } from "../tools";
import { LANGUAGES } from "../config/languages";
import { ROLES } from "../config/roles";
import { REALTIME_MODELS, GOOGLE_LIVE_MODELS } from "../config/models";
const props = defineProps();
const emit = defineEmits();
const audioEl = ref(null);
const imageContainer = ref(null);
const fileInput = ref(null);
const showConfigPopup = ref(false);
const sidebarEl = ref(null);
// Sidebar width management
const SIDEBAR_WIDTH_KEY = "sidebar_width_v1";
const DEFAULT_SIDEBAR_WIDTH = 240; // 60 * 4 (w-60 in tailwind)
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 600;
const sidebarWidth = ref(parseInt(localStorage.getItem(SIDEBAR_WIDTH_KEY) || String(DEFAULT_SIDEBAR_WIDTH)));
// Resize state
const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);
function startResize(event) {
    isResizing.value = true;
    startX.value = event.clientX;
    startWidth.value = sidebarWidth.value;
    // Prevent text selection during resize
    event.preventDefault();
    // Add global event listeners
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
}
function handleResize(event) {
    if (!isResizing.value)
        return;
    const deltaX = event.clientX - startX.value;
    const newWidth = startWidth.value + deltaX;
    // Constrain width to min/max bounds
    if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        sidebarWidth.value = newWidth;
    }
}
function stopResize() {
    if (isResizing.value) {
        isResizing.value = false;
        // Save to localStorage
        localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth.value));
        // Remove global event listeners
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", stopResize);
    }
}
// Cleanup on unmount
onUnmounted(() => {
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
});
const acceptedFileTypes = computed(() => getAcceptedFileTypes().join(","));
const fileUploadPlugins = computed(() => getFileUploadPlugins());
const isVoiceMode = computed(() => props.modelKind === "voice-realtime" ||
    props.modelKind === "voice-google-live");
const isOpenAIRealtime = computed(() => props.modelKind === "voice-realtime");
const isGoogleLive = computed(() => props.modelKind === "voice-google-live");
const connectButtonLabel = computed(() => isVoiceMode.value ? "Connect" : "Start Session");
const isCurrentRoleCustomizable = computed(() => {
    return isRoleCustomizable(props.roleId);
});
const availablePluginsForCurrentRole = computed(() => {
    const pluginNames = getAvailablePluginsForRole(props.roleId);
    if (!pluginNames)
        return []; // Customizable role, shouldn't happen here
    return pluginNames
        .map((name) => {
        const pluginModule = getPluginList().find((p) => p.plugin.toolDefinition.name === name);
        return pluginModule ? pluginModule.plugin.toolDefinition.name : null;
    })
        .filter((name) => name !== null);
});
function scrollToBottom() {
    nextTick(() => {
        if (imageContainer.value) {
            imageContainer.value.scrollTop = imageContainer.value.scrollHeight;
        }
    });
}
function triggerFileUpload() {
    fileInput.value?.click();
}
function handleFileUpload(event) {
    const target = event.target;
    const files = target.files;
    if (!files || files.length === 0)
        return;
    const results = [];
    let loadedCount = 0;
    const totalFiles = files.length;
    Array.from(files).forEach((file) => {
        // Find the plugin that handles this file type
        const plugin = fileUploadPlugins.value.find((p) => p.fileUpload.acceptedTypes.includes(file.type));
        if (!plugin) {
            console.warn(`No plugin found for file type: ${file.type}`);
            loadedCount++;
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileData = e.target?.result;
            const result = plugin.fileUpload.handleUpload(fileData, file.name);
            results.push(result);
            loadedCount++;
            if (loadedCount === totalFiles) {
                emit("uploadFiles", results);
            }
        };
        reader.readAsDataURL(file);
    });
    // Reset the input so the same files can be uploaded again
    target.value = "";
}
function handlePluginToggle(pluginName, enabled) {
    const updated = { ...props.enabledPlugins, [pluginName]: enabled };
    emit("update:enabledPlugins", updated);
}
function handlePluginConfigUpdate(key, value) {
    const updated = { ...props.pluginConfigs, [key]: value };
    emit("update:pluginConfigs", updated);
}
function getRoleIcon() {
    const role = ROLES.find((r) => r.id === props.roleId);
    return role?.icon || "graphic_eq";
}
function handleEnterKey(event) {
    // Don't submit if IME is composing (e.g., converting kana to kanji in Japanese)
    if (event.isComposing) {
        return;
    }
    // Don't submit if text is empty
    if (!props.userInput.trim()) {
        event.preventDefault();
        return;
    }
    // In voice mode, don't submit if chat is not active
    if (props.modelKind === "voice-realtime" && !props.chatActive) {
        event.preventDefault();
        return;
    }
    // Submit the message
    event.preventDefault();
    const text = props.userInput;
    emit("update:userInput", ""); // Clear immediately
    emit("sendTextMessage", text);
}
function handleSendClick() {
    if (!props.userInput.trim())
        return;
    const text = props.userInput;
    emit("update:userInput", ""); // Clear immediately
    emit("sendTextMessage", text);
}
const __VLS_exposed = {
    audioEl,
    scrollToBottom,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ref: "sidebarEl",
    ...{ style: ({ width: __VLS_ctx.sidebarWidth + 'px' }) },
    ...{ class: "flex-shrink-0 bg-gray-50 border rounded pb-4 px-4 flex flex-col space-y-4 relative" },
});
/** @type {typeof __VLS_ctx.sidebarEl} */ ;
// @ts-ignore
[sidebarWidth, sidebarEl,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ onMousedown: (__VLS_ctx.startResize) },
    ...{ class: "absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors z-10" },
    title: "Drag to resize",
});
// @ts-ignore
[startResize,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "space-y-2 flex-shrink-0" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex gap-2" },
});
if (__VLS_ctx.modelKind === 'text-rest') {
    // @ts-ignore
    [modelKind,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-center px-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "material-icons text-2xl text-blue-600 transition-transform" },
        ...{ class: ({ 'animate-spin': __VLS_ctx.isConversationActive }) },
    });
    // @ts-ignore
    [isConversationActive,];
    (__VLS_ctx.getRoleIcon());
    // @ts-ignore
    [getRoleIcon,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex-1" },
    });
    if (__VLS_ctx.pluginResults.length > 0) {
        // @ts-ignore
        [pluginResults,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.modelKind === 'text-rest'))
                        return;
                    if (!(__VLS_ctx.pluginResults.length > 0))
                        return;
                    __VLS_ctx.$emit('clearResults');
                    // @ts-ignore
                    [$emit,];
                } },
            ...{ class: "px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center w-10" },
            title: "New conversation",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "material-icons text-lg" },
        });
    }
    if (__VLS_ctx.pluginResults.length === 0) {
        // @ts-ignore
        [pluginResults,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.modelKind === 'text-rest'))
                        return;
                    if (!(__VLS_ctx.pluginResults.length === 0))
                        return;
                    __VLS_ctx.showConfigPopup = true;
                    // @ts-ignore
                    [showConfigPopup,];
                } },
            ...{ class: "px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center justify-center w-10" },
            title: "Configuration",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "material-icons text-lg" },
        });
    }
}
else {
    if (!__VLS_ctx.chatActive) {
        // @ts-ignore
        [chatActive,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.modelKind === 'text-rest'))
                        return;
                    if (!(!__VLS_ctx.chatActive))
                        return;
                    __VLS_ctx.$emit('startChat');
                    // @ts-ignore
                    [$emit,];
                } },
            disabled: (__VLS_ctx.connecting),
            ...{ class: "flex-1 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50" },
        });
        // @ts-ignore
        [connecting,];
        (__VLS_ctx.connecting ? "Connecting..." : __VLS_ctx.connectButtonLabel);
        // @ts-ignore
        [connecting, connectButtonLabel,];
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex gap-2 w-full" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-center justify-center px-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "material-icons text-2xl text-blue-600 transition-transform" },
            ...{ class: ({ 'animate-spin': __VLS_ctx.isConversationActive }) },
        });
        // @ts-ignore
        [isConversationActive,];
        (__VLS_ctx.getRoleIcon());
        // @ts-ignore
        [getRoleIcon,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.modelKind === 'text-rest'))
                        return;
                    if (!!(!__VLS_ctx.chatActive))
                        return;
                    __VLS_ctx.$emit('stopChat');
                    // @ts-ignore
                    [$emit,];
                } },
            ...{ class: "flex-1 px-4 py-2 bg-red-600 text-white rounded" },
        });
        if (__VLS_ctx.supportsAudioInput) {
            // @ts-ignore
            [supportsAudioInput,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.modelKind === 'text-rest'))
                            return;
                        if (!!(!__VLS_ctx.chatActive))
                            return;
                        if (!(__VLS_ctx.supportsAudioInput))
                            return;
                        __VLS_ctx.$emit('setMute', !__VLS_ctx.isMuted);
                        // @ts-ignore
                        [$emit, isMuted,];
                    } },
                ...{ class: "px-3 py-2 rounded border flex items-center justify-center" },
                ...{ class: (__VLS_ctx.isMuted
                        ? 'bg-red-100 text-red-600 border-red-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300') },
                title: (__VLS_ctx.isMuted ? 'Unmute microphone' : 'Mute microphone'),
            });
            // @ts-ignore
            [isMuted, isMuted,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "material-icons text-lg" },
            });
            (__VLS_ctx.isMuted ? "mic_off" : "mic");
            // @ts-ignore
            [isMuted,];
        }
    }
    if (!__VLS_ctx.chatActive) {
        // @ts-ignore
        [chatActive,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.modelKind === 'text-rest'))
                        return;
                    if (!(!__VLS_ctx.chatActive))
                        return;
                    __VLS_ctx.showConfigPopup = true;
                    // @ts-ignore
                    [showConfigPopup,];
                } },
            ...{ class: "px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center justify-center" },
            title: "Configuration",
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "material-icons text-lg" },
        });
    }
}
if (__VLS_ctx.supportsAudioOutput) {
    // @ts-ignore
    [supportsAudioOutput,];
    __VLS_asFunctionalElement(__VLS_elements.audio, __VLS_elements.audio)({
        ref: "audioEl",
        autoplay: true,
    });
    /** @type {typeof __VLS_ctx.audioEl} */ ;
    // @ts-ignore
    [audioEl,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex-1 flex flex-col min-h-0" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ref: "imageContainer",
    ...{ class: "border rounded p-2 overflow-y-auto space-y-2 flex-1" },
});
/** @type {typeof __VLS_ctx.imageContainer} */ ;
// @ts-ignore
[imageContainer,];
if (!__VLS_ctx.pluginResults.length && !__VLS_ctx.isGeneratingImage) {
    // @ts-ignore
    [pluginResults, isGeneratingImage,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-gray-500 text-sm" },
    });
}
for (const [result, index] of __VLS_getVForSourceType((__VLS_ctx.pluginResults))) {
    // @ts-ignore
    [pluginResults,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('selectResult', result);
                // @ts-ignore
                [$emit,];
            } },
        key: (index),
        ...{ class: "cursor-pointer hover:opacity-75 transition-opacity border rounded p-2" },
        ...{ class: ({ 'ring-2 ring-blue-500': __VLS_ctx.selectedResult === result }) },
    });
    // @ts-ignore
    [selectedResult,];
    if (__VLS_ctx.getToolPlugin(result.toolName)?.previewComponent) {
        // @ts-ignore
        [getToolPlugin,];
        const __VLS_0 = ((__VLS_ctx.getToolPlugin(result.toolName).previewComponent));
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            result: (result),
        }));
        const __VLS_2 = __VLS_1({
            result: (result),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        // @ts-ignore
        [getToolPlugin,];
    }
}
if (__VLS_ctx.isGeneratingImage) {
    // @ts-ignore
    [isGeneratingImage,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex items-center justify-center py-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "ml-2 text-sm text-gray-600" },
    });
    (__VLS_ctx.generatingMessage);
    // @ts-ignore
    [generatingMessage,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "space-y-2 flex-shrink-0" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex gap-2 w-full" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.triggerFileUpload) },
    ...{ class: "px-3 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded hover:bg-gray-200 flex items-center justify-center flex-shrink-0" },
    title: "Upload image or PDF",
});
// @ts-ignore
[triggerFileUpload,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "text-lg" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onInput: (...[$event]) => {
            __VLS_ctx.$emit('update:userInput', $event.target.value);
            // @ts-ignore
            [$emit,];
        } },
    ...{ onKeydown: (__VLS_ctx.handleEnterKey) },
    value: (__VLS_ctx.userInput),
    disabled: (!__VLS_ctx.chatActive && __VLS_ctx.modelKind === 'voice-realtime'),
    type: "text",
    placeholder: "Type a message",
    ...{ class: "flex-1 min-w-0 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" },
});
// @ts-ignore
[modelKind, chatActive, handleEnterKey, userInput,];
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onChange: (__VLS_ctx.handleFileUpload) },
    ref: "fileInput",
    type: "file",
    accept: (__VLS_ctx.acceptedFileTypes),
    multiple: true,
    ...{ class: "hidden" },
});
/** @type {typeof __VLS_ctx.fileInput} */ ;
// @ts-ignore
[handleFileUpload, acceptedFileTypes, fileInput,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.handleSendClick) },
    disabled: ((__VLS_ctx.modelKind === 'voice-realtime' && !__VLS_ctx.chatActive) || !__VLS_ctx.userInput.trim()),
    ...{ class: "w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" },
});
// @ts-ignore
[modelKind, chatActive, userInput, handleSendClick,];
if (__VLS_ctx.showConfigPopup) {
    // @ts-ignore
    [showConfigPopup,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showConfigPopup))
                    return;
                __VLS_ctx.showConfigPopup = false;
                // @ts-ignore
                [showConfigPopup,];
            } },
        ...{ class: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] flex flex-col" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-between items-center mb-4 flex-shrink-0" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "text-xl font-semibold" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showConfigPopup))
                    return;
                __VLS_ctx.showConfigPopup = false;
                // @ts-ignore
                [showConfigPopup,];
            } },
        ...{ class: "text-gray-500 hover:text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-4 overflow-y-auto flex-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        ...{ onChange: (...[$event]) => {
                if (!(__VLS_ctx.showConfigPopup))
                    return;
                __VLS_ctx.$emit('update:modelKind', $event.target.value);
                // @ts-ignore
                [$emit,];
            } },
        value: (__VLS_ctx.modelKind),
        ...{ class: "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" },
    });
    // @ts-ignore
    [modelKind,];
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "voice-realtime",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "voice-google-live",
    });
    __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
        value: "text-rest",
    });
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs text-gray-500 mt-1" },
    });
    if (__VLS_ctx.isOpenAIRealtime) {
        // @ts-ignore
        [isOpenAIRealtime,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
            ...{ onChange: (...[$event]) => {
                    if (!(__VLS_ctx.showConfigPopup))
                        return;
                    if (!(__VLS_ctx.isOpenAIRealtime))
                        return;
                    __VLS_ctx.$emit('update:modelId', $event.target.value);
                    // @ts-ignore
                    [$emit,];
                } },
            value: (__VLS_ctx.modelId),
            ...{ class: "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" },
        });
        // @ts-ignore
        [modelId,];
        for (const [model] of __VLS_getVForSourceType((__VLS_ctx.REALTIME_MODELS))) {
            // @ts-ignore
            [REALTIME_MODELS,];
            __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
                key: (model.id),
                value: (model.id),
            });
            (model.label);
        }
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xs text-gray-500 mt-1" },
        });
    }
    if (__VLS_ctx.isGoogleLive) {
        // @ts-ignore
        [isGoogleLive,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
            ...{ onChange: (...[$event]) => {
                    if (!(__VLS_ctx.showConfigPopup))
                        return;
                    if (!(__VLS_ctx.isGoogleLive))
                        return;
                    __VLS_ctx.$emit('update:modelId', $event.target.value);
                    // @ts-ignore
                    [$emit,];
                } },
            value: (__VLS_ctx.modelId),
            ...{ class: "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" },
        });
        // @ts-ignore
        [modelId,];
        for (const [model] of __VLS_getVForSourceType((__VLS_ctx.GOOGLE_LIVE_MODELS))) {
            // @ts-ignore
            [GOOGLE_LIVE_MODELS,];
            __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
                key: (model.id),
                value: (model.id),
            });
            (model.label);
        }
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xs text-gray-500 mt-1" },
        });
    }
    if (__VLS_ctx.modelKind === 'text-rest') {
        // @ts-ignore
        [modelKind,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
            ...{ onChange: (...[$event]) => {
                    if (!(__VLS_ctx.showConfigPopup))
                        return;
                    if (!(__VLS_ctx.modelKind === 'text-rest'))
                        return;
                    __VLS_ctx.$emit('update:textModelId', $event.target.value);
                    // @ts-ignore
                    [$emit,];
                } },
            value: (__VLS_ctx.textModelId),
            ...{ class: "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" },
        });
        // @ts-ignore
        [textModelId,];
        for (const [option] of __VLS_getVForSourceType((__VLS_ctx.textModelOptions))) {
            // @ts-ignore
            [textModelOptions,];
            __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
                key: (option.id),
                value: (option.id),
                disabled: (option.disabled),
            });
            (option.label);
        }
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xs text-gray-500 mt-1" },
        });
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "relative" },
    });
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 pointer-events-none" },
    });
    (__VLS_ctx.getRoleIcon());
    // @ts-ignore
    [getRoleIcon,];
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        ...{ onChange: (...[$event]) => {
                if (!(__VLS_ctx.showConfigPopup))
                    return;
                __VLS_ctx.$emit('update:roleId', $event.target.value);
                // @ts-ignore
                [$emit,];
            } },
        value: (__VLS_ctx.roleId),
        ...{ class: "w-full border rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" },
    });
    // @ts-ignore
    [roleId,];
    for (const [role] of __VLS_getVForSourceType((__VLS_ctx.ROLES))) {
        // @ts-ignore
        [ROLES,];
        __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
            key: (role.id),
            value: (role.id),
        });
        (role.name);
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
        ...{ onChange: (...[$event]) => {
                if (!(__VLS_ctx.showConfigPopup))
                    return;
                __VLS_ctx.$emit('update:userLanguage', $event.target.value);
                // @ts-ignore
                [$emit,];
            } },
        value: (__VLS_ctx.userLanguage),
        ...{ class: "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" },
    });
    // @ts-ignore
    [userLanguage,];
    for (const [language] of __VLS_getVForSourceType((__VLS_ctx.LANGUAGES))) {
        // @ts-ignore
        [LANGUAGES,];
        __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
            key: (language.code),
            value: (language.code),
        });
        (language.name);
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "flex items-center space-x-2 cursor-pointer" },
    });
    __VLS_asFunctionalElement(__VLS_elements.input)({
        ...{ onChange: (...[$event]) => {
                if (!(__VLS_ctx.showConfigPopup))
                    return;
                __VLS_ctx.$emit('update:suppressInstructions', $event.target.checked);
                // @ts-ignore
                [$emit,];
            } },
        type: "checkbox",
        checked: (__VLS_ctx.suppressInstructions),
        ...{ class: "rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500" },
    });
    // @ts-ignore
    [suppressInstructions,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "text-sm font-medium text-gray-700" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
    __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
        ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
    });
    __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
        ...{ onInput: (...[$event]) => {
                if (!(__VLS_ctx.showConfigPopup))
                    return;
                __VLS_ctx.$emit('update:customInstructions', $event.target.value);
                // @ts-ignore
                [$emit,];
            } },
        value: (__VLS_ctx.customInstructions),
        placeholder: "Add additional instructions for the AI...",
        ...{ class: "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-20" },
    });
    // @ts-ignore
    [customInstructions,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs text-gray-500 mt-1" },
    });
    if (__VLS_ctx.isCurrentRoleCustomizable) {
        // @ts-ignore
        [isCurrentRoleCustomizable,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "max-h-60 overflow-y-auto border rounded p-2 space-y-1" },
        });
        for (const [pluginModule] of __VLS_getVForSourceType((__VLS_ctx.getPluginList()))) {
            // @ts-ignore
            [getPluginList,];
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
                key: (pluginModule.plugin.toolDefinition.name),
                ...{ class: "flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded" },
            });
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onChange: (...[$event]) => {
                        if (!(__VLS_ctx.showConfigPopup))
                            return;
                        if (!(__VLS_ctx.isCurrentRoleCustomizable))
                            return;
                        __VLS_ctx.handlePluginToggle(pluginModule.plugin.toolDefinition.name, $event.target.checked);
                        // @ts-ignore
                        [handlePluginToggle,];
                    } },
                type: "checkbox",
                checked: (__VLS_ctx.enabledPlugins[pluginModule.plugin.toolDefinition.name] ??
                    true),
                ...{ class: "rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500" },
            });
            // @ts-ignore
            [enabledPlugins,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-sm text-gray-700" },
            });
            (pluginModule.plugin.toolDefinition.name);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "plugins-info" },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-xs text-gray-500 mb-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex flex-wrap gap-2 max-h-60 overflow-y-auto border rounded p-2 bg-gray-50" },
        });
        for (const [pluginName] of __VLS_getVForSourceType((__VLS_ctx.availablePluginsForCurrentRole))) {
            // @ts-ignore
            [availablePluginsForCurrentRole,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                key: (pluginName),
                ...{ class: "inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium" },
            });
            (pluginName);
        }
    }
    if (__VLS_ctx.hasAnyPluginConfig()) {
        // @ts-ignore
        [hasAnyPluginConfig,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "block text-sm font-medium text-gray-700 mb-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "space-y-4" },
        });
        for (const [pluginModule] of __VLS_getVForSourceType((__VLS_ctx.getPluginsWithConfig(__VLS_ctx.roleId)))) {
            // @ts-ignore
            [roleId, getPluginsWithConfig,];
            const __VLS_5 = ((pluginModule.plugin.config.component));
            // @ts-ignore
            const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
                ...{ 'onUpdate:value': {} },
                key: (pluginModule.plugin.config.key),
                value: (__VLS_ctx.pluginConfigs[pluginModule.plugin.config.key] ??
                    pluginModule.plugin.config.defaultValue),
            }));
            const __VLS_7 = __VLS_6({
                ...{ 'onUpdate:value': {} },
                key: (pluginModule.plugin.config.key),
                value: (__VLS_ctx.pluginConfigs[pluginModule.plugin.config.key] ??
                    pluginModule.plugin.config.defaultValue),
            }, ...__VLS_functionalComponentArgsRest(__VLS_6));
            let __VLS_9;
            let __VLS_10;
            const __VLS_11 = ({ 'update:value': {} },
                { 'onUpdate:value': (...[$event]) => {
                        if (!(__VLS_ctx.showConfigPopup))
                            return;
                        if (!(__VLS_ctx.hasAnyPluginConfig()))
                            return;
                        __VLS_ctx.handlePluginConfigUpdate(pluginModule.plugin.config.key, $event);
                        // @ts-ignore
                        [pluginConfigs, handlePluginConfigUpdate,];
                    } });
            var __VLS_8;
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-end mt-4 pt-4 border-t flex-shrink-0" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showConfigPopup))
                    return;
                __VLS_ctx.showConfigPopup = false;
                // @ts-ignore
                [showConfigPopup,];
            } },
        ...{ class: "px-4 py-2 text-gray-600 hover:text-gray-800" },
    });
}
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['top-0']} */ ;
/** @type {__VLS_StyleScopedClasses['right-0']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-col-resize']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-transform']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-0']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:opacity-75']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-opacity']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-0']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-3']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['transform']} */ ;
/** @type {__VLS_StyleScopedClasses['-translate-y-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-10']} */ ;
/** @type {__VLS_StyleScopedClasses['pr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['resize-y']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-20']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-60']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['p-1']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['plugins-info']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-60']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-100']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-gray-800']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        getToolPlugin: getToolPlugin,
        getPluginList: getPluginList,
        getPluginsWithConfig: getPluginsWithConfig,
        hasAnyPluginConfig: hasAnyPluginConfig,
        LANGUAGES: LANGUAGES,
        ROLES: ROLES,
        REALTIME_MODELS: REALTIME_MODELS,
        GOOGLE_LIVE_MODELS: GOOGLE_LIVE_MODELS,
        audioEl: audioEl,
        imageContainer: imageContainer,
        fileInput: fileInput,
        showConfigPopup: showConfigPopup,
        sidebarEl: sidebarEl,
        sidebarWidth: sidebarWidth,
        startResize: startResize,
        acceptedFileTypes: acceptedFileTypes,
        isOpenAIRealtime: isOpenAIRealtime,
        isGoogleLive: isGoogleLive,
        connectButtonLabel: connectButtonLabel,
        isCurrentRoleCustomizable: isCurrentRoleCustomizable,
        availablePluginsForCurrentRole: availablePluginsForCurrentRole,
        triggerFileUpload: triggerFileUpload,
        handleFileUpload: handleFileUpload,
        handlePluginToggle: handlePluginToggle,
        handlePluginConfigUpdate: handlePluginConfigUpdate,
        getRoleIcon: getRoleIcon,
        handleEnterKey: handleEnterKey,
        handleSendClick: handleSendClick,
    }),
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup: () => (__VLS_exposed),
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
