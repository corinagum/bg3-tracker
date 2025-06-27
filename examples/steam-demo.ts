#!/usr/bin/env tsx

import { fetchSteamProfileAchievements } from '../src/services/steam-api.js';

/**
 * Steam Integration Demo
 *
 * This demo shows how to use the Steam integration features.
 * Note: This is for demonstration purposes only.
 */

async function demo() {
  // Example 1: Fetch achievements for a public Steam profile
  // console.log('📋 Example 1: Fetching achievements for a public profile...');
  try {
    // Note: This is a demo - you would use a real Steam ID or vanity URL
    const achievements = await fetchSteamProfileAchievements({
      steamId: '76561198012345678', // Example Steam ID
      gameId: '1086940', // Baldur's Gate 3
      apiKey: 'demo-api-key', // You would use a real API key
    });

    // Calculate completion statistics
    // const achievedCount = achievements.filter(a => a.achieved).length;
    // const totalCount = achievements.length;
    // const completionPercentage = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

    // console.log(`✅ Found ${totalCount} achievements`);
    // console.log(`✅ Completed: ${achievedCount}/${totalCount} (${completionPercentage}%)`);
    // console.log('✅ Saved to: examples/demo-achievements.json\n');

    // Show some recent achievements
    const recentAchievements = achievements
      .filter(a => a.achieved && a.unlockTime)
      .sort((a, b) => (b.unlockTime || 0) - (a.unlockTime || 0))
      .slice(0, 3);

    if (recentAchievements.length > 0) {
      // console.log('🏆 Recent Achievements:');
      recentAchievements.forEach(() => {
        // const date = achievement.unlockTime
        //   ? new Date(achievement.unlockTime * 1000).toLocaleDateString()
        //   : 'Unknown';
        // console.log(`   ${index + 1}. ${achievement.title} (${date})`);
      });
      // console.log('');
    }

  } catch {
    // console.log(`❌ Demo failed: ${error instanceof Error ? error.message : String(error)}`);
    // console.log('   This is expected for demo purposes - use a real Steam ID or vanity URL\n');
  }

  // Example 2: Show how to use different input formats
  // console.log('📋 Example 2: Different input formats...');
  // console.log('   Steam ID: 76561198012345678');
  // console.log('   Vanity URL: https://steamcommunity.com/id/username');
  // console.log('   Short vanity: username');
  // console.log('   Profile URL: https://steamcommunity.com/profiles/76561198012345678\n');

  // Example 3: Show how to use with different games
  // console.log('📋 Example 3: Different games...');
  const games = [
    { name: 'Baldur\'s Gate 3', id: '1086940' },
    { name: 'Counter-Strike 2', id: '730' },
    { name: 'Dota 2', id: '570' },
    { name: 'Grand Theft Auto V', id: '271590' },
    { name: 'Rust', id: '252490' },
  ];

  games.forEach(() => {
    // console.log(`   ${game.name}: --gameid=${game.id}`);
  });
  // console.log('');

  // Example 4: Show API key usage
  // console.log('📋 Example 4: Using Steam API key...');
  // console.log('   Get your API key from: https://steamcommunity.com/dev/apikey');
  // console.log('   Usage: --apikey=YOUR_API_KEY');
  // console.log('   Benefits: Faster, more reliable, higher rate limits\n');

  // Example 5: Show output options
  // console.log('📋 Example 5: Output options...');
  // console.log('   Save to file: --output=my-achievements.json');
  // console.log('   Programmatic: const achievements = await fetchSteamProfileAchievements(options);');
  // console.log('   Console output: Shows summary and recent achievements\n');

  // console.log('🎯 Ready to use! Try:');
  // console.log('   npm run fetch-steam -- --help');
  // console.log('   npm run fetch-steam -- --steamid=YOUR_STEAM_ID');
  // console.log('   npm run fetch-steam -- --vanity=YOUR_VANITY_URL');
}

// Run the demo
demo().catch(() => {
  // console.error('❌ Demo error:', error);
  process.exit(1);
});
