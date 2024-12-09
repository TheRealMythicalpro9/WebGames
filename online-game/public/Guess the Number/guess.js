let secretNumber;
let score;
let highScore = sessionStorage.getItem('highScore') ? parseInt(sessionStorage.getItem('highScore')) : 0;
let timesPlayed = sessionStorage.getItem('timesPlayed') ? parseInt(sessionStorage.getItem('timesPlayed')) : 0;
let isFirstGuess = true;

function initializeGame() {
    // Initialize game state
    secretNumber = Math.floor(Math.random() * 999) + 1; // Generate a random secret number
    score = 0;
    isFirstGuess = true;

    // Update UI
    document.getElementById('score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
    document.getElementById('times-played').textContent = timesPlayed;
    document.getElementById('feedback').textContent = '';
    document.getElementById('result').textContent = '';
    document.getElementById('guess').value = '';
}

function checkGuess() {
    const guess = parseInt(document.getElementById('guess').value);
    const feedback = document.getElementById('feedback');
    const result = document.getElementById('result');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const timesPlayedElement = document.getElementById('times-played');

    if (isNaN(guess) || guess < 1 || guess > 999) {
        feedback.textContent = "Please enter a valid number between 1 and 999.";
        return;
    }

    // Increment timesPlayed on the first guess of the game
    if (isFirstGuess) {
        timesPlayed++;
        sessionStorage.setItem('timesPlayed', timesPlayed); // Save to sessionStorage
        timesPlayedElement.textContent = timesPlayed;
        isFirstGuess = false;
    }

    score++;

    if (guess < secretNumber) {
        feedback.textContent = "Too low! Try again.";
    } else if (guess > secretNumber) {
        feedback.textContent = "Too high! Try again.";
    } else {
        feedback.textContent = "Correct! You've guessed the number!";
        result.textContent = `You guessed the number in ${score} attempts.`;

        // Update high score if necessary
        if (score < highScore || highScore === 0) {
            highScore = score;
            sessionStorage.setItem('highScore', highScore); // Store high score in sessionStorage
            highScoreElement.textContent = highScore;
        }
    }

    scoreElement.textContent = score;
}

function generateCode() {
    const gameData = {
        highScore: highScore, // Include highScore
        timesPlayed: timesPlayed // Include timesPlayed
    };

    const encodedGameData = btoa(JSON.stringify(gameData));
    document.getElementById('generated-code').value = encodedGameData;

    navigator.clipboard.writeText(encodedGameData)
        .then(() => {
            alert('Code copied to clipboard!');
        })
        .catch(err => {
            alert('Failed to copy code: ' + err);
        });
}

function loadProgress() {
    const code = document.getElementById('paste-code').value;

    try {
        const decodedData = JSON.parse(atob(code));

        if (typeof decodedData.highScore === 'number' && typeof decodedData.timesPlayed === 'number') {
            highScore = decodedData.highScore;
            timesPlayed = decodedData.timesPlayed;

            sessionStorage.setItem('highScore', highScore);
            sessionStorage.setItem('timesPlayed', timesPlayed);

            // Update UI
            document.getElementById('high-score').textContent = highScore;
            document.getElementById('times-played').textContent = timesPlayed;

            alert('Progress loaded successfully!');
        } else {
            alert('Invalid code or corrupt data.');
        }
    } catch (err) {
        alert('Failed to load progress: ' + err);
    }
}

function resetGame() {
    initializeGame();
}

// Initialize game on page load
initializeGame();
