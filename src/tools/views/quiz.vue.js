import { ref, watch, computed } from "vue";
const props = defineProps();
const emit = defineEmits();
const quizData = ref(null);
const userAnswers = ref([]);
watch(() => props.selectedResult, (newResult) => {
    if (newResult?.toolName === "putQuestions" && newResult.jsonData) {
        quizData.value = newResult.jsonData;
        // Restore user answers from viewState or initialize new array
        if (newResult.viewState?.userAnswers) {
            userAnswers.value = newResult.viewState.userAnswers;
        }
        else {
            userAnswers.value = new Array(quizData.value.questions.length).fill(null);
        }
    }
}, { immediate: true });
// Watch userAnswers and save to viewState whenever they change
watch(userAnswers, (newAnswers) => {
    if (props.selectedResult && newAnswers) {
        const updatedResult = {
            ...props.selectedResult,
            viewState: {
                userAnswers: newAnswers,
            },
        };
        emit("updateResult", updatedResult);
    }
}, { deep: true });
const answeredCount = computed(() => {
    return userAnswers.value.filter((answer) => answer !== null).length;
});
const allQuestionsAnswered = computed(() => {
    return (quizData.value && answeredCount.value === quizData.value.questions.length);
});
function getChoiceClass(qIndex, cIndex) {
    const isSelected = userAnswers.value[qIndex] === cIndex;
    const baseClasses = "border-2";
    if (isSelected) {
        return `${baseClasses} border-blue-500 bg-blue-900/30`;
    }
    return `${baseClasses} border-gray-600 hover:border-gray-500 hover:bg-gray-700/30`;
}
function handleSubmit() {
    if (!quizData.value || !allQuestionsAnswered.value)
        return;
    // Format answers as text
    const answerText = userAnswers.value
        .map((answer, index) => {
        if (answer === null)
            return null;
        const questionNum = index + 1;
        const choiceLetter = String.fromCharCode(65 + answer);
        const choiceText = quizData.value.questions[index].choices[answer];
        return `Q${questionNum}: ${choiceLetter} - ${choiceText}`;
    })
        .filter((text) => text !== null)
        .join("\n");
    const message = `Here are my answers:\n${answerText}`;
    props.sendTextMessage(message);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "w-full h-full overflow-y-auto p-8" },
});
if (__VLS_ctx.quizData) {
    // @ts-ignore
    [quizData,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "max-w-3xl w-full mx-auto" },
    });
    if (__VLS_ctx.quizData.title) {
        // @ts-ignore
        [quizData,];
        __VLS_asFunctionalElement(__VLS_elements.h2, __VLS_elements.h2)({
            ...{ class: "text-gray-900 text-3xl font-bold mb-8 text-center" },
        });
        (__VLS_ctx.quizData.title);
        // @ts-ignore
        [quizData,];
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "space-y-6" },
    });
    for (const [question, qIndex] of __VLS_getVForSourceType((__VLS_ctx.quizData.questions))) {
        // @ts-ignore
        [quizData,];
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            key: (qIndex),
            ...{ class: "bg-gray-800 rounded-lg p-6 border-2 border-gray-700" },
        });
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "text-white text-lg font-semibold mb-4" },
        });
        __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
            ...{ class: "text-blue-400 mr-2" },
        });
        (qIndex + 1);
        (question.question);
        __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
            ...{ class: "space-y-3" },
        });
        for (const [choice, cIndex] of __VLS_getVForSourceType((question.choices))) {
            __VLS_asFunctionalElement(__VLS_elements.label, __VLS_elements.label)({
                key: (cIndex),
                ...{ class: (__VLS_ctx.getChoiceClass(qIndex, cIndex)) },
                ...{ class: "flex items-start p-4 rounded-lg cursor-pointer transition-all duration-200" },
            });
            // @ts-ignore
            [getChoiceClass,];
            __VLS_asFunctionalElement(__VLS_elements.input)({
                type: "radio",
                name: (`question-${qIndex}`),
                value: (cIndex),
                ...{ class: "mt-1 mr-3 h-4 w-4 flex-shrink-0" },
            });
            (__VLS_ctx.userAnswers[qIndex]);
            // @ts-ignore
            [userAnswers,];
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "text-white flex-1" },
            });
            __VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
                ...{ class: "font-semibold mr-2" },
            });
            (String.fromCharCode(65 + cIndex));
            (choice);
        }
    }
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-8 flex justify-center" },
    });
    __VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
        ...{ onClick: (__VLS_ctx.handleSubmit) },
        disabled: (!__VLS_ctx.allQuestionsAnswered),
        ...{ class: (__VLS_ctx.allQuestionsAnswered
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 cursor-not-allowed opacity-50') },
        ...{ class: "px-8 py-3 rounded-lg text-white font-semibold text-lg transition-colors" },
    });
    // @ts-ignore
    [handleSubmit, allQuestionsAnswered, allQuestionsAnswered,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "mt-4 text-center text-gray-400 text-sm" },
    });
    (__VLS_ctx.answeredCount);
    (__VLS_ctx.quizData.questions.length);
    // @ts-ignore
    [quizData, answeredCount,];
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
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['border-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-start']} */ ;
/** @type {__VLS_StyleScopedClasses['p-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-3']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-shrink-0']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
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
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        quizData: quizData,
        userAnswers: userAnswers,
        answeredCount: answeredCount,
        allQuestionsAnswered: allQuestionsAnswered,
        getChoiceClass: getChoiceClass,
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
