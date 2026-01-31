const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const width = 10;
const bombAmount = 20;
let gameBoard = Array(width * width).fill('empty');

function initGame() {
    gameBoard.fill('empty');
    let bombsPlaced = 0;
    while (bombsPlaced < bombAmount) {
        let randomPos = Math.floor(Math.random() * (width * width));
        if (gameBoard[randomPos] !== 'bomb') {
            gameBoard[randomPos] = 'bomb';
            bombsPlaced++;
        }
    }
}
initGame();

io.on('connection', (socket) => {
    console.log('Ein Spieler ist beigetreten');

    socket.on('cellClicked', (data) => {
        const index = data.index;
        if (gameBoard[index] === 'bomb') {
            io.emit('updateBoard', { index: index, type: 'bomb' });
        } else {
            let minesFound = 0;
            const row = Math.floor(index / width);
            const col = index % width;

            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    const neighborRow = row + r;
                    const neighborCol = col + c;
                    if (neighborRow >= 0 && neighborRow < width && neighborCol >= 0 && neighborCol < width) {
                        const neighborIndex = neighborRow * width + neighborCol;
                        if (gameBoard[neighborIndex] === 'bomb') {
                            minesFound++;
                        }
                    }
                }
            }
            io.emit('updateBoard', { index: index, type: 'number', value: minesFound });
        }
    });

    socket.on('resetGame', () => {
        initGame();
        io.emit('restartUI');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));