# BG3 tracker

I want to track my Baldur's Gate 3 achievements my way.

## Features

- **Achievement Tracking**: Track and visualize Baldur's Gate 3 achievements
- **Steam Integration**: Fetch accomplished achievements from any Steam gamer profile
- **Steam Authentication**: Login with your Steam account to access your achievements
- **Multiple Game Support**: Works with any Steam game, not just Baldur's Gate 3
- **Web Interface**: Beautiful web interface to view and manage achievements
- **CLI Tools**: Command-line tools for data fetching and management

## Setup

### Steam Authentication Setup

To enable Steam authentication, you'll need to set up a Steam API key and configure the environment:

1. **Get a Steam API Key**:
   - Go to [Steam Community](https://steamcommunity.com/dev/apikey)
   - Sign in with your Steam account
   - Enter a domain name (use `localhost` for development)
   - Accept the terms and click "Register"
   - Copy your API key

2. **Configure Environment**:
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env and add your Steam API key
   STEAM_API_KEY=your-steam-api-key-here
   SESSION_SECRET=your-random-session-secret
   ```

3. **Start the Development Server**:
   ```bash
   # Terminal 1: Start the backend server
   npm run dev:server
   
   # Terminal 2: Start the frontend development server
   npm run dev
   ```

4. **Access the Application**:
   - Open http://localhost:5173 in your browser
   - Click "Login with Steam" to authenticate
   - After authentication, you'll see your Steam profile information

## Usage

### Basic Achievement Tracking

1. Run `npm run fetch-achievements` to fetch the achievements from the achievements page and download all icons.
   - This only needs to be done once, or whenever you want to refresh the data.
   - You can also run `npm run fetch-achievements -- --retry` to retry only failed downloads.
2. Run `npm run dev` to start the development server.

### Steam Integration

The project now includes a comprehensive Steam integration system that allows you to fetch accomplished achievements from any Steam gamer profile.

#### Quick Start

```bash
# Fetch achievements using Steam ID
npm run fetch-steam -- --steamid=76561198012345678

# Fetch achievements using vanity URL
npm run fetch-steam -- --vanity=https://steamcommunity.com/id/username

# Fetch achievements with API key and save to file
npm run fetch-steam -- --vanity=username --apikey=YOUR_API_KEY --output=my-achievements.json

# Fetch achievements for a different game
npm run fetch-steam -- --steamid=76561198012345678 --gameid=730 --output=csgo-achievements.json
```

#### Steam Integration Features

- **Flexible Profile Input**: Accept Steam IDs, vanity URLs, or full Steam profile URLs
- **Multiple Game Support**: Works with any Steam game, not just Baldur's Gate 3
- **API + Scraping Fallback**: Uses Steam Web API when available, falls back to web scraping
- **Rich Achievement Data**: Includes achievement status, unlock times, and completion percentages
- **CLI Interface**: Easy-to-use command-line tool
- **File Export**: Save achievements to JSON files for further processing

#### Popular Game IDs

| Game | Game ID |
|------|---------|
| Baldur's Gate 3 | 1086940 |
| Counter-Strike 2 | 730 |
| Dota 2 | 570 |
| Grand Theft Auto V | 271590 |
| Rust | 252490 |
| Apex Legends | 1172470 |
| PUBG: BATTLEGROUNDS | 578080 |

For detailed documentation on the Steam integration, see [STEAM_INTEGRATION.md](./STEAM_INTEGRATION.md).

## Development

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:server` - Start backend server with Steam authentication
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run fetch-achievements` - Fetch BG3 achievements from Steam
- `npm run fetch-steam` - Fetch achievements from any Steam profile
- `npm run lint` - Run ESLint
- `npm run fmt` - Format code with ESLint

### Development Workflow

1. **Start both servers**:
   ```bash
   # Terminal 1: Backend server (handles Steam auth)
   npm run dev:server
   
   # Terminal 2: Frontend server (Vite dev server)
   npm run dev
   ```

2. **Access the application** at http://localhost:5173

3. **Steam authentication** will be handled by the backend server running on port 3000

## License

[!WARNING]
This project is **not licensed for public use**.
You may **not** copy, modify, distribute, or use this code in any form without explicit written permission from the author.
