import { ref, watch, computed } from "vue";
const props = defineProps();
const emit = defineEmits();
const formData = ref(null);
const formValues = ref({});
const touched = ref(new Set());
const fieldErrors = ref(new Map());
const submitted = ref(false);
const showErrorSummary = ref(false);
const isRestoring = ref(false);
// Initialize form data and restore state
watch(() => props.selectedResult, (newResult, oldResult) => {
    if (newResult?.toolName === "createForm" && newResult.jsonData) {
        // Only restore if this is a different result (uuid changed) or first load
        const isNewResult = !oldResult || oldResult.uuid !== newResult.uuid;
        if (isNewResult) {
            isRestoring.value = true;
            formData.value = newResult.jsonData;
            // Initialize formValues for all fields
            formValues.value = {};
            formData.value.fields.forEach((field) => {
                formValues.value[field.id] = getDefaultValue(field);
            });
            // Restore from viewState if available
            if (newResult.viewState) {
                const viewState = newResult.viewState;
                if (viewState.userResponses) {
                    Object.assign(formValues.value, viewState.userResponses);
                }
                if (viewState.touched) {
                    touched.value = new Set(viewState.touched);
                    // Re-validate touched fields
                    viewState.touched.forEach((fieldId) => {
                        validateField(fieldId);
                    });
                }
                if (viewState.submitted !== undefined) {
                    submitted.value = viewState.submitted;
                }
            }
            isRestoring.value = false;
        }
    }
}, { immediate: true });
// Save state to viewState - watch all state changes together
watch([formValues, touched, submitted], () => {
    if (isRestoring.value || !props.selectedResult)
        return;
    const updatedResult = {
        ...props.selectedResult,
        viewState: {
            userResponses: { ...formValues.value },
            touched: Array.from(touched.value),
            submitted: submitted.value,
        },
    };
    emit("updateResult", updatedResult);
}, { deep: true });
function getDefaultValue(field) {
    // Check if field has a defaultValue property
    const fieldWithDefault = field;
    if (fieldWithDefault.defaultValue !== undefined) {
        switch (field.type) {
            case "radio":
            case "dropdown":
                // Convert string value to index in choices
                const choiceIndex = field.choices.indexOf(fieldWithDefault.defaultValue);
                return choiceIndex !== -1 ? choiceIndex : null;
            case "checkbox":
                // Convert array of string values to array of indices
                if (Array.isArray(fieldWithDefault.defaultValue)) {
                    return fieldWithDefault.defaultValue
                        .map((val) => field.choices.indexOf(val))
                        .filter((idx) => idx !== -1);
                }
                return [];
            default:
                // For text, textarea, number, date, time - return defaultValue directly
                return fieldWithDefault.defaultValue;
        }
    }
    // Fall back to hardcoded defaults if no defaultValue is set
    switch (field.type) {
        case "text":
        case "textarea":
            return "";
        case "number":
            return field.min !== undefined
                ? field.min
                : 0;
        case "date":
        case "time":
            return "";
        case "radio":
        case "dropdown":
            return null;
        case "checkbox":
            return [];
        default:
            return null;
    }
}
function isEmpty(value) {
    if (value === null || value === undefined)
        return true;
    if (typeof value === "string")
        return value.trim() === "";
    if (Array.isArray(value))
        return value.length === 0;
    return false;
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
}
function getErrorMessage(field, value) {
    // Required field validation
    if (field.required && isEmpty(value)) {
        return `${field.label} is required`;
    }
    // Skip other validations if field is empty and not required
    if (isEmpty(value)) {
        return null;
    }
    // Type-specific validations
    switch (field.type) {
        case "text": {
            const textField = field;
            if (textField.validation === "email" && !isValidEmail(value)) {
                return "Please enter a valid email address";
            }
            if (textField.validation === "url" && !isValidUrl(value)) {
                return "Please enter a valid URL";
            }
            if (textField.validation === "phone" && !isValidPhone(value)) {
                return "Please enter a valid phone number";
            }
            if (typeof textField.validation === "string" &&
                textField.validation !== "email" &&
                textField.validation !== "url" &&
                textField.validation !== "phone") {
                try {
                    if (!new RegExp(textField.validation).test(value)) {
                        return `${field.label} format is invalid`;
                    }
                }
                catch {
                    console.warn(`Invalid regex pattern: ${textField.validation}`);
                }
            }
            break;
        }
        case "textarea": {
            const textareaField = field;
            if (textareaField.minLength && value.length < textareaField.minLength) {
                return `Must be at least ${textareaField.minLength} characters (currently ${value.length})`;
            }
            if (textareaField.maxLength && value.length > textareaField.maxLength) {
                return `Must be no more than ${textareaField.maxLength} characters (currently ${value.length})`;
            }
            break;
        }
        case "number": {
            const numberField = field;
            if (numberField.min !== undefined && value < numberField.min) {
                return `Must be at least ${numberField.min}`;
            }
            if (numberField.max !== undefined && value > numberField.max) {
                return `Must be no more than ${numberField.max}`;
            }
            break;
        }
        case "date": {
            const dateField = field;
            if (dateField.minDate && value < dateField.minDate) {
                return `Date must be on or after ${dateField.minDate}`;
            }
            if (dateField.maxDate && value > dateField.maxDate) {
                return `Date must be on or before ${dateField.maxDate}`;
            }
            break;
        }
        case "checkbox": {
            const checkboxField = field;
            const selectedCount = value?.length || 0;
            if (checkboxField.minSelections &&
                selectedCount < checkboxField.minSelections) {
                return `Please select at least ${checkboxField.minSelections} option${checkboxField.minSelections > 1 ? "s" : ""}`;
            }
            if (checkboxField.maxSelections &&
                selectedCount > checkboxField.maxSelections) {
                return `Please select no more than ${checkboxField.maxSelections} option${checkboxField.maxSelections > 1 ? "s" : ""}`;
            }
            break;
        }
    }
    return null;
}
function validateField(fieldId) {
    const field = formData.value?.fields.find((f) => f.id === fieldId);
    if (!field)
        return true;
    const value = formValues.value[fieldId];
    const errorMessage = getErrorMessage(field, value);
    if (errorMessage) {
        fieldErrors.value.set(fieldId, {
            fieldId,
            message: errorMessage,
            type: "custom",
        });
        return false;
    }
    else {
        fieldErrors.value.delete(fieldId);
        return true;
    }
}
function handleBlur(fieldId) {
    touched.value.add(fieldId);
    validateField(fieldId);
}
function handleInput(fieldId) {
    // Real-time validation for fields that are already touched
    if (touched.value.has(fieldId)) {
        validateField(fieldId);
    }
}
function hasError(fieldId) {
    return fieldErrors.value.has(fieldId);
}
function focusField(fieldId) {
    const element = document.getElementById(`input-${fieldId}`);
    if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}
function showCharCount(field) {
    return ((field.type === "text" || field.type === "textarea") &&
        field.maxLength !== undefined);
}
function isNearLimit(field) {
    if (field.type !== "text" && field.type !== "textarea")
        return false;
    const maxLength = field.maxLength;
    if (!maxLength)
        return false;
    const currentLength = (formValues.value[field.id] || "").length;
    return currentLength / maxLength > 0.9;
}
const requiredFieldsCount = computed(() => {
    return formData.value?.fields.filter((f) => f.required).length || 0;
});
const filledRequiredCount = computed(() => {
    if (!formData.value)
        return 0;
    return formData.value.fields.filter((f) => f.required && !isEmpty(formValues.value[f.id])).length;
});
function handleSubmit() {
    if (submitted.value)
        return;
    // Mark all fields as touched
    formData.value?.fields.forEach((field) => {
        touched.value.add(field.id);
        validateField(field.id);
    });
    // Check for errors
    if (fieldErrors.value.size > 0) {
        showErrorSummary.value = true;
        // Focus first error field
        const firstErrorFieldId = Array.from(fieldErrors.value.keys())[0];
        focusField(firstErrorFieldId);
        return;
    }
    // Build response object with actual choice values (not indices)
    const responses = {};
    formData.value?.fields.forEach((field) => {
        const value = formValues.value[field.id];
        // Convert indices to actual values for choice-based fields
        if (field.type === "radio" || field.type === "dropdown") {
            if (value !== null && value !== undefined) {
                responses[field.id] = field.choices[value];
            }
            else {
                responses[field.id] = null;
            }
        }
        else if (field.type === "checkbox") {
            // Convert array of indices to array of values
            responses[field.id] = (value || []).map((idx) => field.choices[idx]);
        }
        else {
            responses[field.id] = value;
        }
    });
    const message = JSON.stringify({
        formSubmission: {
            formTitle: formData.value?.title || "Form",
            responses,
        },
    }, null, 2);
    submitted.value = true;
    props.sendTextMessage(message);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form-field']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full h-full overflow-y-auto p-8" },
});
if (__VLS_ctx.formData) {
    // @ts-ignore
    [formData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "max-w-3xl w-full mx-auto" },
    });
    if (__VLS_ctx.formData.title) {
        // @ts-ignore
        [formData,];
        __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
            ...{ class: "text-gray-900 text-3xl font-bold mb-4 text-center" },
        });
        (__VLS_ctx.formData.title);
        // @ts-ignore
        [formData,];
    }
    if (__VLS_ctx.formData.description) {
        // @ts-ignore
        [formData,];
        __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
            ...{ class: "text-gray-600 text-center mb-8 text-lg" },
        });
        (__VLS_ctx.formData.description);
        // @ts-ignore
        [formData,];
    }
    if (__VLS_ctx.showErrorSummary && __VLS_ctx.fieldErrors.size > 0) {
        // @ts-ignore
        [showErrorSummary, fieldErrors,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6" },
            role: "alert",
        });
        __VLS_asFunctionalElement(__VLS_elements.h3, __VLS_elements.h3)({
            ...{ class: "text-red-800 font-semibold mb-2 flex items-center gap-2" },
        });
        __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
            ...{ class: "w-5 h-5" },
            fill: "currentColor",
            viewBox: "0 0 20 20",
            'aria-hidden': "true",
        });
        __VLS_asFunctionalElement(__VLS_elements.path)({
            'fill-rule': "evenodd",
            d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
            'clip-rule': "evenodd",
        });
        __VLS_asFunctionalElement(__VLS_elements.ul, __VLS_elements.ul)({
            ...{ class: "text-red-700 space-y-1" },
        });
        for (const [[fieldId, error]] of __VLS_getVForSourceType((__VLS_ctx.fieldErrors))) {
            // @ts-ignore
            [fieldErrors,];
            __VLS_asFunctionalElement(__VLS_elements.li, __VLS_elements.li)({
                key: (fieldId),
            });
            __VLS_asFunctionalElement(__VLS_elements.a, __VLS_elements.a)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!(__VLS_ctx.showErrorSummary && __VLS_ctx.fieldErrors.size > 0))
                            return;
                        __VLS_ctx.focusField(fieldId);
                        // @ts-ignore
                        [focusField,];
                    } },
                href: (`#${fieldId}`),
                ...{ class: "hover:underline cursor-pointer" },
            });
            (error.message);
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.form, __VLS_elements.form)({
        ...{ onSubmit: (__VLS_ctx.handleSubmit) },
        ...{ class: "space-y-6" },
    });
    // @ts-ignore
    [handleSubmit,];
    for (const [field] of __VLS_getVForSourceType((__VLS_ctx.formData.fields))) {
        // @ts-ignore
        [formData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (field.id),
            id: (field.id),
            ...{ class: "form-field" },
            ...{ class: ({ 'has-error': __VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id) }) },
        });
        // @ts-ignore
        [hasError, touched,];
        __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
            for: (`input-${field.id}`),
            ...{ class: "block text-gray-800 font-semibold mb-2" },
            ...{ class: ({
                    'text-red-600': __VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id),
                }) },
        });
        // @ts-ignore
        [hasError, touched,];
        (field.label);
        if (field.required) {
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-red-500 ml-1" },
                'aria-label': "required",
            });
        }
        if (field.description) {
            __VLS_asFunctionalElement(__VLS_elements.p, __VLS_elements.p)({
                ...{ class: "text-gray-600 text-sm mb-2" },
            });
            (field.description);
        }
        if (field.type === 'text') {
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onBlur: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!(field.type === 'text'))
                            return;
                        __VLS_ctx.handleBlur(field.id);
                        // @ts-ignore
                        [handleBlur,];
                    } },
                ...{ onInput: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!(field.type === 'text'))
                            return;
                        __VLS_ctx.handleInput(field.id);
                        // @ts-ignore
                        [handleInput,];
                    } },
                id: (`input-${field.id}`),
                value: (__VLS_ctx.formValues[field.id]),
                type: "text",
                placeholder: (field.placeholder),
                'aria-invalid': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)),
                'aria-describedby': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)
                    ? `${field.id}-error`
                    : undefined),
                ...{ class: "w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" },
                ...{ class: ({
                        'border-red-500 focus:ring-red-500': __VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id),
                        'border-gray-300': !__VLS_ctx.hasError(field.id) || !__VLS_ctx.touched.has(field.id),
                    }) },
            });
            // @ts-ignore
            [hasError, hasError, hasError, hasError, touched, touched, touched, touched, formValues,];
        }
        else if (field.type === 'textarea') {
            __VLS_asFunctionalElement(__VLS_elements.textarea)({
                ...{ onBlur: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!(field.type === 'textarea'))
                            return;
                        __VLS_ctx.handleBlur(field.id);
                        // @ts-ignore
                        [handleBlur,];
                    } },
                ...{ onInput: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!(field.type === 'textarea'))
                            return;
                        __VLS_ctx.handleInput(field.id);
                        // @ts-ignore
                        [handleInput,];
                    } },
                id: (`input-${field.id}`),
                value: (__VLS_ctx.formValues[field.id]),
                placeholder: (field.placeholder),
                rows: (field.rows || 4),
                'aria-invalid': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)),
                'aria-describedby': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)
                    ? `${field.id}-error`
                    : undefined),
                ...{ class: "w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y" },
                ...{ class: ({
                        'border-red-500 focus:ring-red-500': __VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id),
                        'border-gray-300': !__VLS_ctx.hasError(field.id) || !__VLS_ctx.touched.has(field.id),
                    }) },
            });
            // @ts-ignore
            [hasError, hasError, hasError, hasError, touched, touched, touched, touched, formValues,];
        }
        else if (field.type === 'number') {
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onBlur: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        if (!(field.type === 'number'))
                            return;
                        __VLS_ctx.handleBlur(field.id);
                        // @ts-ignore
                        [handleBlur,];
                    } },
                ...{ onInput: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        if (!(field.type === 'number'))
                            return;
                        __VLS_ctx.handleInput(field.id);
                        // @ts-ignore
                        [handleInput,];
                    } },
                id: (`input-${field.id}`),
                type: "number",
                min: (field.min),
                max: (field.max),
                step: (field.step),
                'aria-invalid': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)),
                'aria-describedby': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)
                    ? `${field.id}-error`
                    : undefined),
                ...{ class: "w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" },
                ...{ class: ({
                        'border-red-500 focus:ring-red-500': __VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id),
                        'border-gray-300': !__VLS_ctx.hasError(field.id) || !__VLS_ctx.touched.has(field.id),
                    }) },
            });
            (__VLS_ctx.formValues[field.id]);
            // @ts-ignore
            [hasError, hasError, hasError, hasError, touched, touched, touched, touched, formValues,];
        }
        else if (field.type === 'date') {
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onBlur: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        if (!!(field.type === 'number'))
                            return;
                        if (!(field.type === 'date'))
                            return;
                        __VLS_ctx.handleBlur(field.id);
                        // @ts-ignore
                        [handleBlur,];
                    } },
                ...{ onChange: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        if (!!(field.type === 'number'))
                            return;
                        if (!(field.type === 'date'))
                            return;
                        __VLS_ctx.handleInput(field.id);
                        // @ts-ignore
                        [handleInput,];
                    } },
                id: (`input-${field.id}`),
                type: "date",
                min: (field.minDate),
                max: (field.maxDate),
                'aria-invalid': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)),
                'aria-describedby': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)
                    ? `${field.id}-error`
                    : undefined),
                ...{ class: "w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" },
                ...{ class: ({
                        'border-red-500 focus:ring-red-500': __VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id),
                        'border-gray-300': !__VLS_ctx.hasError(field.id) || !__VLS_ctx.touched.has(field.id),
                    }) },
            });
            (__VLS_ctx.formValues[field.id]);
            // @ts-ignore
            [hasError, hasError, hasError, hasError, touched, touched, touched, touched, formValues,];
        }
        else if (field.type === 'time') {
            __VLS_asFunctionalElement(__VLS_elements.input)({
                ...{ onBlur: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        if (!!(field.type === 'number'))
                            return;
                        if (!!(field.type === 'date'))
                            return;
                        if (!(field.type === 'time'))
                            return;
                        __VLS_ctx.handleBlur(field.id);
                        // @ts-ignore
                        [handleBlur,];
                    } },
                ...{ onChange: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        if (!!(field.type === 'number'))
                            return;
                        if (!!(field.type === 'date'))
                            return;
                        if (!(field.type === 'time'))
                            return;
                        __VLS_ctx.handleInput(field.id);
                        // @ts-ignore
                        [handleInput,];
                    } },
                id: (`input-${field.id}`),
                type: "time",
                'aria-invalid': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)),
                'aria-describedby': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)
                    ? `${field.id}-error`
                    : undefined),
                ...{ class: "w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" },
                ...{ class: ({
                        'border-red-500 focus:ring-red-500': __VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id),
                        'border-gray-300': !__VLS_ctx.hasError(field.id) || !__VLS_ctx.touched.has(field.id),
                    }) },
            });
            (__VLS_ctx.formValues[field.id]);
            // @ts-ignore
            [hasError, hasError, hasError, hasError, touched, touched, touched, touched, formValues,];
        }
        else if (field.type === 'radio') {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-2" },
                role: "radiogroup",
                'aria-invalid': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)),
                'aria-describedby': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)
                    ? `${field.id}-error`
                    : undefined),
            });
            // @ts-ignore
            [hasError, hasError, touched, touched,];
            for (const [choice, index] of __VLS_getVForSourceType((field.choices))) {
                __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
                    key: (index),
                    ...{ class: "flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50" },
                    ...{ class: ({
                            'border-blue-500 bg-blue-50': __VLS_ctx.formValues[field.id] === index,
                            'border-gray-300': __VLS_ctx.formValues[field.id] !== index,
                        }) },
                });
                // @ts-ignore
                [formValues, formValues,];
                __VLS_asFunctionalElement(__VLS_elements.input)({
                    ...{ onChange: (...[$event]) => {
                            if (!(__VLS_ctx.formData))
                                return;
                            if (!!(field.type === 'text'))
                                return;
                            if (!!(field.type === 'textarea'))
                                return;
                            if (!!(field.type === 'number'))
                                return;
                            if (!!(field.type === 'date'))
                                return;
                            if (!!(field.type === 'time'))
                                return;
                            if (!(field.type === 'radio'))
                                return;
                            __VLS_ctx.handleInput(field.id);
                            // @ts-ignore
                            [handleInput,];
                        } },
                    ...{ onBlur: (...[$event]) => {
                            if (!(__VLS_ctx.formData))
                                return;
                            if (!!(field.type === 'text'))
                                return;
                            if (!!(field.type === 'textarea'))
                                return;
                            if (!!(field.type === 'number'))
                                return;
                            if (!!(field.type === 'date'))
                                return;
                            if (!!(field.type === 'time'))
                                return;
                            if (!(field.type === 'radio'))
                                return;
                            __VLS_ctx.handleBlur(field.id);
                            // @ts-ignore
                            [handleBlur,];
                        } },
                    type: "radio",
                    name: (field.id),
                    value: (index),
                    ...{ class: "mr-3 h-4 w-4 flex-shrink-0" },
                });
                (__VLS_ctx.formValues[field.id]);
                // @ts-ignore
                [formValues,];
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-gray-800" },
                });
                (choice);
            }
        }
        else if (field.type === 'dropdown') {
            __VLS_asFunctionalElement(__VLS_elements.select, __VLS_elements.select)({
                ...{ onBlur: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        if (!!(field.type === 'number'))
                            return;
                        if (!!(field.type === 'date'))
                            return;
                        if (!!(field.type === 'time'))
                            return;
                        if (!!(field.type === 'radio'))
                            return;
                        if (!(field.type === 'dropdown'))
                            return;
                        __VLS_ctx.handleBlur(field.id);
                        // @ts-ignore
                        [handleBlur,];
                    } },
                ...{ onChange: (...[$event]) => {
                        if (!(__VLS_ctx.formData))
                            return;
                        if (!!(field.type === 'text'))
                            return;
                        if (!!(field.type === 'textarea'))
                            return;
                        if (!!(field.type === 'number'))
                            return;
                        if (!!(field.type === 'date'))
                            return;
                        if (!!(field.type === 'time'))
                            return;
                        if (!!(field.type === 'radio'))
                            return;
                        if (!(field.type === 'dropdown'))
                            return;
                        __VLS_ctx.handleInput(field.id);
                        // @ts-ignore
                        [handleInput,];
                    } },
                id: (`input-${field.id}`),
                value: (__VLS_ctx.formValues[field.id]),
                'aria-invalid': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)),
                'aria-describedby': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)
                    ? `${field.id}-error`
                    : undefined),
                ...{ class: "w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white" },
                ...{ class: ({
                        'border-red-500 focus:ring-red-500': __VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id),
                        'border-gray-300': !__VLS_ctx.hasError(field.id) || !__VLS_ctx.touched.has(field.id),
                    }) },
            });
            // @ts-ignore
            [hasError, hasError, hasError, hasError, touched, touched, touched, touched, formValues,];
            __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
                value: (null),
                disabled: true,
            });
            for (const [choice, index] of __VLS_getVForSourceType((field.choices))) {
                __VLS_asFunctionalElement(__VLS_elements.option, __VLS_elements.option)({
                    key: (index),
                    value: (index),
                });
                (choice);
            }
        }
        else if (field.type === 'checkbox') {
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "space-y-2" },
                role: "group",
                'aria-invalid': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)),
                'aria-describedby': (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)
                    ? `${field.id}-error`
                    : undefined),
            });
            // @ts-ignore
            [hasError, hasError, touched, touched,];
            for (const [choice, index] of __VLS_getVForSourceType((field.choices))) {
                __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
                    key: (index),
                    ...{ class: "flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50" },
                    ...{ class: ({
                            'border-blue-500 bg-blue-50': (__VLS_ctx.formValues[field.id] || []).includes(index),
                            'border-gray-300': !(__VLS_ctx.formValues[field.id] || []).includes(index),
                        }) },
                });
                // @ts-ignore
                [formValues, formValues,];
                __VLS_asFunctionalElement(__VLS_elements.input)({
                    ...{ onChange: (...[$event]) => {
                            if (!(__VLS_ctx.formData))
                                return;
                            if (!!(field.type === 'text'))
                                return;
                            if (!!(field.type === 'textarea'))
                                return;
                            if (!!(field.type === 'number'))
                                return;
                            if (!!(field.type === 'date'))
                                return;
                            if (!!(field.type === 'time'))
                                return;
                            if (!!(field.type === 'radio'))
                                return;
                            if (!!(field.type === 'dropdown'))
                                return;
                            if (!(field.type === 'checkbox'))
                                return;
                            __VLS_ctx.handleInput(field.id);
                            // @ts-ignore
                            [handleInput,];
                        } },
                    ...{ onBlur: (...[$event]) => {
                            if (!(__VLS_ctx.formData))
                                return;
                            if (!!(field.type === 'text'))
                                return;
                            if (!!(field.type === 'textarea'))
                                return;
                            if (!!(field.type === 'number'))
                                return;
                            if (!!(field.type === 'date'))
                                return;
                            if (!!(field.type === 'time'))
                                return;
                            if (!!(field.type === 'radio'))
                                return;
                            if (!!(field.type === 'dropdown'))
                                return;
                            if (!(field.type === 'checkbox'))
                                return;
                            __VLS_ctx.handleBlur(field.id);
                            // @ts-ignore
                            [handleBlur,];
                        } },
                    type: "checkbox",
                    value: (index),
                    ...{ class: "mr-3 h-4 w-4 flex-shrink-0" },
                });
                (__VLS_ctx.formValues[field.id]);
                // @ts-ignore
                [formValues,];
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                    ...{ class: "text-gray-800" },
                });
                (choice);
            }
        }
        if (__VLS_ctx.hasError(field.id) && __VLS_ctx.touched.has(field.id)) {
            // @ts-ignore
            [hasError, touched,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                id: (`${field.id}-error`),
                ...{ class: "flex items-center gap-2 mt-2 text-red-600 text-sm" },
                role: "alert",
            });
            __VLS_asFunctionalElement(__VLS_elements.svg, __VLS_elements.svg)({
                ...{ class: "w-4 h-4 flex-shrink-0" },
                fill: "currentColor",
                viewBox: "0 0 20 20",
                'aria-hidden': "true",
            });
            __VLS_asFunctionalElement(__VLS_elements.path)({
                'fill-rule': "evenodd",
                d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                'clip-rule': "evenodd",
            });
            (__VLS_ctx.fieldErrors.get(field.id)?.message);
            // @ts-ignore
            [fieldErrors,];
        }
        if (__VLS_ctx.showCharCount(field)) {
            // @ts-ignore
            [showCharCount,];
            __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
                ...{ class: "text-sm mt-2" },
                ...{ class: ({
                        'text-amber-600 font-semibold': __VLS_ctx.isNearLimit(field),
                        'text-gray-500': !__VLS_ctx.isNearLimit(field),
                    }) },
            });
            // @ts-ignore
            [isNearLimit, isNearLimit,];
            ((__VLS_ctx.formValues[field.id] || "").length);
            // @ts-ignore
            [formValues,];
            if (field.maxLength) {
                __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({});
                (field.maxLength);
            }
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-8 flex justify-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        type: "submit",
        disabled: (__VLS_ctx.submitted),
        ...{ class: (__VLS_ctx.submitted
                ? 'bg-green-600 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700') },
        ...{ class: "px-8 py-3 rounded-lg text-white font-semibold text-lg transition-colors" },
    });
    // @ts-ignore
    [submitted, submitted,];
    (__VLS_ctx.submitted ? "✓ Submitted" : "Submit Form");
    // @ts-ignore
    [submitted,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-4 text-center text-gray-600 text-sm" },
    });
    (__VLS_ctx.filledRequiredCount);
    (__VLS_ctx.requiredFieldsCount);
    // @ts-ignore
    [filledRequiredCount, requiredFieldsCount,];
}
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-8']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-800']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-700']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['form-field']} */ ;
/** @type {__VLS_StyleScopedClasses['has-error']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['resize-y']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:ring-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-amber-600']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-8']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        formData: formData,
        formValues: formValues,
        touched: touched,
        fieldErrors: fieldErrors,
        submitted: submitted,
        showErrorSummary: showErrorSummary,
        handleBlur: handleBlur,
        handleInput: handleInput,
        hasError: hasError,
        focusField: focusField,
        showCharCount: showCharCount,
        isNearLimit: isNearLimit,
        requiredFieldsCount: requiredFieldsCount,
        filledRequiredCount: filledRequiredCount,
        handleSubmit: handleSubmit,
    }),
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
