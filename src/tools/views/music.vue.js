import { ref, onMounted, watch, onUnmounted } from "vue";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
// @ts-ignore
import PlaybackEngine from "osmd-audio-player";
const props = defineProps();
const musicContainer = ref(null);
let osmd = null;
let player = null;
const isLoaded = ref(false);
const isPlaying = ref(false);
const tempo = ref(200);
const loop = ref(false);
const metronome = ref(false);
const renderMusic = async () => {
    if (!musicContainer.value || !props.selectedResult.data?.musicXML) {
        return;
    }
    try {
        // Clear previous rendering
        musicContainer.value.innerHTML = "";
        isLoaded.value = false;
        isPlaying.value = false;
        // Create new OSMD instance
        osmd = new OpenSheetMusicDisplay(musicContainer.value, {
            autoResize: true,
            backend: "svg",
            drawTitle: false,
            followCursor: true,
        });
        // Load and render the MusicXML
        await osmd.load(props.selectedResult.data.musicXML);
        await osmd.render();
        // Initialize audio player
        if (!player) {
            player = new PlaybackEngine();
        }
        // Load score into audio player
        await player.loadScore(osmd);
        // Extract tempo from the score if available
        const scoreTempos = osmd.Sheet?.SourceMeasures?.[0]?.TempoExpressions;
        if (scoreTempos && scoreTempos.length > 0) {
            const firstTempo = scoreTempos[0];
            // @ts-ignore - OSMD tempo property access
            const tempoValue = firstTempo.TempoInBpm || firstTempo.tempoInBpm;
            if (tempoValue) {
                tempo.value = tempoValue;
            }
        }
        // Listen for iteration events (fires when playback completes)
        player.on("iteration", (data) => {
            // Check if we've reached the end and not looping
            if (!loop.value && data && data.length === 0) {
                player.stop();
                isPlaying.value = false;
            }
        });
        isLoaded.value = true;
    }
    catch (error) {
        console.error("Error rendering music:", error);
        if (musicContainer.value) {
            musicContainer.value.innerHTML = `<div class="text-red-500">Error rendering sheet music: ${error instanceof Error ? error.message : "Unknown error"}</div>`;
        }
    }
};
const handlePlay = async () => {
    if (!player || !isLoaded.value)
        return;
    player.setBpm(Math.max(30, Math.min(300, tempo.value)));
    player.metronomeVolume = metronome.value ? 0.7 : 0.0;
    player.isLooping = loop.value;
    await player.play();
    isPlaying.value = true;
};
const handlePause = () => {
    if (!player)
        return;
    player.pause();
    isPlaying.value = false;
};
const handleStop = () => {
    if (!player)
        return;
    player.stop();
    isPlaying.value = false;
};
watch(tempo, () => {
    if (player) {
        player.setBpm(Math.max(30, Math.min(300, tempo.value)));
    }
});
watch(loop, () => {
    if (player) {
        player.isLooping = loop.value;
    }
});
watch(metronome, () => {
    if (player) {
        player.metronomeVolume = metronome.value ? 0.7 : 0.0;
    }
});
onMounted(() => {
    renderMusic();
});
watch(() => props.selectedResult.data?.musicXML, () => {
    renderMusic();
});
onUnmounted(() => {
    if (player) {
        player.stop();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full h-full overflow-y-auto" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "min-h-full flex flex-col p-4" },
});
if (__VLS_ctx.selectedResult.title) {
    // @ts-ignore
    [selectedResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mb-4 text-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "text-2xl font-bold text-gray-900" },
    });
    (__VLS_ctx.selectedResult.title);
    // @ts-ignore
    [selectedResult,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "mb-4 flex gap-2 items-center justify-center" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isPlaying ? __VLS_ctx.handleStop() : __VLS_ctx.handlePlay();
            // @ts-ignore
            [isPlaying, handleStop, handlePlay,];
        } },
    disabled: (!__VLS_ctx.isLoaded),
    ...{ class: "px-4 py-2 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1" },
    ...{ class: (__VLS_ctx.isPlaying ? 'bg-red-500' : 'bg-blue-500') },
});
// @ts-ignore
[isPlaying, isLoaded,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons" },
});
(__VLS_ctx.isPlaying ? "stop" : "play_arrow");
// @ts-ignore
[isPlaying,];
(__VLS_ctx.isPlaying ? "Stop" : "Play");
// @ts-ignore
[isPlaying,];
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "flex items-center gap-2" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "number",
    min: "30",
    max: "300",
    ...{ class: "w-20 px-2 py-1 border rounded" },
});
(__VLS_ctx.tempo);
// @ts-ignore
[tempo,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ref: "musicContainer",
    ...{ class: "flex-1 flex items-center justify-center bg-white rounded-lg p-4" },
});
/** @type {typeof __VLS_ctx.musicContainer} */ ;
// @ts-ignore
[musicContainer,];
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:bg-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled:cursor-not-allowed']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-20']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        musicContainer: musicContainer,
        isLoaded: isLoaded,
        isPlaying: isPlaying,
        tempo: tempo,
        handlePlay: handlePlay,
        handleStop: handleStop,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
