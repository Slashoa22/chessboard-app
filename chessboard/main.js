var boardState =   
 [['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty']];

var chatlog = [];

var socket = new WebSocket("ws://"+window.location.host+"/ws");

socket.onopen = function() {requestBoard()}

socket.onmessage = function(event) {
    var update = JSON.parse(event.data);
    if (Array.isArray(update)) {
        boardState = update;
        drawBoard();
    }
    else {
        if (update.type === "board") {
            boardState[update.row][update.col] = update.piece;
            drawBoard();
        }
        else if (update.type === "chat") {
            chatlog.push(update.msg);
            if (chatlog.length > 30) {
                chatlog.shift();
            }
            document.getElementById("chat").innerHTML = chatlog.join("<br>");
        }
    }
}

function drawBoard() {
    var boardCanvas = document.getElementById("chessboard");
    var ctx = boardCanvas.getContext("2d");
    var space_width = boardCanvas.width / 8;
    var space_height = boardCanvas.height / 8;
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            if ((row+col) % 2 === 0) {
                ctx.fillStyle = "Gray";
            }
            else {
                ctx.fillStyle = "Gainsboro";
            }
            ctx.fillRect(col*space_height, row*space_width, space_height, space_width);
            var img = boardState[row][col];
            if (img !== "empty") {
                if (pieces[img] && pieces[img].naturalWidth > 0) {
                    ctx.drawImage(pieces[img],col*space_height, row*space_width, space_height, space_width);
                }
                else {
                    ctx.fillStyle = "Red";
                    ctx. fillRect(col*space_height, row*space_width, space_height, space_width)
                }
            }
        }
    }
}

function sendUpdate(row, col, piece) {
    socket.send(JSON.stringify(
        {
            type: "board",
            row: row,
            col: col,
            piece: piece
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
        var piece = select.value;
        boardState[row][col] = piece;
        sendUpdate(row, col, piece)
    }
    else if (event.button === 1) {
        select.value = boardState[row][col]
    }
    else if (event.button === 2) {
        boardState[row][col] = "empty";
        sendUpdate(row, col, "empty")
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

