// Canvas setup
const canvas = document.getElementById('worldCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;        // 20x20 tiles
const tileSize = canvas.width / gridSize;

let world = [];
for (let y = 0; y < gridSize; y++) {
    let currentRow = [];
    for (let x = 0; x < gridSize; x++) {
        currentRow.push(int(Math.random()*10000) % 1);
    }
    world.push(currentRow);
}


const VIEW_SIZE = 8;
const INPUT_SIZE = VIEW_SIZE * VIEW_SIZE; // 64
const NUM_ACTIONS = 4; // up, down, left, right

const model = tf.sequential();
model.add(tf.layers.dense({inputShape:[INPUT_SIZE], units:32, activation:'relu'}));
model.add(tf.layers.dense({units:NUM_ACTIONS, activation:'softmax'}));
model.compile({optimizer:'adam', loss:'categoricalCrossentropy'});

// Creature class
class Creature {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = 'green';
    }
    getPerception(world) {
        const perception = [];
        for (let dy = -Math.floor(VIEW_SIZE/2); dy < Math.floor(VIEW_SIZE/2); dy++) {
            for (let dx = -Math.floor(VIEW_SIZE/2); dx < Math.floor(VIEW_SIZE/2); dx++) {
                const nx = this.x + dx;
                const ny = this.y + dy;
                if (world[ny] && world[ny][nx] !== undefined) {
                    perception.push(world[ny][nx]);
                } else {
                    perception.push(0); // treat out-of-bounds as empty
                }
            }
        }
        return perception; // flat 64-length array
    }
    async move() {
        const inputTensor = tf.tensor([this.getPerception(world)]);
        const prediction = model.predict(inputTensor);
        const action = prediction.argMax(-1).dataSync()[0]; // 0-3
        inputTensor.dispose();
        prediction.dispose();

        // Map action to dx/dy
        let dx=0, dy=0;
        if(action === 0) dy = -1;       // up
        else if(action === 1) dy = 1;   // down
        else if(action === 2) dx = -1;  // left
        else if(action === 3) dx = 1;   // right

        this.x = Math.max(0, Math.min(gridSize-1, this.x + dx));
        this.y = Math.max(0, Math.min(gridSize-1, this.y + dy));
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

function generateModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [2], units: 4, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 2, activation: 'tanh' })); // outputs -1 to 1

    model.compile({
    optimizer: 'sgd',
    loss: 'meanSquaredError'
    });

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
