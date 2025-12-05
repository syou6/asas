import { computed } from "vue";
import TextSelectionMenu from "../../components/TextSelectionMenu.vue";
const props = defineProps();
const extractedTitle = computed(() => {
    const jsonData = props.selectedResult?.jsonData;
    return jsonData?.data?.title || props.selectedResult?.title || "Untitled";
});
const extractedByline = computed(() => {
    const jsonData = props.selectedResult?.jsonData;
    return jsonData?.data?.byline || "";
});
const extractedExcerpt = computed(() => {
    const jsonData = props.selectedResult?.jsonData;
    return jsonData?.data?.excerpt || "";
});
const extractedContent = computed(() => {
    const jsonData = props.selectedResult?.jsonData;
    const content = jsonData?.data?.textContent || jsonData?.data?.text;
    if (!content) {
        return "No content available.";
    }
    return content;
});
const formattedContent = computed(() => {
    const content = extractedContent.value;
    if (content === "No content available.") {
        return [content];
    }
    // Split by double newlines for paragraphs, or single newlines if no double newlines exist
    const paragraphs = content.includes("\n\n")
        ? content.split("\n\n")
        : content.split("\n");
    // Filter out empty paragraphs and trim whitespace
    return paragraphs.map((p) => p.trim()).filter((p) => p.length > 0);
});
function isTwitterUrl(url) {
    try {
        const urlObj = new URL(url);
        return (urlObj.hostname === "twitter.com" ||
            urlObj.hostname === "www.twitter.com" ||
            urlObj.hostname === "x.com" ||
            urlObj.hostname === "www.x.com");
    }
    catch {
        return false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full h-full" },
});
if (__VLS_ctx.selectedResult?.data?.url && __VLS_ctx.isTwitterUrl(__VLS_ctx.selectedResult.data.url)) {
    // @ts-ignore
    [selectedResult, selectedResult, isTwitterUrl,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "overflow-auto p-4 bg-white h-full" },
    });
    if (__VLS_ctx.selectedResult.data.twitterEmbedHtml) {
        // @ts-ignore
        [selectedResult,];
        __VLS_asFunctionalElement(__VLS_elements.div)({});
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.selectedResult.data.twitterEmbedHtml) }, null, null);
        // @ts-ignore
        [selectedResult,];
    }
    else if (__VLS_ctx.selectedResult.data.twitterEmbedHtml === null) {
        // @ts-ignore
        [selectedResult,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "h-full flex items-center justify-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-gray-600 mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
            href: (__VLS_ctx.selectedResult.data.url),
            target: "_blank",
            ...{ class: "inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" },
        });
        // @ts-ignore
        [selectedResult,];
    }
    else {
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "h-full flex items-center justify-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-center" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-gray-600" },
        });
    }
}
if (__VLS_ctx.selectedResult?.data?.url && !__VLS_ctx.isTwitterUrl(__VLS_ctx.selectedResult.data.url)) {
    // @ts-ignore
    [selectedResult, selectedResult, isTwitterUrl,];
    /** @type {[typeof TextSelectionMenu, typeof TextSelectionMenu, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(TextSelectionMenu, new TextSelectionMenu({
        sendTextMessage: (__VLS_ctx.sendTextMessage),
    }));
    const __VLS_1 = __VLS_0({
        sendTextMessage: (__VLS_ctx.sendTextMessage),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    const { default: __VLS_3 } = __VLS_2.slots;
    // @ts-ignore
    [sendTextMessage,];
    {
        const { default: __VLS_4 } = __VLS_2.slots;
        const [{ onMouseUp }] = __VLS_getSlotParameters(__VLS_4);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "w-full h-full overflow-auto p-6 bg-white" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "max-w-4xl mx-auto" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "mb-4 p-3 bg-blue-50 border border-blue-200 rounded" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-sm text-blue-800" },
        });
        __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
            href: (__VLS_ctx.selectedResult.data.url),
            target: "_blank",
            ...{ class: "text-blue-600 hover:underline" },
        });
        // @ts-ignore
        [selectedResult,];
        __VLS_asFunctionalElement(__VLS_elements.article, __VLS_elements.article)({
            ...{ onMouseup: (onMouseUp) },
        });
        __VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
            ...{ class: "text-3xl font-bold mb-3 text-gray-900" },
        });
        (__VLS_ctx.extractedTitle);
        // @ts-ignore
        [extractedTitle,];
        if (__VLS_ctx.extractedByline) {
            // @ts-ignore
            [extractedByline,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm text-gray-600 mb-2" },
            });
            (__VLS_ctx.extractedByline);
            // @ts-ignore
            [extractedByline,];
        }
        if (__VLS_ctx.extractedExcerpt) {
            // @ts-ignore
            [extractedExcerpt,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-lg text-gray-700 mb-4 italic border-l-4 border-blue-500 pl-4" },
            });
            (__VLS_ctx.extractedExcerpt);
            // @ts-ignore
            [extractedExcerpt,];
        }
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-gray-800 leading-relaxed" },
        });
        for (const [paragraph, index] of __VLS_getVForSourceType((__VLS_ctx.formattedContent))) {
            // @ts-ignore
            [formattedContent,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                key: (index),
                ...{ class: "mb-4" },
            });
            (paragraph);
        }
    }
    var __VLS_2;
}
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-8']} */ ;
/** @type {__VLS_StyleScopedClasses['w-8']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-200']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['italic']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-4']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        TextSelectionMenu: TextSelectionMenu,
        extractedTitle: extractedTitle,
        extractedByline: extractedByline,
        extractedExcerpt: extractedExcerpt,
        formattedContent: formattedContent,
        isTwitterUrl: isTwitterUrl,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
