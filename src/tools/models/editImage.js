import { generateImageCommon } from "./generateImage";
import ImageView from "../views/image.vue";
import ImagePreview from "../previews/image.vue";
const toolName = "editImage";
const toolDefinition = {
    type: "function",
    name: toolName,
    description: "Edit the previously generated image based on a text prompt.",
    parameters: {
        type: "object",
        properties: {
            prompt: {
                type: "string",
                description: "Description of the edits to be made to the image in English",
            },
        },
        required: ["prompt"],
    },
};
const editImage = async (context, args) => {
    const prompt = args.prompt;
    return generateImageCommon(context, prompt, true);
};
export const plugin = {
    toolDefinition,
    execute: editImage,
    generatingMessage: "Editing image...",
    isEnabled: () => true,
    viewComponent: ImageView,
    previewComponent: ImagePreview,
    systemPrompt: `When the user asks 'turn this image into ...', call ${toolName} API to generate a new image.`,
};
