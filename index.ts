import type { ServerWebSocket } from "bun";
import { formatDiagnostic } from "typescript";
console.log("Running")
let cls = new Set<ServerWebSocket>()
let boardState =
{
    toUpdateDouleMove: [],
    board: [
        [
            { type: 'Black Rook', hasMoved: false },
            { type: 'Black Knight' },
            { type: 'Black Bishop' },
            { type: 'Black Queen' },
            { type: 'Black King', hasMoved: false },
            { type: 'Black Bishop' },
            { type: 'Black Knight' },
            { type: 'Black Rook', hasMoved: false }
        ],
        [
            { type: 'Black Pawn', justDoubleMoved: false },
            { type: 'Black Pawn', justDoubleMoved: false },
            { type: 'Black Pawn', justDoubleMoved: false },
            { type: 'Black Pawn', justDoubleMoved: false },
            { type: 'Black Pawn', justDoubleMoved: false },
            { type: 'Black Pawn', justDoubleMoved: false },
            { type: 'Black Pawn', justDoubleMoved: false },
            { type: 'Black Pawn', justDoubleMoved: false }
        ],
        [
            { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' },
            { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }
        ],
        [
            { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' },
            { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }
        ],
        [
            { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' },
            { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }
        ],
        [
            { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' },
            { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }
        ],
        [
            { type: 'White Pawn', justDoubleMoved: false },
            { type: 'White Pawn', justDoubleMoved: false },
            { type: 'White Pawn', justDoubleMoved: false },
            { type: 'White Pawn', justDoubleMoved: false },
            { type: 'White Pawn', justDoubleMoved: false },
            { type: 'White Pawn', justDoubleMoved: false },
            { type: 'White Pawn', justDoubleMoved: false },
            { type: 'White Pawn', justDoubleMoved: false }
        ],
        [
            { type: 'White Rook', hasMoved: false },
            { type: 'White Knight' },
            { type: 'White Bishop' },
            { type: 'White Queen' },
            { type: 'White King', hasMoved: false },
            { type: 'White Bishop' },
            { type: 'White Knight' },
            { type: 'White Rook', hasMoved: false }
        ]
    ]
}

function isLegal(fromCol: Number, fromRow: Number, toCol: Number, toRow: Number) {
    return true;
}

function parseMove(ws: ServerWebSocket, message: string | Buffer<ArrayBuffer>) {
    // i'm sure all of these @ts-expect-error are fine
    try {
        let msg = JSON.parse(String(message));
        if (msg.type !== "board") {
            return;
        }

        if (!(isLegal(msg.from.col, msg.from.row, msg.to.col, msg.to.col))) {
            ws.send(JSON.stringify(
                {
                    type: "board",
                    success: false
                }
            ))
            return;
        }
        for (let p of boardState.toUpdateDouleMove) {
            // @ts-expect-error
            boardState[p.row][p.col].justDoubleMoved = false;
        }
        // @ts-expect-error
        let piece = boardState.board[msg.from.row][msg.from.col]
        if ((
            piece!.type === "White King" ||
            piece!.type === "Black King" ||
            piece!.type === "White Rook" || 
            piece!.type === "Black Rook")
            // @ts-expect-error
            && piece.hasMoved === false)
        {
            // @ts-expect-error
            piece!.hasMoved = true;
        }
        if ((
            piece!.type === "White Pawn" ||
            piece!.type === "Black Pawn" )
            && Math.abs(msg.from.row - msg.to.row) === 2)
        {
            // @ts-expect-error
            piece.justDoubleMoved = true;
        }
        let move = {
            type: "board",
            from: {
                row: msg.from.row,
                col: msg.from.col
            },
            to: {
                row: msg.to.row,
                col: msg.to.col
            },
            piece: piece
        }
        // @ts-expect-error
        boardState.board[move.from.row][move.from.col] = { type: 'empty'};
        // @ts-expect-error
        boardState.board[move.to.row][move.to.col] = piece;
        for (let c of cls) {
            c.send(JSON.stringify(move));
        }
    }
    catch (e) {
        console.warn(`um.. your'e freaking message dint parse: ${message}`);
    }
}

function parsePlace(ws: ServerWebSocket, message: string | Buffer<ArrayBuffer>) {
    try {
        let msg = JSON.parse(String(message));
        if (msg.type !== "place") {
            return;
        }
        for (let p of boardState.toUpdateDouleMove) {
            // @ts-expect-error
            boardState[p.row][p.col].justDoubleMoved = false;
        }
        let row = msg.row;
        let col = msg.col;
        let piece = msg.piece;
        let placePiece = {}
        if (piece.type === "White King" ||
            piece.type === "Black King" ||
            piece.type === "White Rook" || 
            piece.type === "Black Rook") {
                // @ts-expect-error
                placePiece.hasMoved = false;
            }
        if (piece.type === "White Pawn" ||
            piece.type === "Black Pawn" )
             {
                // @ts-expect-error
                placePiece.justDoubleMoved = false;
            }
        // @ts-expect-error
        placePiece.type = piece.type;
         // @ts-expect-error
        boardState.board[row][col] = placePiece;
        boardState
        for (let c of cls) {
            c.send(JSON.stringify({
                    type: "setBoard",
                    board: boardState.board
            }));
        }
    }
    catch (e) {
        console.warn(`um.. your'e freaking message dint parse: ${message}`);
    }
}

function parseMessage(message: string | Buffer<ArrayBuffer>) {
    try {
        let msg = JSON.parse(String(message));
        if (msg.type === "chat") {
            for (let c of cls) {
                c.send(message);
            }
            console.log(`message: ${msg.msg}`);
        }
    } catch (e) {
        console.warn(`um.. your message didn't parse: ${message}`);
    }
}

Bun.serve({
    routes: {
        "/": () => new Response(Bun.file("chessboard/index.html")),
        "/main.js": () => new Response(Bun.file("chessboard/main.js")),
        "/style.css": () => new Response(Bun.file("chessboard/style.css"))
    },
    fetch(req, server) {
        const path = new URL(req.url).pathname
        if (path === "/ws") {
            server.upgrade(req);
            return;
        }
        if (path.startsWith("/assets/")) {
            return new Response(Bun.file(`chessboard${path}`));
        }
        return new Response("Unmatched route", {status: 404});
    },

    websocket: {
        open(ws) {
            cls.add(ws);
            console.log(`bro connected💀`);
        },
        message(ws, message) {
            console.log(message)
            if (message !== "boardState") {
                parsePlace(ws, message);
                parseMove(ws, message);
                parseMessage(message);
            }
            else {
                ws.send(JSON.stringify({
                    type: "setBoard",
                    board: boardState.board
            }));
            }
        },
        close(ws) {
            cls.delete(ws);
            console.log(`bro disconnected💀`);
        }
    }
});