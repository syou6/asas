export const TEXT_MODEL_PROVIDERS = [
    "openai",
    "anthropic",
    "google",
    "ollama",
];
const DEFAULT_MODEL_ID = "openai:gpt-4o-mini";
export const DEFAULT_TEXT_MODEL = {
    provider: "openai",
    model: "gpt-4o-mini",
    rawId: DEFAULT_MODEL_ID,
};
function isTextProvider(value) {
    return TEXT_MODEL_PROVIDERS.includes(value);
}
export function resolveTextModelId(modelId) {
    if (!modelId) {
        return DEFAULT_TEXT_MODEL;
    }
    const trimmed = modelId.trim();
    if (!trimmed) {
        return DEFAULT_TEXT_MODEL;
    }
    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex <= 0) {
        return DEFAULT_TEXT_MODEL;
    }
    const provider = trimmed.slice(0, separatorIndex);
    const model = trimmed.slice(separatorIndex + 1).trim();
    if (!isTextProvider(provider) || !model) {
        return DEFAULT_TEXT_MODEL;
    }
    return {
        provider,
        model,
        rawId: trimmed,
    };
}
