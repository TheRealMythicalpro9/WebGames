document.addEventListener("DOMContentLoaded", () => {
    const wordContainer = document.getElementById("word-container");
    const guessInput = document.getElementById("guess-input");
    const submitGuess = document.getElementById("submit-guess");
    const status = document.getElementById("status");
    const hangman = document.getElementById("hangman");
    const restartGame = document.getElementById("restart-game");

    const canvas = document.getElementById("hangmanCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 400;

    let word = ""; // Word chosen by the bot
    let guessedWord = [];
    let wrongGuesses = [];
    const maxAttempts = 6;

    // Draw hanging post
    function drawPost() {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 5;

        // Base
        ctx.beginPath();
        ctx.moveTo(50, 380);
        ctx.lineTo(150, 380);
        ctx.stroke();

        // Upright
        ctx.beginPath();
        ctx.moveTo(100, 380);
        ctx.lineTo(100, 50);
        ctx.stroke();

        // Top Beam
        ctx.beginPath();
        ctx.moveTo(100, 50);
        ctx.lineTo(250, 50);
        ctx.stroke();

        // Rope
        ctx.beginPath();
        ctx.moveTo(250, 50);
        ctx.lineTo(250, 100);
        ctx.stroke();
    }

    // Draw the man based on wrong guesses
    function drawMan() {
        switch (wrongGuesses.length) {
            case 1: // Head
                ctx.beginPath();
                ctx.arc(250, 130, 30, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 2: // Body
                ctx.beginPath();
                ctx.moveTo(250, 160);
                ctx.lineTo(250, 250);
                ctx.stroke();
                break;
            case 3: // Left Arm
                ctx.beginPath();
                ctx.moveTo(250, 180);
                ctx.lineTo(200, 220);
                ctx.stroke();
                break;
            case 4: // Right Arm
                ctx.beginPath();
                ctx.moveTo(250, 180);
                ctx.lineTo(300, 220);
                ctx.stroke();
                break;
            case 5: // Left Leg
                ctx.beginPath();
                ctx.moveTo(250, 250);
                ctx.lineTo(200, 320);
                ctx.stroke();
                break;
            case 6: // Right Leg
                ctx.beginPath();
                ctx.moveTo(250, 250);
                ctx.lineTo(300, 320);
                ctx.stroke();
                break;
        }
    }

    // Load the dictionary and select a random word
    fetch("dictionary.txt")
        .then((response) => response.text())
        .then((data) => {
            const words = data
                .split("\n")
                .map((word) => word.trim())
                .filter((word) => word.length >= 5);
            word = words[Math.floor(Math.random() * words.length)].toLowerCase();
            guessedWord = Array(word.length).fill("_");
            renderWord();
            drawPost();
        });

    function renderWord() {
        wordContainer.textContent = guessedWord.join(" ");
    }

    function updateStatus(message, color = "black") {
        status.textContent = message;
        status.style.color = color;
    }

    submitGuess.addEventListener("click", () => {
        const guess = guessInput.value.toLowerCase();
        guessInput.value = "";

        if (!guess || guess.length !== 1 || !/^[a-z]$/.test(guess)) {
            updateStatus("Please enter a valid letter.", "red");
            return;
        }

        if (guessedWord.includes(guess) || wrongGuesses.includes(guess)) {
            updateStatus("You already guessed that letter!", "orange");
            return;
        }

        if (word.includes(guess)) {
            for (let i = 0; i < word.length; i++) {
                if (word[i] === guess) guessedWord[i] = guess;
            }
            updateStatus("Correct guess!", "green");
        } else {
            wrongGuesses.push(guess);
            hangman.textContent = `Wrong guesses: ${wrongGuesses.join(", ")}`;
            updateStatus("Wrong guess!", "red");
            drawMan();
        }

        renderWord();

        if (!guessedWord.includes("_")) {
            updateStatus("You won! 🎉", "green");
            restartGame.style.display = "block";
        } else if (wrongGuesses.length >= maxAttempts) {
            updateStatus(`You lost! The word was "${word}".`, "red");
            restartGame.style.display = "block";
        }
    });

    restartGame.addEventListener("click", () => {
        location.reload();
    });
});
