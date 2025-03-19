// UI class to handle all user interface interactions
export class UI {
    constructor() {
        // Screen elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.menuScreen = document.getElementById('menu-screen');
        this.characterSelectScreen = document.getElementById('character-select-screen');
        this.optionsScreen = document.getElementById('options-screen');
        this.helpScreen = document.getElementById('help-screen');
        this.gameContainer = document.getElementById('game-container');
        this.scoreboard = document.getElementById('scoreboard');
        this.gameOverScreen = document.getElementById('game-over-screen');
        
        // Loading elements
        this.progressBar = document.querySelector('.progress');
        this.loadingText = document.querySelector('.loading-text');
        
        // HUD elements
        this.healthBar = document.querySelector('.health-fill');
        this.teleportSpots = document.querySelectorAll('.teleport-spot');
        this.specialMove1 = document.getElementById('special-move-1');
        this.specialMove2 = document.getElementById('special-move-2');
        this.timeLeft = document.querySelector('#time-left span');
        this.playersLeft = document.querySelector('#players-left span');
        
        // Game settings
        this.sensitivity = document.getElementById('sensitivity');
        this.volume = document.getElementById('volume');
        this.graphics = document.getElementById('graphics');
    }
    
    // Loading screen methods
    showLoadingScreen() {
        this.hideAllScreens();
        this.loadingScreen.classList.remove('hidden');
    }
    
    hideLoadingScreen() {
        this.loadingScreen.classList.add('hidden');
    }
    
    updateLoadingProgress(progress) {
        this.progressBar.style.width = `${progress}%`;
        this.loadingText.textContent = `Loading... ${Math.floor(progress)}%`;
    }
    
    // Menu screen methods
    showMenuScreen() {
        this.hideAllScreens();
        this.menuScreen.classList.remove('hidden');
    }
    
    hideMenuScreen() {
        this.menuScreen.classList.add('hidden');
    }
    
    // Character select screen methods
    showCharacterSelectScreen() {
        this.hideAllScreens();
        this.characterSelectScreen.classList.remove('hidden');
    }
    
    hideCharacterSelectScreen() {
        this.characterSelectScreen.classList.add('hidden');
    }
    
    // Options screen methods
    showOptionsScreen() {
        this.hideAllScreens();
        this.optionsScreen.classList.remove('hidden');
    }
    
    hideOptionsScreen() {
        this.optionsScreen.classList.add('hidden');
    }
    
    // Help screen methods
    showHelpScreen() {
        this.hideAllScreens();
        this.helpScreen.classList.remove('hidden');
    }
    
    hideHelpScreen() {
        this.helpScreen.classList.add('hidden');
    }
    
    // Game screen methods
    showGameScreen() {
        this.hideAllScreens();
        this.gameContainer.classList.remove('hidden');
    }
    
    hideGameScreen() {
        this.gameContainer.classList.add('hidden');
    }
    
    // Scoreboard methods
    showScoreboard() {
        this.scoreboard.classList.remove('hidden');
    }
    
    hideScoreboard() {
        this.scoreboard.classList.add('hidden');
    }
    
    updateScoreboard(players) {
        const scoreboardBody = document.getElementById('scoreboard-body');
        scoreboardBody.innerHTML = '';
        
        players.forEach(player => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = player.name;
            row.appendChild(nameCell);
            
            const teamCell = document.createElement('td');
            teamCell.textContent = player.team === 'tagger' ? 'Tagger' : 'Runner';
            teamCell.style.color = player.team === 'tagger' ? '#ff4444' : '#4444ff';
            row.appendChild(teamCell);
            
            const tagsCell = document.createElement('td');
            tagsCell.textContent = player.tags;
            row.appendChild(tagsCell);
            
            const escapesCell = document.createElement('td');
            escapesCell.textContent = player.escapes;
            row.appendChild(escapesCell);
            
            scoreboardBody.appendChild(row);
        });
    }
    
    // Game over screen methods
    showGameOverScreen(result, stats) {
        this.gameOverScreen.classList.remove('hidden');
        document.getElementById('game-result').textContent = result;
        
        const finalStats = document.getElementById('final-stats');
        finalStats.innerHTML = '';
        
        for (const [key, value] of Object.entries(stats)) {
            const statElement = document.createElement('p');
            statElement.textContent = `${key}: ${value}`;
            finalStats.appendChild(statElement);
        }
    }
    
    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }
    
    // HUD methods
    updateHealth(health) {
        this.healthBar.style.width = `${health}%`;
        
        if (health > 70) {
            this.healthBar.style.backgroundColor = '#4CAF50';
        } else if (health > 30) {
            this.healthBar.style.backgroundColor = '#FFC107';
        } else {
            this.healthBar.style.backgroundColor = '#F44336';
        }
    }
    
    updateTeleportSpots(activeSpots) {
        this.teleportSpots.forEach((spot, index) => {
            if (activeSpots[index]) {
                spot.classList.add('active');
            } else {
                spot.classList.remove('active');
            }
        });
    }
    
    updateSpecialMoves(moves) {
        if (moves.length > 0) {
            this.specialMove1.querySelector('span').textContent = moves[0];
        }
        
        if (moves.length > 1) {
            this.specialMove2.querySelector('span').textContent = moves[1];
        }
    }
    
    updateTimeLeft(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        this.timeLeft.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    updatePlayersLeft(current, total) {
        this.playersLeft.textContent = `${current}/${total}`;
    }
    
    // Helper methods
    hideAllScreens() {
        this.loadingScreen.classList.add('hidden');
        this.menuScreen.classList.add('hidden');
        this.characterSelectScreen.classList.add('hidden');
        this.optionsScreen.classList.add('hidden');
        this.helpScreen.classList.add('hidden');
        this.gameContainer.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
    }
    
    // Settings methods
    getSettings() {
        return {
            sensitivity: parseInt(this.sensitivity.value),
            volume: parseInt(this.volume.value) / 10,
            graphics: this.graphics.value
        };
    }
}
