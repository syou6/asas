import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import * as XLSX from "xlsx";
import { SpreadsheetEngine, columnToIndex, indexToColumn, } from "../models/spreadsheet-engine";
// Import all spreadsheet functions to populate the function registry
import "../models/spreadsheet-engine/functions";
/**
 * Normalize malformed data structures
 * Some models generate flat arrays instead of 2D arrays - fix them
 */
function normalizeSheetData(data) {
    // Handle null/undefined
    if (!data) {
        return [];
    }
    // If not an array
    if (!Array.isArray(data)) {
        return [];
    }
    // Empty array
    if (data.length === 0) {
        return [];
    }
    // If data is already a 2D array, return as-is
    if (Array.isArray(data[0])) {
        return data;
    }
    // If data is a flat array of cell objects, convert to 2D by pairing cells
    // Pattern: [cell1, cell2, cell3, cell4] -> [[cell1, cell2], [cell3, cell4]]
    if (typeof data[0] === "object" && data[0] !== null) {
        const rows = [];
        for (let i = 0; i < data.length; i += 2) {
            const row = [data[i]];
            if (i + 1 < data.length) {
                row.push(data[i + 1]);
            }
            rows.push(row);
        }
        return rows;
    }
    // Unknown structure - return empty
    return [];
}
const props = defineProps();
const emit = defineEmits();
// Create spreadsheet engine instance
const engine = new SpreadsheetEngine();
const activeSheetIndex = ref(0);
const editableData = ref(JSON.stringify(props.selectedResult.data?.sheets || [], null, 2));
const editorTextarea = ref(null);
const editorDetails = ref(null);
const tableContainer = ref(null);
// Mini editor state
const miniEditorOpen = ref(false);
const miniEditorCell = ref(null);
const miniEditorValue = ref(null);
const miniEditorType = ref("string");
const miniEditorFormula = ref("");
const miniEditorFormat = ref("");
// Referenced cells state (for formula highlighting)
const referencedCells = ref([]);
// Check if spreadsheet data has been modified
const hasChanges = computed(() => {
    try {
        const currentData = JSON.stringify(props.selectedResult.data?.sheets || [], null, 2);
        return editableData.value !== currentData;
    }
    catch {
        return false;
    }
});
// Helper functions using the spreadsheet engine utilities
const colToIndex = columnToIndex;
const indexToCol = indexToColumn;
// Calculate formulas in the data using the spreadsheet engine
const calculateFormulas = (data, sheetName) => {
    // If we have a sheet name, we need to find all sheets for cross-sheet references
    const allSheets = props.selectedResult.data?.sheets;
    // Create a SheetData object for the engine
    const sheet = {
        name: sheetName || "Sheet1",
        data: data,
    };
    // Calculate using the engine
    const result = engine.calculate(sheet, allSheets);
    // Return the calculated data
    return result.data;
};
// Render the active sheet as HTML table
const renderedHtml = computed(() => {
    if (!props.selectedResult.data?.sheets ||
        props.selectedResult.data.sheets.length === 0) {
        return "";
    }
    const sheet = props.selectedResult.data.sheets[activeSheetIndex.value];
    if (!sheet || !sheet.data) {
        return "";
    }
    try {
        // Calculate formulas first with sheet name for cross-sheet references
        const calculatedData = calculateFormulas(sheet.data, sheet.name);
        // Convert data array to worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(calculatedData);
        // Generate HTML table
        const html = XLSX.utils.sheet_to_html(worksheet, {
            id: "spreadsheet-table",
            editable: false,
        });
        return html;
    }
    catch (error) {
        console.error("Failed to render spreadsheet:", error);
        return `<div class="error">Failed to render spreadsheet: ${error instanceof Error ? error.message : "Unknown error"}</div>`;
    }
});
// Download as Excel file
const downloadExcel = () => {
    if (!props.selectedResult?.data?.sheets)
        return;
    try {
        const workbook = XLSX.utils.book_new();
        // Add all sheets to workbook
        props.selectedResult.data.sheets.forEach((sheet) => {
            const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
        });
        // Generate filename
        const filename = props.selectedResult.title
            ? `${props.selectedResult.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.xlsx`
            : "spreadsheet.xlsx";
        // Write file
        XLSX.writeFile(workbook, filename);
    }
    catch (error) {
        console.error("Failed to download Excel:", error);
        alert(`Failed to download Excel file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
function handleDataEdit() {
    // Just update the local state, don't apply yet
    // User needs to click "Apply Changes" button
}
// Extract cell references from a formula string
function extractCellReferences(formula) {
    const references = [];
    // Remove the "=" prefix if present
    const cleanFormula = formula.startsWith("=") ? formula.substring(1) : formula;
    // First, extract range references (e.g., A1:B10, $A$1:$B$10)
    const rangeRegex = /\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+/g;
    const rangeMatches = cleanFormula.match(rangeRegex);
    if (rangeMatches) {
        for (const range of rangeMatches) {
            // Remove $ symbols for absolute references
            const cleanRange = range.replace(/\$/g, "");
            const rangeMatch = cleanRange.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
            if (rangeMatch) {
                const startCol = colToIndex(rangeMatch[1]);
                const startRow = parseInt(rangeMatch[2]) - 1;
                const endCol = colToIndex(rangeMatch[3]);
                const endRow = parseInt(rangeMatch[4]) - 1;
                // Add all cells in the range
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startCol; col <= endCol; col++) {
                        if (!references.some((ref) => ref.row === row && ref.col === col)) {
                            references.push({ row, col });
                        }
                    }
                }
            }
        }
    }
    // Remove ranges from formula before extracting individual cell references
    const formulaWithoutRanges = cleanFormula.replace(rangeRegex, "");
    // Then, extract individual cell references (e.g., A1, $B$2, B2)
    const cellRefRegex = /\$?[A-Z]+\$?\d+/g;
    const cellMatches = formulaWithoutRanges.match(cellRefRegex);
    if (cellMatches) {
        for (const match of cellMatches) {
            // Remove $ symbols for absolute references
            const cleanRef = match.replace(/\$/g, "");
            const cellMatch = cleanRef.match(/^([A-Z]+)(\d+)$/);
            if (cellMatch) {
                const col = colToIndex(cellMatch[1]);
                const row = parseInt(cellMatch[2]) - 1; // Convert to 0-based
                // Add to references if not already present
                if (!references.some((ref) => ref.row === row && ref.col === col)) {
                    references.push({ row, col });
                }
            }
        }
    }
    return references;
}
function openMiniEditor(rowIndex, colIndex) {
    try {
        const sheets = JSON.parse(editableData.value);
        const currentSheet = sheets[activeSheetIndex.value];
        if (!currentSheet || !currentSheet.data) {
            return;
        }
        // Normalize the data in case it's malformed
        const normalizedData = normalizeSheetData(currentSheet.data);
        if (!normalizedData[rowIndex] ||
            normalizedData[rowIndex][colIndex] === undefined) {
            return;
        }
        const cellValue = normalizedData[rowIndex][colIndex];
        // Determine cell type and extract values (new format: {v, f})
        if (typeof cellValue === "object" &&
            cellValue !== null &&
            "v" in cellValue) {
            const value = cellValue.v;
            const format = cellValue.f ?? "";
            // Check if it's a formula (value starts with "=")
            if (typeof value === "string" && value.startsWith("=")) {
                miniEditorType.value = "object";
                miniEditorValue.value = "";
                miniEditorFormula.value = value.substring(1); // Remove "=" prefix
                miniEditorFormat.value = format;
                // Extract and store referenced cells for highlighting
                referencedCells.value = extractCellReferences(value);
            }
            else if (typeof value === "number") {
                miniEditorType.value = "object";
                miniEditorValue.value = "";
                miniEditorFormula.value = String(value);
                miniEditorFormat.value = format;
                referencedCells.value = [];
            }
            else {
                miniEditorType.value = "string";
                miniEditorValue.value = String(value);
                miniEditorFormula.value = "";
                miniEditorFormat.value = "";
                referencedCells.value = [];
            }
        }
        else {
            // Legacy format or plain value
            miniEditorType.value = "string";
            miniEditorValue.value = String(cellValue ?? "");
            miniEditorFormula.value = "";
            miniEditorFormat.value = "";
            referencedCells.value = [];
        }
        miniEditorCell.value = { row: rowIndex, col: colIndex };
        miniEditorOpen.value = true;
    }
    catch (error) {
        console.error("Failed to open mini editor:", error);
    }
}
function closeMiniEditor() {
    miniEditorOpen.value = false;
    miniEditorCell.value = null;
    miniEditorValue.value = null;
    miniEditorFormula.value = "";
    miniEditorFormat.value = "";
    referencedCells.value = [];
}
function saveMiniEditor() {
    if (!miniEditorCell.value)
        return;
    try {
        const sheets = JSON.parse(editableData.value);
        const currentSheet = sheets[activeSheetIndex.value];
        if (!currentSheet || !currentSheet.data)
            return;
        const { row, col } = miniEditorCell.value;
        // Normalize the data in case it's malformed
        let normalizedData = normalizeSheetData(currentSheet.data);
        // Ensure the row exists
        while (normalizedData.length <= row) {
            normalizedData.push([]);
        }
        // Ensure the row is an array
        if (!Array.isArray(normalizedData[row])) {
            normalizedData[row] = [];
        }
        // Build the new cell value based on type (new format: {v, f})
        let newCellValue;
        if (miniEditorType.value === "string") {
            // String type - create simple cell with string value
            newCellValue = {
                v: String(miniEditorValue.value),
            };
        }
        else {
            // object type (Formula or Number)
            const input = miniEditorFormula.value?.trim() || "";
            // Detect if it's a formula by checking for:
            // 1. Function names or expressions starting with operators (-, +, etc.)
            // 2. Cell references with operators (A1+B1, etc.)
            // 3. Arithmetic expressions with operators (6/100, 5*2, etc.)
            const isFormula = /^[-+]?\s*[A-Z]+\s*\(/i.test(input) || // Any function call, optionally preceded by +/- operator
                /[A-Z]+\d+\s*[\+\-\*\/\^]/.test(input) ||
                /\d+\s*[\+\-\*\/\^]\s*\d+/.test(input);
            newCellValue = { v: "" };
            if (isFormula) {
                // Store formula with "=" prefix
                newCellValue.v = "=" + input;
            }
            else if (input !== "") {
                const numValue = parseFloat(input);
                newCellValue.v = isNaN(numValue) ? input : numValue;
            }
            // Add format if provided
            if (miniEditorFormat.value) {
                newCellValue.f = miniEditorFormat.value;
            }
        }
        // Update the cell in normalized data
        normalizedData[row][col] = newCellValue;
        // Update the sheet with normalized data
        currentSheet.data = normalizedData;
        // Update editableData
        editableData.value = JSON.stringify(sheets, null, 2);
        // Apply changes immediately
        const updatedResult = {
            ...props.selectedResult,
            data: {
                ...props.selectedResult.data,
                sheets: sheets,
            },
        };
        emit("updateResult", updatedResult);
        // Update referenced cells if the saved cell contains a formula
        if (typeof newCellValue.v === "string" && newCellValue.v.startsWith("=")) {
            referencedCells.value = extractCellReferences(newCellValue.v);
        }
        else {
            referencedCells.value = [];
        }
        // Don't close the mini editor - keep it open so user can see the updated references
        // closeMiniEditor();
    }
    catch (error) {
        alert(`Failed to save cell: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
function handleTableClick(event) {
    const target = event.target;
    // Check if clicked element is a table cell
    if (target.tagName !== "TD")
        return;
    // Get the row and column indices
    const cell = target;
    const row = cell.parentElement;
    const colIndex = cell.cellIndex;
    const rowIndex = row.rowIndex;
    // Check if the main editor details is open
    const isEditorOpen = editorDetails.value?.open ?? false;
    // If editor is closed, open mini editor
    if (!isEditorOpen) {
        openMiniEditor(rowIndex, colIndex);
        return;
    }
    // If editor is open, try to find and select this cell in the editor
    if (editorTextarea.value) {
        try {
            const sheets = JSON.parse(editableData.value);
            const currentSheet = sheets[activeSheetIndex.value];
            if (!currentSheet || !currentSheet.data) {
                return;
            }
            // Normalize the data in case it's malformed
            const normalizedData = normalizeSheetData(currentSheet.data);
            if (normalizedData[rowIndex] &&
                normalizedData[rowIndex][colIndex] !== undefined) {
                const cellValue = normalizedData[rowIndex][colIndex];
                const cellStr = JSON.stringify(cellValue);
                // Find the sheet's data section in the editor
                const sheetStartMarker = `"name": "${currentSheet.name}"`;
                const dataStartMarker = `"data": [`;
                let searchPos = editableData.value.indexOf(sheetStartMarker);
                if (searchPos >= 0) {
                    searchPos = editableData.value.indexOf(dataStartMarker, searchPos);
                    if (searchPos >= 0) {
                        // Now navigate through the formatted JSON to find the target row and cell
                        let currentRow = -1;
                        let pos = searchPos + dataStartMarker.length;
                        // Find the target row by counting opening brackets
                        while (pos < editableData.value.length && currentRow < rowIndex) {
                            const char = editableData.value[pos];
                            if (char === "[") {
                                currentRow++;
                                if (currentRow === rowIndex) {
                                    // Found our target row - now find the colIndex-th cell
                                    let currentCol = 0;
                                    let cellStart = -1;
                                    let inString = false;
                                    let inObject = 0;
                                    let bracketDepth = 0;
                                    for (let i = pos; i < editableData.value.length; i++) {
                                        const c = editableData.value[i];
                                        const prevChar = i > 0 ? editableData.value[i - 1] : "";
                                        // Track string boundaries
                                        if (c === '"' && prevChar !== "\\") {
                                            inString = !inString;
                                        }
                                        if (!inString) {
                                            // Track bracket depth to know when we exit this row
                                            if (c === "[")
                                                bracketDepth++;
                                            if (c === "]") {
                                                bracketDepth--;
                                                if (bracketDepth === 0)
                                                    break; // End of row
                                            }
                                            // Track object depth
                                            if (c === "{")
                                                inObject++;
                                            if (c === "}")
                                                inObject--;
                                            // Count cells by top-level commas
                                            if (c === "," && inObject === 0 && bracketDepth === 1) {
                                                currentCol++;
                                            }
                                        }
                                        // Find the start of our target cell
                                        if (currentCol === colIndex && cellStart === -1) {
                                            // Skip whitespace and opening bracket/comma
                                            if (c !== " " &&
                                                c !== "\n" &&
                                                c !== "\t" &&
                                                c !== "[" &&
                                                c !== ",") {
                                                cellStart = i;
                                                break;
                                            }
                                        }
                                    }
                                    if (cellStart >= 0) {
                                        editorTextarea.value.focus();
                                        editorTextarea.value.setSelectionRange(cellStart, cellStart + cellStr.length);
                                        // Scroll the textarea to make the selection visible
                                        const textBeforeSelection = editableData.value.substring(0, cellStart);
                                        const lineNumber = textBeforeSelection.split("\n").length;
                                        const lineHeight = 22;
                                        const textarea = editorTextarea.value;
                                        textarea.scrollTop = Math.max(0, lineNumber * lineHeight - textarea.clientHeight / 2);
                                    }
                                    break;
                                }
                            }
                            pos++;
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("Failed to select cell in editor:", error);
        }
    }
}
function applyChanges() {
    try {
        // Parse the edited JSON
        const parsedSheets = JSON.parse(editableData.value);
        // Validate it's an array
        if (!Array.isArray(parsedSheets)) {
            throw new Error("Data must be an array of sheets");
        }
        // Update the result with new spreadsheet data
        const updatedResult = {
            ...props.selectedResult,
            data: {
                ...props.selectedResult.data,
                sheets: parsedSheets,
            },
        };
        emit("updateResult", updatedResult);
        // Reset to first sheet after update
        activeSheetIndex.value = 0;
    }
    catch (error) {
        alert(`Invalid JSON format: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
// Watch for external changes to selectedResult
watch(() => props.selectedResult.data?.sheets, (newSheets) => {
    editableData.value = JSON.stringify(newSheets || [], null, 2);
    // Reset to first sheet when result changes
    activeSheetIndex.value = 0;
});
// Reset active sheet if it's out of bounds
watch(() => props.selectedResult.data?.sheets?.length, (length) => {
    if (length && activeSheetIndex.value >= length) {
        activeSheetIndex.value = 0;
    }
});
// Highlight selected cell and referenced cells when mini editor is open
watch([miniEditorOpen, miniEditorCell, referencedCells, renderedHtml], () => {
    // Remove previous highlights
    const prevEditingCell = tableContainer.value?.querySelector(".cell-editing");
    if (prevEditingCell) {
        prevEditingCell.classList.remove("cell-editing");
    }
    const prevReferencedCells = tableContainer.value?.querySelectorAll(".cell-referenced");
    if (prevReferencedCells) {
        prevReferencedCells.forEach((cell) => cell.classList.remove("cell-referenced"));
    }
    if (miniEditorOpen.value && tableContainer.value) {
        const table = tableContainer.value.querySelector("#spreadsheet-table");
        if (table) {
            // Highlight the selected cell
            if (miniEditorCell.value) {
                const row = table.querySelectorAll("tr")[miniEditorCell.value.row];
                if (row) {
                    const cell = row.querySelectorAll("td")[miniEditorCell.value.col];
                    if (cell) {
                        cell.classList.add("cell-editing");
                    }
                }
            }
            // Highlight referenced cells
            for (const ref of referencedCells.value) {
                const row = table.querySelectorAll("tr")[ref.row];
                if (row) {
                    const cell = row.querySelectorAll("td")[ref.col];
                    if (cell) {
                        cell.classList.add("cell-referenced");
                    }
                }
            }
        }
    }
}, { flush: "post" });
// Keyboard navigation handler
function handleKeyboardNavigation(event) {
    // Only handle arrow keys when mini editor is open and not focused on input
    if (!miniEditorOpen.value || !miniEditorCell.value)
        return;
    // Don't interfere if user is typing in an input field
    const target = event.target;
    if (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable) {
        return;
    }
    const { row, col } = miniEditorCell.value;
    let newRow = row;
    let newCol = col;
    // Determine new position based on arrow key
    switch (event.key) {
        case "ArrowUp":
            newRow = Math.max(0, row - 1);
            break;
        case "ArrowDown":
            newRow = row + 1;
            break;
        case "ArrowLeft":
            newCol = Math.max(0, col - 1);
            break;
        case "ArrowRight":
            newCol = col + 1;
            break;
        default:
            return; // Not an arrow key, ignore
    }
    // Get current sheet data to validate bounds
    try {
        const sheets = JSON.parse(editableData.value);
        const currentSheet = sheets[activeSheetIndex.value];
        if (!currentSheet || !currentSheet.data)
            return;
        // Validate new position is within bounds
        if (newRow < 0 ||
            newRow >= currentSheet.data.length ||
            newCol < 0 ||
            !currentSheet.data[newRow] ||
            newCol >= currentSheet.data[newRow].length) {
            return; // Out of bounds, ignore
        }
        // Prevent default scrolling behavior
        event.preventDefault();
        // Move to new cell
        openMiniEditor(newRow, newCol);
    }
    catch (error) {
        console.error("Failed to navigate cells:", error);
    }
}
// Add keyboard event listener on mount
onMounted(() => {
    document.addEventListener("keydown", handleKeyboardNavigation);
});
// Remove keyboard event listener on unmount
onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyboardNavigation);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['excel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['excel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['download-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['spreadsheet-source']} */ ;
/** @type {__VLS_StyleScopedClasses['spreadsheet-source']} */ ;
/** @type {__VLS_StyleScopedClasses['spreadsheet-source']} */ ;
/** @type {__VLS_StyleScopedClasses['spreadsheet-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-option']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "spreadsheet-container" },
});
if (!__VLS_ctx.selectedResult.data?.sheets || __VLS_ctx.selectedResult.data.sheets.length === 0) {
    // @ts-ignore
    [selectedResult, selectedResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "min-h-full p-8 flex items-center justify-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-gray-500" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "spreadsheet-content-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "header" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
        ...{ class: "title" },
    });
    (__VLS_ctx.selectedResult.title || "Spreadsheet");
    // @ts-ignore
    [selectedResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "button-group" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.downloadExcel) },
        ...{ class: "download-btn excel-btn" },
    });
    // @ts-ignore
    [downloadExcel,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "material-icons" },
    });
    if (__VLS_ctx.selectedResult.data.sheets.length > 1) {
        // @ts-ignore
        [selectedResult,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "sheet-tabs" },
        });
        for (const [sheet, index] of __VLS_getVForSourceType((__VLS_ctx.selectedResult.data.sheets))) {
            // @ts-ignore
            [selectedResult,];
            __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.selectedResult.data?.sheets || __VLS_ctx.selectedResult.data.sheets.length === 0))
                            return;
                        if (!(__VLS_ctx.selectedResult.data.sheets.length > 1))
                            return;
                        __VLS_ctx.activeSheetIndex = index;
                        // @ts-ignore
                        [activeSheetIndex,];
                    } },
                key: (index),
                ...{ class: (['sheet-tab', { active: __VLS_ctx.activeSheetIndex === index }]) },
            });
            // @ts-ignore
            [activeSheetIndex,];
            (sheet.name);
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onClick: (__VLS_ctx.handleTableClick) },
        ref: "tableContainer",
        ...{ class: "table-container" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedHtml) }, null, null);
    /** @type {typeof __VLS_ctx.tableContainer} */ ;
    // @ts-ignore
    [handleTableClick, renderedHtml, tableContainer,];
    if (!__VLS_ctx.miniEditorOpen) {
        // @ts-ignore
        [miniEditorOpen,];
        __VLS_asFunctionalElement(__VLS_elements.details, __VLS_elements.details)({
            ref: "editorDetails",
            ...{ class: "spreadsheet-source" },
        });
        /** @type {typeof __VLS_ctx.editorDetails} */ ;
        // @ts-ignore
        [editorDetails,];
        __VLS_asFunctionalElement(__VLS_elements.summary, __VLS_elements.summary)({});
        __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
            ...{ onInput: (__VLS_ctx.handleDataEdit) },
            ref: "editorTextarea",
            value: (__VLS_ctx.editableData),
            ...{ class: "spreadsheet-editor" },
            spellcheck: "false",
        });
        /** @type {typeof __VLS_ctx.editorTextarea} */ ;
        // @ts-ignore
        [handleDataEdit, editableData, editorTextarea,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.applyChanges) },
            ...{ class: "apply-btn" },
            disabled: (!__VLS_ctx.hasChanges),
        });
        // @ts-ignore
        [applyChanges, hasChanges,];
    }
    if (__VLS_ctx.miniEditorOpen) {
        // @ts-ignore
        [miniEditorOpen,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mini-editor-panel" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mini-editor-content" },
        });
        if (__VLS_ctx.miniEditorCell) {
            // @ts-ignore
            [miniEditorCell,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "cell-ref" },
            });
            (__VLS_ctx.indexToCol(__VLS_ctx.miniEditorCell.col));
            (__VLS_ctx.miniEditorCell.row + 1);
            // @ts-ignore
            [miniEditorCell, miniEditorCell, indexToCol,];
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "radio-group" },
        });
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "radio-option" },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            type: "radio",
            value: "string",
        });
        (__VLS_ctx.miniEditorType);
        // @ts-ignore
        [miniEditorType,];
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            ...{ class: "radio-option" },
        });
        __VLS_asFunctionalElement(__VLS_elements.input)({
            type: "radio",
            value: "object",
        });
        (__VLS_ctx.miniEditorType);
        // @ts-ignore
        [miniEditorType,];
        if (__VLS_ctx.miniEditorType === 'string') {
            // @ts-ignore
            [miniEditorType,];
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onKeyup: (__VLS_ctx.saveMiniEditor) },
                type: "text",
                value: (__VLS_ctx.miniEditorValue),
                ...{ class: "form-input" },
                placeholder: "Value",
            });
            // @ts-ignore
            [saveMiniEditor, miniEditorValue,];
        }
        if (__VLS_ctx.miniEditorType === 'object') {
            // @ts-ignore
            [miniEditorType,];
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onKeyup: (__VLS_ctx.saveMiniEditor) },
                type: "text",
                value: (__VLS_ctx.miniEditorFormula),
                ...{ class: "form-input" },
                placeholder: "Value or Formula (e.g., 100 or SUM(B2:B11))",
            });
            // @ts-ignore
            [saveMiniEditor, miniEditorFormula,];
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onKeyup: (__VLS_ctx.saveMiniEditor) },
                type: "text",
                value: (__VLS_ctx.miniEditorFormat),
                ...{ class: "form-input" },
                placeholder: "Format (e.g., $#,##0.00)",
            });
            // @ts-ignore
            [saveMiniEditor, miniEditorFormat,];
        }
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.saveMiniEditor) },
            ...{ class: "save-btn" },
        });
        // @ts-ignore
        [saveMiniEditor,];
        __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
            ...{ onClick: (__VLS_ctx.closeMiniEditor) },
            ...{ class: "cancel-btn" },
        });
        // @ts-ignore
        [closeMiniEditor,];
    }
}
/** @type {__VLS_StyleScopedClasses['spreadsheet-container']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['spreadsheet-content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['button-group']} */ ;
/** @type {__VLS_StyleScopedClasses['download-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['excel-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['spreadsheet-source']} */ ;
/** @type {__VLS_StyleScopedClasses['spreadsheet-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-editor-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-editor-content']} */ ;
/** @type {__VLS_StyleScopedClasses['cell-ref']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-group']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-option']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-option']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cancel-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        activeSheetIndex: activeSheetIndex,
        editableData: editableData,
        editorTextarea: editorTextarea,
        editorDetails: editorDetails,
        tableContainer: tableContainer,
        miniEditorOpen: miniEditorOpen,
        miniEditorCell: miniEditorCell,
        miniEditorValue: miniEditorValue,
        miniEditorType: miniEditorType,
        miniEditorFormula: miniEditorFormula,
        miniEditorFormat: miniEditorFormat,
        hasChanges: hasChanges,
        indexToCol: indexToCol,
        renderedHtml: renderedHtml,
        downloadExcel: downloadExcel,
        handleDataEdit: handleDataEdit,
        closeMiniEditor: closeMiniEditor,
        saveMiniEditor: saveMiniEditor,
        handleTableClick: handleTableClick,
        applyChanges: applyChanges,
    }),
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
