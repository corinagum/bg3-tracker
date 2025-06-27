# Steam Integration for BG3 Tracker

This project now includes a comprehensive Steam integration system that allows you to fetch accomplished achievements from any Steam gamer profile. This feature works with both the Steam Web API (when an API key is provided) and web scraping as a fallback.

## Features

- **Flexible Profile Input**: Accept Steam IDs, vanity URLs, or full Steam profile URLs
- **Multiple Game Support**: Works with any Steam game, not just Baldur's Gate 3
- **API + Scraping Fallback**: Uses Steam Web API when available, falls back to web scraping
- **Rich Achievement Data**: Includes achievement status, unlock times, and completion percentages
- **CLI Interface**: Easy-to-use command-line tool
- **File Export**: Save achievements to JSON files for further processing

## Prerequisites

1. **Node.js and npm**: Make sure you have Node.js installed
2. **Steam API Key (Optional)**: For better results and higher rate limits
   - Get your API key from: https://steamcommunity.com/dev/apikey
   - The system works without an API key, but with limitations

## Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd bg3-tracker
   npm install
   ```

2. The Steam integration is already included in the project.

## Usage

### Command Line Interface

The easiest way to use the Steam integration is through the CLI tool:

```bash
npm run fetch-steam -- [options]
```

#### Basic Examples

**Fetch achievements using Steam ID:**
```bash
npm run fetch-steam -- --steamid=76561198012345678
```

**Fetch achievements using vanity URL:**
```bash
npm run fetch-steam -- --vanity=https://steamcommunity.com/id/username
```

**Fetch achievements with API key and save to file:**
```bash
npm run fetch-steam -- --vanity=username --apikey=YOUR_API_KEY --output=my-achievements.json
```

**Fetch achievements for a different game:**
```bash
npm run fetch-steam -- --steamid=76561198012345678 --gameid=730 --output=csgo-achievements.json
```

#### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--steamid=STEAM_ID` | Steam ID (17-digit number) | `--steamid=76561198012345678` |
| `--vanity=VANITY_URL` | Vanity URL or Steam profile URL | `--vanity=https://steamcommunity.com/id/username` |
| `--apikey=API_KEY` | Steam API key (optional) | `--apikey=YOUR_API_KEY` |
| `--gameid=GAME_ID` | Game ID (default: 1086940 for BG3) | `--gameid=730` |
| `--output=PATH` | Output file path (optional) | `--output=achievements.json` |
| `--help` | Show help message | `--help` |

### Popular Game IDs

| Game | Game ID |
|------|---------|
| Baldur's Gate 3 | 1086940 |
| Counter-Strike 2 | 730 |
| Dota 2 | 570 |
| Grand Theft Auto V | 271590 |
| Rust | 252490 |
| Apex Legends | 1172470 |
| PUBG: BATTLEGROUNDS | 578080 |

### Programmatic Usage

You can also use the Steam API functions directly in your code:

```typescript
import { fetchSteamProfileAchievements } from './src/services/steam-api';

// Fetch achievements for a Steam profile
const achievements = await fetchSteamProfileAchievements({
  steamId: '76561198012345678',
  apiKey: 'YOUR_API_KEY', // optional
  gameId: '1086940', // optional, defaults to BG3
  outputPath: 'achievements.json', // optional
});

console.log(`Found ${achievements.length} achievements`);
console.log(`Completed: ${achievements.filter(a => a.achieved).length}`);
```

## API Reference

### `fetchSteamProfileAchievements(options)`

Main function to fetch achievements from a Steam profile.

**Parameters:**
- `options.steamId` (string, optional): Steam ID (17-digit number)
- `options.vanityUrl` (string, optional): Vanity URL or Steam profile URL
- `options.apiKey` (string, optional): Steam API key for better results
- `options.gameId` (string, optional): Game ID (default: '1086940' for BG3)
- `options.outputPath` (string, optional): Path to save achievements JSON file

**Returns:** Promise<Achievement[]>

**Note:** Either `steamId` or `vanityUrl` must be provided.

### Individual API Functions

You can also use the individual functions for more granular control:

- `resolveSteamId(identifier, apiKey?)`: Resolve Steam ID from various input formats
- `getSteamUserProfile(steamId, apiKey?)`: Get user profile information
- `getUserGames(steamId, apiKey?)`: Get user's game library
- `getUserGameAchievements(steamId, gameId, apiKey?)`: Get user's achievements for a specific game
- `getGameSchema(gameId, apiKey?)`: Get all available achievements for a game

## Achievement Data Structure

The system returns achievement objects with the following structure:

```typescript
interface Achievement {
  title?: string;           // Achievement name
  description?: string;     // Achievement description
  icon?: string;           // Achievement icon URL
  percentage?: string;     // Completion percentage
  achieved?: boolean;      // Whether the user has achieved this
  unlockTime?: number;     // Unix timestamp when achieved (if achieved)
  iconUrl?: string;        // Original icon URL
  iconLocal?: string;      // Local file path (if downloaded)
  iconPublic?: string;     // Public URL path (if copied to public assets)
}
```

## Steam API vs Web Scraping

### Steam Web API (Recommended)
- **Pros**: Faster, more reliable, higher rate limits, more data
- **Cons**: Requires API key, limited to public profiles
- **Usage**: Provide `--apikey` parameter

### Web Scraping (Fallback)
- **Pros**: Works without API key, can access more profile types
- **Cons**: Slower, less reliable, may break with Steam UI changes
- **Usage**: Don't provide `--apikey` parameter

## Error Handling

The system includes comprehensive error handling:

- **Invalid Steam ID/URL**: Clear error messages with suggestions
- **Private Profiles**: Graceful fallback to scraping when possible
- **Network Issues**: Retry logic and fallback methods
- **Rate Limiting**: Built-in delays and retry mechanisms

## Troubleshooting

### Common Issues

1. **"Could not resolve Steam ID"**
   - Check that the Steam ID or vanity URL is correct
   - Ensure the profile is public
   - Try using the full Steam profile URL

2. **"Failed to fetch user achievements"**
   - The profile might be private
   - The user might not own the game
   - Try using a Steam API key for better results

3. **"No achievements found"**
   - The user might not have played the game
   - The game might not have achievements
   - Check the game ID is correct

### Getting Help

1. Run with `--help` to see usage information
2. Check the console output for detailed error messages
3. Ensure you have the latest version of the project
4. Try using a Steam API key for better results

## Development

### Running Tests

```bash
npm test
```

### Adding New Games

To add support for new games, simply use their Steam App ID:

```bash
npm run fetch-steam -- --gameid=NEW_GAME_ID --steamid=STEAM_ID
```

### Contributing

When contributing to the Steam integration:

1. Follow the existing code style
2. Add tests for new functionality
3. Update documentation for new features
4. Test with both API and scraping methods

## License

This Steam integration is part of the BG3 Tracker project and follows the same license terms. 