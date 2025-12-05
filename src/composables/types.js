/**
 * Type guard to validate ToolCallMessage structure
 */
export function isValidToolCallMessage(msg) {
    return (typeof msg === "object" &&
        msg !== null &&
        "type" in msg &&
        typeof msg.type === "string");
}
/**
 * Helper to create a success result
 */
export function createSuccessResult(data) {
    return {
        success: true,
        data,
    };
}
/**
 * Helper to create an error result
 */
export function createErrorResult(code, message, details) {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
    };
}
