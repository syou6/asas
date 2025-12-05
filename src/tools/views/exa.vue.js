import TextSelectionMenu from "../../components/TextSelectionMenu.vue";
defineOptions({
    inheritAttrs: false,
});
const props = defineProps();
const __VLS_emit = defineEmits();
const handleLinkClick = (e, url) => {
    if (e.metaKey || e.ctrlKey) {
        // Command/Ctrl key pressed - allow default behavior (open in new tab)
        return;
    }
    // Otherwise, prevent default and tell LLM to browse
    e.preventDefault();
    props.sendTextMessage(`Browse to ${url}`);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {[typeof TextSelectionMenu, typeof TextSelectionMenu, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(TextSelectionMenu, new TextSelectionMenu({
    sendTextMessage: (__VLS_ctx.sendTextMessage),
}));
const __VLS_1 = __VLS_0({
    sendTextMessage: (__VLS_ctx.sendTextMessage),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
const { default: __VLS_4 } = __VLS_2.slots;
// @ts-ignore
[sendTextMessage,];
{
    const { default: __VLS_5 } = __VLS_2.slots;
    const [{ onMouseUp }] = __VLS_getSlotParameters(__VLS_5);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "w-full h-full overflow-auto p-6 bg-white" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ onMouseup: (onMouseUp) },
        ...{ class: "max-w-4xl mx-auto" },
    });
    __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
        ...{ class: "text-2xl font-bold text-gray-800 mb-6" },
    });
    if (__VLS_ctx.selectedResult.jsonData.query) {
        // @ts-ignore
        [selectedResult,];
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-lg font-normal text-gray-600" },
        });
        (__VLS_ctx.selectedResult.jsonData.query);
        // @ts-ignore
        [selectedResult,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6" },
    });
    for (const [result, index] of __VLS_getVForSourceType((__VLS_ctx.selectedResult.jsonData.results ||
        __VLS_ctx.selectedResult.jsonData))) {
        // @ts-ignore
        [selectedResult, selectedResult,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (index),
            ...{ class: "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex items-start justify-between" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "flex-1" },
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-lg font-semibold text-blue-600 hover:text-blue-800" },
        });
        __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
            ...{ onClick: ((e) => __VLS_ctx.handleLinkClick(e, result.url)) },
            href: (result.url),
            ...{ class: "hover:underline" },
        });
        // @ts-ignore
        [handleLinkClick,];
        (result.title);
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-sm text-gray-500 mt-1" },
        });
        (result.url);
        if (result.text) {
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-gray-700 mt-2 line-clamp-3" },
            });
            (result.text);
        }
        if (result.highlights && result.highlights.length) {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "mt-3" },
            });
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-sm font-medium text-gray-600 mb-1" },
            });
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-1" },
            });
            for (const [highlight, hIndex] of __VLS_getVForSourceType((result.highlights.slice(0, 3)))) {
                __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                    key: (hIndex),
                    ...{ class: "text-sm text-gray-600 italic" },
                });
                (highlight);
            }
        }
        if (result.publishedDate) {
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-xs text-gray-400 mt-2" },
            });
            (new Date(result.publishedDate).toLocaleDateString());
        }
    }
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-4xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-normal']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-shadow']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['line-clamp-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['italic']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        TextSelectionMenu: TextSelectionMenu,
        handleLinkClick: handleLinkClick,
    }),
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
