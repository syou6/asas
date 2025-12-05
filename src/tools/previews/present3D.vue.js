import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import * as THREE from "three";
import { parseShapeScript } from "../../utils/shapescript/parser";
import { astToThreeJS } from "../../utils/shapescript/toThreeJS";
const props = defineProps();
const displayTitle = computed(() => {
    return props.result.title || "3D Visualization";
});
const previewViewport = ref(null);
let scene;
let camera;
let renderer;
let animationId;
let sceneGroup = null;
onMounted(() => {
    initPreview();
});
onUnmounted(() => {
    cleanup();
});
// Watch for script changes and reload the scene
watch(() => props.result.data.script, () => {
    reloadScene();
});
function initPreview() {
    if (!previewViewport.value)
        return;
    try {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x2a2a3a);
        // Create camera
        const width = previewViewport.value.clientWidth || 200;
        const height = previewViewport.value.clientHeight || 150;
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(4, 4, 8);
        camera.lookAt(0, 0, 0);
        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        previewViewport.value.appendChild(renderer.domElement);
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
        // Parse and add ShapeScript objects
        const ast = parseShapeScript(props.result.data.script);
        sceneGroup = astToThreeJS(ast, { wireframe: false });
        scene.add(sceneGroup);
        // Start slow rotation animation
        animate();
    }
    catch (error) {
        console.error("Preview render error:", error);
    }
}
function animate() {
    animationId = requestAnimationFrame(animate);
    // Slowly rotate the camera around the scene
    const time = Date.now() * 0.0005;
    camera.position.x = Math.cos(time) * 8;
    camera.position.z = Math.sin(time) * 8;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
}
function reloadScene() {
    if (!scene)
        return;
    try {
        // Remove old objects
        if (sceneGroup) {
            scene.remove(sceneGroup);
        }
        // Parse and create new objects
        const ast = parseShapeScript(props.result.data.script);
        sceneGroup = astToThreeJS(ast, { wireframe: false });
        scene.add(sceneGroup);
    }
    catch (error) {
        console.error("Preview reload error:", error);
    }
}
function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (renderer) {
        renderer.dispose();
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "preview-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ref: "previewViewport",
    ...{ class: "preview-viewport" },
});
/** @type {typeof __VLS_ctx.previewViewport} */ ;
// @ts-ignore
[previewViewport,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "preview-title" },
});
(__VLS_ctx.displayTitle);
// @ts-ignore
[displayTitle,];
/** @type {__VLS_StyleScopedClasses['preview-container']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-viewport']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        displayTitle: displayTitle,
        previewViewport: previewViewport,
    }),
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
