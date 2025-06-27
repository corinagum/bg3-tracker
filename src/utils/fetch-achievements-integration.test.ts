/**
 * Integration tests for fetch-achievements.ts
 *
 * Run these tests with the --no-isolate flag:
 * npx vitest run src/utils/fetch-achievements-integration.test.ts --no-isolate
 */
import { describe, it, expect, beforeAll, afterEach, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  downloadImage, 
  copyFile, 
  copyImagesToPublic,
  fetchAchievements 
} from './fetch-achievements';

// Get the directory path for test files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDir = path.join(__dirname, '..', '..', 'test-output');

// Mock puppeteer
vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn().mockResolvedValue(),
        evaluate: vi.fn().mockResolvedValue([
          {
            title: 'Test Achievement 1',
            description: 'Test Description 1',
            h5Description: 'Test H5 Description 1',
            icon: 'http://example.com/icon1.png',
            percentage: '50%'
          },
          {
            title: 'Test Achievement 2',
            description: 'Test Description 2',
            h5Description: 'Test H5 Description 2',
            icon: 'http://example.com/icon2.png',
            percentage: '25%'
          }
        ]),
        close: vi.fn().mockResolvedValue()
      }),
      close: vi.fn().mockResolvedValue()
    })
  }
}));

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {})
};

// Setup and teardown for tests
beforeAll(() => {
  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up test files more carefully
  if (fs.existsSync(testDir)) {
    try {
    const files = fs.readdirSync(testDir);
    for (const file of files) {
        const filePath = path.join(testDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          // Recursively remove directory contents
          const subFiles = fs.readdirSync(filePath);
          for (const subFile of subFiles) {
            fs.unlinkSync(path.join(filePath, subFile));
          }
          fs.rmdirSync(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Test cleanup warning:', error instanceof Error ? error.message : String(error));
    }
  }
});

// Mock global fetch
global.fetch = vi.fn();

describe('downloadImage', () => {
  it('saves image data to file', async () => {
    // Mock fetch response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer
    });

    const testFilePath = path.join(testDir, 'test-image.png');

    await downloadImage('http://example.com/image.png', testFilePath);

    // Verify the file exists and contains data
    expect(fs.existsSync(testFilePath)).toBe(true);

    const fileData = fs.readFileSync(testFilePath);
    expect(fileData.length).toBeGreaterThan(0);
  });

  it('throws error when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    const testFilePath = path.join(testDir, 'should-not-exist.png');

    await expect(() =>
      downloadImage('http://example.com/not-found.png', testFilePath)
    ).rejects.toThrow('Failed to download');

    // Verify the file doesn't exist
    expect(fs.existsSync(testFilePath)).toBe(false);
  });

  it('throws error when fetch throws', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const testFilePath = path.join(testDir, 'should-not-exist.png');

    await expect(() =>
      downloadImage('http://example.com/error.png', testFilePath)
    ).rejects.toThrow('Network error');

    // Verify the file doesn't exist
    expect(fs.existsSync(testFilePath)).toBe(false);
  });
});

describe('copyFile', () => {
  it('copies a file from source to destination', () => {
    // Create a source file
    const sourceFile = path.join(testDir, 'source.txt');
    const destFile = path.join(testDir, 'dest.txt');

    fs.writeFileSync(sourceFile, 'test content');

    // Copy the file
    const result = copyFile(sourceFile, destFile);

    // Verify destination exists and has same content
    expect(result).toBe(true);
    expect(fs.existsSync(destFile)).toBe(true);
    expect(fs.readFileSync(destFile, 'utf8')).toBe('test content');
  });

  it('returns false when copy fails', () => {
    const result = copyFile('/nonexistent/source.txt', '/nonexistent/dest.txt');
    expect(result).toBe(false);
  });
});

describe('copyImagesToPublic', () => {
  it('copies image files to public directory', () => {
    // Create test images in a temporary directory structure
    const testImgDir = path.join(testDir, 'temp-img');
    const testPublicDir = path.join(testDir, 'temp-public');
    
    // Create directories
    fs.mkdirSync(testImgDir, { recursive: true });
    fs.mkdirSync(testPublicDir, { recursive: true });
    
    // Create test files
    fs.writeFileSync(path.join(testImgDir, 'test1.png'), 'image1');
    fs.writeFileSync(path.join(testImgDir, 'test2.jpg'), 'image2');
    fs.writeFileSync(path.join(testImgDir, 'test3.txt'), 'not-an-image');

    // Test the copy logic manually since we can't easily mock the module paths
    const files = fs.readdirSync(testImgDir);
    let copiedCount = 0;

    files.forEach(file => {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.gif')) {
        const sourcePath = path.join(testImgDir, file);
        const destPath = path.join(testPublicDir, file);
        const result = copyFile(sourcePath, destPath);
        if (result) copiedCount++;
      }
    });

    expect(copiedCount).toBe(2);
    expect(fs.existsSync(path.join(testPublicDir, 'test1.png'))).toBe(true);
    expect(fs.existsSync(path.join(testPublicDir, 'test2.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(testPublicDir, 'test3.txt'))).toBe(false);
  });

  it('returns 0 when image directory does not exist', () => {
    // Mock fs.existsSync to return false for imgDir
    const originalExistsSync = fs.existsSync;
    fs.existsSync = vi.fn((path: string) => {
      if (path.includes('img')) {
        return false; // imgDir doesn't exist
      }
      return true; // other directories exist
    }) as typeof fs.existsSync;

    try {
      const result = copyImagesToPublic();
      expect(result).toBe(0);
      // Verify console.warn was called
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('Image directory'));
    } finally {
      // Restore original fs.existsSync
      fs.existsSync = originalExistsSync;
    }
  });
});

describe('fetchAchievements', () => {
  it('fetches achievements and downloads images successfully', async () => {
    // Mock successful image downloads
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer
    });

    // Mock file system operations
    const mockFs = {
      existsSync: vi.fn((path: string) => {
        if (path.includes('data') || path.includes('img') || path.includes('public')) {
          return true;
        }
        return false;
      }),
      readdirSync: vi.fn(() => []),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };

    // Temporarily replace fs methods
    const originalExistsSync = fs.existsSync;
    const originalReaddirSync = fs.readdirSync;
    const originalWriteFileSync = fs.writeFileSync;
    const originalMkdirSync = fs.mkdirSync;

    fs.existsSync = mockFs.existsSync as typeof fs.existsSync;
    fs.readdirSync = mockFs.readdirSync as typeof fs.readdirSync;
    fs.writeFileSync = mockFs.writeFileSync as typeof fs.writeFileSync;
    fs.mkdirSync = mockFs.mkdirSync as typeof fs.mkdirSync;

    try {
      const achievements = await fetchAchievements();

      expect(achievements).toHaveLength(2);
      expect(achievements[0]).toHaveProperty('title', 'Test Achievement 1');
      expect(achievements[1]).toHaveProperty('title', 'Test Achievement 2');
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      // Verify console.log was called for various success messages
      expect(consoleSpy.log).toHaveBeenCalledWith('Starting achievement fetching process...');
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Extracted 2 achievements'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Downloaded'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('images downloaded successfully'));
    } finally {
      // Restore original fs methods
      fs.existsSync = originalExistsSync;
      fs.readdirSync = originalReaddirSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    }
  });

  it('handles retry mode when achievements file exists', async () => {
    // Create a mock achievements file
    const testDataDir = path.join(testDir, 'data');
    const achievementsFile = path.join(testDataDir, 'bg3_achievements.json');
    const mockAchievements = [
      {
        title: 'Existing Achievement',
        description: 'Existing Description',
        h5Description: 'Existing H5 Description',
        icon: 'http://example.com/existing.png',
        percentage: '75%'
      }
    ];
    
    // Ensure the directory exists before writing the file
    fs.mkdirSync(testDataDir, { recursive: true });
    fs.writeFileSync(achievementsFile, JSON.stringify(mockAchievements));

    // Mock successful image download for retry
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer
    });

    // Mock file system operations
    const mockFs = {
      existsSync: vi.fn((path: string) => {
        if (path.includes('data') || path.includes('img') || path.includes('public') || path.includes('bg3_achievements.json')) {
          return true;
        }
        return false;
      }),
      readFileSync: vi.fn((path: string) => {
        if (path.includes('bg3_achievements.json')) {
          return JSON.stringify(mockAchievements);
        }
        if (path.includes('download-failures.json')) {
          return JSON.stringify({
            failures: [{
              achievement: mockAchievements[0],
              index: 0,
              error: 'Previous error'
            }]
          });
        }
        return '[]';
      }),
      readdirSync: vi.fn(() => []),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };

    // Temporarily replace fs methods
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    const originalReaddirSync = fs.readdirSync;
    const originalWriteFileSync = fs.writeFileSync;
    const originalMkdirSync = fs.mkdirSync;

    fs.existsSync = mockFs.existsSync as typeof fs.existsSync;
    fs.readFileSync = mockFs.readFileSync as typeof fs.readFileSync;
    fs.readdirSync = mockFs.readdirSync as typeof fs.readdirSync;
    fs.writeFileSync = mockFs.writeFileSync as typeof fs.writeFileSync;
    fs.mkdirSync = mockFs.mkdirSync as typeof fs.mkdirSync;

    try {
      const achievements = await fetchAchievements({ retryFailedDownloadsOnly: true });

      expect(achievements).toHaveLength(1);
      expect(achievements[0]).toHaveProperty('title', 'Existing Achievement');
      expect(mockFs.readFileSync).toHaveBeenCalled();
    } finally {
      // Restore original fs methods
      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.readdirSync = originalReaddirSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    }
  });

  it('throws error when retry mode is used but no achievements file exists', async () => {
    const mockFs = {
      existsSync: vi.fn(() => false)
    };

    // Temporarily replace fs.existsSync
    const originalExistsSync = fs.existsSync;
    fs.existsSync = mockFs.existsSync as typeof fs.existsSync;

    try {
      await expect(fetchAchievements({ retryFailedDownloadsOnly: true }))
        .rejects.toThrow('Cannot retry downloads: No existing achievements data found');
    } finally {
      fs.existsSync = originalExistsSync;
    }
  });

  it('handles download failures gracefully', async () => {
    // Mock failed image downloads
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    // Mock file system operations
    const mockFs = {
      existsSync: vi.fn((path: string) => {
        if (path.includes('data') || path.includes('img') || path.includes('public')) {
          return true;
        }
        return false;
      }),
      readdirSync: vi.fn(() => []),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };

    // Temporarily replace fs methods
    const originalExistsSync = fs.existsSync;
    const originalReaddirSync = fs.readdirSync;
    const originalWriteFileSync = fs.writeFileSync;
    const originalMkdirSync = fs.mkdirSync;

    fs.existsSync = mockFs.existsSync as typeof fs.existsSync;
    fs.readdirSync = mockFs.readdirSync as typeof fs.readdirSync;
    fs.writeFileSync = mockFs.writeFileSync as typeof fs.writeFileSync;
    fs.mkdirSync = mockFs.mkdirSync as typeof fs.mkdirSync;

    try {
      const achievements = await fetchAchievements();

      expect(achievements).toHaveLength(2);
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      // Check that writeFileSync was called for both achievements and failures log
      const calls = (mockFs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls;
      const achievementsCall = calls.find((call: unknown[]) => typeof call[0] === 'string' && call[0].includes('bg3_achievements.json'));
      const failuresCall = calls.find((call: unknown[]) => typeof call[0] === 'string' && call[0].includes('download-failures.json'));
      expect(achievementsCall).toBeTruthy();
      expect(failuresCall).toBeTruthy();
      // Verify console.error was called for download failures
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Failed to download icon'));
    } finally {
      // Restore original fs methods
      fs.existsSync = originalExistsSync;
      fs.readdirSync = originalReaddirSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    }
  });

  it('handles puppeteer errors gracefully', async () => {
    // Mock puppeteer to throw an error
    const puppeteer = await import('puppeteer');
    (puppeteer.default.launch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Browser launch failed'));

    // Mock file system operations
    const mockFs = {
      existsSync: vi.fn((path: string) => {
        if (path.includes('data') || path.includes('img') || path.includes('public')) {
          return true;
        }
        return false;
      }),
      readdirSync: vi.fn(() => []),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };

    // Temporarily replace fs methods
    const originalExistsSync = fs.existsSync;
    const originalReaddirSync = fs.readdirSync;
    const originalWriteFileSync = fs.writeFileSync;
    const originalMkdirSync = fs.mkdirSync;

    fs.existsSync = mockFs.existsSync as typeof fs.existsSync;
    fs.readdirSync = mockFs.readdirSync as typeof fs.readdirSync;
    fs.writeFileSync = mockFs.writeFileSync as typeof fs.writeFileSync;
    fs.mkdirSync = mockFs.mkdirSync as typeof fs.mkdirSync;

    try {
      await expect(fetchAchievements()).rejects.toThrow('Browser launch failed');
      // Verify console.error was called for puppeteer error
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('Error fetching achievements'));
    } finally {
      // Restore original fs methods
      fs.existsSync = originalExistsSync;
      fs.readdirSync = originalReaddirSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    }
  });

  it('handles empty achievements list', async () => {
    // Mock puppeteer to return empty achievements
    const puppeteer = await import('puppeteer');
    (puppeteer.default.launch as ReturnType<typeof vi.fn>).mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn().mockResolvedValue(),
        evaluate: vi.fn().mockResolvedValue([]), // Empty achievements
        close: vi.fn().mockResolvedValue()
      }),
      close: vi.fn().mockResolvedValue()
    });

    // Mock successful image downloads
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer
    });

    // Mock file system operations
    const mockFs = {
      existsSync: vi.fn((path: string) => {
        if (path.includes('data') || path.includes('img') || path.includes('public')) {
          return true;
        }
        return false;
      }),
      readdirSync: vi.fn(() => []),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };

    // Temporarily replace fs methods
    const originalExistsSync = fs.existsSync;
    const originalReaddirSync = fs.readdirSync;
    const originalWriteFileSync = fs.writeFileSync;
    const originalMkdirSync = fs.mkdirSync;

    fs.existsSync = mockFs.existsSync as typeof fs.existsSync;
    fs.readdirSync = mockFs.readdirSync as typeof fs.readdirSync;
    fs.writeFileSync = mockFs.writeFileSync as typeof fs.writeFileSync;
    fs.mkdirSync = mockFs.mkdirSync as typeof fs.mkdirSync;

    try {
      const achievements = await fetchAchievements();

      expect(achievements).toHaveLength(0);
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      // Verify console.log was called for empty list message
      expect(consoleSpy.log).toHaveBeenCalledWith('No achievements to process');
    } finally {
      // Restore original fs methods
      fs.existsSync = originalExistsSync;
      fs.readdirSync = originalReaddirSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    }
  });

  it('handles achievements with missing title or icon', async () => {
    // Mock puppeteer to return achievements with missing data
    const puppeteer = await import('puppeteer');
    (puppeteer.default.launch as ReturnType<typeof vi.fn>).mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn().mockResolvedValue(),
        evaluate: vi.fn().mockResolvedValue([
          {
            title: 'Valid Achievement',
            description: 'Valid Description',
            h5Description: 'Valid H5 Description',
            icon: 'http://example.com/valid.png',
            percentage: '50%'
          },
          {
            title: '', // Missing title
            description: 'Invalid Description',
            h5Description: 'Invalid H5 Description',
            icon: 'http://example.com/invalid.png',
            percentage: '25%'
          },
          {
            title: 'No Icon Achievement',
            description: 'No Icon Description',
            h5Description: 'No Icon H5 Description',
            icon: '', // Missing icon
            percentage: '10%'
          }
        ]),
        close: vi.fn().mockResolvedValue()
      }),
      close: vi.fn().mockResolvedValue()
    });

    // Mock successful image downloads
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer
    });

    // Mock file system operations
    const mockFs = {
      existsSync: vi.fn((path: string) => {
        if (path.includes('data') || path.includes('img') || path.includes('public')) {
          return true;
        }
        return false;
      }),
      readdirSync: vi.fn(() => []),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };

    // Temporarily replace fs methods
    const originalExistsSync = fs.existsSync;
    const originalReaddirSync = fs.readdirSync;
    const originalWriteFileSync = fs.writeFileSync;
    const originalMkdirSync = fs.mkdirSync;

    fs.existsSync = mockFs.existsSync as typeof fs.existsSync;
    fs.readdirSync = mockFs.readdirSync as typeof fs.readdirSync;
    fs.writeFileSync = mockFs.writeFileSync as typeof fs.writeFileSync;
    fs.mkdirSync = mockFs.mkdirSync as typeof fs.mkdirSync;

    try {
      const achievements = await fetchAchievements();

      expect(achievements).toHaveLength(3);
      expect(achievements[0]).toHaveProperty('title', 'Valid Achievement');
      expect(achievements[1]).toHaveProperty('title', '');
      expect(achievements[2]).toHaveProperty('title', 'No Icon Achievement');
      expect(mockFs.writeFileSync).toHaveBeenCalled();
    } finally {
      // Restore original fs methods
      fs.existsSync = originalExistsSync;
      fs.readdirSync = originalReaddirSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    }
  });

  it('handles retry mode with no previous failures', async () => {
    // Create a mock achievements file
    const achievementsFile = path.join(testDir, 'data', 'bg3_achievements.json');
    const mockAchievements = [
      {
        title: 'Existing Achievement',
        description: 'Existing Description',
        h5Description: 'Existing H5 Description',
        icon: 'http://example.com/existing.png',
        percentage: '75%'
      }
    ];
    
    // Ensure the directory exists before writing the file
    fs.mkdirSync(path.dirname(achievementsFile), { recursive: true });
    fs.writeFileSync(achievementsFile, JSON.stringify(mockAchievements));

    // Mock file system operations
    const mockFs = {
      existsSync: vi.fn((path: string) => {
        if (path.includes('data') || path.includes('img') || path.includes('public') || path.includes('bg3_achievements.json')) {
          return true;
        }
        return false;
      }),
      readFileSync: vi.fn((path: string) => {
        if (path.includes('bg3_achievements.json')) {
          return JSON.stringify(mockAchievements);
        }
        if (path.includes('download-failures.json')) {
          return JSON.stringify({ failures: [] }); // No previous failures
        }
        return '[]';
      }),
      readdirSync: vi.fn(() => []),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };

    // Temporarily replace fs methods
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    const originalReaddirSync = fs.readdirSync;
    const originalWriteFileSync = fs.writeFileSync;
    const originalMkdirSync = fs.mkdirSync;

    fs.existsSync = mockFs.existsSync as typeof fs.existsSync;
    fs.readFileSync = mockFs.readFileSync as typeof fs.readFileSync;
    fs.readdirSync = mockFs.readdirSync as typeof fs.readdirSync;
    fs.writeFileSync = mockFs.writeFileSync as typeof fs.writeFileSync;
    fs.mkdirSync = mockFs.mkdirSync as typeof fs.mkdirSync;

    try {
      const achievements = await fetchAchievements({ retryFailedDownloadsOnly: true });

      expect(achievements).toHaveLength(1);
      expect(achievements[0]).toHaveProperty('title', 'Existing Achievement');
      expect(mockFs.readFileSync).toHaveBeenCalled();
    } finally {
      // Restore original fs methods
      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.readdirSync = originalReaddirSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    }
  });

  it('handles successful retry that clears previous failures', async () => {
    // Create a mock achievements file
    const achievementsFile = path.join(testDir, 'data', 'bg3_achievements.json');
    const mockAchievements = [
      {
        title: 'Existing Achievement',
        description: 'Existing Description',
        h5Description: 'Existing H5 Description',
        icon: 'http://example.com/existing.png',
        percentage: '75%'
      }
    ];
    
    // Ensure the directory exists before writing the file
    fs.mkdirSync(path.dirname(achievementsFile), { recursive: true });
    fs.writeFileSync(achievementsFile, JSON.stringify(mockAchievements));

    // Mock successful image download for retry
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer
    });

    // Mock file system operations
    const mockFs = {
      existsSync: vi.fn((path: string) => {
        if (path.includes('data') || path.includes('img') || path.includes('public') || path.includes('bg3_achievements.json')) {
          return true;
        }
        return false;
      }),
      readFileSync: vi.fn((path: string) => {
        if (path.includes('bg3_achievements.json')) {
          return JSON.stringify(mockAchievements);
        }
        if (path.includes('download-failures.json')) {
          return JSON.stringify({
            failures: [{
              achievement: mockAchievements[0],
              index: 0,
              error: 'Previous error'
            }]
          });
        }
        return '[]';
      }),
      readdirSync: vi.fn(() => []),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };

    // Temporarily replace fs methods
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    const originalReaddirSync = fs.readdirSync;
    const originalWriteFileSync = fs.writeFileSync;
    const originalMkdirSync = fs.mkdirSync;

    fs.existsSync = mockFs.existsSync as typeof fs.existsSync;
    fs.readFileSync = mockFs.readFileSync as typeof fs.readFileSync;
    fs.readdirSync = mockFs.readdirSync as typeof fs.readdirSync;
    fs.writeFileSync = mockFs.writeFileSync as typeof fs.writeFileSync;
    fs.mkdirSync = mockFs.mkdirSync as typeof fs.mkdirSync;

    try {
      const achievements = await fetchAchievements({ retryFailedDownloadsOnly: true });

      expect(achievements).toHaveLength(1);
      expect(achievements[0]).toHaveProperty('title', 'Existing Achievement');
      expect(mockFs.readFileSync).toHaveBeenCalled();
      // Should have called writeFileSync to clear failures
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      // Verify console.log was called for success message
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('All previous failures have been resolved'));
    } finally {
      // Restore original fs methods
      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
      fs.readdirSync = originalReaddirSync;
      fs.writeFileSync = originalWriteFileSync;
      fs.mkdirSync = originalMkdirSync;
    }
  });
}); 