import { computed, ref, watch, nextTick } from "vue";
import { marked } from "marked";
const props = defineProps();
const emit = defineEmits();
const isGeneratingPdf = ref(false);
const pdfError = ref(null);
const editableMarkdown = ref(props.selectedResult.data?.markdown || "");
// Check if markdown has been modified
const hasChanges = computed(() => {
    return editableMarkdown.value !== props.selectedResult.data?.markdown;
});
const pdfPath = computed(() => props.selectedResult?.data?.pdfPath || null);
const renderedHtml = computed(() => {
    if (!props.selectedResult.data?.markdown) {
        console.error("No markdown data in result:", props.selectedResult);
        return "";
    }
    // console.log("Rendering markdown:", props.selectedResult.data.markdown);
    return marked(props.selectedResult.data.markdown);
});
// Generate PDF when component mounts with markdown
watch(() => props.selectedResult?.data?.markdown, async (markdown) => {
    if (!markdown ||
        props.selectedResult?.data?.pdfPath ||
        isGeneratingPdf.value ||
        !props.selectedResult)
        return;
    isGeneratingPdf.value = true;
    pdfError.value = null;
    try {
        const pdfResponse = await fetch("/api/generate-pdf", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                markdown,
                title: props.selectedResult.title || "Document",
                uuid: props.selectedResult.uuid,
            }),
        });
        if (pdfResponse.ok) {
            const pdfResult = await pdfResponse.json();
            // Update the result with pdfPath and notify parent
            const updatedResult = {
                ...props.selectedResult,
                data: {
                    ...props.selectedResult.data,
                    pdfPath: pdfResult.pdfPath,
                },
            };
            emit("updateResult", updatedResult);
        }
        else {
            const error = await pdfResponse.json();
            pdfError.value =
                error.details || error.error || "Failed to generate PDF";
            console.error("PDF generation failed:", pdfError.value);
        }
    }
    catch (error) {
        pdfError.value = error instanceof Error ? error.message : "Unknown error";
        console.error("PDF generation exception:", error);
    }
    finally {
        isGeneratingPdf.value = false;
    }
}, { immediate: true });
// Watch for scroll requests from viewState
watch(() => props.selectedResult?.viewState?.scrollToAnchor, (anchorId) => {
    if (!anchorId)
        return;
    // Use nextTick to ensure the DOM is updated
    nextTick(() => {
        const element = document.getElementById(anchorId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        else {
            console.warn(`Anchor element with id "${anchorId}" not found`);
        }
    });
});
const downloadMarkdown = () => {
    if (!props.selectedResult?.data?.markdown)
        return;
    const blob = new Blob([props.selectedResult.data.markdown], {
        type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = props.selectedResult.title
        ? `${props.selectedResult.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`
        : "document.md";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
const downloadPdf = async () => {
    if (!pdfPath.value)
        return;
    try {
        const response = await fetch("/api/download-pdf", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                pdfPath: pdfPath.value,
            }),
        });
        if (!response.ok) {
            throw new Error("Failed to download PDF");
        }
        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : "document.pdf";
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    catch (error) {
        console.error("PDF download failed:", error);
        alert(`Failed to download PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
function handleMarkdownEdit() {
    // Just update the local state, don't apply yet
    // User needs to click "Apply Changes" button
}
function applyMarkdown() {
    // Update the result with new markdown content
    const updatedResult = {
        ...props.selectedResult,
        data: {
            ...props.selectedResult.data,
            markdown: editableMarkdown.value,
            // Reset pdfPath since markdown has changed
            pdfPath: undefined,
        },
    };
    emit("updateResult", updatedResult);
    // The renderedHtml will be updated automatically via computed property
    // and PDF will be regenerated via the existing watch
}
// Watch for external changes to selectedResult (when user clicks different result)
watch(() => props.selectedResult.data?.markdown, (newMarkdown) => {
    editableMarkdown.value = newMarkdown || "";
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-source']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-source']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-source']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "markdown-container" },
});
if (!__VLS_ctx.selectedResult.data?.markdown) {
    // @ts-ignore
    [selectedResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "min-h-full p-8 flex items-center justify-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-gray-500" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "markdown-content-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "p-4" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({
        ...{ style: {} },
    });
    (__VLS_ctx.selectedResult.title || "Document");
    // @ts-ignore
    [selectedResult,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.downloadMarkdown) },
        ...{ style: {} },
    });
    // @ts-ignore
    [downloadMarkdown,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "material-icons" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.downloadPdf) },
        disabled: (!__VLS_ctx.pdfPath),
        ...{ style: ({
                padding: '0.5em 1em',
                backgroundColor: __VLS_ctx.pdfPath ? '#2196f3' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: __VLS_ctx.pdfPath ? 'pointer' : 'not-allowed',
                fontSize: '0.9em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
            }) },
    });
    // @ts-ignore
    [downloadPdf, pdfPath, pdfPath, pdfPath,];
    __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
        ...{ class: "material-icons" },
        ...{ style: ({
                fontSize: '1.2em',
                animation: __VLS_ctx.isGeneratingPdf
                    ? 'spin 1s linear infinite'
                    : 'none',
            }) },
    });
    // @ts-ignore
    [isGeneratingPdf,];
    (__VLS_ctx.isGeneratingPdf ? "hourglass_empty" : "download");
    // @ts-ignore
    [isGeneratingPdf,];
    if (__VLS_ctx.pdfError) {
        // @ts-ignore
        [pdfError,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ style: {} },
        });
        (__VLS_ctx.pdfError);
        // @ts-ignore
        [pdfError,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "markdown-content prose prose-slate max-w-none" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedHtml) }, null, null);
    // @ts-ignore
    [renderedHtml,];
    __VLS_asFunctionalElement(__VLS_elements.details, __VLS_elements.details)({
        ...{ class: "markdown-source" },
    });
    __VLS_asFunctionalElement(__VLS_elements.summary, __VLS_elements.summary)({});
    __VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
        ...{ onInput: (__VLS_ctx.handleMarkdownEdit) },
        value: (__VLS_ctx.editableMarkdown),
        ...{ class: "markdown-editor" },
        spellcheck: "false",
    });
    // @ts-ignore
    [handleMarkdownEdit, editableMarkdown,];
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.applyMarkdown) },
        ...{ class: "apply-btn" },
        disabled: (!__VLS_ctx.hasChanges),
    });
    // @ts-ignore
    [applyMarkdown, hasChanges,];
}
/** @type {__VLS_StyleScopedClasses['markdown-container']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-slate']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-none']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-source']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        isGeneratingPdf: isGeneratingPdf,
        pdfError: pdfError,
        editableMarkdown: editableMarkdown,
        hasChanges: hasChanges,
        pdfPath: pdfPath,
        renderedHtml: renderedHtml,
        downloadMarkdown: downloadMarkdown,
        downloadPdf: downloadPdf,
        handleMarkdownEdit: handleMarkdownEdit,
        applyMarkdown: applyMarkdown,
    }),
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
