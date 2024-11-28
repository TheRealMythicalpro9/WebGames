document.addEventListener("DOMContentLoaded", () => {
  // Create confetti canvas
  const confettiCanvas = document.createElement("canvas");
  confettiCanvas.id = "confettiCanvas";
  confettiCanvas.style.position = "fixed";
  confettiCanvas.style.top = "0";
  confettiCanvas.style.left = "0";
  confettiCanvas.style.width = "100%";
  confettiCanvas.style.height = "100%";
  confettiCanvas.style.pointerEvents = "none";
  document.body.appendChild(confettiCanvas);

  const ctx = confettiCanvas.getContext("2d");
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const confettiPieces = [];
  const colors = ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"];

  // Resize the canvas on window resize
  window.addEventListener("resize", () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });

  // Confetti piece class
  class ConfettiPiece {
    constructor(x, y, size, color) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.color = color;
      this.velocityX = Math.random() * 2 - 1; // Horizontal movement
      this.velocityY = Math.random() * 3 + 2; // Vertical fall speed
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 5;
    }

    update() {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.rotation += this.rotationSpeed;

      // Reset confetti when it falls off the screen
      if (this.y > confettiCanvas.height) {
        this.y = -10;
        this.x = Math.random() * confettiCanvas.width;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // Initialize confetti
  for (let i = 0; i < 200; i++) {
    const size = Math.random() * 10 + 5;
    const x = Math.random() * confettiCanvas.width;
    const y = Math.random() * confettiCanvas.height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    confettiPieces.push(new ConfettiPiece(x, y, size, color));
  }

  // Animation loop
  const animate = () => {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (const piece of confettiPieces) {
      piece.update();
      piece.draw(ctx);
    }
    requestAnimationFrame(animate);
  };

  animate();
});
