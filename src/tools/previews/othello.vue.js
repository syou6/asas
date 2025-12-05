const __VLS_props = defineProps();
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
    ...{ class: "p-3 bg-green-50 rounded" },
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
        ...{ class: "inline-block" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-8" },
        ...{ style: {} },
    });
    for (const [row, rowIndex] of __VLS_getVForSourceType((__VLS_ctx.result.jsonData.board))) {
        (rowIndex);
        // @ts-ignore
        [result,];
        for (const [cell, colIndex] of __VLS_getVForSourceType((row))) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (`${rowIndex}-${colIndex}`),
                ...{ class: "w-4 h-4 flex items-center justify-center" },
                ...{ style: {} },
            });
            if (cell === 'B') {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "w-3 h-3 bg-black rounded-full" },
                });
            }
            else if (cell === 'W') {
                __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                    ...{ class: "w-3 h-3 bg-white rounded-full" },
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
}
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-8']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['w-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        getGameResult: getGameResult,
        capitalizeFirst: capitalizeFirst,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
