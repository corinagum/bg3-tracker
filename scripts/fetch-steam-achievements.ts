#!/usr/bin/env tsx

import { fetchSteamProfileAchievements } from '../src/services/steam-api.js';

interface CliOptions {
  steamId?: string;
  vanityUrl?: string;
  apiKey?: string;
  gameId?: string;
  outputPath?: string;
  help?: boolean;
}

function printUsage(): void {
  console.log(`
Steam Achievement Fetcher

Usage: npm run fetch-steam -- [options]

Options:
  --steamid=STEAM_ID     Steam ID (17-digit number)
  --vanity=VANITY_URL    Vanity URL or Steam profile URL
  --apikey=API_KEY       Steam API key (optional, for better results)
  --gameid=GAME_ID       Game ID (default: 1086940 for Baldur's Gate 3)
  --output=PATH          Output file path (optional)
  --help                 Show this help message

Examples:
  # Fetch achievements using Steam ID
  npm run fetch-steam -- --steamid=76561198012345678

  # Fetch achievements using vanity URL
  npm run fetch-steam -- --vanity=https://steamcommunity.com/id/username

  # Fetch achievements with API key and save to file
  npm run fetch-steam -- --vanity=username --apikey=YOUR_API_KEY --output=my-achievements.json

  # Fetch achievements for a different game
  npm run fetch-steam -- --steamid=76561198012345678 --gameid=730 --output=csgo-achievements.json

Game IDs:
  - 1086940: Baldur's Gate 3 (default)
  - 730: Counter-Strike 2
  - 570: Dota 2
  - 271590: Grand Theft Auto V
  - 252490: Rust
  - 1172470: Apex Legends
  - 578080: PUBG: BATTLEGROUNDS
`);
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--steamid=')) {
      options.steamId = arg.split('=')[1];
    } else if (arg.startsWith('--vanity=')) {
      options.vanityUrl = arg.split('=')[1];
    } else if (arg.startsWith('--apikey=')) {
      options.apiKey = arg.split('=')[1];
    } else if (arg.startsWith('--gameid=')) {
      options.gameId = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.outputPath = arg.split('=')[1];
    }
  }

  return options;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printUsage();
    return;
  }

  if (!options.steamId && !options.vanityUrl) {
    console.error('❌ Error: Either --steamid or --vanity must be provided');
    console.error('');
    printUsage();
    process.exit(1);
  }

  try {
    console.log('🚀 Starting Steam achievement fetch...');

    const achievements = await fetchSteamProfileAchievements({
      steamId: options.steamId,
      vanityUrl: options.vanityUrl,
      apiKey: options.apiKey,
      gameId: options.gameId,
      outputPath: options.outputPath,
    });

    // Display summary
    const achievedCount = achievements.filter(a => a.achieved).length;
    const totalCount = achievements.length;
    const completionPercentage = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

    console.log('');
    console.log('📊 Achievement Summary:');
    console.log(`   Total Achievements: ${totalCount}`);
    console.log(`   Achieved: ${achievedCount}`);
    console.log(`   Remaining: ${totalCount - achievedCount}`);
    console.log(`   Completion: ${completionPercentage}%`);

    if (achievements.length > 0) {
      console.log('');
      console.log('🏆 Recently Achieved:');
      const recentAchievements = achievements
        .filter(a => a.achieved && a.unlockTime)
        .sort((a, b) => (b.unlockTime || 0) - (a.unlockTime || 0))
        .slice(0, 5);

      if (recentAchievements.length > 0) {
        recentAchievements.forEach((achievement, index) => {
          const date = achievement.unlockTime
            ? new Date(achievement.unlockTime * 1000).toLocaleDateString()
            : 'Unknown';
          console.log(`   ${index + 1}. ${achievement.title} (${date})`);
        });
      } else {
        console.log('   No achievements found');
      }
    }

    if (!options.outputPath) {
      console.log('');
      console.log('💡 Tip: Use --output=PATH to save achievements to a file');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
