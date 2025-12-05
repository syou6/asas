import GoogleMap from "../../components/GoogleMap.vue";
const props = defineProps();
const handleMapError = (errorMessage) => {
    if (props.sendTextMessage) {
        props.sendTextMessage(`Error loading map for location "${props.selectedResult?.data?.location}": ${errorMessage}`);
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full h-full p-4" },
});
/** @type {[typeof GoogleMap, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(GoogleMap, new GoogleMap({
    ...{ 'onError': {} },
    location: (__VLS_ctx.selectedResult.data?.location),
    apiKey: (__VLS_ctx.googleMapKey),
    zoom: (15),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onError': {} },
    location: (__VLS_ctx.selectedResult.data?.location),
    apiKey: (__VLS_ctx.googleMapKey),
    zoom: (15),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
const __VLS_5 = ({ error: {} },
    { onError: (__VLS_ctx.handleMapError) });
// @ts-ignore
[selectedResult, googleMapKey, handleMapError,];
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        GoogleMap: GoogleMap,
        handleMapError: handleMapError,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
