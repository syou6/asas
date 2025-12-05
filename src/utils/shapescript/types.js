// ShapeScript AST Type Definitions
// Token types for the lexer
export var TokenType;
(function (TokenType) {
    // Primitives
    TokenType["CUBE"] = "CUBE";
    TokenType["SPHERE"] = "SPHERE";
    TokenType["CYLINDER"] = "CYLINDER";
    TokenType["CONE"] = "CONE";
    TokenType["TORUS"] = "TORUS";
    TokenType["CIRCLE"] = "CIRCLE";
    TokenType["SQUARE"] = "SQUARE";
    TokenType["POLYGON"] = "POLYGON";
    // Builders
    TokenType["EXTRUDE"] = "EXTRUDE";
    TokenType["LOFT"] = "LOFT";
    TokenType["LATHE"] = "LATHE";
    TokenType["FILL"] = "FILL";
    TokenType["HULL"] = "HULL";
    TokenType["GROUP"] = "GROUP";
    TokenType["PATH"] = "PATH";
    TokenType["POINT"] = "POINT";
    TokenType["CURVE"] = "CURVE";
    TokenType["DETAIL"] = "DETAIL";
    TokenType["BACKGROUND"] = "BACKGROUND";
    TokenType["TEXTURE"] = "TEXTURE";
    // CSG Operations
    TokenType["UNION"] = "UNION";
    TokenType["DIFFERENCE"] = "DIFFERENCE";
    TokenType["INTERSECTION"] = "INTERSECTION";
    TokenType["XOR"] = "XOR";
    TokenType["STENCIL"] = "STENCIL";
    // Control Flow
    TokenType["FOR"] = "FOR";
    TokenType["IN"] = "IN";
    TokenType["TO"] = "TO";
    TokenType["STEP"] = "STEP";
    TokenType["IF"] = "IF";
    TokenType["ELSE"] = "ELSE";
    TokenType["SWITCH"] = "SWITCH";
    TokenType["CASE"] = "CASE";
    TokenType["DEFINE"] = "DEFINE";
    TokenType["OPTION"] = "OPTION";
    // Properties
    TokenType["POSITION"] = "POSITION";
    TokenType["ROTATION"] = "ROTATION";
    TokenType["ORIENTATION"] = "ORIENTATION";
    TokenType["SIZE"] = "SIZE";
    TokenType["COLOR"] = "COLOR";
    TokenType["OPACITY"] = "OPACITY";
    TokenType["ROTATE"] = "ROTATE";
    TokenType["TRANSLATE"] = "TRANSLATE";
    TokenType["SCALE"] = "SCALE";
    // Literals
    TokenType["NUMBER"] = "NUMBER";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    TokenType["STRING"] = "STRING";
    // Operators
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["STAR"] = "STAR";
    TokenType["DIVIDE"] = "DIVIDE";
    TokenType["PERCENT"] = "PERCENT";
    TokenType["LPAREN"] = "LPAREN";
    TokenType["RPAREN"] = "RPAREN";
    TokenType["LBRACKET"] = "LBRACKET";
    TokenType["RBRACKET"] = "RBRACKET";
    TokenType["DOT"] = "DOT";
    TokenType["EQUALS"] = "EQUALS";
    TokenType["NOT_EQUALS"] = "NOT_EQUALS";
    TokenType["LESS"] = "LESS";
    TokenType["LESS_EQUAL"] = "LESS_EQUAL";
    TokenType["GREATER"] = "GREATER";
    TokenType["GREATER_EQUAL"] = "GREATER_EQUAL";
    TokenType["AND"] = "AND";
    TokenType["OR"] = "OR";
    TokenType["NOT"] = "NOT";
    // Symbols
    TokenType["LBRACE"] = "LBRACE";
    TokenType["RBRACE"] = "RBRACE";
    TokenType["COMMA"] = "COMMA";
    TokenType["SLASH"] = "SLASH";
    // Special
    TokenType["NEWLINE"] = "NEWLINE";
    TokenType["EOF"] = "EOF";
    TokenType["COMMENT"] = "COMMENT";
})(TokenType || (TokenType = {}));
export class ParseError extends Error {
    constructor(message, line, column) {
        super(line !== undefined && column !== undefined
            ? `Parse error at line ${line}, column ${column}: ${message}`
            : `Parse error: ${message}`);
        Object.defineProperty(this, "line", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: line
        });
        Object.defineProperty(this, "column", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: column
        });
        this.name = "ParseError";
    }
}
