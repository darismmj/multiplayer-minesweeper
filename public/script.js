const socket = io();
const grid = document.querySelector('#grid');
const resetBtn = document.querySelector('#resetBtn');

// Funktion zum Erstellen oder Zurücksetzen des Spielfelds im Browser
function createBoard() {
    grid.innerHTML = ''; // Altes Gitter löschen
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;

        cell.addEventListener('click', () => {
            // Nur klicken, wenn das Feld noch nicht aufgedeckt wurde
            if (!cell.classList.contains('revealed')) {
                socket.emit('cellClicked', { index: i });
            }
        });

        grid.appendChild(cell);
    }
}

// Initiales Spielfeld beim Laden der Seite erstellen
createBoard();

// Nachricht vom Server empfangen (enthält eine Liste von aufzudeckenden Feldern)
socket.on('updateBoard', (dataList) => {
    const cells = document.querySelectorAll('.cell');
    
    dataList.forEach(data => {
        const targetCell = cells[data.index];
        if (!targetCell) return;

        targetCell.classList.add('revealed');

        if (data.type === 'bomb') {
            targetCell.innerText = '💣';
            targetCell.style.backgroundColor = 'red';
            // Optional: Kurze Verzögerung für die Game-Over Nachricht
            setTimeout(() => {
                alert('Miene getroffen! Das Spiel ist vorbei.');
            }, 100);
        } else {
            // Zahlen anzeigen (1-8), 0 bleibt leer
            if (data.value > 0) {
                targetCell.innerText = data.value;
                targetCell.classList.add(`num-${data.value}`);
            } else {
                targetCell.innerText = ''; 
            }
        }
    });
});

// Event-Listener für den Neustart-Button
resetBtn.addEventListener('click', () => {
    socket.emit('resetGame');
});

// Wenn der Server ein neues Spiel startet, das UI zurücksetzen
socket.on('restartUI', () => {
    createBoard();
});
