import { nextTick } from "vue";
/**
 * Composable for managing scrolling behavior in the application.
 * Handles both sidebar and main canvas scrolling operations.
 */
export function useScrolling(options) {
    const scrollSidebarToBottom = () => {
        const sidebar = options.sidebarRef();
        sidebar?.scrollToBottom();
    };
    const scrollCanvasToTop = () => {
        nextTick(() => {
            const mainContent = document.querySelector(".flex-1.border.rounded.bg-gray-50.overflow-hidden");
            if (!mainContent)
                return;
            const scrollableElement = mainContent.querySelector("iframe, .w-full.h-full.overflow-auto, .w-full.h-full.flex");
            if (!scrollableElement)
                return;
            if (scrollableElement.tagName === "IFRAME") {
                try {
                    scrollableElement.contentWindow?.scrollTo(0, 0);
                }
                catch {
                    // Cross-origin iframe, can't scroll
                }
            }
            else {
                scrollableElement.scrollTop = 0;
            }
        });
    };
    return {
        scrollSidebarToBottom,
        scrollCanvasToTop,
    };
}
