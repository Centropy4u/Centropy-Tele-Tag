// Main game class
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { Player } from './player.js';
import { Landscape } from './landscape.js';
import { DayNightCycle } from './daynight.js';
import { SpecialMoves } from './specialmoves.js';

export class Game {
    constructor(ui, networkManager) {
        // Store references to UI and network manager
        this.ui = ui;
        this.networkManager = networkManager;
        
        // Game state
        this.running = false;
        this.paused = false;
        
        // Player settings
        this.playerSkin = '1';
        this.specialMoves = [];
        
        // Game settings
        this.settings = this.ui.getSettings();
        
        // Setup Three.js scene
        this.setupScene();
        
        // Setup game objects
        this.setupGameObjects();
        
        // Setup network callbacks
        this.setupNetworkCallbacks();
        
        // Teleportation spots
        this.teleportSpots = Array(10).fill(null);
        
        // Game clock
        this.clock = new THREE.Clock();
        
        // Game time
        this.gameTime = 300; // 5 minutes
    }
    
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 0); // Eye height
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Create controls
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(50, 50, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.scene.add(this.sunLight);
        
        // Add fog
        this.scene.fog = new THREE.Fog(0xaaaaaa, 0, 500);
    }
    
    setupGameObjects() {
        // Create player
        this.player = new Player(this.scene, this.camera, this.controls);
        
        // Create landscapes
        this.landscape = new Landscape(this.scene);
        
        // Create day/night cycle
        this.dayNightCycle = new DayNightCycle(this.scene, this.sunLight);
        
        // Create special moves manager
        this.specialMovesManager = new SpecialMoves(this.scene, this.player);
        
        // Create other players container
        this.otherPlayers = {};
    }
    
    setupNetworkCallbacks() {
        // Player joined
        this.networkManager.on('playerJoined', (player) => {
            if (player.id !== this.networkManager.getPlayerId()) {
                this.addOtherPlayer(player);
            }
        });
        
        // Player left
        this.networkManager.on('playerLeft', (playerId) => {
            this.removeOtherPlayer(playerId);
        });
        
        // Player moved
        this.networkManager.on('playerMoved', (data) => {
            if (data.id !== this.networkManager.getPlayerId() && this.otherPlayers[data.id]) {
                this.otherPlayers[data.id].updatePosition(data.position, data.rotation);
            }
        });
        
        // Player teleported
        this.networkManager.on('playerTeleported', (data) => {
            if (data.id !== this.networkManager.getPlayerId() && this.otherPlayers[data.id]) {
                this.otherPlayers[data.id].teleport(data.position);
            }
        });
        
        // Player tagged
        this.networkManager.on('playerTagged', (data) => {
            if (data.taggedId === this.networkManager.getPlayerId()) {
                // Player got tagged
                this.player.setTeam('tagger');
                this.ui.updateHealth(100);
            }
            
            // Update scoreboard
            this.updateScoreboard();
        });
        
        // Game started
        this.networkManager.on('gameStarted', (data) => {
            if (data.taggerId === this.networkManager.getPlayerId()) {
                // Player is the initial tagger
                this.player.setTeam('tagger');
            } else {
                // Player is a runner
                this.player.setTeam('runner');
            }
            
            // Reset game time
            this.gameTime = data.gameTime || 300;
            
            // Update UI
            this.updateScoreboard();
        });
        
        // Game ended
        this.networkManager.on('gameEnded', (data) => {
            this.running = false;
            this.controls.unlock();
            
            // Show game over screen
            this.ui.showGameOverScreen(data.result, data.stats);
        });
    }
    
    start() {
        // Lock pointer
        this.lockPointer();
        
        // Start game
        this.running = true;
        this.paused = false;
        
        // Reset clock
        this.clock.start();
        
        // Join game
        this.networkManager.joinGame({
            name: 'Player ' + Math.floor(Math.random() * 1000),
            skin: this.playerSkin,
            specialMoves: this.specialMoves
        });
        
        // Start animation loop
        this.animate();
    }
    
    pause() {
        this.paused = true;
        this.controls.unlock();
    }
    
    resume() {
        this.paused = false;
        this.lockPointer();
    }
    
    stop() {
        this.running = false;
        this.controls.unlock();
        
        // Leave game
        this.networkManager.leaveGame();
    }
    
    animate() {
        if (!this.running) return;
        
        requestAnimationFrame(() => this.animate());
        
        if (!this.paused) {
            const delta = this.clock.getDelta();
            
            // Update player
            this.player.update(delta);
            
            // Update day/night cycle
            this.dayNightCycle.update(delta);
            
            // Update special moves
            this.specialMovesManager.update(delta);
            
            // Update other players
            for (const id in this.otherPlayers) {
                this.otherPlayers[id].update(delta);
            }
            
            // Check for collisions
            this.checkCollisions();
            
            // Update network position
            this.networkManager.updatePosition(
                this.player.getPosition(),
                this.player.getRotation()
            );
            
            // Update game time
            this.gameTime -= delta;
            if (this.gameTime <= 0) {
                this.gameTime = 0;
                // Game over
                // This will be handled by the server
            }
            
            // Update UI
            this.ui.updateTimeLeft(this.gameTime);
            this.ui.updatePlayersLeft(
                Object.values(this.networkManager.getPlayers()).filter(p => p.team !== 'tagger').length,
                Object.values(this.networkManager.getPlayers()).length
            );
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    handleKeyDown(event) {
        // Movement keys
        if (event.key === 'w' || event.key === 'W') {
            this.player.moveForward = true;
        }
        if (event.key === 's' || event.key === 'S') {
            this.player.moveBackward = true;
        }
        if (event.key === 'a' || event.key === 'A') {
            this.player.moveLeft = true;
        }
        if (event.key === 'd' || event.key === 'D') {
            this.player.moveRight = true;
        }
        
        // Jump
        if (event.key === ' ') {
            this.player.jump();
        }
        
        // Special moves
        if (event.key === 'e' || event.key === 'E') {
            if (this.specialMoves.length > 0) {
                this.specialMovesManager.activateMove(this.specialMoves[0]);
                this.networkManager.useSpecialMove(this.specialMoves[0]);
            }
        }
        if (event.key === 'q' || event.key === 'Q') {
            if (this.specialMoves.length > 1) {
                this.specialMovesManager.activateMove(this.specialMoves[1]);
                this.networkManager.useSpecialMove(this.specialMoves[1]);
            }
        }
        
        // Teleport spots
        const numKey = parseInt(event.key);
        if (!isNaN(numKey) && numKey >= 0 && numKey <= 9) {
            const spotIndex = numKey === 0 ? 9 : numKey - 1;
            
            if (event.shiftKey) {
                // Save teleport spot
                this.teleportSpots[spotIndex] = this.player.getPosition().clone();
                this.ui.updateTeleportSpots(this.teleportSpots.map(spot => spot !== null));
            } else {
                // Teleport to spot
                if (this.teleportSpots[spotIndex]) {
                    this.player.teleport(this.teleportSpots[spotIndex]);
                    this.networkManager.teleport(this.teleportSpots[spotIndex]);
                }
            }
        }
    }
    
    handleKeyUp(event) {
        // Movement keys
        if (event.key === 'w' || event.key === 'W') {
            this.player.moveForward = false;
        }
        if (event.key === 's' || event.key === 'S') {
            this.player.moveBackward = false;
        }
        if (event.key === 'a' || event.key === 'A') {
            this.player.moveLeft = false;
        }
        if (event.key === 'd' || event.key === 'D') {
            this.player.moveRight = false;
        }
    }
    
    handleMouseMove(event) {
        // Mouse sensitivity
        const sensitivity = this.settings.sensitivity / 500;
        
        // Update player rotation
        this.player.rotateY(-event.movementX * sensitivity);
    }
    
    handleResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    lockPointer() {
        this.controls.lock();
    }
    
    isRunning() {
        return this.running && !this.paused;
    }
    
    setPlayerSkin(skin) {
        this.playerSkin = skin;
    }
    
    setSpecialMoves(moves) {
        this.specialMoves = moves;
        this.ui.updateSpecialMoves(moves.map(move => {
            switch (move) {
                case '1': return 'Speed Boost';
                case '2': return 'High Jump';
                case '3': return 'Invisibility';
                case '4': return 'Freeze Ray';
                case '5': return 'Shield';
                case '6': return 'Decoy';
                default: return 'Unknown';
            }
        }));
    }
    
    addOtherPlayer(player) {
        // Create other player
        const otherPlayer = new Player(this.scene, null, null, player.id);
        otherPlayer.setSkin(player.skin);
        otherPlayer.setTeam(player.team);
        
        // Add to other players
        this.otherPlayers[player.id] = otherPlayer;
    }
    
    removeOtherPlayer(playerId) {
        if (this.otherPlayers[playerId]) {
            // Remove from scene
            this.otherPlayers[playerId].remove();
            
            // Remove from other players
            delete this.otherPlayers[playerId];
        }
    }
    
    checkCollisions() {
        // Check for collisions with other players
        for (const id in this.otherPlayers) {
            const otherPlayer = this.otherPlayers[id];
            
            // Calculate distance
            const distance = this.player.getPosition().distanceTo(otherPlayer.getPosition());
            
            // If close enough, check for tag
            if (distance < 2) {
                // If player is tagger and other player is runner
                if (this.player.getTeam() === 'tagger' && otherPlayer.getTeam() === 'runner') {
                    // Tag player
                    this.networkManager.tagPlayer(id);
                }
                
                // If player is runner and other player is tagger
                if (this.player.getTeam() === 'runner' && otherPlayer.getTeam() === 'tagger') {
                    // Reduce health
                    const health = this.player.getHealth() - 1;
                    this.player.setHealth(health);
                    this.ui.updateHealth(health);
                    
                    // If health is 0, player is tagged
                    if (health <= 0) {
                        this.player.setTeam('tagger');
                        this.ui.updateHealth(100);
                    }
                }
            }
        }
    }
    
    updateScoreboard() {
        const players = Object.values(this.networkManager.getPlayers()).map(player => {
            return {
                name: player.name,
                team: player.team,
                tags: player.tags || 0,
                escapes: player.escapes || 0
            };
        });
        
        this.ui.updateScoreboard(players);
    }
}
