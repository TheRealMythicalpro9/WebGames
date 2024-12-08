let GRID_SIZE = 5; // Default grid size
const gameContainer = document.getElementById('game-container');
const resetButton = document.getElementById('reset-button');
const solveButton = document.getElementById('solve-button');
const moveCounterDisplay = document.getElementById('move-counter');
const messageDisplay = document.getElementById('message');
const gridSizeDropdown = document.getElementById('grid-size-dropdown');
let moveCount = 0;
let grid = [];

// Populate dropdown with grid size options
for (let size = 5; size <= 25; size++) {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = `${size}x${size}`;
    gridSizeDropdown.appendChild(option);
}

// Handle grid size changes
gridSizeDropdown.addEventListener('change', () => {
    GRID_SIZE = parseInt(gridSizeDropdown.value, 10);
    initGame();
});

// Initialize the game
function initGame() {
    gameContainer.innerHTML = '';
    gameContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 40px)`;
    gameContainer.style.gridTemplateRows = `repeat(${GRID_SIZE}, 40px)`;
    grid = [];
    moveCount = 0;
    updateMoveCounter();
    messageDisplay.textContent = '';

    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            const light = document.createElement('button');
            light.classList.add('light', 'off');
            light.dataset.row = row;
            light.dataset.col = col;
            light.addEventListener('click', () => toggleLights(row, col));
            gameContainer.appendChild(light);
            grid[row][col] = false; // All lights off initially
        }
    }

    randomizeLights();
}

// Randomize the initial state
function randomizeLights() {
    const numberOfMoves = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
    for (let i = 0; i < numberOfMoves; i++) {
        const randomRow = Math.floor(Math.random() * GRID_SIZE);
        const randomCol = Math.floor(Math.random() * GRID_SIZE);

        // Toggle lights without counting moves
        toggleLightState(randomRow, randomCol, false);
        toggleLightState(randomRow - 1, randomCol, false);
        toggleLightState(randomRow + 1, randomCol, false);
        toggleLightState(randomRow, randomCol - 1, false);
        toggleLightState(randomRow, randomCol + 1, false);
    }
}

// Toggle lights based on clicked position
function toggleLights(row, col) {
    toggleLightState(row, col);
    toggleLightState(row - 1, col);
    toggleLightState(row + 1, col);
    toggleLightState(row, col - 1);
    toggleLightState(row, col + 1);
    moveCount++;
    updateMoveCounter();
    checkWin();
}

// Toggle a single light's state
function toggleLightState(row, col, countMove = true) {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
    grid[row][col] = !grid[row][col];
    const light = document.querySelector(`.light[data-row='${row}'][data-col='${col}']`);
    if (grid[row][col]) {
        light.classList.add('on');
        light.classList.remove('off');
    } else {
        light.classList.add('off');
        light.classList.remove('on');
    }
}

// Update move counter display
function updateMoveCounter() {
    moveCounterDisplay.textContent = `Moves: ${moveCount}`;
}

// Check if all lights are off
function checkWin() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col]) return;
        }
    }
    messageDisplay.textContent = `You won in ${moveCount} moves! 🎉`;
}

// Reset the game
resetButton.addEventListener('click', initGame);

// Solve the puzzle
solveButton.addEventListener('click', solvePuzzle);

function solvePuzzle() {
    const lightsState = grid.flat(); // Flatten the grid to a 1D array
    const solution = gaussianElimination(lightsState);

    // Adjust solution to one-indexed format
    const adjustedSolution = solution.map(pos => {
        const [row, col] = pos;
        return `(${row + 1}, ${col + 1})`; // Convert to one-indexed
    });

    // Show solution (positions of the lights to click)
    messageDisplay.textContent = `Click on the following positions to solve: ${adjustedSolution.join(', ')}`;
}

// Gaussian elimination over GF(2) to solve Lights Out
function gaussianElimination(state) {
    const A = createMatrix();
    const b = state.slice(); // Copy of the current state of lights
    const solution = new Array(GRID_SIZE * GRID_SIZE).fill(0);

    // Perform Gaussian elimination (mod 2) on the system of equations
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        // Find the row with a 1 in column i
        if (A[i][i] === 0) {
            for (let j = i + 1; j < GRID_SIZE * GRID_SIZE; j++) {
                if (A[j][i] === 1) {
                    // Swap rows
                    [A[i], A[j]] = [A[j], A[i]];
                    [b[i], b[j]] = [b[j], b[i]];
                    break;
                }
            }
        }

        // Eliminate all below rows
        for (let j = i + 1; j < GRID_SIZE * GRID_SIZE; j++) {
            if (A[j][i] === 1) {
                for (let k = 0; k < GRID_SIZE * GRID_SIZE; k++) {
                    A[j][k] ^= A[i][k]; // XOR operation (GF(2))
                }
                b[j] ^= b[i];
            }
        }
    }

    // Back-substitution
    for (let i = GRID_SIZE * GRID_SIZE - 1; i >= 0; i--) {
        let sum = b[i];
        for (let j = i + 1; j < GRID_SIZE * GRID_SIZE; j++) {
            sum ^= A[i][j] * solution[j];
        }
        solution[i] = sum;
    }

    // Convert solution to positions
    const positions = [];
    for (let i = 0; i < solution.length; i++) {
        if (solution[i] === 1) {
            positions.push(i);
        }
    }
    return positions.map(i => {
        const row = Math.floor(i / GRID_SIZE);
        const col = i % GRID_SIZE;
        return [row, col]; // Keep coordinates for later use in adjusted format
    });
}

// Create the matrix for Lights Out (neighbors toggle)
function createMatrix() {
    const A = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => new Array(GRID_SIZE * GRID_SIZE).fill(0));

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const idx = r * GRID_SIZE + c;
            A[idx][idx] = 1; // The light itself

            if (r > 0) A[idx][(r - 1) * GRID_SIZE + c] = 1; // Above
            if (r < GRID_SIZE - 1) A[idx][(r + 1) * GRID_SIZE + c] = 1; // Below
            if (c > 0) A[idx][r * GRID_SIZE + (c - 1)] = 1; // Left
            if (c < GRID_SIZE - 1) A[idx][r * GRID_SIZE + (c + 1)] = 1; // Right
        }
    }

    return A;
}

// Start the game on page load
window.onload = initGame;
