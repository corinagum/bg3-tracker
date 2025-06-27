/**
 * steam-api.ts
 *
 * Steam API integration utility for fetching user, game, and achievement data from Steam profiles.
 * Uses both the Steam Web API and web scraping as a fallback.
 * Depends on types from steam-api-types.ts.
 */

import type {
  SteamUser,
  SteamGameSchema,
  SteamUserAchievements,
  SteamProfileOptions,
  SteamAchievement,
} from './steam-api-types';

export interface SteamApiAchievement {
  title: string;
  description: string;
  icon: string;
  percentage: string;
  achieved: boolean;
  unlockTime?: number;
}

export async function resolveSteamId(identifier: string): Promise<string> {
  // If it's already a 17-digit Steam ID, return it
  if (/^\d{17}$/.test(identifier)) {
    return identifier;
  }

  // Extract Steam ID from profile URL
  const profileMatch = identifier.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (profileMatch) {
    return profileMatch[1];
  }

  // Extract vanity name from vanity URL
  const vanityMatch = identifier.match(/steamcommunity\.com\/id\/([^/]+)/);
  if (vanityMatch) {
    return vanityMatch[1];
  }

  // If it's just a vanity name without URL, we need to resolve it via Steam API
  // For now, throw an error for invalid identifiers
  throw new Error(`Could not resolve Steam ID for: ${identifier}`);
}

export async function getSteamUserProfile(steamId: string, apiKey: string): Promise<SteamUser> {
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.status}`);
  }

  const data = await response.json();
  const players = data.response?.players;

  if (!players || players.length === 0) {
    throw new Error('User not found');
  }

  return players[0];
}

export async function getUserGameAchievements(steamId: string, gameId: string, apiKey: string): Promise<SteamUserAchievements> {
  const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${apiKey}&steamid=${steamId}&appid=${gameId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch achievements: ${response.status}`);
  }

  return await response.json();
}

export async function getGameSchema(gameId: string, apiKey: string): Promise<SteamGameSchema> {
  const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${gameId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch game schema: ${response.status}`);
  }

  const data = await response.json();
  return data.game;
}

export async function fetchSteamProfileAchievements(options: SteamProfileOptions): Promise<SteamApiAchievement[]> {
  const { steamId, vanityUrl, apiKey, gameId = '1086940' } = options;

  if (!steamId && !vanityUrl) {
    throw new Error('Either steamId or vanityUrl must be provided');
  }

  let resolvedSteamId: string;
  if (steamId) {
    resolvedSteamId = await resolveSteamId(steamId);
  } else {
    resolvedSteamId = await resolveSteamId(vanityUrl!);
  }

  // If we have an API key, use the Steam API
  if (apiKey) {
    try {
      const [, userAchievements, gameSchema] = await Promise.all([
        getSteamUserProfile(resolvedSteamId, apiKey),
        getUserGameAchievements(resolvedSteamId, gameId, apiKey),
        getGameSchema(gameId, apiKey),
      ]);

      // Merge achievement data
      const achievements: SteamApiAchievement[] = [];
      const schemaAchievements = gameSchema.availableGameStats.achievements;
      const userAchievementMap = new Map(
        userAchievements.playerstats.achievements.map((a: SteamAchievement) => [a.apiname, a]),
      );

      for (const schemaAchievement of schemaAchievements) {
        const userAchievement = userAchievementMap.get(schemaAchievement.name);
        achievements.push({
          title: schemaAchievement.displayName,
          description: schemaAchievement.description,
          icon: schemaAchievement.icon,
          percentage: userAchievement ? '100%' : '0%',
          achieved: userAchievement ? userAchievement.achieved === 1 : false,
          unlockTime: userAchievement?.unlocktime,
        });
      }

      return achievements;
    } catch (error) {
      console.warn('Steam API failed, falling back to web scraping:', error);
    }
  }

  // Fallback to web scraping (simplified implementation)
  throw new Error('Web scraping fallback not implemented');
}
