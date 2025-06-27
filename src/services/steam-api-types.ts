/**
 * steam-api-types.ts
 *
 * Types and interfaces for Steam API integration, including user, game, achievement, and schema structures.
 * Used by steam-api.ts and related scripts.
 */

export interface SteamUser {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
  profilestate: number;
  lastlogoff: number;
  commentpermission: number;
  realname?: string;
  primaryclanid?: string;
  timecreated?: number;
  gameid?: string;
  gameserverip?: string;
  gameextrainfo?: string;
  cityid?: number;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url: string;
  img_logo_url: string;
  has_community_visible_stats: boolean;
  playtime_windows_forever: number;
  playtime_mac_forever: number;
  playtime_linux_forever: number;
}

export interface SteamUserGames {
  game_count: number;
  games: SteamGame[];
}

export interface SteamAchievement {
  apiname: string;
  achieved: number;
  unlocktime: number;
  name: string;
  description: string;
}

export interface SteamGameSchema {
  gameName: string;
  gameVersion: string;
  availableGameStats: {
    achievements: Array<{
      name: string;
      defaultvalue: number;
      displayName: string;
      hidden: number;
      description: string;
      icon: string;
      icongray: string;
    }>;
    stats: unknown[];
  };
}

export interface SteamUserAchievements {
  playerstats: {
    steamID: string;
    gameName: string;
    achievements: SteamAchievement[];
    success: boolean;
  };
}

export interface SteamProfileOptions {
  steamId?: string;
  vanityUrl?: string;
  apiKey?: string;
  gameId?: string;
  outputPath?: string;
}
