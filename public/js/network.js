// Network manager to handle multiplayer functionality
export class NetworkManager {
    constructor() {
        this.socket = io();
        this.players = {};
        this.playerId = null;
        this.gameStarted = false;
        this.callbacks = {
            playerJoined: null,
            playerLeft: null,
            playerMoved: null,
            playerTeleported: null,
            playerTagged: null,
            gameStarted: null,
            gameEnded: null
        };
        
        this.setupSocketListeners();
    }
    
    setupSocketListeners() {
        // Connection established
        this.socket.on('connect', () => {
            console.log('Connected to server with ID:', this.socket.id);
            this.playerId = this.socket.id;
        });
        
        // Disconnection
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
        
        // Player joined
        this.socket.on('playerJoined', (player) => {
            console.log('Player joined:', player);
            this.players[player.id] = player;
            
            if (this.callbacks.playerJoined) {
                this.callbacks.playerJoined(player);
            }
        });
        
        // Player left
        this.socket.on('playerLeft', (playerId) => {
            console.log('Player left:', playerId);
            delete this.players[playerId];
            
            if (this.callbacks.playerLeft) {
                this.callbacks.playerLeft(playerId);
            }
        });
        
        // Player moved
        this.socket.on('playerMoved', (data) => {
            if (this.players[data.id]) {
                this.players[data.id].position = data.position;
                this.players[data.id].rotation = data.rotation;
                
                if (this.callbacks.playerMoved) {
                    this.callbacks.playerMoved(data);
                }
            }
        });
        
        // Player teleported
        this.socket.on('playerTeleported', (data) => {
            if (this.players[data.id]) {
                this.players[data.id].position = data.position;
                
                if (this.callbacks.playerTeleported) {
                    this.callbacks.playerTeleported(data);
                }
            }
        });
        
        // Player tagged
        this.socket.on('playerTagged', (data) => {
            if (this.players[data.taggedId]) {
                this.players[data.taggedId].team = 'tagger';
                
                if (this.callbacks.playerTagged) {
                    this.callbacks.playerTagged(data);
                }
            }
        });
        
        // Game started
        this.socket.on('gameStarted', (data) => {
            console.log('Game started:', data);
            this.gameStarted = true;
            
            // Set initial tagger
            if (data.taggerId) {
                this.players[data.taggerId].team = 'tagger';
            }
            
            if (this.callbacks.gameStarted) {
                this.callbacks.gameStarted(data);
            }
        });
        
        // Game ended
        this.socket.on('gameEnded', (data) => {
            console.log('Game ended:', data);
            this.gameStarted = false;
            
            if (this.callbacks.gameEnded) {
                this.callbacks.gameEnded(data);
            }
        });
        
        // Initial players list
        this.socket.on('initialPlayers', (players) => {
            console.log('Initial players:', players);
            this.players = players;
        });
    }
    
    // Register callbacks
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }
    
    // Join game
    joinGame(playerData) {
        this.socket.emit('joinGame', playerData);
    }
    
    // Leave game
    leaveGame() {
        this.socket.emit('leaveGame');
    }
    
    // Update player position
    updatePosition(position, rotation) {
        this.socket.emit('updatePosition', {
            position: position,
            rotation: rotation
        });
    }
    
    // Teleport player
    teleport(position) {
        this.socket.emit('teleport', {
            position: position
        });
    }
    
    // Tag player
    tagPlayer(taggedId) {
        this.socket.emit('tagPlayer', {
            taggedId: taggedId
        });
    }
    
    // Use special move
    useSpecialMove(moveType) {
        this.socket.emit('useSpecialMove', {
            moveType: moveType
        });
    }
    
    // Get all players
    getPlayers() {
        return this.players;
    }
    
    // Get player ID
    getPlayerId() {
        return this.playerId;
    }
    
    // Check if game has started
    isGameStarted() {
        return this.gameStarted;
    }
}
