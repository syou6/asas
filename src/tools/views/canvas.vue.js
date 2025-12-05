import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import VueDrawingCanvas from "vue-drawing-canvas";
const props = defineProps();
const emit = defineEmits();
const canvasRef = ref(null);
const canvasImage = ref("");
const brushSize = ref(5);
const brushColor = ref("#000000");
const initialStrokes = ref([]);
const canvasWidth = ref(800);
const canvasHeight = ref(600);
const canvasRenderKey = ref(0);
const restoreDrawingState = () => {
    if (props.selectedResult?.viewState?.drawingState) {
        const state = props.selectedResult.viewState.drawingState;
        brushSize.value = state.brushSize || 5;
        brushColor.value = state.brushColor || "#000000";
        canvasWidth.value = state.canvasWidth || 800;
        canvasHeight.value = state.canvasHeight || 600;
        if (state.strokes) {
            initialStrokes.value = state.strokes;
        }
        else {
            initialStrokes.value = [];
        }
    }
    else {
        initialStrokes.value = [];
    }
};
restoreDrawingState();
const undo = async () => {
    if (canvasRef.value) {
        try {
            canvasRef.value.undo();
            // Wait for the canvas to update, then save state
            //await nextTick();
            setTimeout(saveDrawingState, 50);
        }
        catch (error) {
            console.warn("Undo operation failed:", error);
        }
    }
};
const redo = async () => {
    if (canvasRef.value) {
        try {
            canvasRef.value.redo();
            // Wait for the canvas to update, then save state
            //await nextTick();
            setTimeout(saveDrawingState, 50);
        }
        catch (error) {
            console.warn("Redo operation failed:", error);
        }
    }
};
const clear = () => {
    if (canvasRef.value) {
        try {
            canvasRef.value.reset();
            saveDrawingState();
        }
        catch (error) {
            console.warn("Clear operation failed:", error);
        }
    }
};
const handleDrawingEnd = () => {
    saveDrawingState();
};
const saveDrawingState = async () => {
    if (canvasRef.value && props.selectedResult) {
        try {
            const imageData = await canvasRef.value.save();
            const strokes = canvasRef.value.getAllStrokes();
            const drawingState = {
                strokes,
                brushSize: brushSize.value,
                brushColor: brushColor.value,
                canvasWidth: canvasWidth.value,
                canvasHeight: canvasHeight.value,
            };
            const updatedResult = {
                ...props.selectedResult,
                data: {
                    prompt: props.selectedResult.data?.prompt || "",
                    imageData: imageData,
                },
                viewState: {
                    drawingState,
                },
            };
            emit("updateResult", updatedResult);
        }
        catch (error) {
            console.error("Failed to save drawing state:", error);
        }
    }
};
// Watch for selectedResult changes to restore drawing state
watch(() => props.selectedResult, () => {
    restoreDrawingState();
}, { immediate: false });
// Watch for changes to automatically save drawing state
watch([brushSize, brushColor], () => {
    saveDrawingState();
});
// Watch for canvas size changes and force re-mount
watch([canvasWidth, canvasHeight], () => {
    // Force canvas to re-mount with new dimensions by changing the key
    canvasRenderKey.value++;
});
const updateCanvasSize = () => {
    // Get the canvas container (the div with flex-1 p-4 overflow-hidden)
    const canvasContainer = canvasRef.value?.$el?.parentElement;
    if (canvasContainer) {
        const containerRect = canvasContainer.getBoundingClientRect();
        // Be more conservative with width - subtract more for padding, borders, scrollbars
        const availableWidth = containerRect.width - 64; // More margin for width
        const availableHeight = containerRect.height - 64; // More margin for height
        // Cap the width to ensure it doesn't overflow
        const newWidth = Math.max(300, Math.min(600, Math.floor(availableWidth)));
        const newHeight = Math.max(200, Math.min(400, Math.floor(availableHeight)));
        // Only update if the size actually changed to avoid unnecessary re-renders
        if (newWidth !== canvasWidth.value || newHeight !== canvasHeight.value) {
            canvasWidth.value = newWidth;
            canvasHeight.value = newHeight;
        }
    }
};
onMounted(async () => {
    await nextTick();
    updateCanvasSize();
    // Listen for window resize to update canvas size
    window.addEventListener("resize", updateCanvasSize);
    /*
    // Restore state after canvas is mounted with a delay
    setTimeout(() => {
      restoreDrawingState();
    }, 200);
    */
});
// Clean up resize listener
onUnmounted(() => {
    window.removeEventListener("resize", updateCanvasSize);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full h-full flex flex-col bg-white" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex-shrink-0 p-4 border-b bg-gray-50" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center justify-between gap-4" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center gap-4" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center gap-2" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex gap-1" },
});
for (const [size] of __VLS_getVForSourceType(([2, 5, 10, 20]))) {
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.brushSize = size;
                // @ts-ignore
                [brushSize,];
            } },
        key: (size),
        ...{ class: ([
                'w-8 h-8 rounded border-2 transition-colors',
                __VLS_ctx.brushSize === size
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-gray-300 bg-white hover:bg-gray-50',
            ]) },
    });
    // @ts-ignore
    [brushSize,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: ('bg-gray-800 rounded-full mx-auto') },
        ...{ style: ({
                width: Math.max(2, size * 1) + 'px',
                height: Math.max(2, size * 1) + 'px',
            }) },
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center gap-2" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    type: "color",
    ...{ class: "w-12 h-8 rounded border" },
});
(__VLS_ctx.brushColor);
// @ts-ignore
[brushColor,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center gap-1" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.undo) },
    ...{ class: "w-8 h-8 flex items-center justify-center rounded border-2 border-gray-300 bg-white hover:bg-gray-50" },
    title: "Undo",
});
// @ts-ignore
[undo,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons text-gray-600" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.redo) },
    ...{ class: "w-8 h-8 flex items-center justify-center rounded border-2 border-gray-300 bg-white hover:bg-gray-50" },
    title: "Redo",
});
// @ts-ignore
[redo,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons text-gray-600" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.clear) },
    ...{ class: "w-8 h-8 flex items-center justify-center rounded border-2 border-red-300 bg-white hover:bg-red-50" },
    title: "Clear",
});
// @ts-ignore
[clear,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons text-red-600" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex-1 p-4 overflow-hidden" },
});
const __VLS_0 = {}.VueDrawingCanvas;
/** @type {[typeof __VLS_components.VueDrawingCanvas, ]} */ ;
// @ts-ignore
VueDrawingCanvas;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onMouseup': {} },
    ...{ 'onTouchend': {} },
    ref: "canvasRef",
    key: (`${__VLS_ctx.selectedResult?.uuid || 'default'}-${__VLS_ctx.canvasRenderKey}`),
    image: (__VLS_ctx.canvasImage),
    width: (__VLS_ctx.canvasWidth),
    height: (__VLS_ctx.canvasHeight),
    strokeType: ('dash'),
    lineCap: ('round'),
    lineJoin: ('round'),
    fillShape: (false),
    eraser: (false),
    lineWidth: (__VLS_ctx.brushSize),
    color: (__VLS_ctx.brushColor),
    backgroundColor: ('#FFFFFF'),
    backgroundImage: (undefined),
    watermark: (undefined),
    initialImage: (__VLS_ctx.initialStrokes),
    saveAs: "png",
    styles: ({
        border: '1px solid #ddd',
        borderRadius: '8px',
    }),
    lock: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onMouseup': {} },
    ...{ 'onTouchend': {} },
    ref: "canvasRef",
    key: (`${__VLS_ctx.selectedResult?.uuid || 'default'}-${__VLS_ctx.canvasRenderKey}`),
    image: (__VLS_ctx.canvasImage),
    width: (__VLS_ctx.canvasWidth),
    height: (__VLS_ctx.canvasHeight),
    strokeType: ('dash'),
    lineCap: ('round'),
    lineJoin: ('round'),
    fillShape: (false),
    eraser: (false),
    lineWidth: (__VLS_ctx.brushSize),
    color: (__VLS_ctx.brushColor),
    backgroundColor: ('#FFFFFF'),
    backgroundImage: (undefined),
    watermark: (undefined),
    initialImage: (__VLS_ctx.initialStrokes),
    saveAs: "png",
    styles: ({
        border: '1px solid #ddd',
        borderRadius: '8px',
    }),
    lock: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
const __VLS_6 = ({ mouseup: {} },
    { onMouseup: (__VLS_ctx.handleDrawingEnd) });
const __VLS_7 = ({ touchend: {} },
    { onTouchend: (__VLS_ctx.handleDrawingEnd) });
/** @type {typeof __VLS_ctx.canvasRef} */ ;
var __VLS_8 = {};
// @ts-ignore
[brushSize, brushColor, selectedResult, canvasRenderKey, canvasImage, canvasWidth, canvasHeight, initialStrokes, handleDrawingEnd, handleDrawingEnd, canvasRef,];
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-300']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-red-50']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
// @ts-ignore
var __VLS_9 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        VueDrawingCanvas: VueDrawingCanvas,
        canvasRef: canvasRef,
        canvasImage: canvasImage,
        brushSize: brushSize,
        brushColor: brushColor,
        initialStrokes: initialStrokes,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        canvasRenderKey: canvasRenderKey,
        undo: undo,
        redo: redo,
        clear: clear,
        handleDrawingEnd: handleDrawingEnd,
    }),
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
