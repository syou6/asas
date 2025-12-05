import { ref, watch, computed } from "vue";
const props = defineProps();
const gameState = ref(null);
const hoveredCell = ref(null);
watch(() => props.selectedResult, (newResult) => {
    if (newResult?.toolName === "playOthello" && newResult.jsonData) {
        gameState.value = newResult.jsonData;
    }
}, { immediate: true });
const currentPlayerName = computed(() => {
    if (!gameState.value?.playerNames)
        return "";
    const player = gameState.value.playerNames[gameState.value.currentSide];
    return player.charAt(0).toUpperCase() + player.slice(1);
});
const currentColorName = computed(() => {
    if (!gameState.value)
        return "";
    return gameState.value.currentSide === "B" ? "Black" : "White";
});
const isComputerTurn = computed(() => {
    return (gameState.value?.playerNames &&
        gameState.value.playerNames[gameState.value.currentSide] === "computer");
});
const flatBoard = computed(() => {
    if (!gameState.value?.board)
        return [];
    const board = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cellValue = gameState.value.board[row][col];
            const isLegalMove = gameState.value.legalMoves?.some((move) => move.row === row && move.col === col);
            board.push({
                row,
                col,
                piece: cellValue !== "." ? cellValue : null,
                isLegalMove,
                label: isLegalMove ? String.fromCharCode(65 + col) + (row + 1) : "",
            });
        }
    }
    return board;
});
function getCellClass(cell, index) {
    const baseClasses = "w-12 h-12 flex items-center justify-center border border-green-900 bg-green-700";
    const hoverClasses = cell.isLegalMove && !isComputerTurn.value && hoveredCell.value === index
        ? "bg-green-600"
        : "";
    const cursorClasses = cell.isLegalMove && !isComputerTurn.value && !gameState.value?.isTerminal
        ? "cursor-pointer hover:bg-green-600"
        : "cursor-default";
    return `${baseClasses} ${hoverClasses} ${cursorClasses}`;
}
function getPieceClass(piece) {
    return piece === "B" ? "bg-black" : "bg-white";
}
function handleCellClick(index) {
    if (!gameState.value || gameState.value.isTerminal || isComputerTurn.value)
        return;
    const cell = flatBoard.value[index];
    if (!cell.isLegalMove)
        return;
    const columnLetter = String.fromCharCode(65 + cell.col);
    const rowNumber = cell.row + 1;
    props.sendTextMessage(`I want to play at ${columnLetter}${rowNumber}, which is column=${cell.col}, row=${cell.row} `);
}
function handleCellHover(index, isEntering) {
    if (!gameState.value || gameState.value.isTerminal || isComputerTurn.value)
        return;
    const cell = flatBoard.value[index];
    if (!cell.isLegalMove)
        return;
    hoveredCell.value = isEntering ? index : null;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full h-full flex flex-col items-center justify-center p-4" },
});
if (__VLS_ctx.gameState) {
    // @ts-ignore
    [gameState,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "flex flex-col items-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-white text-lg font-bold mb-4 text-center" },
    });
    (__VLS_ctx.currentPlayerName);
    (__VLS_ctx.currentColorName);
    // @ts-ignore
    [currentPlayerName, currentColorName,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid grid-cols-8 gap-0.5 p-4 bg-green-800 rounded-lg border-2 border-green-900" },
    });
    for (const [cell, index] of __VLS_getVForSourceType((__VLS_ctx.flatBoard))) {
        // @ts-ignore
        [flatBoard,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.gameState))
                        return;
                    __VLS_ctx.handleCellClick(index);
                    // @ts-ignore
                    [handleCellClick,];
                } },
            ...{ onMouseenter: (...[$event]) => {
                    if (!(__VLS_ctx.gameState))
                        return;
                    __VLS_ctx.handleCellHover(index, true);
                    // @ts-ignore
                    [handleCellHover,];
                } },
            ...{ onMouseleave: (...[$event]) => {
                    if (!(__VLS_ctx.gameState))
                        return;
                    __VLS_ctx.handleCellHover(index, false);
                    // @ts-ignore
                    [handleCellHover,];
                } },
            key: (index),
            ...{ class: (__VLS_ctx.getCellClass(cell, index)) },
        });
        // @ts-ignore
        [getCellClass,];
        if (cell.piece) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: (__VLS_ctx.getPieceClass(cell.piece)) },
                ...{ class: "w-10 h-10 rounded-full border-2 border-gray-600" },
            });
            // @ts-ignore
            [getPieceClass,];
        }
        else if (cell.isLegalMove && !__VLS_ctx.isComputerTurn) {
            // @ts-ignore
            [isComputerTurn,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "w-10 h-10 flex items-center justify-center text-gray-300 text-sm font-bold" },
            });
            (cell.label);
        }
    }
}
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-8']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-green-900']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        gameState: gameState,
        currentPlayerName: currentPlayerName,
        currentColorName: currentColorName,
        isComputerTurn: isComputerTurn,
        flatBoard: flatBoard,
        getCellClass: getCellClass,
        getPieceClass: getPieceClass,
        handleCellClick: handleCellClick,
        handleCellHover: handleCellHover,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
