const __VLS_props = defineProps();
function isStarPoint(row, col) {
    const starPoints = [
        [2, 2],
        [2, 6],
        [4, 4],
        [6, 2],
        [6, 6],
    ];
    return starPoints.some(([r, c]) => r === row && c === col);
}
function getGameResult(gameState) {
    if (!gameState.isTerminal)
        return "";
    if (gameState.winner === "draw")
        return "Draw!";
    if (gameState.winner === "B")
        return "⚫ Black Wins!";
    if (gameState.winner === "W")
        return "⚪ White Wins!";
    return "Game Over";
}
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "p-3 bg-amber-50 rounded" },
});
if (__VLS_ctx.result.jsonData) {
    // @ts-ignore
    [result,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex justify-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "inline-block relative" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-9" },
        ...{ style: {} },
    });
    for (const [row, rowIndex] of __VLS_getVForSourceType((__VLS_ctx.result.jsonData.board))) {
        (rowIndex);
        // @ts-ignore
        [result,];
        for (const [cell, colIndex] of __VLS_getVForSourceType((row))) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (`${rowIndex}-${colIndex}`),
                ...{ class: "w-3 h-3 flex items-center justify-center relative" },
            });
            if (rowIndex < 8) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "absolute left-1/2 top-1/2 w-px bg-black" },
                    ...{ style: {} },
                });
            }
            if (colIndex < 8) {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "absolute left-1/2 top-1/2 h-px bg-black" },
                    ...{ style: {} },
                });
            }
            if (__VLS_ctx.isStarPoint(rowIndex, colIndex)) {
                // @ts-ignore
                [isStarPoint,];
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "absolute w-1 h-1 bg-black rounded-full" },
                    ...{ style: {} },
                });
            }
            if (cell === 'B') {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "w-2.5 h-2.5 bg-black rounded-full relative" },
                    ...{ style: {} },
                });
            }
            else if (cell === 'W') {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "w-2.5 h-2.5 bg-white rounded-full border border-gray-300 relative" },
                    ...{ style: {} },
                });
            }
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs text-center space-y-1" },
    });
    if (!__VLS_ctx.result.jsonData.isTerminal) {
        // @ts-ignore
        [result,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-gray-600" },
        });
        (__VLS_ctx.result.jsonData.currentSide === "B" ? "⚫" : "⚪");
        (__VLS_ctx.capitalizeFirst(__VLS_ctx.result.jsonData.playerNames[__VLS_ctx.result.jsonData.currentSide]));
        // @ts-ignore
        [result, result, result, capitalizeFirst,];
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "font-medium" },
        });
        (__VLS_ctx.getGameResult(__VLS_ctx.result.jsonData));
        // @ts-ignore
        [result, getGameResult,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-gray-500 text-xs" },
    });
    (__VLS_ctx.result.jsonData.capturedStones.B);
    (__VLS_ctx.result.jsonData.capturedStones.W);
    // @ts-ignore
    [result, result,];
}
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-9']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-px']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-px']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['w-1']} */ ;
/** @type {__VLS_StyleScopedClasses['h-1']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        isStarPoint: isStarPoint,
        getGameResult: getGameResult,
        capitalizeFirst: capitalizeFirst,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
