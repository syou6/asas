import { computed } from "vue";
const props = defineProps();
const displayTitle = computed(() => {
    return props.result.title || "HTML Page";
});
const libraryLabel = computed(() => {
    const type = props.result.data?.type;
    if (!type)
        return "";
    const labels = {
        tailwind: "Tailwind CSS",
        "d3.js": "D3.js",
        "three.js": "Three.js",
    };
    return labels[type];
});
const libraryIcon = computed(() => {
    const type = props.result.data?.type;
    if (!type)
        return "🌐";
    const icons = {
        tailwind: "🎨",
        "d3.js": "📊",
        "three.js": "🎮",
    };
    return icons[type];
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-center p-4 bg-blue-50 dark:bg-blue-900 rounded" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-blue-600 dark:text-blue-300 font-medium" },
});
(__VLS_ctx.libraryIcon);
// @ts-ignore
[libraryIcon,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-sm text-gray-800 dark:text-gray-200 mt-1 font-medium truncate" },
});
(__VLS_ctx.displayTitle);
// @ts-ignore
[displayTitle,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-xs text-gray-600 dark:text-gray-400 mt-1" },
});
(__VLS_ctx.libraryLabel);
// @ts-ignore
[libraryLabel,];
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-blue-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-blue-300']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        displayTitle: displayTitle,
        libraryLabel: libraryLabel,
        libraryIcon: libraryIcon,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
