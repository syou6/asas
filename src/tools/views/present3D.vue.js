import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { parseShapeScript } from "../../utils/shapescript/parser";
import { astToThreeJS } from "../../utils/shapescript/toThreeJS";
const props = defineProps();
const emit = defineEmits();
const editableScript = ref(props.selectedResult.data.script);
// State
const viewport = ref(null);
const parseError = ref(null);
const showWireframe = ref(false);
const showGrid = ref(true);
// Check if script has been modified
const hasChanges = computed(() => {
    return editableScript.value !== props.selectedResult.data.script;
});
let scene;
let camera;
let renderer;
let controls;
let animationId;
let gridHelper;
let sceneObjects = [];
let cameraChangeTimeout = null;
let resizeObserver = null;
// Lifecycle
onMounted(() => {
    initScene();
    loadShapeScript();
    animate();
    // Restore camera state after everything is initialized
    nextTick(() => {
        restoreCameraState();
    });
});
onUnmounted(() => {
    cleanup();
});
// Watch for script changes
watch(() => props.selectedResult.data.script, () => {
    loadShapeScript();
});
// Watch for wireframe toggle - reload scene with new setting
watch(showWireframe, () => {
    loadShapeScript();
});
// Watch for grid toggle
watch(showGrid, (value) => {
    if (gridHelper) {
        gridHelper.visible = value;
    }
});
// Methods
function initScene() {
    if (!viewport.value)
        return;
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    // Create camera
    const width = viewport.value.clientWidth;
    const height = viewport.value.clientHeight;
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(5, 5, 10);
    camera.lookAt(0, 0, 0);
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    viewport.value.appendChild(renderer.domElement);
    // Add controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Save camera state when user moves the camera
    controls.addEventListener("change", handleCameraChange);
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    // Add grid helper
    gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.visible = showGrid.value;
    scene.add(gridHelper);
    // Handle window resize
    window.addEventListener("resize", handleResize);
    // Watch for viewport size changes (e.g., when details panel opens/closes)
    resizeObserver = new ResizeObserver(() => {
        handleResize();
    });
    resizeObserver.observe(viewport.value);
}
function handleResize() {
    if (!viewport.value)
        return;
    const width = viewport.value.clientWidth;
    const height = viewport.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
function loadShapeScript() {
    try {
        // Clear previous scene objects
        sceneObjects.forEach((obj) => scene.remove(obj));
        sceneObjects = [];
        // Parse ShapeScript into AST
        const script = props.selectedResult.data.script;
        const ast = parseShapeScript(script);
        // Convert AST to Three.js objects
        const group = astToThreeJS(ast, { wireframe: showWireframe.value });
        // Add to scene
        scene.add(group);
        sceneObjects.push(group);
        parseError.value = null;
    }
    catch (error) {
        parseError.value = error instanceof Error ? error.message : "Unknown error";
        console.error("ShapeScript parse error:", error);
    }
}
function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
function resetCamera() {
    camera.position.set(5, 5, 10);
    camera.lookAt(0, 0, 0);
    controls.reset();
}
function restoreCameraState() {
    if (!camera || !controls) {
        return;
    }
    if (!props.selectedResult?.viewState?.cameraState) {
        return;
    }
    const state = props.selectedResult.viewState.cameraState;
    if (state.position) {
        camera.position.set(state.position.x, state.position.y, state.position.z);
    }
    if (state.target) {
        controls.target.set(state.target.x, state.target.y, state.target.z);
    }
    camera.updateProjectionMatrix();
    controls.update();
}
function saveCameraState() {
    const cameraState = {
        position: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
        },
        target: {
            x: controls.target.x,
            y: controls.target.y,
            z: controls.target.z,
        },
    };
    return cameraState;
}
function handleCameraChange() {
    // Debounce camera state updates to avoid excessive emits
    if (cameraChangeTimeout !== null) {
        clearTimeout(cameraChangeTimeout);
    }
    cameraChangeTimeout = window.setTimeout(() => {
        updateCameraState();
    }, 500); // Wait 500ms after user stops moving camera
}
function updateCameraState() {
    const updatedResult = {
        ...props.selectedResult,
        viewState: {
            cameraState: saveCameraState(),
        },
    };
    emit("updateResult", updatedResult);
}
function toggleWireframe() {
    showWireframe.value = !showWireframe.value;
}
function toggleGrid() {
    showGrid.value = !showGrid.value;
}
function cleanup() {
    if (cameraChangeTimeout !== null) {
        clearTimeout(cameraChangeTimeout);
    }
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (renderer) {
        renderer.dispose();
    }
    if (controls) {
        controls.removeEventListener("change", handleCameraChange);
        controls.dispose();
    }
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    window.removeEventListener("resize", handleResize);
}
function handleScriptEdit() {
    // Just update the local state, don't apply yet
    // User needs to click "Apply Changes" button
}
function applyScript() {
    try {
        // Try to parse the script first to validate it
        parseShapeScript(editableScript.value);
        // If parsing succeeds, update the result (preserve existing viewState)
        const updatedResult = {
            ...props.selectedResult,
            data: {
                script: editableScript.value,
            },
        };
        emit("updateResult", updatedResult);
        // The loadShapeScript will be called automatically via the watch
    }
    catch (error) {
        parseError.value =
            error instanceof Error ? error.message : "Invalid ShapeScript";
        console.error("Script validation failed:", error);
    }
}
// Watch for external changes to selectedResult (when user clicks different result)
watch(() => props.selectedResult.data.script, (newScript) => {
    editableScript.value = newScript;
});
// Watch for selectedResult changes to restore camera state
watch(() => props.selectedResult, () => {
    nextTick(() => {
        restoreCameraState();
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_elements;
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['script-source']} */ ;
/** @type {__VLS_StyleScopedClasses['script-source']} */ ;
/** @type {__VLS_StyleScopedClasses['script-source']} */ ;
/** @type {__VLS_StyleScopedClasses['script-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "present3d-container" },
});
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "header" },
});
__VLS_asFunctionalElement(__VLS_elements.h1, __VLS_elements.h1)({});
(__VLS_ctx.selectedResult.title || "3D Visualization");
// @ts-ignore
[selectedResult,];
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "controls" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.resetCamera) },
    ...{ class: "control-btn" },
});
// @ts-ignore
[resetCamera,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons" },
});
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleWireframe) },
    ...{ class: "control-btn" },
});
// @ts-ignore
[toggleWireframe,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons" },
});
(__VLS_ctx.showWireframe ? "grid_off" : "grid_on");
// @ts-ignore
[showWireframe,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.toggleGrid) },
    ...{ class: "control-btn" },
});
// @ts-ignore
[toggleGrid,];
__VLS_asFunctionalElement(__VLS_elements.span, __VLS_elements.span)({
    ...{ class: "material-icons" },
});
(__VLS_ctx.showGrid ? "visibility_off" : "visibility");
// @ts-ignore
[showGrid,];
if (__VLS_ctx.parseError) {
    // @ts-ignore
    [parseError,];
    __VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
        ...{ class: "error" },
    });
    __VLS_asFunctionalElement(__VLS_elements.strong, __VLS_elements.strong)({});
    (__VLS_ctx.parseError);
    // @ts-ignore
    [parseError,];
}
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({
    ...{ class: "viewport" },
    ref: "viewport",
});
/** @type {typeof __VLS_ctx.viewport} */ ;
// @ts-ignore
[viewport,];
__VLS_asFunctionalElement(__VLS_elements.details, __VLS_elements.details)({
    ...{ class: "script-source" },
});
__VLS_asFunctionalElement(__VLS_elements.summary, __VLS_elements.summary)({});
__VLS_asFunctionalElement(__VLS_elements.textarea, __VLS_elements.textarea)({
    ...{ onInput: (__VLS_ctx.handleScriptEdit) },
    value: (__VLS_ctx.editableScript),
    ...{ class: "script-editor" },
    spellcheck: "false",
});
// @ts-ignore
[handleScriptEdit, editableScript,];
__VLS_asFunctionalElement(__VLS_elements.button, __VLS_elements.button)({
    ...{ onClick: (__VLS_ctx.applyScript) },
    ...{ class: "apply-btn" },
    disabled: (!__VLS_ctx.hasChanges),
});
// @ts-ignore
[applyScript, hasChanges,];
/** @type {__VLS_StyleScopedClasses['present3d-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['controls']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['control-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['material-icons']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['viewport']} */ ;
/** @type {__VLS_StyleScopedClasses['script-source']} */ ;
/** @type {__VLS_StyleScopedClasses['script-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup: () => ({
        editableScript: editableScript,
        viewport: viewport,
        parseError: parseError,
        showWireframe: showWireframe,
        showGrid: showGrid,
        hasChanges: hasChanges,
        resetCamera: resetCamera,
        toggleWireframe: toggleWireframe,
        toggleGrid: toggleGrid,
        handleScriptEdit: handleScriptEdit,
        applyScript: applyScript,
    }),
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
