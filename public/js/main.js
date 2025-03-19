// Main entry point for the game
import { Game } from './game.js';
import { UI } from './ui.js';
import { NetworkManager } from './network.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    const ui = new UI();
    
    // Show loading screen
    ui.showLoadingScreen();
    
    // Initialize network manager
    const networkManager = new NetworkManager();
    
    // Initialize game when assets are loaded
    let game = null;
    
    // Simulate loading progress
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // Initialize game
            game = new Game(ui, networkManager);
            
            // Hide loading screen and show menu
            setTimeout(() => {
                ui.hideLoadingScreen();
                ui.showMenuScreen();
            }, 500);
        }
        ui.updateLoadingProgress(progress);
    }, 300);
    
    // Event listeners for menu buttons
    document.getElementById('play-button').addEventListener('click', () => {
        ui.hideMenuScreen();
        ui.showCharacterSelectScreen();
    });
    
    document.getElementById('options-button').addEventListener('click', () => {
        ui.hideMenuScreen();
        ui.showOptionsScreen();
    });
    
    document.getElementById('help-button').addEventListener('click', () => {
        ui.hideMenuScreen();
        ui.showHelpScreen();
    });
    
    // Event listeners for options screen
    document.getElementById('back-button').addEventListener('click', () => {
        ui.hideOptionsScreen();
        ui.showMenuScreen();
    });
    
    // Event listeners for help screen
    document.getElementById('help-back-button').addEventListener('click', () => {
        ui.hideHelpScreen();
        ui.showMenuScreen();
    });
    
    // Event listeners for character selection
    const characters = document.querySelectorAll('.character');
    characters.forEach(character => {
        character.addEventListener('click', () => {
            // Remove selected class from all characters
            characters.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked character
            character.classList.add('selected');
            // Update selected character in game
            if (game) {
                game.setPlayerSkin(character.dataset.skin);
            }
        });
    });
    
    // Event listeners for special move selection
    const specialMoves = document.querySelectorAll('.special-move');
    let selectedMoves = [];
    
    specialMoves.forEach(move => {
        move.addEventListener('click', () => {
            if (selectedMoves.includes(move.dataset.move)) {
                // If already selected, deselect it
                move.classList.remove('selected');
                selectedMoves = selectedMoves.filter(m => m !== move.dataset.move);
            } else if (selectedMoves.length < 2) {
                // If not selected and less than 2 moves selected, select it
                move.classList.add('selected');
                selectedMoves.push(move.dataset.move);
            }
            
            // Update UI
            updateSelectedMoves();
            
            // Update selected moves in game
            if (game) {
                game.setSpecialMoves(selectedMoves);
            }
        });
    });
    
    function updateSelectedMoves() {
        const moveSlot1 = document.getElementById('move-slot-1');
        const moveSlot2 = document.getElementById('move-slot-2');
        
        if (selectedMoves.length > 0) {
            const move1 = document.querySelector(`.special-move[data-move="${selectedMoves[0]}"]`);
            moveSlot1.innerHTML = `<p>E: ${move1.querySelector('p').textContent}</p>`;
        } else {
            moveSlot1.innerHTML = '<p>E: None</p>';
        }
        
        if (selectedMoves.length > 1) {
            const move2 = document.querySelector(`.special-move[data-move="${selectedMoves[1]}"]`);
            moveSlot2.innerHTML = `<p>Q: ${move2.querySelector('p').textContent}</p>`;
        } else {
            moveSlot2.innerHTML = '<p>Q: None</p>';
        }
    }
    
    // Event listener for start game button
    document.getElementById('start-game-button').addEventListener('click', () => {
        // Check if character and special moves are selected
        const selectedCharacter = document.querySelector('.character.selected');
        
        if (!selectedCharacter) {
            alert('Please select a character');
            return;
        }
        
        if (selectedMoves.length < 2) {
            alert('Please select two special moves');
            return;
        }
        
        // Hide character select screen and show game
        ui.hideCharacterSelectScreen();
        ui.showGameScreen();
        
        // Start the game
        if (game) {
            game.start();
        }
    });
    
    // Event listeners for game over screen
    document.getElementById('play-again-button').addEventListener('click', () => {
        ui.hideGameOverScreen();
        ui.showCharacterSelectScreen();
    });
    
    document.getElementById('main-menu-button').addEventListener('click', () => {
        ui.hideGameOverScreen();
        ui.showMenuScreen();
    });
    
    // Handle keyboard events
    document.addEventListener('keydown', (event) => {
        if (game && game.isRunning()) {
            // Handle game controls
            game.handleKeyDown(event);
            
            // Show scoreboard when Tab is pressed
            if (event.key === 'Tab') {
                event.preventDefault();
                ui.showScoreboard();
            }
            
            // Show menu when Escape is pressed
            if (event.key === 'Escape') {
                event.preventDefault();
                game.pause();
                ui.showMenuScreen();
            }
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (game && game.isRunning()) {
            // Handle game controls
            game.handleKeyUp(event);
            
            // Hide scoreboard when Tab is released
            if (event.key === 'Tab') {
                ui.hideScoreboard();
            }
        }
    });
    
    // Handle mouse movement for camera control
    document.addEventListener('mousemove', (event) => {
        if (game && game.isRunning()) {
            game.handleMouseMove(event);
        }
    });
    
    // Lock pointer when clicking on game container
    document.getElementById('game-container').addEventListener('click', () => {
        if (game && game.isRunning()) {
            game.lockPointer();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (game) {
            game.handleResize();
        }
    });
});
