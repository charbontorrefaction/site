const gameContainer = document.querySelector('.game-container');
const can = document.querySelector('.can');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const body = document.body; // Référence au body pour changer la couleur de fond
const aboutElement = document.getElementById('about');
const infoPopup = document.getElementById('info-popup');
const closePopup = document.getElementById('close-popup');


let score = 0;
let speed = 6; // Vitesse initiale
let grainInterval = 500; // Intervalle initial
let grainTimer;
let lives = 3;
let gameRunning = true; // Flag pour vérifier si le jeu est en cours

// Images pour les icônes de vies
const lifeIconFullSrc = 'asset/HEART_FULL.svg'; // Chemin vers l'icône de cœur plein
const lifeIconEmptySrc = 'asset/HEART_EMPTY.svg'; // Chemin vers l'icône de cœur vide

// Tableau des couleurs de fond
const backgroundColors = ['#AE95DA', '#FF6C0E', '#898F65', '#F29EBE'];
let currentBackgroundColor = '#AE95DA'; // Couleur initiale du fond


// Tableau des images de canettes
const canImages = [
    'asset/1_CAN_WEB.png',
    'asset/2_CAN_WEB.png',
    'asset/3_CAN_WEB.png',
    'asset/4_CAN_WEB.png'
];

aboutElement.addEventListener('click', (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du lien
    infoPopup.classList.remove('hidden'); // Affiche la fenêtre pop-up
});

closePopup.addEventListener('click', () => {
    infoPopup.classList.add('hidden'); // Cache la fenêtre pop-up
});

// Optionnel: Fermer la pop-up en cliquant en dehors de la fenêtre
infoPopup.addEventListener('click', (e) => {
    if (e.target === infoPopup) {
        infoPopup.classList.add('hidden');
    }
});

function adjustCanSize() {
    const canWidth = Math.min(window.innerWidth * 0.3, 450); // Taille maximale en pixels
    can.style.width = `${canWidth}px`;
    can.style.height = 'auto'; // La hauteur sera automatiquement ajustée
}

adjustCanSize();
window.addEventListener('resize', adjustCanSize);

let currentCanImage = canImages[0]; // Initialiser avec la première image
can.style.backgroundImage = `url('${currentCanImage}')`;

document.addEventListener('mousemove', (e) => {
    if (!gameRunning) return;

    const rect = gameContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - can.offsetWidth / 2, gameContainer.offsetWidth - can.offsetWidth));
    can.style.left = `${x}px`;
});

document.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;

    const rect = gameContainer.getBoundingClientRect();
    touchStartX = e.touches[0].clientX - rect.left - can.offsetWidth / 2;
});

document.addEventListener('touchmove', (e) => {
    if (!gameRunning) return;

    const rect = gameContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left - can.offsetWidth / 2, gameContainer.offsetWidth - can.offsetWidth));
    can.style.left = `${x}px`;
});

function getRandomRotationClass() {
    const rotations = ['rotate-slow', 'rotate-medium', 'rotate-fast'];
    return rotations[Math.floor(Math.random() * rotations.length)];
}

function adjustGrainSize() {
    const maxGrainSize = 60; // Taille maximale des grains en pixels
    const grainSizePercentage = 0.07; // Exemple : 7% de la largeur de l'écran
    const grainSize = Math.min(window.innerWidth * grainSizePercentage, maxGrainSize);
    document.documentElement.style.setProperty('--grain-size', `${grainSize}px`);
}

adjustGrainSize();
window.addEventListener('resize', adjustGrainSize);

function createGrain() {
    const grain = document.createElement('div');
    grain.className = `grain ${getRandomRotationClass()}`;
    grain.style.left = `${Math.random() * (gameContainer.offsetWidth - 60)}px`;
    grain.style.top = '-60px'; // Position initiale ajustée
    gameContainer.appendChild(grain);
    return grain;
}

function fallGrain(grain) {
    const interval = setInterval(() => {
        if (!gameRunning) {
            const grainTop = grain.offsetTop + speed;
            grain.style.top = `${grainTop}px`;

            if (grainTop > gameContainer.offsetHeight) {
                clearInterval(interval);
                grain.remove();
            }
            return;
        }

        const grainTop = grain.offsetTop + speed;
        grain.style.top = `${grainTop}px`;

        if (grainTop + grain.offsetHeight > gameContainer.offsetHeight) {
            clearInterval(interval);
            grain.remove();
            loseLife();
        } else if (
            grainTop + grain.offsetHeight >= can.offsetTop &&
            grain.offsetLeft + grain.offsetWidth > can.offsetLeft &&
            grain.offsetLeft < can.offsetLeft + can.offsetWidth &&
            grainTop + grain.offsetHeight <= can.offsetTop + 30
        ) {
            clearInterval(interval);
            grain.remove();
            score++;
            speed += 0.03; // Vitesse augmentée
            grainInterval = Math.max(100, grainInterval - 2); // Intervalle réduit
            updateScore();
            resetGrainDrop();
        }
    }, 10);
}

function updateScore() {
    scoreElement.textContent = `${score}`;
}

// Mise à jour des vies avec des icônes
function updateLives() {
    livesElement.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const img = document.createElement('img');
        img.src = i < lives ? lifeIconFullSrc : lifeIconEmptySrc;
        img.className = 'life-icon';
        img.alt = i < lives ? 'Vie pleine' : 'Vie perdue';
        livesElement.appendChild(img);
    }
}

function loseLife() {
    if (lives > 0) {
        lives--;
        updateLives();
        changeBackgroundColor();
        if (lives <= 0) {
            endGame();
        }
    }
}

function changeBackgroundColor() {
    let newColor;
    do {
        newColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
    } while (newColor === currentBackgroundColor);
    currentBackgroundColor = newColor;
    body.style.backgroundColor = currentBackgroundColor;
}

function endGame() {
    gameRunning = false;
    clearInterval(grainTimer);
    gameOverElement.classList.remove('hidden');
    finalScoreElement.textContent = `${score}`;
    restartBtn.classList.remove('hidden');
}

function getRandomCanImage() {
    let newImage;
    do {
        newImage = canImages[Math.floor(Math.random() * canImages.length)];
    } while (newImage === currentCanImage);
    currentCanImage = newImage;
    return newImage;
}

function startGrainDrop() {
    grainTimer = setInterval(() => {
        if (!gameRunning) return;
        const grain = createGrain();
        fallGrain(grain);
    }, grainInterval);
}

function resetGrainDrop() {
    clearInterval(grainTimer);
    startGrainDrop();
}

function resetGame() {
    score = 0;
    speed = 6;
    grainInterval = 500;
    lives = 3;
    gameRunning = true;
    updateScore();
    updateLives();
    gameOverElement.classList.add('hidden');
    restartBtn.classList.add('hidden');
    can.style.backgroundImage = `url('${getRandomCanImage()}')`;
    startGrainDrop();
}

restartBtn.addEventListener('click', resetGame);

startGrainDrop();
updateLives(); // Initialiser les icônes de vies