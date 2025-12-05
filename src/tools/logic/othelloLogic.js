const DIRECTIONS = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
];
function createEmptyBoard() {
    const board = [];
    for (let i = 0; i < 8; i++) {
        board[i] = new Array(8).fill(".");
    }
    return board;
}
function createInitialBoard() {
    const board = createEmptyBoard();
    // Initial Othello setup
    board[3][3] = "W";
    board[3][4] = "B";
    board[4][3] = "B";
    board[4][4] = "W";
    return board;
}
function copyBoard(board) {
    return board.map((row) => [...row]);
}
function isInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}
function getOpponent(side) {
    return side === "B" ? "W" : "B";
}
function checkDirection(board, row, col, dRow, dCol, side) {
    const opponent = getOpponent(side);
    const flipped = [];
    let r = row + dRow;
    let c = col + dCol;
    // First, collect opponent pieces
    while (isInBounds(r, c) && board[r][c] === opponent) {
        flipped.push({ row: r, col: c });
        r += dRow;
        c += dCol;
    }
    // If we end with our piece and have opponent pieces in between, it's valid
    if (isInBounds(r, c) && board[r][c] === side && flipped.length > 0) {
        return flipped;
    }
    return [];
}
function getFlippedPieces(board, row, col, side) {
    if (board[row][col] !== ".") {
        return [];
    }
    const allFlipped = [];
    for (const [dRow, dCol] of DIRECTIONS) {
        const flipped = checkDirection(board, row, col, dRow, dCol, side);
        allFlipped.push(...flipped);
    }
    return allFlipped;
}
function isLegalMove(board, row, col, side) {
    return getFlippedPieces(board, row, col, side).length > 0;
}
function getLegalMoves(board, side) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isLegalMove(board, row, col, side)) {
                moves.push({ row, col });
            }
        }
    }
    return moves;
}
function makeMove(board, row, col, side) {
    const newBoard = copyBoard(board);
    const flipped = getFlippedPieces(board, row, col, side);
    // Place the new piece
    newBoard[row][col] = side;
    // Flip the pieces
    for (const { row: r, col: c } of flipped) {
        newBoard[r][c] = side;
    }
    return { newBoard, flippedCount: flipped.length };
}
function countPieces(board) {
    let B = 0, W = 0, empty = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = board[row][col];
            if (cell === "B")
                B++;
            else if (cell === "W")
                W++;
            else
                empty++;
        }
    }
    return { B, W, empty };
}
function determineWinner(counts) {
    if (counts.empty > 0)
        return null; // Game not over
    if (counts.B > counts.W)
        return "B";
    if (counts.W > counts.B)
        return "W";
    return "draw";
}
export function playOthello(cmd) {
    if (cmd.action === "new_game") {
        const { playerNames } = cmd;
        const board = createInitialBoard();
        const legalMoves = getLegalMoves(board, "B");
        const counts = countPieces(board);
        return {
            board,
            currentSide: "B",
            playerNames,
            legalMoves,
            counts,
            isTerminal: false,
            winner: null,
            lastAction: { type: "new_game" },
        };
    }
    if (cmd.action === "pass") {
        const { board, currentSide, playerNames } = cmd;
        const nextSide = getOpponent(currentSide);
        const legalMoves = getLegalMoves(board, nextSide);
        const counts = countPieces(board);
        // Check if game is terminal (no legal moves for either player)
        const isTerminal = legalMoves.length === 0;
        const winner = isTerminal ? determineWinner(counts) : null;
        return {
            board,
            currentSide: nextSide,
            playerNames,
            legalMoves,
            counts,
            isTerminal,
            winner,
            lastAction: { type: "pass" },
        };
    }
    // Move command
    const { row, col, board, currentSide, playerNames } = cmd;
    // Validate the move
    if (!isLegalMove(board, row, col, currentSide)) {
        const legalMoves = getLegalMoves(board, currentSide);
        const counts = countPieces(board);
        return {
            board,
            currentSide,
            playerNames,
            legalMoves,
            counts,
            isTerminal: false,
            winner: null,
            lastAction: { type: "pass" }, // Keep previous action type
            error: `Invalid move: (${row}, ${col}) is not a legal move for ${currentSide}`,
        };
    }
    const { newBoard, flippedCount } = makeMove(board, row, col, currentSide);
    const nextSide = getOpponent(currentSide);
    const legalMoves = getLegalMoves(newBoard, nextSide);
    const counts = countPieces(newBoard);
    // Check if game is terminal
    const isTerminal = legalMoves.length === 0 &&
        getLegalMoves(newBoard, currentSide).length === 0;
    const winner = isTerminal ? determineWinner(counts) : null;
    return {
        board: newBoard,
        currentSide: nextSide,
        playerNames,
        legalMoves,
        counts,
        isTerminal,
        winner,
        lastAction: { type: "move", row, col, flipped: flippedCount },
    };
}
