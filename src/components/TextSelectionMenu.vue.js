import { ref, onMounted, onUnmounted } from "vue";
defineOptions({
    inheritAttrs: false,
});
const props = defineProps();
const showMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const selectedText = ref("");
function handleTextSelection(event) {
    // Use setTimeout to let the selection finish before checking
    setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        if (text && selection && selection.rangeCount > 0) {
            selectedText.value = text;
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            menuPosition.value = {
                x: rect.left + rect.width / 2,
                y: rect.bottom + 5,
            };
            showMenu.value = true;
        }
        else {
            // Hide menu if no text is selected
            showMenu.value = false;
        }
    }, 10);
}
function handleGlobalClick(event) {
    // Hide menu if clicking outside the menu itself
    const target = event.target;
    if (showMenu.value && !target.closest(".selection-menu")) {
        showMenu.value = false;
    }
}
onMounted(() => {
    document.addEventListener("click", handleGlobalClick);
});
onUnmounted(() => {
    document.removeEventListener("click", handleGlobalClick);
});
function handleReadAloud() {
    if (selectedText.value) {
        props.sendTextMessage(`Read aloud as-is (no translation): "${selectedText.value}"`);
    }
    showMenu.value = false;
}
function handleTranslate() {
    if (selectedText.value) {
        props.sendTextMessage(`Translate into my native language: "${selectedText.value}"`);
    }
    showMenu.value = false;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
var __VLS_0 = {
    onMouseUp: (__VLS_ctx.handleTextSelection),
};
// @ts-ignore
[handleTextSelection,];
if (__VLS_ctx.showMenu) {
    // @ts-ignore
    [showMenu,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onMousedown: () => { } },
        ...{ style: ({
                position: 'fixed',
                left: __VLS_ctx.menuPosition.x + 'px',
                top: __VLS_ctx.menuPosition.y + 'px',
                zIndex: 1000,
            }) },
        ...{ class: "bg-white shadow-2xl rounded-lg border-2 border-blue-500 selection-menu" },
    });
    // @ts-ignore
    [menuPosition, menuPosition,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.handleReadAloud) },
        ...{ class: "block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm whitespace-nowrap font-medium text-gray-700 hover:text-blue-600 transition-colors" },
    });
    // @ts-ignore
    [handleReadAloud,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.handleTranslate) },
        ...{ class: "block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm whitespace-nowrap border-t border-gray-200 font-medium text-gray-700 hover:text-blue-600 transition-colors" },
    });
    // @ts-ignore
    [handleTranslate,];
}
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-nowrap']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
// @ts-ignore
var __VLS_1 = __VLS_0;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        showMenu: showMenu,
        menuPosition: menuPosition,
        handleTextSelection: handleTextSelection,
        handleReadAloud: handleReadAloud,
        handleTranslate: handleTranslate,
    }),
    __typeProps: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
