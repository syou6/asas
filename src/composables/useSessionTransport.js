import { computed, unref } from "vue";
import { useVoiceRealtimeSession } from "./useVoiceRealtimeSession";
import { useTextSession } from "./useTextSession";
import { useGoogleLiveSession } from "./useGoogleLiveSession";
export function useSessionTransport(options) {
    const { transportKind: providedKind, ...realtimeOptions } = options;
    const transportKind = computed(() => {
        const kind = providedKind ? unref(providedKind) : "voice-realtime";
        return kind;
    });
    const voiceSession = useVoiceRealtimeSession(realtimeOptions);
    const textSession = useTextSession(realtimeOptions);
    const googleLiveSession = useGoogleLiveSession(realtimeOptions);
    const activeSession = computed(() => {
        if (transportKind.value === "text-rest")
            return textSession;
        if (transportKind.value === "voice-google-live")
            return googleLiveSession;
        return voiceSession;
    });
    const capabilities = computed(() => {
        if (transportKind.value === "voice-realtime") {
            return {
                supportsAudioInput: true,
                supportsAudioOutput: true,
                supportsText: true,
            };
        }
        if (transportKind.value === "voice-google-live") {
            return {
                supportsAudioInput: true,
                supportsAudioOutput: true,
                supportsText: true,
            };
        }
        return {
            supportsAudioInput: false,
            supportsAudioOutput: false,
            supportsText: true,
        };
    });
    return {
        chatActive: computed(() => activeSession.value.chatActive.value),
        conversationActive: computed(() => activeSession.value.conversationActive.value),
        connecting: computed(() => activeSession.value.connecting.value),
        isMuted: computed(() => activeSession.value.isMuted.value),
        startResponse: computed(() => activeSession.value.startResponse.value),
        isDataChannelOpen: () => activeSession.value.isDataChannelOpen(),
        startChat: () => activeSession.value.startChat(),
        stopChat: () => activeSession.value.stopChat(),
        sendUserMessage: (text) => activeSession.value.sendUserMessage(text),
        sendFunctionCallOutput: (callId, output) => activeSession.value.sendFunctionCallOutput(callId, output),
        sendInstructions: (instructions) => activeSession.value.sendInstructions(instructions),
        setMute: (muted) => activeSession.value.setMute(muted),
        setLocalAudioEnabled: (enabled) => activeSession.value.setLocalAudioEnabled(enabled),
        attachRemoteAudioElement: (...args) => activeSession.value.attachRemoteAudioElement(...args),
        registerEventHandlers: (handlers) => {
            voiceSession.registerEventHandlers(handlers);
            textSession.registerEventHandlers(handlers);
            googleLiveSession.registerEventHandlers(handlers);
        },
        transportKind,
        capabilities,
    };
}
