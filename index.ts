import type { ServerWebSocket } from "bun";
console.log("Running")
let cls = new Set<ServerWebSocket>()
let boardState =   
[['Black Rook', 'Black Knight', 'Black Bishop', 'Black Queen', 'Black King', 'Black Bishop', 'Black Knight', 'Black Rook'],
['Black Pawn', 'Black Pawn', 'Black Pawn', 'Black Pawn', 'Black Pawn', 'Black Pawn', 'Black Pawn', 'Black Pawn'],
['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
['White Pawn', 'White Pawn', 'White Pawn', 'White Pawn', 'White Pawn', 'White Pawn', 'White Pawn', 'White Pawn'],
['White Rook', 'White Knight', 'White Bishop', 'White Queen', 'White King', 'White Bishop', 'White Knight', 'White Rook']]


function parseMove(ws: ServerWebSocket, message: string | Buffer<ArrayBuffer>) {
    try {
        let msg = JSON.parse(String(message));
        if (msg.row >= 0 && msg.row <= 8 && msg.col >= 0 && msg.col <= 8) {
            // @ts-expect-error
            boardState[msg.row][msg.col] = msg.piece;
            for (let c of cls) {
                if (c !== ws) {
                    c.send(message);
                }
            }
        }
    }
    catch (e) {
        console.warn(`um.. your'e freaking message dint parse: ${message}`)
    }
}

Bun.serve({
    routes: {
        "/": () => new Response(Bun.file("chessboard/index.html")),
        "/main.js": () => new Response(Bun.file("chessboard/main.js"))
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
            console.log(`${ws} connected💀`);
        },
        message(ws, message) {
            console.log(message)
            if (message !== "boardState") {
                parseMove(ws, message)
            }
            else {
                ws.send(JSON.stringify(boardState))
            }
            console.log("\n")
        },
        close(ws) {
            cls.delete(ws)
            console.log(`${ws} disconnected💀`);
        }
    }
});