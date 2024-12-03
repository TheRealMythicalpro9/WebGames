let grid = [];
let score = 0;
let board = document.querySelector('.grid');
let scoreDisplay = document.getElementById('score');

function startGame() {
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
    score = 0;
    updateDisplay();
    spawnRandomTile();
    spawnRandomTile();
}

function updateDisplay() {
    board.innerHTML = '';
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.innerHTML = cell !== 0 ? cell : '';
            tile.style.backgroundColor = getColor(cell);
            board.appendChild(tile);
        });
    });
    scoreDisplay.textContent = score;
}

function getColor(value) {
    if (value === 0) return "#ccc0b3"; // Default background for empty tiles

    const startColor = { r: 109, g: 213, b: 237 }; // RGB for #6dd5ed
    const endColor = { r: 255, g: 126, b: 95 }; // RGB for #ff7e5f
    const t = (Math.log2(value) - Math.log2(2)) / (Math.log2(16384) - Math.log2(2));

    const r = Math.round(startColor.r + t * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + t * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + t * (endColor.b - startColor.b));

    return `rgb(${r}, ${g}, ${b})`;
}

function spawnRandomTile() {
    let emptyCells = [];
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === 0) emptyCells.push({ row: rowIndex, col: colIndex });
        });
    });

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        updateDisplay();
    }
}

function move(direction) {
    if (isGameOver()) return; // If the game is over, no move is made

    switch (direction) {
        case 'left':
            for (let row = 0; row < 4; row++) slideRow(row);
            break;
        case 'right':
            for (let row = 0; row < 4; row++) slideRow(row, true);
            break;
        case 'up':
            for (let col = 0; col < 4; col++) slideColumn(col);
            break;
        case 'down':
            for (let col = 0; col < 4; col++) slideColumn(col, true);
            break;
    }
    spawnRandomTile();
    checkGameState();
}

function slideRow(rowIndex, reverse = false) {
    let row = grid[rowIndex];
    if (reverse) row = row.reverse();

    row = row.filter(num => num !== 0); // Remove zeroes
    let merged = false;
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1] && !merged) {
            row[i] *= 2;
            row[i + 1] = 0;
            score += row[i];
            merged = true;
        } else {
            merged = false;
        }
    }

    row = row.filter(num => num !== 0); // Remove zeroes again
    while (row.length < 4) row.push(0); // Fill the remaining spaces with zeroes
    if (reverse) row = row.reverse();

    grid[rowIndex] = row;
    updateDisplay();
}

function slideColumn(colIndex, reverse = false) {
    let column = grid.map(row => row[colIndex]);
    if (reverse) column = column.reverse();

    column = column.filter(num => num !== 0); // Remove zeroes
    let merged = false;
    for (let i = 0; i < column.length - 1; i++) {
        if (column[i] === column[i + 1] && !merged) {
            column[i] *= 2;
            column[i + 1] = 0;
            score += column[i];
            merged = true;
        } else {
            merged = false;
        }
    }

    column = column.filter(num => num !== 0); // Remove zeroes again
    while (column.length < 4) column.push(0); // Fill the remaining spaces with zeroes
    if (reverse) column = column.reverse();

    for (let i = 0; i < 4; i++) {
        grid[i][colIndex] = column[i];
    }
    updateDisplay();
}

function checkGameState() {
    if (isGameOver()) {
        alert("Game Over! No more moves left.");
        stopBot();
    } else if (isGameWon()) {
        const playAgain = confirm("You've won! Would you like to continue playing?");
        if (!playAgain) {
            stopBot();
        }
    }
}

function isGameOver() {
    return !canMakeAnyMove();
}

function canMakeAnyMove() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col] === 0) return true; // There's an empty space
            if (row < 3 && grid[row][col] === grid[row + 1][col]) return true; // Check for merges vertically
            if (col < 3 && grid[row][col] === grid[row][col + 1]) return true; // Check for merges horizontally
        }
    }
    return false;
}

function isGameWon() {
    return grid.flat().includes(2048); // Check if the player has reached 2048
}
// Event listeners for keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
});

startGame(); // Start the game when the page loads
