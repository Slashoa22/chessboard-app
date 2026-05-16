var boardState =
{
    selectedPiece: {
        exists: false,
        row: 0,
        col: 0,
    },
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

var boardCanvas = document.getElementById("chessboard");
var ctx = boardCanvas.getContext("2d");
var space_width = boardCanvas.width / 8;
var space_height = boardCanvas.height / 8;

var chatlog = [];

var socket = new WebSocket("ws://"+window.location.host+"/ws");

socket.onopen = function() {requestBoard()}


socket.onmessage = function(event) {
    var update = JSON.parse(event.data);
    switch (update.type) {
        case "setBoard":
            boardState.board = update.board;
            drawBoard();
            break;
        case "board":
            if (update.success === false) {
                console.log("Illegal!")
                break;
            }
            boardState.board[update.from.row][update.from.col] = { type: 'empty' };
            boardState.board[update.to.row][update.to.col] = update.piece;
            drawBoard();
            break;
        case "chat":
            chatlog.push(update.msg);
            if (chatlog.length > 30) {
                chatlog.shift();
            }
            document.getElementById("chat").innerHTML = chatlog.join("<br>");
            break;
        default:
            console.warn("bro literally sent fake shi:", update.type);
    }
}


function drawBoard() {
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            drawSpace(row, col);
            drawPiece(row, col);
        }
    }
}

function drawSpace(row, col) {
    if ((row+col) % 2 === 0) {
        if (boardState.selectedPiece.exists &&
            row === boardState.selectedPiece.row &&
            col === boardState.selectedPiece.col) {
                ctx.fillStyle = "#e65c78";
            }
            else {
                ctx.fillStyle = "Gray";  //#808080
            }
        }
    else {
        if (boardState.selectedPiece.exists &&
            row === boardState.selectedPiece.row &&
            col === boardState.selectedPiece.col) {
                ctx.fillStyle = "#e65c78"; 
            }
        else {
            ctx.fillStyle = "Gainsboro"; //#DCDCDC
        }
    }
    ctx.fillRect(col*space_height, row*space_width, space_height, space_width);
}


function drawPiece(row, col) {
    var piece = boardState.board[row][col]
    var type = piece.type
    if (type === "empty") {
        return
    }
    if (pieces[type] && pieces[type].naturalWidth > 0) {
        ctx.drawImage(pieces[type],col*space_height, row*space_width, space_height, space_width);
    }
    else {
        ctx.fillStyle = "Green";
        ctx. fillRect(col*space_height, row*space_width, space_height, space_width)
    }
}

function sendMove(fromRow, fromCol, toRow, toCol) {
    socket.send(JSON.stringify(
        {
            type: "board",
            from: {
                row: fromRow,
                col: fromCol
            },
            to: {
                row: toRow,
                col: toCol
            },
        }
    ))
}

function sendPlace(piece, row, col) {
    socket.send(JSON.stringify(
        {
            type: "place",
            piece: piece,
            row: row,
            col: col
        }
    ))
}

function sendMessage() {
    socket.send(JSON.stringify(
        {
            type: "chat",
            msg: document.getElementById("chatbox").value
        }
    ))
    document.getElementById("chatbox").value = ""
}

function requestBoard() {
    socket.send("boardState")
}

function boardClick(event) {
    var boardCanvas = document.getElementById("chessboard");
    var space_width = boardCanvas.width / 8;
    var space_height = boardCanvas.height / 8;
    var rect = boardCanvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var col = Math.floor(x / space_width);
    var row = Math.floor(y / space_height);
    var select = document.getElementById("piece")
    if (event.button === 0) {
        if (!boardState.selectedPiece.exists) {
            boardState.selectedPiece.exists = true;
            boardState.selectedPiece.row = row;
            boardState.selectedPiece.col = col;
        }
        else {
            boardState.selectedPiece.exists = false;
            sendMove(
                boardState.selectedPiece.row,
                boardState.selectedPiece.col,
                row, col
            );
        }
    }
    else if (event.button === 2) {
        sendPlace(
            { type:select.value },
            row,
            col
        )
    }
    drawBoard();
}

var pieces = {
    initImage: function(img, imgSrc) {
        this[img] = new Image();
        this[img].src = imgSrc;
        var select = document.getElementById("piece");
        var option = document.createElement("option");
        option.value = img;
        option.text = img;
        select.appendChild(option);
        this[img].onload = function() {drawBoard()};
    }
}

pieces.initImage("White Checker","assets/white_checker.webp");
pieces.initImage("White Checker Queen","assets/white_checker_queen.webp");

pieces.initImage("Black Checker","assets/black_checker.webp");
pieces.initImage("Black Checker Queen","assets/black_checker_queen.webp");

pieces.initImage("White Pawn", "assets/white_pawn.webp");
pieces.initImage("White Rook", "assets/white_rook.webp");
pieces.initImage("White Knight", "assets/white_knight.webp");
pieces.initImage("White Bishop", "assets/white_bishop.webp");
pieces.initImage("White Queen", "assets/white_queen.webp");
pieces.initImage("White King", "assets/white_king.webp");

pieces.initImage("Black Pawn", "assets/black_pawn.webp");
pieces.initImage("Black Rook", "assets/black_rook.webp");
pieces.initImage("Black Knight", "assets/black_knight.webp");
pieces.initImage("Black Bishop", "assets/black_bishop.webp");
pieces.initImage("Black Queen", "assets/black_queen.webp");
pieces.initImage("Black King", "assets/black_king.webp");

