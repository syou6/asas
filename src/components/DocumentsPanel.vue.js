import { onMounted, ref } from "vue";
const emit = defineEmits();
const documents = ref([]);
const loading = ref(false);
const loadError = ref(null);
const uploading = ref(false);
const uploadError = ref(null);
const deletingId = ref(null);
const fileInput = ref(null);
async function fetchDocuments() {
    loading.value = true;
    loadError.value = null;
    try {
        const response = await fetch("/api/docs");
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const body = (await response.json());
        if (!body.success) {
            throw new Error(body.error ?? "Failed to fetch documents");
        }
        documents.value = body.documents;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch documents";
        loadError.value = message;
    }
    finally {
        loading.value = false;
    }
}
async function handleUpload(event) {
    const target = event.target;
    const file = target.files?.[0];
    if (!file)
        return;
    uploading.value = true;
    uploadError.value = null;
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/docs/upload", {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const body = (await response.json());
        if (!body.success) {
            throw new Error(body.error ?? "Upload failed");
        }
        // refresh list
        await fetchDocuments();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        uploadError.value = message;
    }
    finally {
        uploading.value = false;
        if (fileInput.value) {
            fileInput.value.value = "";
        }
    }
}
async function handleDelete(id) {
    deletingId.value = id;
    try {
        const response = await fetch(`/api/docs/${id}`, { method: "DELETE" });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const body = (await response.json());
        if (!body.success) {
            throw new Error(body.error ?? "Delete failed");
        }
        documents.value = documents.value.filter((doc) => doc.id !== id);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Delete failed";
        loadError.value = message;
    }
    finally {
        deletingId.value = null;
    }
}
function formatBytes(bytes) {
    if (!bytes || bytes <= 0)
        return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** idx;
    return `${value.toFixed(1)} ${units[idx]}`;
}
function formatDate(value) {
    if (!value)
        return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    return date.toLocaleString();
}
onMounted(fetchDocuments);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-end" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full max-w-xl h-full bg-white shadow-xl border-l flex flex-col" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center justify-between px-4 py-3 border-b" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex flex-col" },
});
__VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
    ...{ class: "text-lg font-semibold" },
});
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-sm text-gray-500" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.emit('close');
            // @ts-ignore
            [emit,];
        } },
    ...{ class: "text-gray-500 hover:text-gray-800" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "p-4 space-y-4 overflow-y-auto flex-1" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "border rounded-lg p-4 space-y-3 bg-gray-50" },
});
__VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
    ...{ class: "text-sm font-medium text-gray-700" },
});
__VLS_asFunctionalElement(__VLS_elements.input)({
    ...{ onChange: (__VLS_ctx.handleUpload) },
    ref: "fileInput",
    type: "file",
    accept: ".md,.markdown,.txt",
    ...{ class: "block w-full text-sm text-gray-700" },
});
/** @type {typeof __VLS_ctx.fileInput} */ ;
// @ts-ignore
[handleUpload, fileInput,];
__VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
    ...{ class: "text-xs text-gray-500" },
});
if (__VLS_ctx.uploadError) {
    // @ts-ignore
    [uploadError,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs text-red-600" },
    });
    (__VLS_ctx.uploadError);
    // @ts-ignore
    [uploadError,];
}
if (__VLS_ctx.uploading) {
    // @ts-ignore
    [uploading,];
    __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
        ...{ class: "text-xs text-blue-600" },
    });
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "flex items-center justify-between" },
});
__VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
    ...{ class: "text-sm font-semibold text-gray-800" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.fetchDocuments) },
    ...{ class: "text-sm text-blue-600 hover:text-blue-800" },
});
// @ts-ignore
[fetchDocuments,];
if (__VLS_ctx.loadError) {
    // @ts-ignore
    [loadError,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-sm text-red-600" },
    });
    (__VLS_ctx.loadError);
    // @ts-ignore
    [loadError,];
}
if (__VLS_ctx.loading && __VLS_ctx.documents.length === 0) {
    // @ts-ignore
    [loading, documents,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-sm text-gray-500" },
    });
}
if (!__VLS_ctx.loading && __VLS_ctx.documents.length === 0 && !__VLS_ctx.loadError) {
    // @ts-ignore
    [loadError, loading, documents,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-sm text-gray-500" },
    });
}
__VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({
    ...{ class: "space-y-3" },
});
for (const [doc] of __VLS_getVForSourceType((__VLS_ctx.documents))) {
    // @ts-ignore
    [documents,];
    __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
        key: (doc.id),
        ...{ class: "border rounded-md p-3 flex items-start justify-between gap-3" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-1" },
    });
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "font-medium text-gray-900 truncate" },
    });
    (doc.title);
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs text-gray-500" },
    });
    (__VLS_ctx.formatBytes(doc.size_bytes));
    (__VLS_ctx.formatDate(doc.created_at));
    // @ts-ignore
    [formatBytes, formatDate,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "text-xs text-gray-500 break-all" },
    });
    (doc.path);
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(doc.id);
                // @ts-ignore
                [handleDelete,];
            } },
        ...{ class: "text-xs text-red-600 hover:text-red-800" },
        disabled: (__VLS_ctx.deletingId === doc.id),
    });
    // @ts-ignore
    [deletingId,];
    (__VLS_ctx.deletingId === doc.id ? "Deleting..." : "Delete");
    // @ts-ignore
    [deletingId,];
}
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-30']} */ ;
/** @type {__VLS_StyleScopedClasses['z-40']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-end']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-col']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-3']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['truncate']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-red-800']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        emit: emit,
        documents: documents,
        loading: loading,
        loadError: loadError,
        uploading: uploading,
        uploadError: uploadError,
        deletingId: deletingId,
        fileInput: fileInput,
        fetchDocuments: fetchDocuments,
        handleUpload: handleUpload,
        handleDelete: handleDelete,
        formatBytes: formatBytes,
        formatDate: formatDate,
    }),
    __typeEmits: {},
});
export default (await import('vue')).defineComponent({
    __typeEmits: {},
});
; /* PartiallyEnd: #4569/main.vue */
