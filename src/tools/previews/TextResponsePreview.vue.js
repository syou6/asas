import { computed } from "vue";
const props = defineProps();
const previewText = computed(() => props.result.data?.text ?? "");
const messageRole = computed(() => props.result.data?.role ?? "assistant");
const textColorClass = computed(() => {
    switch (messageRole.value) {
        case "system":
            return "text-blue-700";
        case "user":
            return "text-green-700 font-medium";
        default:
            return "text-gray-700";
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-sm leading-snug" },
    ...{ class: (__VLS_ctx.textColorClass) },
});
// @ts-ignore
[textColorClass,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "line-clamp-5 whitespace-pre-wrap" },
});
(__VLS_ctx.previewText);
// @ts-ignore
[previewText,];
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-snug']} */ ;
/** @type {__VLS_StyleScopedClasses['line-clamp-5']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        previewText: previewText,
        textColorClass: textColorClass,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
