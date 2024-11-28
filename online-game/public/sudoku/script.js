let board = [];
let solutionBoard = [];
let currentLevel = 'easy';
let hiddenButtonClicked = false; // Track if the hidden button has been clicked
let selectedNumber = null; // Track the selected number from the side menu (null represents delete)

// Difficulty settings
const difficultySettings = {
  example: 0, xxeasy: 10, xeasy: 20, easy: 30,
  medium: 40, hard: 50, annoying: 60,
  diabolical: 65, impossible: 75
};

// Function to generate a valid, randomized 9x9 Sudoku board using backtracking
const generateFullSudoku = () => {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

  const randomizedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const isSafe = (grid, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
      if (grid[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (grid[i][j] === num) return false;
      }
    }
    return true;
  };

  const solveSudoku = (grid) => {
    let emptyCell = findEmptyCell(grid);
    if (!emptyCell) return true;
    let [row, col] = emptyCell;

    const numbers = [...randomizedNumbers];
    shuffleArray(numbers);

    for (let num of numbers) {
      if (isSafe(grid, row, col, num)) {
        grid[row][col] = num;
        if (solveSudoku(grid)) {
          return true;
        }
        grid[row][col] = 0;
      }
    }
    return false;
  };

  const findEmptyCell = (grid) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === 0) return [i, j];
      }
    }
    return null;
  };

  solveSudoku(grid);
  return grid;
};

// Function to remove cells from the fully solved grid to create a puzzle
const createPuzzle = (grid, level) => {
  const puzzle = grid.map(row => row.slice());
  const cellsToRemove = Math.floor(81 * (difficultySettings[level] / 100));

  let count = 0;
  while (count < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      count++;
    }
  }
  return puzzle;
};

// Generate the Sudoku board
const generateBoard = (editable = true) => {
  const table = document.querySelector('table');
  table.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const row = table.insertRow();
    for (let j = 0; j < 9; j++) {
      const cell = row.insertCell();
      if (board[i][j]) {
        cell.textContent = board[i][j];
        cell.classList.add('fixed');
      } else {
        cell.classList.add('editable');
        cell.addEventListener('click', () => {
          if ((editable || hiddenButtonClicked) && selectedNumber !== null) {
            if (selectedNumber === 'delete') {
              board[i][j] = 0; // Delete the number
              cell.textContent = ''; // Clear cell content
            } else {
              board[i][j] = selectedNumber;
              cell.textContent = selectedNumber;
            }
          } else if (!editable && !hiddenButtonClicked) {
            alert("Nothing here yet... Or is there?!");
          } else {
            alert("Select a number from the side!");
          }
        });
      }
    }
  }
};

// Function to reveal additional 10% of the board
const revealMoreCells = () => {
  if (hiddenButtonClicked) return;

  const cellsToReveal = Math.floor(81 * 0.1); // 10% of total cells
  let revealed = 0;

  while (revealed < cellsToReveal) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (board[row][col] === 0) {
      board[row][col] = solutionBoard[row][col];
      revealed++;
    }
  }

  hiddenButtonClicked = true; // Prevent further clicks
  generateBoard(true); // Enable editing
};

// Function to check if the current board follows the rules and is won
const checkVictory = () => {
  if (isBoardValid(board)) {
    window.location.href = "/victory/victory.html"; // Redirect to victory page if valid
  } else {
    alert("The Sudoku board is not correct!");
  }
};

// Check if the board is valid (no duplicates in rows, columns, or 3x3 subgrids)
const isBoardValid = (board) => {
  for (let row = 0; row < 9; row++) {
    const rowSet = new Set();
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0 || rowSet.has(board[row][col])) return false;
      rowSet.add(board[row][col]);
    }
  }

  for (let col = 0; col < 9; col++) {
    const colSet = new Set();
    for (let row = 0; row < 9; row++) {
      if (board[row][col] === 0 || colSet.has(board[row][col])) return false;
      colSet.add(board[row][col]);
    }
  }

  for (let startRow = 0; startRow < 9; startRow += 3) {
    for (let startCol = 0; startCol < 9; startCol += 3) {
      const subgridSet = new Set();
      for (let row = startRow; row < startRow + 3; row++) {
        for (let col = startCol; col < startCol + 3; col++) {
          if (board[row][col] === 0 || subgridSet.has(board[row][col])) return false;
          subgridSet.add(board[row][col]);
        }
      }
    }
  }

  return true; // Board is valid and solved
};

// Function to position the hidden button around the center
const positionHiddenButton = () => {
  const button = document.getElementById("hidden-button");
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;

  const angle = Math.random() * 2 * Math.PI;
  const radius = 100; // 100 pixels from the center

  const buttonX = centerX + radius * Math.cos(angle) - button.offsetWidth / 2;
  const buttonY = centerY + radius * Math.sin(angle) - button.offsetHeight / 2;

  button.style.position = "absolute";
  button.style.left = `${buttonX}px`;
  button.style.top = `${buttonY}px`;
  button.style.visibility = "visible";
};

// Handle number selection
const handleNumberSelection = (event) => {
  document.querySelectorAll('.number').forEach(btn => btn.classList.remove('selected'));
  event.target.classList.add('selected');
  selectedNumber = parseInt(event.target.dataset.number, 10);
};

// Handle delete selection
const handleDeleteSelection = () => {
  document.querySelectorAll('.number').forEach(btn => btn.classList.remove('selected'));
  selectedNumber = 'delete'; // Set to 'delete' to trigger cell clearing
};

// Highlight the selected number button
document.querySelectorAll('.number').forEach(button => {
  button.addEventListener('click', (e) => {
    // Remove the highlight from all number buttons
    document.querySelectorAll('.number').forEach(btn => btn.classList.remove('highlighted'));

    // Add the highlight to the clicked button
    e.target.classList.add('highlighted');

    // Set the selected number (you can use this for filling in Sudoku cells)
    selectedNumber = parseInt(e.target.dataset.number, 10);
    console.log("Selected number: ", selectedNumber); // For debugging
  });
});

// Handle delete button click
document.getElementById('delete-button').addEventListener('click', handleDeleteSelection);

// Initialize the game
document.querySelectorAll('.level').forEach(btn => btn.onclick = e => {
  currentLevel = e.target.dataset.level;
  const fullBoard = generateFullSudoku();
  solutionBoard = fullBoard;
  board = createPuzzle(fullBoard, currentLevel);
  if (currentLevel === 'impossible') {
    positionHiddenButton();
  }
  generateBoard(currentLevel === 'impossible' ? false : true);
});

document.getElementById("hidden-button").addEventListener("click", revealMoreCells);

// Add styles
const style = document.createElement('style');
style.innerHTML = `
  .selected { background:  linear-gradient(145deg, #ff7e5f, #feb47b);}
  .highlighted { background-color: #ff6403; color: white; border: 1px solid #ccc; } /* Highlighted button style */
  .fixed { background-color: #ff600a; pointer-events: none; }
  .editable { cursor: pointer; }
`;
document.head.appendChild(style);
