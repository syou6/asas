import { ref, computed, onUnmounted, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
const props = defineProps();
const emit = defineEmits();
const movieUrl = ref(null);
const videoEl = ref(null);
const isGeneratingMovie = ref(false);
const movieError = ref(null);
const parseError = ref(null);
const editableScript = ref(JSON.stringify(props.selectedResult?.data?.mulmoScript, null, 2) || "");
// moviePath comes from selectedResult now
const moviePath = computed(() => props.selectedResult?.data?.moviePath || null);
// Check if script has been modified
const hasChanges = computed(() => {
    const currentScript = JSON.stringify(props.selectedResult?.data?.mulmoScript, null, 2);
    return editableScript.value !== currentScript;
});
onUnmounted(() => {
    if (movieUrl.value) {
        URL.revokeObjectURL(movieUrl.value);
    }
});
// Generate movie when component mounts with mulmoScript
watch(() => props.selectedResult?.data?.mulmoScript, async (mulmoScript) => {
    if (!mulmoScript ||
        props.selectedResult?.data?.moviePath ||
        isGeneratingMovie.value ||
        !props.selectedResult)
        return;
    isGeneratingMovie.value = true;
    movieError.value = null;
    try {
        const uuid = uuidv4();
        const movieResponse = await fetch("/api/generate-movie", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mulmoScript,
                uuid,
                images: props.selectedResult?.data?.images || {},
            }),
        });
        if (movieResponse.ok) {
            const movieResult = await movieResponse.json();
            // Update the result with moviePath and notify parent
            const updatedResult = {
                ...props.selectedResult,
                data: {
                    ...props.selectedResult.data,
                    moviePath: movieResult.outputPath,
                },
            };
            emit("updateResult", updatedResult);
        }
        else {
            const error = await movieResponse.json();
            movieError.value =
                error.details || error.error || "Failed to generate movie";
            console.error("Movie generation failed:", movieError.value);
        }
    }
    catch (error) {
        movieError.value =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Movie generation exception:", error);
    }
    finally {
        isGeneratingMovie.value = false;
    }
}, { immediate: true });
// Load movie automatically when moviePath exists
watch(moviePath, async (path) => {
    if (!path)
        return;
    try {
        const response = await fetch("/api/download-movie", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                moviePath: path,
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to load movie");
        }
        const blob = await response.blob();
        if (movieUrl.value) {
            URL.revokeObjectURL(movieUrl.value);
        }
        movieUrl.value = URL.createObjectURL(blob);
    }
    catch (error) {
        console.error("Movie loading failed:", error);
    }
}, { immediate: true });
const downloadMulmoScript = () => {
    if (!props.selectedResult?.data?.mulmoScript)
        return;
    const jsonString = JSON.stringify(props.selectedResult.data.mulmoScript, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mulmoscript.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
const downloadMovie = async () => {
    if (!moviePath.value)
        return;
    try {
        const response = await fetch("/api/download-movie", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                moviePath: moviePath.value,
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to download movie");
        }
        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : "movie.mp4";
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    catch (error) {
        console.error("Movie download failed:", error);
        alert(`Failed to download movie: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
const handlePlay = () => {
    props.setMute?.(true);
};
const handlePause = () => {
    props.setMute?.(false);
};
const handleEnded = () => {
    props.setMute?.(false);
};
function handleScriptEdit() {
    // Just update the local state, don't apply yet
    // User needs to click "Apply Changes" button
}
function applyScript() {
    try {
        // Try to parse the script first to validate it
        const parsedScript = JSON.parse(editableScript.value);
        parseError.value = null;
        // Update the result with new script (reset moviePath since script changed)
        const updatedResult = {
            ...props.selectedResult,
            data: {
                ...props.selectedResult.data,
                mulmoScript: parsedScript,
                moviePath: undefined, // Reset movie path so it regenerates
            },
        };
        emit("updateResult", updatedResult);
    }
    catch (error) {
        parseError.value = error instanceof Error ? error.message : "Invalid JSON";
        console.error("Script validation failed:", error);
    }
}
// Watch for external changes to selectedResult (when user clicks different result)
watch(() => props.selectedResult?.data?.mulmoScript, (newScript) => {
    editableScript.value = JSON.stringify(newScript, null, 2) || "";
    parseError.value = null;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['script-source']} */ ;
/** @type {__VLS_StyleScopedClasses['script-source']} */ ;
/** @type {__VLS_StyleScopedClasses['script-source']} */ ;
/** @type {__VLS_StyleScopedClasses['script-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mulmocast-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mulmocast-content-wrapper" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "p-4" },
});
if (__VLS_ctx.selectedResult?.data?.mulmoScript?.title) {
    // @ts-ignore
    [selectedResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
        ...{ style: {} },
    });
    (__VLS_ctx.selectedResult.data.mulmoScript.title);
    // @ts-ignore
    [selectedResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.downloadMulmoScript) },
        ...{ style: {} },
    });
    // @ts-ignore
    [downloadMulmoScript,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "material-icons" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.downloadMovie) },
        disabled: (!__VLS_ctx.moviePath),
        ...{ style: ({
                padding: '0.5em 1em',
                backgroundColor: __VLS_ctx.moviePath ? '#2196f3' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: __VLS_ctx.moviePath ? 'pointer' : 'not-allowed',
                fontSize: '0.9em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
            }) },
    });
    // @ts-ignore
    [downloadMovie, moviePath, moviePath, moviePath,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "material-icons" },
        ...{ style: ({
                fontSize: '1.2em',
                animation: __VLS_ctx.isGeneratingMovie
                    ? 'spin 1s linear infinite'
                    : 'none',
            }) },
    });
    // @ts-ignore
    [isGeneratingMovie,];
    (__VLS_ctx.isGeneratingMovie ? "hourglass_empty" : "download");
    // @ts-ignore
    [isGeneratingMovie,];
}
if (__VLS_ctx.selectedResult?.data?.mulmoScript?.beats) {
    // @ts-ignore
    [selectedResult,];
    for (const [beat, index] of __VLS_getVForSourceType((__VLS_ctx.selectedResult.data.mulmoScript.beats))) {
        // @ts-ignore
        [selectedResult,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (beat.id),
            ...{ style: {} },
        });
        if (index === 0 && __VLS_ctx.movieError) {
            // @ts-ignore
            [movieError,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ style: {} },
            });
            (__VLS_ctx.movieError);
            // @ts-ignore
            [movieError,];
        }
        else if (index === 0 && __VLS_ctx.moviePath && __VLS_ctx.movieUrl) {
            // @ts-ignore
            [moviePath, movieUrl,];
            __VLS_asFunctionalElement(__VLS_elements.video)({
                ...{ onPlay: (__VLS_ctx.handlePlay) },
                ...{ onPause: (__VLS_ctx.handlePause) },
                ...{ onEnded: (__VLS_ctx.handleEnded) },
                ref: "videoEl",
                src: (__VLS_ctx.movieUrl),
                controls: true,
                ...{ style: {} },
            });
            /** @type {typeof __VLS_ctx.videoEl} */ ;
            // @ts-ignore
            [movieUrl, handlePlay, handlePause, handleEnded, videoEl,];
        }
        else if (beat.id && __VLS_ctx.selectedResult.data?.images?.[beat.id]) {
            // @ts-ignore
            [selectedResult,];
            __VLS_asFunctionalElement(__VLS_elements.img)({
                src: (`data:image/png;base64,${__VLS_ctx.selectedResult.data.images[beat.id]}`),
                alt: (beat.text),
                ...{ style: {} },
            });
            // @ts-ignore
            [selectedResult,];
        }
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ style: {} },
        });
        (beat.text);
    }
}
if (__VLS_ctx.selectedResult?.data?.mulmoScript) {
    // @ts-ignore
    [selectedResult,];
    __VLS_asFunctionalElement(__VLS_elements.details, __VLS_elements.details)({
        ...{ class: "script-source" },
    });
    __VLS_asFunctionalElement(__VLS_elements.summary, __VLS_elements.summary)({});
    if (__VLS_ctx.parseError) {
        // @ts-ignore
        [parseError,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "error" },
        });
        __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
        (__VLS_ctx.parseError);
        // @ts-ignore
        [parseError,];
    }
    __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
        ...{ onInput: (__VLS_ctx.handleScriptEdit) },
        value: (__VLS_ctx.editableScript),
        ...{ class: "script-editor" },
        spellcheck: "false",
    });
    // @ts-ignore
    [handleScriptEdit, editableScript,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.applyScript) },
        ...{ class: "apply-btn" },
        disabled: (!__VLS_ctx.hasChanges),
    });
    // @ts-ignore
    [applyScript, hasChanges,];
}
/** @type {__VLS_StyleScopedClasses['mulmocast-container']} */ ;
/** @type {__VLS_StyleScopedClasses['mulmocast-content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['script-source']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['script-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        movieUrl: movieUrl,
        videoEl: videoEl,
        isGeneratingMovie: isGeneratingMovie,
        movieError: movieError,
        parseError: parseError,
        editableScript: editableScript,
        moviePath: moviePath,
        hasChanges: hasChanges,
        downloadMulmoScript: downloadMulmoScript,
        downloadMovie: downloadMovie,
        handlePlay: handlePlay,
        handlePause: handlePause,
        handleEnded: handleEnded,
        handleScriptEdit: handleScriptEdit,
        applyScript: applyScript,
    }),
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
