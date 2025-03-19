// Server configuration for the multiplayer tag game
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// Create express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Game state
const gameState = {
    players: {},
    gameStarted: false,
    gameTime: 300, // 5 minutes
    taggerId: null
};

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Send initial players list
    socket.emit('initialPlayers', gameState.players);
    
    // Join game
    socket.on('joinGame', (playerData) => {
        console.log('Player joined:', socket.id, playerData);
        
        // Add player to game state
        gameState.players[socket.id] = {
            id: socket.id,
            name: playerData.name,
            skin: playerData.skin,
            specialMoves: playerData.specialMoves,
            position: { x: 0, y: 1.6, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            team: 'runner',
            tags: 0,
            escapes: 0
        };
        
        // Broadcast new player to all clients
        io.emit('playerJoined', gameState.players[socket.id]);
        
        // Start game if enough players
        if (Object.keys(gameState.players).length >= 2 && !gameState.gameStarted) {
            startGame();
        }
    });
    
    // Leave game
    socket.on('leaveGame', () => {
        console.log('Player left:', socket.id);
        
        // Remove player from game state
        delete gameState.players[socket.id];
        
        // Broadcast player left to all clients
        io.emit('playerLeft', socket.id);
        
        // End game if not enough players
        if (Object.keys(gameState.players).length < 2 && gameState.gameStarted) {
            endGame('Not enough players');
        }
    });
    
    // Update position
    socket.on('updatePosition', (data) => {
        if (gameState.players[socket.id]) {
            // Update player position
            gameState.players[socket.id].position = data.position;
            gameState.players[socket.id].rotation = data.rotation;
            
            // Broadcast position update to all clients except sender
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                position: data.position,
                rotation: data.rotation
            });
        }
    });
    
    // Teleport
    socket.on('teleport', (data) => {
        if (gameState.players[socket.id]) {
            // Update player position
            gameState.players[socket.id].position = data.position;
            
            // Broadcast teleport to all clients except sender
            socket.broadcast.emit('playerTeleported', {
                id: socket.id,
                position: data.position
            });
        }
    });
    
    // Tag player
    socket.on('tagPlayer', (data) => {
        if (gameState.players[socket.id] && gameState.players[data.taggedId]) {
            // Check if tagger is close enough to tagged player
            const taggerPos = gameState.players[socket.id].position;
            const taggedPos = gameState.players[data.taggedId].position;
            
            const distance = Math.sqrt(
                Math.pow(taggerPos.x - taggedPos.x, 2) +
                Math.pow(taggerPos.y - taggedPos.y, 2) +
                Math.pow(taggerPos.z - taggedPos.z, 2)
            );
            
            if (distance < 2 && gameState.players[socket.id].team === 'tagger') {
                // Tag player
                gameState.players[data.taggedId].team = 'tagger';
                
                // Increment tag count
                gameState.players[socket.id].tags++;
                
                // Broadcast tag to all clients
                io.emit('playerTagged', {
                    taggerId: socket.id,
                    taggedId: data.taggedId
                });
                
                // Check if game is over (all players tagged)
                const runnersLeft = Object.values(gameState.players).filter(p => p.team === 'runner').length;
                
                if (runnersLeft === 0) {
                    endGame('All players tagged');
                }
            }
        }
    });
    
    // Use special move
    socket.on('useSpecialMove', (data) => {
        if (gameState.players[socket.id]) {
            // Broadcast special move to all clients
            io.emit('playerUsedSpecialMove', {
                id: socket.id,
                moveType: data.moveType
            });
        }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove player from game state
        if (gameState.players[socket.id]) {
            delete gameState.players[socket.id];
            
            // Broadcast player left to all clients
            io.emit('playerLeft', socket.id);
            
            // End game if not enough players
            if (Object.keys(gameState.players).length < 2 && gameState.gameStarted) {
                endGame('Not enough players');
            }
        }
    });
});

// Start game
function startGame() {
    console.log('Starting game');
    
    // Set game started
    gameState.gameStarted = true;
    
    // Reset game time
    gameState.gameTime = 300;
    
    // Choose random player as tagger
    const playerIds = Object.keys(gameState.players);
    gameState.taggerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    
    // Set tagger
    gameState.players[gameState.taggerId].team = 'tagger';
    
    // Broadcast game started to all clients
    io.emit('gameStarted', {
        taggerId: gameState.taggerId,
        gameTime: gameState.gameTime
    });
    
    // Start game timer
    startGameTimer();
}

// End game
function endGame(result) {
    console.log('Ending game:', result);
    
    // Set game ended
    gameState.gameStarted = false;
    
    // Calculate stats
    const stats = {
        totalPlayers: Object.keys(gameState.players).length,
        taggers: Object.values(gameState.players).filter(p => p.team === 'tagger').length,
        runners: Object.values(gameState.players).filter(p => p.team === 'runner').length,
        topTagger: Object.values(gameState.players).reduce((prev, curr) => {
            return (prev.tags > curr.tags) ? prev : curr;
        }, { name: 'None', tags: 0 }).name
    };
    
    // Broadcast game ended to all clients
    io.emit('gameEnded', {
        result: result,
        stats: stats
    });
    
    // Reset player teams
    for (const id in gameState.players) {
        gameState.players[id].team = 'runner';
    }
}

// Game timer
let gameTimer = null;

function startGameTimer() {
    // Clear existing timer
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    
    // Start new timer
    gameTimer = setInterval(() => {
        // Decrement game time
        gameState.gameTime--;
        
        // Check if time is up
        if (gameState.gameTime <= 0) {
            clearInterval(gameTimer);
            endGame('Time up');
        }
    }, 1000);
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
