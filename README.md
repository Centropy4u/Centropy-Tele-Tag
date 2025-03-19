# Teleportation Tag Game

A multiplayer browser game with teleportation mechanics, day/night cycles, and multiple landscapes.

## Game Overview

Teleportation Tag is a multiplayer tag game where one player starts as "it" and must tag other players. When a player is tagged, they join the "it" team and help catch the remaining players. The game continues until all players are caught or the time runs out.

### Features

- **Teleportation Mechanics**: Save up to 10 locations and teleport back to them using number keys
- **Multiple Landscapes**: Play across Namibian savannah, German forest, and snowy Himalaya landscapes
- **Day/Night Cycle**: Experience dynamic lighting changes as time passes
- **Special Moves**: Choose from 6 different special abilities to help you escape or catch others
- **Character Customization**: Select from 5 different player skins
- **Multiplayer**: Play with friends in real-time using WebSocket technology

## Controls

- **WASD**: Move
- **Mouse**: Look around
- **Spacebar**: Jump
- **E**: Special Move 1
- **Q**: Special Move 2
- **1-0**: Teleport to saved location
- **Shift + 1-0**: Save current location
- **Tab**: Show scoreboard
- **Esc**: Menu

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. Open your browser and go to `http://localhost:3000`

## Multiplayer Setup

By default, the game runs on localhost, allowing players on the same network to connect. To play with friends over the internet, you'll need to:

1. Use a service like ngrok to expose your local server

## Modifying the Game

### Adding New Landscapes

1. Create a new landscape creation method in `landscape.js`
2. Add the landscape to the `landscapes` object in the constructor
3. Update the transition logic to include your new landscape

### Adding New Special Moves

1. Add a new move type in the `SpecialMoves` class in `specialmoves.js`
2. Create activation and deactivation methods for your move
3. Add visual effects for your move
4. Update the cooldown and duration settings

### Customizing Player Skins

1. Modify the `setSkin` method in `player.js`
2. Add new skin options to the character selection screen in `index.html`

## Project Structure

- `public/`: Client-side files
  - `index.html`: Main HTML file
  - `css/`: Stylesheets
  - `js/`: JavaScript files
    - `main.js`: Entry point
    - `game.js`: Main game logic
    - `player.js`: Player mechanics
    - `landscape.js`: Environment generation
    - `daynight.js`: Day/night cycle
    - `specialmoves.js`: Special abilities
    - `network.js`: Multiplayer functionality
    - `ui.js`: User interface
  - `assets/`: Game assets (textures, models, sounds)
- `server.js`: Server-side code for multiplayer
- `package.json`: Project configuration

## License

This project is open source and available for personal and educational use.

## Credits

Created as a custom game project by Mika Eichhoff - www.centropy4u.com
