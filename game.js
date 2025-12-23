// Game state
let gameState = {
    score: 0,
    lives: 3,
    isPlaying: false,
    fallSpeed: 1.2,
    spawnRate: 1200,
    lastSpawn: 0,
    gherkins: [],
    lastScoreCheck: 0
};

// Audio context for sound effects
let audioContext = null;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function playEatSound() {
    // Try to play external sound file first
    const audio = document.getElementById('eat-sound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => {
            // If external sound fails, use generated sound
            playGeneratedEatSound();
        });
        return;
    }
    
    // Fallback: generate a simple "chomp" sound
    playGeneratedEatSound();
}

function playGeneratedEatSound() {
    if (!audioContext) {
        initAudio();
        if (!audioContext) return;
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a "chomp" sound with a quick frequency sweep
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playDamageSound() {
    const audio = document.getElementById('damage-sound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => {
            // Silently fail if audio can't play
            console.log('Could not play damage sound');
        });
    }
}

// DOM elements
const openingScreen = document.getElementById('opening-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const playButton = document.getElementById('play-button');
const playAgainButton = document.getElementById('play-again-button');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives-display');
const finalScoreDisplay = document.getElementById('final-score');

function getLifeIcons() {
    return livesDisplay.querySelectorAll('.life-icon');
}
const gameArea = document.getElementById('game-area');
const gherkinsContainer = document.getElementById('gherkins-container');
const elizaContainer = document.getElementById('eliza-container');
const eliza = document.getElementById('eliza');

// Wordle game state
const WORDLE_ANSWER = 'eliza';
let wordleState = {
    currentRow: 0,
    currentCol: 0,
    guesses: Array(6).fill(null).map(() => Array(5).fill('')),
    gameWon: false
};

// Initialize Wordle
function initWordle() {
    const grid = document.getElementById('wordle-grid');
    const keyboard = document.getElementById('wordle-keyboard');
    
    // Create grid (6 rows x 5 columns)
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            grid.appendChild(cell);
        }
    }
    
    // Create keyboard
    const keyboardLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
    ];
    
    keyboard.innerHTML = '';
    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        row.forEach(key => {
            const keyBtn = document.createElement('button');
            keyBtn.className = 'keyboard-key' + (key.length > 1 ? ' wide' : '');
            keyBtn.textContent = key === 'backspace' ? '⌫' : key.toUpperCase();
            keyBtn.dataset.key = key;
            keyBtn.addEventListener('click', () => handleWordleKey(key));
            rowDiv.appendChild(keyBtn);
        });
        keyboard.appendChild(rowDiv);
    });
    
    // Add keyboard event listeners
    document.addEventListener('keydown', handleWordleKeyboard);
}

function handleWordleKeyboard(e) {
    if (wordleState.gameWon) return;
    
    const key = e.key.toLowerCase();
    if (key === 'enter') {
        handleWordleKey('enter');
    } else if (key === 'backspace' || key === 'delete') {
        handleWordleKey('backspace');
    } else if (key.match(/[a-z]/) && key.length === 1) {
        handleWordleKey(key);
    }
}

function handleWordleKey(key) {
    if (wordleState.gameWon) return;
    
    if (key === 'enter') {
        submitWordleGuess();
    } else if (key === 'backspace') {
        deleteWordleLetter();
    } else if (key.match(/[a-z]/) && key.length === 1) {
        addWordleLetter(key);
    }
}

function addWordleLetter(letter) {
    if (wordleState.currentCol >= 5) return;
    
    wordleState.guesses[wordleState.currentRow][wordleState.currentCol] = letter;
    const cell = document.querySelector(`[data-row="${wordleState.currentRow}"][data-col="${wordleState.currentCol}"]`);
    if (cell) {
        cell.textContent = letter.toUpperCase();
        cell.classList.add('filled');
    }
    wordleState.currentCol++;
}

function deleteWordleLetter() {
    if (wordleState.currentCol <= 0) return;
    
    wordleState.currentCol--;
    wordleState.guesses[wordleState.currentRow][wordleState.currentCol] = '';
    const cell = document.querySelector(`[data-row="${wordleState.currentRow}"][data-col="${wordleState.currentCol}"]`);
    if (cell) {
        cell.textContent = '';
        cell.classList.remove('filled');
    }
}

function submitWordleGuess() {
    if (wordleState.currentCol !== 5) return;
    
    const guess = wordleState.guesses[wordleState.currentRow].join('').toLowerCase();
    
    // Check guess against answer
    const answer = WORDLE_ANSWER.split('');
    const guessArray = guess.split('');
    const result = Array(5).fill('absent');
    const answerCounts = {};
    const guessCounts = {};
    
    // Count letters in answer
    answer.forEach(letter => {
        answerCounts[letter] = (answerCounts[letter] || 0) + 1;
    });
    
    // First pass: mark correct positions
    guessArray.forEach((letter, i) => {
        if (letter === answer[i]) {
            result[i] = 'correct';
            answerCounts[letter]--;
        }
    });
    
    // Second pass: mark present (wrong position)
    guessArray.forEach((letter, i) => {
        if (result[i] !== 'correct' && answerCounts[letter] > 0) {
            result[i] = 'present';
            answerCounts[letter]--;
        }
    });
    
    // Update cell colors
    for (let i = 0; i < 5; i++) {
        const cell = document.querySelector(`[data-row="${wordleState.currentRow}"][data-col="${i}"]`);
        if (cell) {
            cell.classList.add(result[i]);
            // Update keyboard key colors
            const keyBtn = document.querySelector(`[data-key="${guessArray[i]}"]`);
            if (keyBtn && !keyBtn.classList.contains('correct')) {
                keyBtn.classList.remove('present', 'absent');
                keyBtn.classList.add(result[i]);
            }
        }
    }
    
    // Check if won
    if (guess === WORDLE_ANSWER) {
        wordleState.gameWon = true;
        const message = document.getElementById('wordle-message');
        message.textContent = 'You got it!';
        playButton.classList.remove('hidden');
        return;
    }
    
    // Move to next row
    wordleState.currentRow++;
    wordleState.currentCol = 0;
    
    // Check if lost
    if (wordleState.currentRow >= 6) {
        const message = document.getElementById('wordle-message');
        message.textContent = `The word was ${WORDLE_ANSWER.toUpperCase()}`;
        playButton.classList.remove('hidden');
    }
}

// Initialize audio
initAudio();

// Initialize Wordle
initWordle();

// Initialize game
playButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', startGame);

// Mouse/touch tracking
let mouseX = window.innerWidth / 2;

document.addEventListener('mousemove', (e) => {
    if (gameState.isPlaying) {
        mouseX = e.clientX;
        updateElizaPosition();
    }
});

// Touch support for mobile
let touchX = window.innerWidth / 2;

document.addEventListener('touchmove', (e) => {
    if (gameState.isPlaying) {
        e.preventDefault();
        touchX = e.touches[0].clientX;
        mouseX = touchX;
        updateElizaPosition();
    }
}, { passive: false });

function updateElizaPosition() {
    const bounds = getGameAreaBounds();
    const elizaWidth = elizaContainer.offsetWidth;
    
    // Convert mouse position to game area relative position
    let targetX = mouseX - bounds.left;
    
    // Clamp to game area bounds (relative to game area)
    const minX = elizaWidth / 2;
    const maxX = bounds.width - elizaWidth / 2;
    if (targetX < minX) targetX = minX;
    if (targetX > maxX) targetX = maxX;
    
    // Position relative to game area (eliza-container is inside game-area)
    elizaContainer.style.left = targetX + 'px';
    elizaContainer.style.transform = 'translateX(-50%)';
}

function startGame() {
    // Hide all screens
    openingScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Reset game state
    gameState.score = 0;
    gameState.lives = 3;
    gameState.isPlaying = true;
    gameState.fallSpeed = 1.2;
    gameState.spawnRate = 1200;
    gameState.lastSpawn = Date.now();
    gameState.gherkins = [];
    gameState.lastScoreCheck = 0;
    
    // Clear any existing gherkins
    gherkinsContainer.innerHTML = '';
    
    // Update displays
    updateScore();
    updateLives();
    
    // Start game loop
    gameLoop();
}

function updateScore() {
    scoreDisplay.textContent = gameState.score;
}

function updateLives() {
    const lifeIcons = getLifeIcons();
    lifeIcons.forEach((icon, index) => {
        if (index < gameState.lives) {
            icon.classList.remove('hidden');
        } else {
            icon.classList.add('hidden');
        }
    });
}

function loseLife() {
    gameState.lives--;
    updateLives();
    
    // Play damage sound effect
    playDamageSound();
    
    if (gameState.lives <= 0) {
        gameOver();
    }
}

function gameOver() {
    gameState.isPlaying = false;
    finalScoreDisplay.textContent = gameState.score;
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
}

function getGameAreaBounds() {
    // Get actual game area dimensions
    const gameAreaRect = gameArea.getBoundingClientRect();
    const gameAreaWidth = gameAreaRect.width;
    const gameAreaLeft = gameAreaRect.left;
    const gameAreaRight = gameAreaRect.right;
    return { left: gameAreaLeft, right: gameAreaRight, width: gameAreaWidth };
}

function createGherkin() {
    const gherkin = document.createElement('div');
    gherkin.className = 'gherkin';
    
    // Random horizontal position within game area - ensure fully within bounds
    const bounds = getGameAreaBounds();
    const gherkinSize = 90;
    // Spawn within bounds, accounting for full gherkin width
    const minX = 0;
    const maxX = bounds.width - gherkinSize;
    const x = minX + Math.random() * maxX;
    gherkin.style.left = x + 'px';
    gherkin.style.top = '-90px';
    
    // Random animation duration (speed) - slower fall
    const duration = (4000 / gameState.fallSpeed) + Math.random() * 800;
    gherkin.style.animationDuration = duration + 'ms';
    
    gherkinsContainer.appendChild(gherkin);
    
    // Store gherkin data (x is relative to game area)
    const gherkinData = {
        element: gherkin,
        x: x,
        y: -90,
        speed: gameState.fallSpeed + Math.random() * 0.3,
        caught: false,
        missed: false
    };
    
    gameState.gherkins.push(gherkinData);
    
    // Remove gherkin after animation completes - check if missed
    setTimeout(() => {
        if (!gherkinData.caught && gherkin.parentNode) {
            // Check if gherkin fell within game area bounds
            const bounds = getGameAreaBounds();
            const gherkinRect = gherkin.getBoundingClientRect();
            const gherkinLeft = gherkinRect.left;
            const gherkinRight = gherkinRect.right;
            
            // Only lose a life if gherkin is fully within the playable area when it falls
            // Check both left and right edges are within bounds
            if (gherkinLeft >= bounds.left && gherkinRight <= bounds.right) {
                if (!gherkinData.missed) {
                    gherkinData.missed = true;
                    loseLife();
                }
            }
            
            gherkin.remove();
            const index = gameState.gherkins.indexOf(gherkinData);
            if (index > -1) {
                gameState.gherkins.splice(index, 1);
            }
        }
    }, duration);
}

function checkCollisions() {
    const elizaRect = elizaContainer.getBoundingClientRect();
    const elizaCenterX = elizaRect.left + elizaRect.width / 2;
    const elizaTop = elizaRect.top;
    // Use a point lower on Eliza for catching (closer to mouth, about 60% down)
    const elizaCatchY = elizaRect.top + (elizaRect.height * 0.6);
    const catchRadius = elizaRect.width * 0.4; // Catch area around mouth
    
    gameState.gherkins.forEach(gherkinData => {
        if (gherkinData.caught) return;
        
        const gherkinRect = gherkinData.element.getBoundingClientRect();
        const gherkinCenterX = gherkinRect.left + gherkinRect.width / 2;
        const gherkinBottom = gherkinRect.bottom;
        
        // Check if gherkin is near Eliza's catch level and horizontally aligned
        const horizontalDistance = Math.abs(gherkinCenterX - elizaCenterX);
        const verticalDistance = gherkinBottom - elizaCatchY;
        
        // Allow catching when gherkin is near the catch point (can catch from slightly above to well below)
        if (horizontalDistance < catchRadius && verticalDistance > -30 && verticalDistance < 60) {
            // Caught!
            gherkinData.caught = true;
            gameState.score += 10;
            updateScore();
            
            // Play eat sound effect
            playEatSound();
            
            // Remove gherkin with a catch animation
            gherkinData.element.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
            gherkinData.element.style.transform = 'scale(0)';
            gherkinData.element.style.opacity = '0';
            
            setTimeout(() => {
                if (gherkinData.element.parentNode) {
                    gherkinData.element.remove();
                }
                const index = gameState.gherkins.indexOf(gherkinData);
                if (index > -1) {
                    gameState.gherkins.splice(index, 1);
                }
            }, 200);
        }
    });
}

function gameLoop() {
    if (!gameState.isPlaying) return;
    
    const now = Date.now();
    
    // Spawn new gherkins
    if (now - gameState.lastSpawn > gameState.spawnRate) {
        createGherkin();
        gameState.lastSpawn = now;
    }
    
    // Update gherkin positions for collision detection
    gameState.gherkins.forEach(gherkinData => {
        if (!gherkinData.caught) {
            const rect = gherkinData.element.getBoundingClientRect();
            gherkinData.y = rect.top;
            gherkinData.x = rect.left;
        }
    });
    
    // Check collisions
    checkCollisions();
    
    // Increase difficulty over time - much slower acceleration
    if (gameState.score > gameState.lastScoreCheck && gameState.score % 200 === 0) {
        gameState.fallSpeed = Math.min(gameState.fallSpeed + 0.05, 3);
        gameState.spawnRate = Math.max(gameState.spawnRate - 20, 700);
        gameState.lastScoreCheck = gameState.score;
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Handle window resize
window.addEventListener('resize', () => {
    if (gameState.isPlaying) {
        updateElizaPosition();
    }
});

