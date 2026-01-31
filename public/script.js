const socket = io();
const grid = document.querySelector('#grid');
const resetBtn = document.querySelector('#resetBtn');

function createBoard() {
    grid.innerHTML = '';
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => {
            if (!cell.classList.contains('revealed')) {
                socket.emit('cellClicked', { index: i });
            }
        });
        grid.appendChild(cell);
    }
}

createBoard();

socket.on('updateBoard', (data) => {
    const cells = document.querySelectorAll('.cell');
    const targetCell = cells[data.index];
    targetCell.classList.add('revealed');

    if (data.type === 'bomb') {
        targetCell.innerText = '💣';
        targetCell.style.backgroundColor = 'red';
    } else {
        if (data.value > 0) {
            targetCell.innerText = data.value;
            targetCell.classList.add(`num-${data.value}`);
        }
    }
});

resetBtn.addEventListener('click', () => {
    socket.emit('resetGame');
});

socket.on('restartUI', () => {
    createBoard();
});
