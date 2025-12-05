/**
 * Spreadsheet Function Registry
 *
 * This module provides a registry system for spreadsheet functions,
 * allowing modular organization and easy extension of formula capabilities.
 */
class FunctionRegistry {
    constructor() {
        Object.defineProperty(this, "functions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    register(def) {
        this.functions.set(def.name.toUpperCase(), def);
    }
    get(name) {
        return this.functions.get(name.toUpperCase());
    }
    hasFunction(name) {
        return this.functions.has(name.toUpperCase());
    }
    getAllFunctions() {
        return Array.from(this.functions.values());
    }
    getFunctionsByCategory() {
        const categories = new Map();
        for (const func of this.functions.values()) {
            const category = func.category || "Other";
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category).push(func);
        }
        return categories;
    }
}
export const functionRegistry = new FunctionRegistry();
/**
 * Helper function to convert a value to a number
 */
export function toNumber(value) {
    if (typeof value === "number")
        return value;
    // Handle percentage strings like "5%" or "0.4167%"
    if (typeof value === "string" && value.includes("%")) {
        const numericPart = value.replace("%", "").trim();
        const num = parseFloat(numericPart);
        return isNaN(num) ? 0 : num / 100;
    }
    // Handle currency strings like "$1,000" or "$1,000.00"
    if (typeof value === "string" && value.includes("$")) {
        const numericPart = value.replace(/[$,]/g, "").trim();
        const num = parseFloat(numericPart);
        return isNaN(num) ? 0 : num;
    }
    // Handle comma-separated numbers like "1,000"
    if (typeof value === "string" && value.includes(",")) {
        const numericPart = value.replace(/,/g, "").trim();
        const num = parseFloat(numericPart);
        return isNaN(num) ? 0 : num;
    }
    // Handle regular numeric strings
    const num = parseFloat(String(value));
    return isNaN(num) ? 0 : num;
}
/**
 * Helper function to convert a value to a string
 */
export function toString(value) {
    return String(value);
}
/**
 * Helper to parse criteria for conditional functions like COUNTIF, SUMIF
 * Returns a comparison function that tests if a value matches the criteria
 */
export function parseCriteria(criteria) {
    // eslint-disable-next-line sonarjs/anchor-precedence
    const trimmedCriteria = criteria.trim().replace(/^["']|["']$/g, "");
    // Check for comparison operators
    // eslint-disable-next-line sonarjs/slow-regex
    const opMatch = trimmedCriteria.match(/^([><=!]+)(.+)$/);
    if (opMatch) {
        const [, op, value] = opMatch;
        const numValue = parseFloat(value);
        switch (op) {
            case ">":
                return (v) => toNumber(v) > numValue;
            case ">=":
                return (v) => toNumber(v) >= numValue;
            case "<":
                return (v) => toNumber(v) < numValue;
            case "<=":
                return (v) => toNumber(v) <= numValue;
            case "=":
            case "==":
                return (v) => String(v) === value || toNumber(v) === numValue;
            case "!=":
            case "<>":
                return (v) => String(v) !== value && toNumber(v) !== numValue;
            default:
                return () => false;
        }
    }
    // Exact match (string or number)
    return (v) => {
        const strMatch = String(v) === trimmedCriteria;
        const numCriteria = parseFloat(trimmedCriteria);
        const numMatch = !isNaN(numCriteria) && toNumber(v) === numCriteria;
        return strMatch || numMatch;
    };
}
