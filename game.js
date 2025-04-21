// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const startScreenElement = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const mobileControls = document.getElementById('mobileControls');
const upBtn = document.getElementById('upBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');

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
const needleWidth = 15;
const needleHeight = 30;

// Game state
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let animationId;
let roadSpeed = 5;
let roadLinesY = [];
let gameRunning = false;
let obstacles = [];
let needles = [];
let obstacleSpeed = 5;
let obstacleFrequency = 100; // Lower means more frequent
let needleFrequency = 150; // Lower means more frequent
let frameCount = 0;
let isMobileDevice = false;
let isNewHighScore = false;

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

// Check if device is mobile
function checkMobileDevice() {
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileDevice) {
        mobileControls.style.display = 'block';
        
        // Adjust canvas size for mobile if needed
        const screenWidth = Math.min(window.innerWidth, 400);
        const screenHeight = Math.min(window.innerHeight - 200, 600); // Leave space for controls
        
        canvas.width = screenWidth;
        canvas.height = screenHeight;
        
        // Update player car position based on new canvas size
        playerCar.x = canvas.width / 2 - carWidth / 2;
        playerCar.y = canvas.height - carHeight - 20;
    }
}

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

// Create a needle on the road
function createNeedle() {
    const laneNumber = Math.floor(Math.random() * 3); // 0, 1, or 2
    const x = roadMarginLeft + laneNumber * laneWidth + (laneWidth - needleWidth) / 2;
    
    needles.push({
        x,
        y: -needleHeight,
        width: needleWidth,
        height: needleHeight,
        collected: false
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

// Draw needles
function drawNeedles() {
    needles.forEach(needle => {
        if (!needle.collected) {
            // Needle metal part
            ctx.fillStyle = '#CCC';
            ctx.fillRect(needle.x, needle.y, needle.width, needle.height);
            
            // Needle sharp tip
            ctx.beginPath();
            ctx.moveTo(needle.x, needle.y);
            ctx.lineTo(needle.x + needle.width / 2, needle.y - 10);
            ctx.lineTo(needle.x + needle.width, needle.y);
            ctx.fillStyle = '#AAA';
            ctx.fill();
            
            // Needle eye
            ctx.fillStyle = '#555';
            ctx.fillRect(needle.x + needle.width / 4, needle.y + needle.height - 8, needle.width / 2, 5);
        }
    });
}

// Draw high score
function drawHighScore() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 150, 25);
}

// Draw celebration effects
function drawCelebration() {
    if (isNewHighScore) {
        // Draw stars or particles around the screen
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 10 + 5;
            
            ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw congratulation text
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, 50);
        ctx.textAlign = 'left';
    }
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
    
    // Generate new needles
    if (frameCount % needleFrequency === 0) {
        createNeedle();
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
                needleFrequency = Math.max(100, needleFrequency - 5);
                obstacleFrequency = Math.max(40, obstacleFrequency - 5);
                roadSpeed += 0.5;
                playerCar.speed = Math.min(10, playerCar.speed + 0.2);
            }
            return false;
        }
        
        return true;
    });
    
    // Move and check needle collisions
    needles = needles.filter(needle => {
        needle.y += obstacleSpeed;
        
        // Check if player collected the needle
        if (
            !needle.collected &&
            playerCar.x < needle.x + needle.width &&
            playerCar.x + carWidth > needle.x &&
            playerCar.y < needle.y + needle.height &&
            playerCar.y + carHeight > needle.y
        ) {
            needle.collected = true;
            score += 5; // Extra points for collecting a needle
            scoreElement.textContent = `Score: ${score}`;
            return false;
        }
        
        // Remove needles that are off-screen
        return needle.y <= canvas.height;
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
    drawNeedles();
    drawHighScore();
    
    // Draw celebration if new high score
    if (isNewHighScore) {
        drawCelebration();
    }
    
    // Continue loop
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    // Check if this is a new high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        isNewHighScore = true;
        
        // Update the game over text to show celebration
        gameOverElement.innerHTML = `
            <span style="color: gold; font-size: 50px;">NEW HIGH SCORE: ${score}!</span><br>
            <span style="color: gold; font-size: 30px;">CONGRATULATIONS!</span><br>
            <button id="restartButton">Play Again</button>
        `;
    } else {
        gameOverElement.innerHTML = `
            Game Over<br>
            Your Score: ${score}<br>
            High Score: ${highScore}<br>
            <button id="restartButton">Play Again</button>
        `;
    }
    
    // Reattach the event listener to the newly created button
    document.getElementById('restartButton').addEventListener('click', resetGame);
    
    gameOverElement.style.display = 'block';
}

// Reset game
function resetGame() {
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    roadSpeed = 5;
    obstacleSpeed = 5;
    obstacleFrequency = 100;
    needleFrequency = 150;
    frameCount = 0;
    isNewHighScore = false;
    playerCar.speed = 5;
    
    playerCar.x = canvas.width / 2 - carWidth / 2;
    playerCar.y = canvas.height - carHeight - 20;
    
    obstacles = [];
    needles = [];
    initRoadLines();
    
    gameOverElement.style.display = 'none';
    startScreenElement.style.display = 'none';
    
    gameRunning = true;
    animationId = requestAnimationFrame(gameLoop);
}

// Setup mobile touch controls
function setupMobileControls() {
    // Handle touch events for mobile buttons
    upBtn.addEventListener('touchstart', () => { keys.ArrowUp = true; });
    upBtn.addEventListener('touchend', () => { keys.ArrowUp = false; });
    
    leftBtn.addEventListener('touchstart', () => { keys.ArrowLeft = true; });
    leftBtn.addEventListener('touchend', () => { keys.ArrowLeft = false; });
    
    rightBtn.addEventListener('touchstart', () => { keys.ArrowRight = true; });
    rightBtn.addEventListener('touchend', () => { keys.ArrowRight = false; });
    
    downBtn.addEventListener('touchstart', () => { keys.ArrowDown = true; });
    downBtn.addEventListener('touchend', () => { keys.ArrowDown = false; });
    
    // Prevent default touch behavior to avoid scrolling
    document.addEventListener('touchmove', (e) => {
        if (gameRunning) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Handle window resize
function handleResize() {
    if (isMobileDevice) {
        const screenWidth = Math.min(window.innerWidth, 400);
        const screenHeight = Math.min(window.innerHeight - 200, 600);
        
        canvas.width = screenWidth;
        canvas.height = screenHeight;
        
        // Recalculate road dimensions
        const roadMarginLeft = (canvas.width - roadWidth) / 2;
        
        // Reset player position
        playerCar.x = canvas.width / 2 - carWidth / 2;
        playerCar.y = canvas.height - carHeight - 20;
        
        // Reset road lines
        initRoadLines();
    }
}

// Update start screen to show high score
function updateStartScreen() {
    if (highScore > 0) {
        startScreenElement.innerHTML = `
            2D Racing Game<br>
            Use Arrow Keys to Drive<br>
            Current High Score: ${highScore}<br>
            <button id="startButton">Start Game</button>
        `;
        // Reattach event listener
        document.getElementById('startButton').addEventListener('click', resetGame);
    }
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

window.addEventListener('resize', handleResize);

startButton.addEventListener('click', () => {
    resetGame();
});

restartButton.addEventListener('click', () => {
    resetGame();
});

// Initialize game
checkMobileDevice();
setupMobileControls();
updateStartScreen();
initRoadLines(); 