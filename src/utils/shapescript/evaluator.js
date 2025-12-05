export class SymbolTable {
    constructor() {
        Object.defineProperty(this, "scopes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.pushScope();
    }
    pushScope() {
        this.scopes.push(new Map());
    }
    popScope() {
        if (this.scopes.length > 1) {
            this.scopes.pop();
        }
    }
    set(name, value) {
        this.scopes[this.scopes.length - 1].set(name, value);
    }
    get(name) {
        // Search from innermost to outermost scope
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) {
                return this.scopes[i].get(name);
            }
        }
        return undefined;
    }
    has(name) {
        return this.get(name) !== undefined;
    }
}
// Built-in functions
const builtInFunctions = {
    // Arithmetic
    round: (x) => Math.round(toNumber(x)),
    floor: (x) => Math.floor(toNumber(x)),
    ceil: (x) => Math.ceil(toNumber(x)),
    abs: (x) => Math.abs(toNumber(x)),
    sign: (x) => Math.sign(toNumber(x)),
    sqrt: (x) => Math.sqrt(toNumber(x)),
    pow: (x, y) => Math.pow(toNumber(x), toNumber(y)),
    min: (...args) => Math.min(...args.map(toNumber)),
    max: (...args) => Math.max(...args.map(toNumber)),
    // Trigonometric (uses radians)
    sin: (x) => Math.sin(toNumber(x)),
    cos: (x) => Math.cos(toNumber(x)),
    tan: (x) => Math.tan(toNumber(x)),
    asin: (x) => Math.asin(toNumber(x)),
    acos: (x) => Math.acos(toNumber(x)),
    atan: (x) => Math.atan(toNumber(x)),
    atan2: (y, x) => Math.atan2(toNumber(y), toNumber(x)),
    // Vector operations
    dot: (a, b) => {
        const vecA = toArray(a);
        const vecB = toArray(b);
        let sum = 0;
        for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
            sum += toNumber(vecA[i]) * toNumber(vecB[i]);
        }
        return sum;
    },
    cross: (a, b) => {
        const vecA = toArray(a);
        const vecB = toArray(b);
        if (vecA.length < 3 || vecB.length < 3) {
            throw new Error("cross product requires 3D vectors");
        }
        const x = toNumber(vecA[0]);
        const y = toNumber(vecA[1]);
        const z = toNumber(vecA[2]);
        const x2 = toNumber(vecB[0]);
        const y2 = toNumber(vecB[1]);
        const z2 = toNumber(vecB[2]);
        return [y * z2 - z * y2, z * x2 - x * z2, x * y2 - y * x2];
    },
    length: (v) => {
        const vec = toArray(v);
        let sum = 0;
        for (const component of vec) {
            const n = toNumber(component);
            sum += n * n;
        }
        return Math.sqrt(sum);
    },
    normalize: (v) => {
        const vec = toArray(v);
        const len = builtInFunctions.length(v);
        if (len === 0)
            return vec;
        return vec.map((component) => toNumber(component) / len);
    },
    sum: (v) => {
        const vec = toArray(v);
        return vec.reduce((acc, val) => acc + toNumber(val), 0);
    },
    // String functions
    join: (...args) => {
        const separator = args.length > 0 && typeof args[args.length - 1] === "string"
            ? args.pop()
            : "";
        return args.map(String).join(separator);
    },
    trim: (s) => String(s).trim(),
    // Random (for procedural generation)
    rand: () => Math.random(),
};
function toNumber(value) {
    if (typeof value === "number")
        return value;
    if (typeof value === "boolean")
        return value ? 1 : 0;
    if (typeof value === "string") {
        const num = parseFloat(value);
        if (isNaN(num))
            throw new Error(`Cannot convert "${value}" to number`);
        return num;
    }
    if (Array.isArray(value) && value.length > 0) {
        return toNumber(value[0]);
    }
    throw new Error(`Cannot convert ${typeof value} to number`);
}
function toArray(value) {
    if (Array.isArray(value))
        return value;
    return [value];
}
function toBoolean(value) {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "number")
        return value !== 0;
    if (typeof value === "string")
        return value.length > 0;
    if (Array.isArray(value))
        return value.length > 0;
    return false;
}
export class Evaluator {
    constructor(symbols) {
        Object.defineProperty(this, "symbols", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.symbols = symbols || new SymbolTable();
    }
    getSymbols() {
        return this.symbols;
    }
    evaluate(expr) {
        // Handle literal values
        if (typeof expr === "number") {
            return expr;
        }
        if (typeof expr === "string") {
            return expr;
        }
        if (Array.isArray(expr)) {
            return expr;
        }
        // Handle expression nodes
        switch (expr.type) {
            case "number":
                return expr.value;
            case "identifier": {
                // Handle built-in random number generator
                if (expr.name === "rnd") {
                    return Math.random();
                }
                const value = this.symbols.get(expr.name);
                if (value === undefined) {
                    throw new Error(`Undefined variable: ${expr.name}`);
                }
                return value;
            }
            case "binary": {
                const left = this.evaluate(expr.left);
                const right = this.evaluate(expr.right);
                switch (expr.operator) {
                    case "+":
                        if (Array.isArray(left) && Array.isArray(right)) {
                            // Vector addition (preserve left length)
                            const result = [...left];
                            for (let i = 0; i < result.length && i < right.length; i++) {
                                result[i] = toNumber(result[i]) + toNumber(right[i]);
                            }
                            return result;
                        }
                        return toNumber(left) + toNumber(right);
                    case "-":
                        if (Array.isArray(left) && Array.isArray(right)) {
                            // Vector subtraction (preserve left length)
                            const result = [...left];
                            for (let i = 0; i < result.length && i < right.length; i++) {
                                result[i] = toNumber(result[i]) - toNumber(right[i]);
                            }
                            return result;
                        }
                        return toNumber(left) - toNumber(right);
                    case "*":
                        if (Array.isArray(left) && Array.isArray(right)) {
                            // Element-wise multiplication (truncate to shorter)
                            const len = Math.min(left.length, right.length);
                            const result = [];
                            for (let i = 0; i < len; i++) {
                                result.push(toNumber(left[i]) * toNumber(right[i]));
                            }
                            return result;
                        }
                        if (Array.isArray(left)) {
                            // Scalar multiplication
                            return left.map((v) => toNumber(v) * toNumber(right));
                        }
                        if (Array.isArray(right)) {
                            // Scalar multiplication
                            return right.map((v) => toNumber(left) * toNumber(v));
                        }
                        return toNumber(left) * toNumber(right);
                    case "/":
                        if (Array.isArray(left) && Array.isArray(right)) {
                            // Element-wise division (truncate to shorter)
                            const len = Math.min(left.length, right.length);
                            const result = [];
                            for (let i = 0; i < len; i++) {
                                result.push(toNumber(left[i]) / toNumber(right[i]));
                            }
                            return result;
                        }
                        if (Array.isArray(left)) {
                            // Scalar division
                            return left.map((v) => toNumber(v) / toNumber(right));
                        }
                        return toNumber(left) / toNumber(right);
                    case "%":
                        return toNumber(left) % toNumber(right);
                    case "=":
                        if (Array.isArray(left) && Array.isArray(right)) {
                            if (left.length !== right.length)
                                return false;
                            for (let i = 0; i < left.length; i++) {
                                if (toNumber(left[i]) !== toNumber(right[i]))
                                    return false;
                            }
                            return true;
                        }
                        return left === right;
                    case "<>":
                        if (Array.isArray(left) && Array.isArray(right)) {
                            if (left.length !== right.length)
                                return true;
                            for (let i = 0; i < left.length; i++) {
                                if (toNumber(left[i]) !== toNumber(right[i]))
                                    return true;
                            }
                            return false;
                        }
                        return left !== right;
                    case "<":
                        return toNumber(left) < toNumber(right);
                    case "<=":
                        return toNumber(left) <= toNumber(right);
                    case ">":
                        return toNumber(left) > toNumber(right);
                    case ">=":
                        return toNumber(left) >= toNumber(right);
                    case "and":
                        return toBoolean(left) && toBoolean(right);
                    case "or":
                        return toBoolean(left) || toBoolean(right);
                    default:
                        throw new Error(`Unknown binary operator: ${expr.operator}`);
                }
            }
            case "unary": {
                const operand = this.evaluate(expr.operand);
                switch (expr.operator) {
                    case "-":
                        if (Array.isArray(operand)) {
                            return operand.map((v) => -toNumber(v));
                        }
                        return -toNumber(operand);
                    case "not":
                        return !toBoolean(operand);
                    default:
                        throw new Error(`Unknown unary operator: ${expr.operator}`);
                }
            }
            case "call": {
                const func = builtInFunctions[expr.name.toLowerCase()];
                if (!func) {
                    throw new Error(`Unknown function: ${expr.name}`);
                }
                const args = expr.args.map((arg) => this.evaluate(arg));
                return func(...args);
            }
            case "tuple": {
                return expr.elements.map((el) => this.evaluate(el));
            }
            case "member":
            case "subscript":
                throw new Error(`Member access and subscripting not yet implemented: ${expr.type}`);
            default:
                throw new Error(`Unknown expression type: ${expr.type}`);
        }
    }
    evaluateToNumber(expr) {
        const value = this.evaluate(expr);
        return toNumber(value);
    }
    evaluateToBoolean(expr) {
        const value = this.evaluate(expr);
        return toBoolean(value);
    }
    evaluateToVector3(expr) {
        if (Array.isArray(expr) && typeof expr[0] === "number") {
            return expr;
        }
        const value = this.evaluate(expr);
        if (Array.isArray(value)) {
            const x = value.length > 0 ? toNumber(value[0]) : 0;
            const y = value.length > 1 ? toNumber(value[1]) : 0;
            const z = value.length > 2 ? toNumber(value[2]) : 0;
            return [x, y, z];
        }
        // Single number becomes uniform vector
        const n = toNumber(value);
        return [n, n, n];
    }
    evaluateToColor(expr) {
        if (Array.isArray(expr) && typeof expr[0] === "number") {
            return expr;
        }
        const value = this.evaluate(expr);
        if (Array.isArray(value)) {
            const r = value.length > 0 ? toNumber(value[0]) : 0;
            const g = value.length > 1 ? toNumber(value[1]) : 0;
            const b = value.length > 2 ? toNumber(value[2]) : 0;
            return [r, g, b];
        }
        // Single number becomes grayscale
        const n = toNumber(value);
        return [n, n, n];
    }
}
