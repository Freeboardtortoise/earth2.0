// Canvas setup
const canvas = document.getElementById('worldCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;        // 20x20 tiles
const tileSize = canvas.width / gridSize;

// Creature class
class Creature {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = 'green';
    }

    move() {
        // Random movement
        const dx = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const dy = Math.floor(Math.random() * 3) - 1;
        this.x = Math.max(0, Math.min(gridSize - 1, this.x + dx));
        this.y = Math.max(0, Math.min(gridSize - 1, this.y + dy));
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);
    }
}

// Initialize creatures
const creatures = [];
for (let i = 0; i < 5; i++) {
    creatures.push(new Creature(
        Math.floor(Math.random() * gridSize),
        Math.floor(Math.random() * gridSize)
    ));
}

// Simulation loop
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid (optional)
    ctx.strokeStyle = '#ccc';
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
    }

    // Update and draw creatures
    creatures.forEach(creature => {
        creature.move();
        creature.draw();
    });

    requestAnimationFrame(update);
}

// Start simulation
update();
