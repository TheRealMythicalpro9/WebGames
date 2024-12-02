    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth - 450;
    canvas.height = window.innerHeight;

    let gravity = 0.2;
    let bounciness = 0.6;
    let friction = 0.01;

    const objects = [];
    const shapes = ['square', 'circle', 'triangle', 'rectangle', 'pentagon', 'hexagon'];

class PhysicsObject {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.velocityX = 0;
    this.velocityY = 0;
    this.rotation = 0;  // New rotation property
    this.rotationVelocity = 0; // Rotation speed
    this.isDragging = false;
    this.isAffectedByGravity = true; // Default to true for gravity-affected objects
    this.unbalance = 0.1; // Add a small amount of unbalance (off-center mass)
  }

  applyPhysics() {
    if (this.isAffectedByGravity && !this.isDragging) {
      this.velocityY += gravity;  // Apply gravity only if affected
    }

    // Handle friction on the X axis
    if (this.x > 0 && this.x < canvas.width && this.y < canvas.height) {
      this.velocityX *= (1 - friction);
    }

    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Apply rotation
    this.rotation += this.rotationVelocity; // Update rotation based on the velocity

    // Prevent object from going below the canvas (ground)
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;  // Reset Y to the ground level
      this.velocityY = -this.velocityY * (this.isAffectedByGravity ? bounciness : 0.3); // Full bounce for gravity-affected objects

      // Prevent continuous sinking
      if (Math.abs(this.velocityY) < 0.1) {
        this.velocityY = 0;
      }
    }

    // Boundary collision checks for left and right
    if (this.x < 0 || this.x + this.width > canvas.width) {
      this.velocityX = -this.velocityX * bounciness;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Translate to object center
    ctx.rotate(this.rotation);  // Apply rotation
    ctx.beginPath();
    if (this.type === 'square') {
      ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    } else if (this.type === 'circle') {
      ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    } else if (this.type === 'triangle') {
      ctx.moveTo(0, -this.height / 2);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 2);
    } else if (this.type === 'rectangle') {
      ctx.rect(-this.width / 2, -this.height / 4, this.width, this.height / 2);
    } else if (this.type === 'pentagon') {
      const radius = this.width / 2;
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    } else if (this.type === 'hexagon') {
      const radius = this.width / 2;
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.restore();
  }

  // General collision detection function
  checkCollision(other) {
    // Bounding box check for all shapes
    if (this.x < other.x + other.width &&
        this.x + this.width > other.x &&
        this.y < other.y + other.height &&
        this.y + this.height > other.y) {

      // Further checks for specific shapes
      if (this.type === 'circle' && other.type === 'square') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'square' && other.type === 'circle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'circle' && other.type === 'rectangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'rectangle' && other.type === 'circle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'square' && other.type === 'rectangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'rectangle' && other.type === 'square') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'triangle' && other.type === 'circle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'circle' && other.type === 'triangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'triangle' && other.type === 'square') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'square' && other.type === 'triangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'triangle' && other.type === 'rectangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'rectangle' && other.type === 'triangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'pentagon' && other.type === 'square') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'square' && other.type === 'pentagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'pentagon' && other.type === 'circle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'circle' && other.type === 'pentagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'pentagon' && other.type === 'triangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'triangle' && other.type === 'pentagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'pentagon' && other.type === 'rectangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'rectangle' && other.type === 'pentagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'hexagon' && other.type === 'square') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'square' && other.type === 'hexagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'hexagon' && other.type === 'circle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'circle' && other.type === 'hexagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'hexagon' && other.type === 'triangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'triangle' && other.type === 'hexagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'hexagon' && other.type === 'rectangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'rectangle' && other.type === 'hexagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'hexagon' && other.type === 'pentagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'pentagon' && other.type === 'hexagon') {
        other.bounce(this);
        return true;
      }
      // Shape collisions with themselves
      if (this.type === 'square' && other.type === 'square') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'circle' && other.type === 'circle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'triangle' && other.type === 'triangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'rectangle' && other.type === 'rectangle') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'pentagon' && other.type === 'pentagon') {
        other.bounce(this);
        return true;
      }
      if (this.type === 'hexagon' && other.type === 'hexagon') {
        other.bounce(this);
        return true;
      }
    }
    return false;
  }


  // Bounce method for shape collisions
  bounce(other) {
    let bounceFactor = this.isAffectedByGravity ? bounciness : 0.3; // Full bounce for gravity-affected object
    // Reverse and scale velocities to create bounce effect
    let normalX = this.x + this.width / 2 - (other.x + other.width / 2);
    let normalY = this.y + this.height / 2 - (other.y + other.height / 2);
    let magnitude = Math.sqrt(normalX * normalX + normalY * normalY);
    normalX /= magnitude;
    normalY /= magnitude;

    let relativeVelocityX = this.velocityX - other.velocityX;
    let relativeVelocityY = this.velocityY - other.velocityY;
    let dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;

    // If objects are moving towards each other
    if (dotProduct < 0) {
      let bounceEffect = (1 + bounceFactor) * dotProduct;
      this.velocityX -= bounceEffect * normalX;
      this.velocityY -= bounceEffect * normalY;
      other.velocityX += bounceEffect * normalX;
      other.velocityY += bounceEffect * normalY;
    }
  }
}

    // Drag and drop functionality
    document.querySelectorAll('.draggable').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('shape', item.id);
      });
    });

    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const shapeType = e.dataTransfer.getData('shape');
      const x = e.offsetX;
      const y = e.offsetY;

      let width = 50, height = 50;
      if (shapeType === 'circle') {
        width = height = 50;
      }
      const newObject = new PhysicsObject(x - width / 2, y - height / 2, width, height, shapeType);
      objects.push(newObject);
    });

    // Update gravity and bounciness
    document.getElementById('gravity').addEventListener('input', (e) => {
      gravity = parseFloat(e.target.value);
      document.getElementById('gravity-value').textContent = gravity;
    });

    document.getElementById('bounciness').addEventListener('input', (e) => {
      bounciness = parseFloat(e.target.value);
      document.getElementById('bounciness-value').textContent = bounciness;
    });

    document.getElementById('friction').addEventListener('input', (e) => {
      friction = parseFloat(e.target.value);
      document.getElementById('friction-value').textContent = friction;
    });

    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply physics to all objects
      objects.forEach(object => {
        object.applyPhysics();
        object.draw();
      });

      // Check for collisions
      for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
          objects[i].checkCollision(objects[j]);
        }
      }

      requestAnimationFrame(update);
    }

    update();
