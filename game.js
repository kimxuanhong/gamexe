// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const startScreenElement = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

// Game settings
const roadWidth = 300;
const roadMarginLeft = (canvas.width - roadWidth) / 2;
const laneWidth = roadWidth / 3;
const carWidth = 40;
const carHeight = 70;
const obstacleWidth = 40;
const obstacleHeight = 70;
const roadLineHeight = 50;
const roadLineGap = 30;

// Game state
let score = 0;
let animationId;
let roadSpeed = 5;
let roadLinesY = [];
let gameRunning = false;
let obstacles = [];
let obstacleSpeed = 5;
let obstacleFrequency = 100; // Lower means more frequent
let frameCount = 0;

// Player car
const playerCar = {
    x: canvas.width / 2 - carWidth / 2,
    y: canvas.height - carHeight - 20,
    speed: 5,
    color: 'red'
};

// Controls
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Initialize road lines
function initRoadLines() {
    roadLinesY = [];
    for (let y = -roadLineHeight; y < canvas.height; y += roadLineHeight + roadLineGap) {
        roadLinesY.push(y);
    }
}

// Create a random obstacle
function createObstacle() {
    const laneNumber = Math.floor(Math.random() * 3); // 0, 1, or 2
    const x = roadMarginLeft + laneNumber * laneWidth + (laneWidth - obstacleWidth) / 2;
    
    // Random obstacle color
    const colors = ['blue', 'green', 'purple', 'orange', 'yellow'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    obstacles.push({
        x,
        y: -obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight,
        color
    });
}

// Draw the road
function drawRoad() {
    // Road background
    ctx.fillStyle = '#555';
    ctx.fillRect(roadMarginLeft, 0, roadWidth, canvas.height);
    
    // Road lines
    ctx.fillStyle = 'white';
    roadLinesY.forEach(y => {
        ctx.fillRect(canvas.width / 2 - 5, y, 10, roadLineHeight);
        
        // Lane dividers
        ctx.fillRect(roadMarginLeft + laneWidth, y, 3, roadLineHeight);
        ctx.fillRect(roadMarginLeft + 2 * laneWidth, y, 3, roadLineHeight);
    });
    
    // Road borders
    ctx.fillStyle = '#999';
    ctx.fillRect(roadMarginLeft - 10, 0, 10, canvas.height); // Left border
    ctx.fillRect(roadMarginLeft + roadWidth, 0, 10, canvas.height); // Right border
}

// Draw player car
function drawPlayerCar() {
    // Car body
    ctx.fillStyle = playerCar.color;
    ctx.fillRect(playerCar.x, playerCar.y, carWidth, carHeight);
    
    // Windows
    ctx.fillStyle = '#333';
    ctx.fillRect(playerCar.x + 5, playerCar.y + 5, carWidth - 10, 15);
    ctx.fillRect(playerCar.x + 5, playerCar.y + carHeight - 25, carWidth - 10, 15);
    
    // Wheels
    ctx.fillStyle = 'black';
    ctx.fillRect(playerCar.x - 3, playerCar.y + 10, 3, 15);
    ctx.fillRect(playerCar.x - 3, playerCar.y + carHeight - 25, 3, 15);
    ctx.fillRect(playerCar.x + carWidth, playerCar.y + 10, 3, 15);
    ctx.fillRect(playerCar.x + carWidth, playerCar.y + carHeight - 25, 3, 15);
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Windows
        ctx.fillStyle = '#333';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacleWidth - 10, 15);
        ctx.fillRect(obstacle.x + 5, obstacle.y + obstacleHeight - 25, obstacleWidth - 10, 15);
        
        // Wheels
        ctx.fillStyle = 'black';
        ctx.fillRect(obstacle.x - 3, obstacle.y + 10, 3, 15);
        ctx.fillRect(obstacle.x - 3, obstacle.y + obstacleHeight - 25, 3, 15);
        ctx.fillRect(obstacle.x + obstacleWidth, obstacle.y + 10, 3, 15);
        ctx.fillRect(obstacle.x + obstacleWidth, obstacle.y + obstacleHeight - 25, 3, 15);
    });
}

// Update game state
function update() {
    // Move player car
    if (keys.ArrowLeft && playerCar.x > roadMarginLeft) {
        playerCar.x -= playerCar.speed;
    }
    if (keys.ArrowRight && playerCar.x < roadMarginLeft + roadWidth - carWidth) {
        playerCar.x += playerCar.speed;
    }
    if (keys.ArrowUp && playerCar.y > 0) {
        playerCar.y -= playerCar.speed;
    }
    if (keys.ArrowDown && playerCar.y < canvas.height - carHeight) {
        playerCar.y += playerCar.speed;
    }
    
    // Move road lines
    roadLinesY = roadLinesY.map(y => {
        y += roadSpeed;
        if (y > canvas.height) {
            return -roadLineHeight;
        }
        return y;
    });
    
    // Generate new obstacles
    frameCount++;
    if (frameCount % obstacleFrequency === 0) {
        createObstacle();
    }
    
    // Move obstacles
    obstacles = obstacles.filter(obstacle => {
        obstacle.y += obstacleSpeed;
        
        // Check collision
        if (
            playerCar.x < obstacle.x + obstacle.width &&
            playerCar.x + carWidth > obstacle.x &&
            playerCar.y < obstacle.y + obstacle.height &&
            playerCar.y + carHeight > obstacle.y
        ) {
            gameOver();
            return false;
        }
        
        // Remove obstacles that are off-screen
        if (obstacle.y > canvas.height) {
            score++;
            scoreElement.textContent = `Score: ${score}`;
            
            // Increase difficulty
            if (score % 10 === 0) {
                obstacleSpeed += 0.5;
                obstacleFrequency = Math.max(40, obstacleFrequency - 5);
                roadSpeed += 0.5;
            }
            return false;
        }
        
        return true;
    });
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game state
    update();
    
    // Draw game elements
    drawRoad();
    drawPlayerCar();
    drawObstacles();
    
    // Continue loop
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    gameOverElement.style.display = 'block';
}

// Reset game
function resetGame() {
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    roadSpeed = 5;
    obstacleSpeed = 5;
    obstacleFrequency = 100;
    frameCount = 0;
    
    playerCar.x = canvas.width / 2 - carWidth / 2;
    playerCar.y = canvas.height - carHeight - 20;
    
    obstacles = [];
    initRoadLines();
    
    gameOverElement.style.display = 'none';
    startScreenElement.style.display = 'none';
    
    gameRunning = true;
    animationId = requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

startButton.addEventListener('click', () => {
    resetGame();
});

restartButton.addEventListener('click', () => {
    resetGame();
});

// Initialize game
initRoadLines(); 