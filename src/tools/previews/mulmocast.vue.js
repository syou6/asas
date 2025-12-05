import { computed } from "vue";
const props = defineProps();
const firstBeatImage = computed(() => {
    const firstBeat = props.result.data?.mulmoScript?.beats?.[0];
    if (firstBeat?.id && props.result.data?.images?.[firstBeat.id]) {
        return props.result.data.images[firstBeat.id];
    }
    return null;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "bg-green-50 rounded overflow-hidden" },
});
if (__VLS_ctx.firstBeatImage) {
    // @ts-ignore
    [firstBeatImage,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-full aspect-video bg-gray-200" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.img)({
        src: (`data:image/png;base64,${__VLS_ctx.firstBeatImage}`),
        alt: (__VLS_ctx.result.data?.mulmoScript?.title || 'Presentation'),
        ...{ class: "w-full h-full object-cover" },
    });
    // @ts-ignore
    [firstBeatImage, result,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "p-2" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "text-green-600 font-medium text-sm truncate" },
});
(__VLS_ctx.result.data?.mulmoScript?.title || __VLS_ctx.result.title || "Presentation");
// @ts-ignore
[result, result,];
/** @type {__VLS_StyleScopedClasses['bg-green-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['aspect-video']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['object-cover']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        firstBeatImage: firstBeatImage,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
