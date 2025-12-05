import HtmlView from "../views/html.vue";
import HtmlPreview from "../previews/html.vue";
const toolName = "renderHtml";
export const HTML_LIBRARIES = [
    "tailwind",
    "d3.js",
    "three.js",
    "p5.js",
    "mermaid",
];
const LIBRARY_DESCRIPTIONS = {
    tailwind: "Tailwind CSS for utility-first styling",
    "d3.js": "D3.js for data-driven visualizations and interactive charts",
    "three.js": "Three.js for 3D graphics and WebGL rendering",
    "p5.js": "p5.js for creative coding, animations, and generative art",
    mermaid: "Mermaid for diagrams and flowcharts from text definitions",
};
const toolDefinition = {
    type: "function",
    name: toolName,
    description: "Render a full HTML page with specified library support (Tailwind CSS, D3.js, Three.js, Chart.js, p5.js, or Mermaid). The HTML will be rendered in an isolated iframe.",
    parameters: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "Title for the HTML page",
            },
            html: {
                type: "string",
                description: "The complete HTML content to render. Should be a full HTML document including DOCTYPE, html, head, and body tags.",
            },
            type: {
                type: "string",
                enum: HTML_LIBRARIES,
                description: (() => {
                    const validValues = HTML_LIBRARIES.map((lib) => `'${lib}' for ${LIBRARY_DESCRIPTIONS[lib]}`).join(", ");
                    return `The primary library used in this HTML page. Valid values: ${validValues}.`;
                })(),
            },
        },
        required: ["title", "html", "type"],
    },
};
const renderHtml = async (context, args) => {
    const html = args.html;
    const type = args.type;
    const title = args.title;
    // Validate type
    if (!HTML_LIBRARIES.includes(type)) {
        throw new Error(`Invalid library type: ${type}. Must be one of: ${HTML_LIBRARIES.join(", ")}`);
    }
    return {
        message: `Rendered HTML page: ${title} (using ${type})`,
        title,
        data: { html, type },
        instructions: "Acknowledge that the HTML page has been created and is displayed to the user.",
    };
};
export const plugin = {
    toolDefinition,
    execute: renderHtml,
    generatingMessage: "Rendering HTML page...",
    waitingMessage: "Tell the user that the HTML page was created and will be presented shortly.",
    isEnabled: () => true,
    viewComponent: HtmlView,
    previewComponent: HtmlPreview,
};
