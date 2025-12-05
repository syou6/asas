import { ref, watch, computed } from "vue";
const props = defineProps();
const gameState = ref(null);
const hoveredCell = ref(null);
// Column labels A-J (skipping I)
const columnLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "J"];
watch(() => props.selectedResult, (newResult) => {
    if (newResult?.toolName === "playGo" && newResult.jsonData) {
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
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cellValue = gameState.value.board[row][col];
            board.push({
                row,
                col,
                piece: cellValue !== "." ? cellValue : null,
            });
        }
    }
    return board;
});
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
function getCellClass(cell, index) {
    const baseClasses = "relative w-12 h-12";
    const cursorClasses = !cell.piece && !isComputerTurn.value && !gameState.value?.isTerminal
        ? "cursor-pointer"
        : "cursor-default";
    return `${baseClasses} ${cursorClasses}`;
}
function getPieceClass(piece) {
    return "";
}
function handleCellClick(index) {
    if (!gameState.value || gameState.value.isTerminal || isComputerTurn.value)
        return;
    const cell = flatBoard.value[index];
    if (cell.piece)
        return; // Can't play on occupied intersection
    const columnLetter = columnLabels[cell.col];
    const rowNumber = cell.row + 1;
    props.sendTextMessage(`I want to play at ${columnLetter}${rowNumber}, which is column=${cell.col}, row=${cell.row}`);
}
function handleCellHover(index, isEntering) {
    if (!gameState.value || gameState.value.isTerminal || isComputerTurn.value)
        return;
    const cell = flatBoard.value[index];
    if (cell.piece)
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
        ...{ class: "text-white text-lg font-bold mb-2 text-center" },
    });
    (__VLS_ctx.currentPlayerName);
    (__VLS_ctx.currentColorName);
    // @ts-ignore
    [currentPlayerName, currentColorName,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-white text-sm mb-4 text-center" },
    });
    (__VLS_ctx.gameState.capturedStones.B);
    (__VLS_ctx.gameState.capturedStones.W);
    // @ts-ignore
    [gameState, gameState,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "relative p-4 bg-amber-100 rounded-lg border-2 border-amber-900" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "grid gap-0" },
        ...{ style: ({
                gridTemplateColumns: `repeat(9, 1fr)`,
                width: '432px',
                height: '432px',
            }) },
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
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "absolute inset-0 pointer-events-none" },
        });
        if (cell.row < 8) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute left-1/2 top-1/2 w-0.5 bg-black" },
                ...{ style: {} },
            });
        }
        if (cell.col < 8) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute left-1/2 top-1/2 h-0.5 bg-black" },
                ...{ style: {} },
            });
        }
        if (__VLS_ctx.isStarPoint(cell.row, cell.col)) {
            // @ts-ignore
            [isStarPoint,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute inset-0 flex items-center justify-center pointer-events-none" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "w-2 h-2 bg-black rounded-full" },
            });
        }
        if (cell.piece) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: (__VLS_ctx.getPieceClass(cell.piece)) },
                ...{ class: "absolute inset-0 flex items-center justify-center pointer-events-none" },
            });
            // @ts-ignore
            [getPieceClass,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "w-10 h-10 rounded-full border-2" },
                ...{ class: (cell.piece === 'B'
                        ? 'bg-black border-gray-700'
                        : 'bg-white border-gray-300') },
            });
        }
        else if (!__VLS_ctx.isComputerTurn && __VLS_ctx.hoveredCell === index) {
            // @ts-ignore
            [isComputerTurn, hoveredCell,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "absolute inset-0 flex items-center justify-center pointer-events-none" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "w-10 h-10 rounded-full opacity-50" },
                ...{ class: (__VLS_ctx.gameState.currentSide === 'B' ? 'bg-black' : 'bg-white') },
            });
            // @ts-ignore
            [gameState,];
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "absolute -bottom-6 left-4 right-4 flex justify-around" },
    });
    for (const [col] of __VLS_getVForSourceType((__VLS_ctx.columnLabels))) {
        // @ts-ignore
        [columnLabels,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (col),
            ...{ class: "text-xs font-bold text-white w-12 text-center" },
        });
        (col);
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "absolute -left-6 top-4 bottom-4 flex flex-col justify-around" },
    });
    for (const [row] of __VLS_getVForSourceType((9))) {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (row),
            ...{ class: "text-xs font-bold text-white h-12 flex items-center justify-center" },
        });
        (row);
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
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-amber-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-amber-900']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-0']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['left-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['top-1/2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['w-2']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pointer-events-none']} */ ;
/** @type {__VLS_StyleScopedClasses['w-10']} */ ;
/** @type {__VLS_StyleScopedClasses['h-10']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['-bottom-6']} */ ;
/** @type {__VLS_StyleScopedClasses['left-4']} */ ;
/** @type {__VLS_StyleScopedClasses['right-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-around']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['w-12']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['-left-6']} */ ;
/** @type {__VLS_StyleScopedClasses['top-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-around']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['h-12']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        gameState: gameState,
        hoveredCell: hoveredCell,
        columnLabels: columnLabels,
        currentPlayerName: currentPlayerName,
        currentColorName: currentColorName,
        isComputerTurn: isComputerTurn,
        flatBoard: flatBoard,
        isStarPoint: isStarPoint,
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
