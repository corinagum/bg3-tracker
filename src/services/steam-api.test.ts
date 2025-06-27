/**
 * steam-api.test.ts
 *
 * Tests for the Steam API integration utility (steam-api.ts).
 * Uses types from steam-api-types.ts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  resolveSteamId,
  getSteamUserProfile,
  getUserGameAchievements,
  getGameSchema,
  fetchSteamProfileAchievements,
} from './steam-api';
import type {
  SteamUser,
  SteamUserAchievements,
  SteamGameSchema,
} from './steam-api-types';

// Mock puppeteer
const mockPage = {
  goto: vi.fn(),
  evaluate: vi.fn(),
  close: vi.fn(),
};

const mockBrowser = {
  newPage: vi.fn(() => mockPage),
  close: vi.fn(),
};

vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn(() => mockBrowser),
  },
}));

global.fetch = vi.fn();

describe('Steam API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveSteamId', () => {
    it('should return Steam ID if already a 17-digit number', async() => {
      const steamId = '76561198012345678';
      const result = await resolveSteamId(steamId);
      expect(result).toBe(steamId);
    });

    it('should extract Steam ID from profile URL', async() => {
      const profileUrl = 'https://steamcommunity.com/profiles/76561198012345678';
      const result = await resolveSteamId(profileUrl);
      expect(result).toBe('76561198012345678');
    });

    it('should extract vanity name from vanity URL', async() => {
      const vanityUrl = 'https://steamcommunity.com/id/username';
      const result = await resolveSteamId(vanityUrl);
      expect(result).toBe('username');
    });

    it('should throw error for invalid identifier', async() => {
      await expect(resolveSteamId('invalid')).rejects.toThrow('Could not resolve Steam ID for: invalid');
    });
  });

  describe('getSteamUserProfile', () => {
    it('should return user profile data', async() => {
      const mockUser: SteamUser = {
        steamid: '76561198012345678',
        personaname: 'TestUser',
        profileurl: 'https://steamcommunity.com/profiles/76561198012345678',
        avatar: 'https://example.com/avatar.jpg',
        avatarmedium: 'https://example.com/avatar_medium.jpg',
        avatarfull: 'https://example.com/avatar_full.jpg',
        personastate: 1,
        communityvisibilitystate: 3,
        profilestate: 1,
        lastlogoff: 1234567890,
        commentpermission: 1,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: { players: [mockUser] } }),
      } as Response);

      const result = await getSteamUserProfile('76561198012345678', 'test-api-key');
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserGameAchievements', () => {
    it('should return user achievements data', async() => {
      const mockAchievements: SteamUserAchievements = {
        playerstats: {
          steamID: '76561198012345678',
          gameName: 'Baldur\'s Gate 3',
          achievements: [
            {
              apiname: 'first_blood',
              achieved: 1,
              unlocktime: 1234567890,
              name: 'First Blood',
              description: 'Kill your first enemy',
            },
          ],
          success: true,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAchievements),
      } as Response);

      const result = await getUserGameAchievements('76561198012345678', '1086940', 'test-api-key');
      expect(result).toEqual(mockAchievements);
    });
  });

  describe('getGameSchema', () => {
    it('should return game schema data', async() => {
      const mockSchema: SteamGameSchema = {
        gameName: 'Baldur\'s Gate 3',
        gameVersion: '1.0',
        availableGameStats: {
          achievements: [
            {
              name: 'first_blood',
              defaultvalue: 0,
              displayName: 'First Blood',
              hidden: 0,
              description: 'Kill your first enemy',
              icon: 'https://example.com/icon.jpg',
              icongray: 'https://example.com/icon_gray.jpg',
            },
          ],
          stats: [],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ game: mockSchema }),
      } as Response);

      const result = await getGameSchema('1086940', 'test-api-key');
      expect(result).toEqual(mockSchema);
    });
  });

  describe('fetchSteamProfileAchievements', () => {
    it('should fetch and merge achievements correctly', async() => {
      const mockUser: SteamUser = {
        steamid: '76561198012345678',
        personaname: 'TestUser',
        profileurl: 'https://steamcommunity.com/profiles/76561198012345678',
        avatar: 'https://example.com/avatar.jpg',
        avatarmedium: 'https://example.com/avatar_medium.jpg',
        avatarfull: 'https://example.com/avatar_full.jpg',
        personastate: 1,
        communityvisibilitystate: 3,
        profilestate: 1,
        lastlogoff: 1234567890,
        commentpermission: 1,
      };

      const mockAchievements: SteamUserAchievements = {
        playerstats: {
          steamID: '76561198012345678',
          gameName: 'Baldur\'s Gate 3',
          achievements: [
            {
              apiname: 'first_blood',
              achieved: 1,
              unlocktime: 1234567890,
              name: 'First Blood',
              description: 'Kill your first enemy',
            },
          ],
          success: true,
        },
      };

      const mockSchema: SteamGameSchema = {
        gameName: 'Baldur\'s Gate 3',
        gameVersion: '1.0',
        availableGameStats: {
          achievements: [
            {
              name: 'first_blood',
              defaultvalue: 0,
              displayName: 'First Blood',
              hidden: 0,
              description: 'Kill your first enemy',
              icon: 'https://example.com/icon.jpg',
              icongray: 'https://example.com/icon_gray.jpg',
            },
          ],
          stats: [],
        },
      };

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ response: { players: [mockUser] } }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockAchievements),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ game: mockSchema }),
        } as Response);

      const result = await fetchSteamProfileAchievements({
        steamId: '76561198012345678',
        apiKey: 'test-api-key',
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: 'First Blood',
        description: 'Kill your first enemy',
        icon: 'https://example.com/icon.jpg',
        percentage: '100%',
        achieved: true,
        unlockTime: 1234567890,
      });
    });

    it('should throw error when neither steamId nor vanityUrl provided', async() => {
      await expect(fetchSteamProfileAchievements({}))
        .rejects.toThrow('Either steamId or vanityUrl must be provided');
    });

    it('should handle API errors gracefully', async() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      await expect(fetchSteamProfileAchievements({
        steamId: '76561198012345678',
        apiKey: 'invalid-key',
      })).rejects.toThrow('Web scraping fallback not implemented');
    });
  });
});
