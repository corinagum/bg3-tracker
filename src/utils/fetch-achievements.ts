console.log('Starting fetch-achievements.ts');

import fs from 'fs';
import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';
import { fileURLToPath } from 'url';
import type { Achievement } from '../components/types';
import type { DownloadFailure, DownloadFailures, FetchOptions, RetryItem } from './types';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const dataDir = path.join(projectRoot, 'src', 'data');
const outputPath = path.join(dataDir, 'bg3_achievements.json');
const imgDir = path.join(dataDir, 'img');
const publicImgDir = path.join(projectRoot, 'public', 'assets', 'achievements');
const downloadLogPath = path.join(dataDir, 'download-failures.json');

// Make sure all directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Ensure public assets directory exists
const publicAssetsDir = path.dirname(publicImgDir);
if (!fs.existsSync(publicAssetsDir)) {
  fs.mkdirSync(publicAssetsDir, { recursive: true });
}

if (!fs.existsSync(publicImgDir)) {
  fs.mkdirSync(publicImgDir, { recursive: true });
}

// Helper function to download an image
export async function downloadImage(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filename, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`Error downloading ${url}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Helper function to create a dash-separated filename from achievement title
export function createDashSeparatedFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with a single dash
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .substring(0, 100); // Limit length for filesystem compatibility
}

// Copy a single file from source to destination
export function copyFile(source: string, destination: string): boolean {
  try {
    fs.copyFileSync(source, destination);
    return true;
  } catch (error) {
    console.error(`Error copying file ${source} to ${destination}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// Copy all images from data directory to public assets
export function copyImagesToPublic(): number {
  if (!fs.existsSync(imgDir)) {
    console.warn(`Image directory ${imgDir} does not exist. Nothing to copy.`);
    return 0;
  }

  // Ensure the public images directory exists
  if (!fs.existsSync(publicImgDir)) {
    fs.mkdirSync(publicImgDir, { recursive: true });
  }

  const files = fs.readdirSync(imgDir);
  let copiedCount = 0;

  files.forEach((file) => {
    if (
      file.endsWith('.png')
      || file.endsWith('.jpg')
      || file.endsWith('.jpeg')
      || file.endsWith('.gif')
    ) {
      const sourcePath = path.join(imgDir, file);
      const destPath = path.join(publicImgDir, file);

      try {
        copyFile(sourcePath, destPath);
        copiedCount++;
      } catch (error) {
        // Failed to write tests for this line
        console.error(`Failed to copy ${file} to public assets: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  });

  console.log(`✅ Copied ${copiedCount} images to public assets directory`);
  return copiedCount;
}

// Load previous download failures if any
export function loadDownloadFailures(): DownloadFailures {
  if (fs.existsSync(downloadLogPath)) {
    try {
      const data = fs.readFileSync(downloadLogPath, 'utf8');
      return JSON.parse(data) as DownloadFailures;
    } catch (error) {
      console.warn(`Failed to parse download failures log: ${error instanceof Error ? error.message : String(error)}`);
      return { failures: [] };
    }
  }
  return { failures: [] };
}

// Save download failures for future retry
export function saveDownloadFailures(failures: DownloadFailure[]): void {
  fs.writeFileSync(downloadLogPath, JSON.stringify({ failures }, null, 2));
}

export async function fetchAchievements(options: FetchOptions = {}): Promise<Achievement[]> {
  const { retryFailedDownloadsOnly = false } = options;
  let achievements: Achievement[] = [];
  let downloadFailures: DownloadFailure[] = [];

  console.log('Starting achievement fetching process...');
  console.log(`Data directory: ${dataDir}`);
  console.log(`Image directory: ${imgDir}`);
  console.log(`Public image directory: ${publicImgDir}`);

  // Load previous failures
  const previousFailures = loadDownloadFailures().failures;

  if (!retryFailedDownloadsOnly) {
    // Fetch new achievements data
    const url = 'https://steamcommunity.com/stats/1086940/achievements';
    console.log(`Fetching achievements from ${url}...`);

    try {
      const browser: Browser = await puppeteer.launch();
      const page: Page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      achievements = await page.evaluate(() => {
        const rows = document.querySelectorAll('.achieveRow');
        return Array.from(rows).map((row) => {
          const title = row.querySelector('.achieveTxt h3')?.textContent?.trim() || '';
          const description = row.querySelector('.achieveTxt .achieveDesc')?.textContent?.trim() || '';
          const h5Description = row.querySelector('.achieveTxt h5')?.textContent?.trim() || '';
          const icon = (row.querySelector('.achieveImgHolder img') as HTMLImageElement)?.src || '';
          const percentage = row.querySelector('.achievePercent')?.textContent?.trim() || '';
          return {
            title,
            description,
            h5Description,
            icon,
            percentage,
          };
        });
      });

      await browser.close();

      // Write the fresh achievements data
      fs.writeFileSync(outputPath, JSON.stringify(achievements, null, 2));
      console.log(`✅ Extracted ${achievements.length} achievements to ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error fetching achievements: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  } else if (fs.existsSync(outputPath)) {
    // When retrying downloads only, load existing achievements data
    console.log('Loading existing achievements data for retry...');
    const data = fs.readFileSync(outputPath, 'utf8');
    achievements = JSON.parse(data) as Achievement[];
  } else {
    throw new Error('Cannot retry downloads: No existing achievements data found');
  }

  // Process to download or retry downloads
  const toProcess: (Achievement | RetryItem)[] = retryFailedDownloadsOnly
    ? previousFailures.map((failure) => ({
      ...failure,
      isRetry: true,
    }))
    : achievements;

  if (toProcess.length === 0) {
    console.log('No achievements to process');
    return achievements;
  }

  console.log(
    `⏱️ ${retryFailedDownloadsOnly ? 'Retrying' : 'Downloading'} ${toProcess.length} achievement icons...`,
  );

  // Process downloads in groups of 5 to avoid overwhelming the server
  const batchSize = 5;
  downloadFailures = [];

  // Check which files already exist
  const existingFiles = new Set<string>();
  if (fs.existsSync(imgDir)) {
    fs.readdirSync(imgDir).forEach((file) => {
      existingFiles.add(file);
    });
  }

  // Track which achievements have been updated with local paths
  const enhancedIndexMap = new Map<number, Achievement>();

  for (let i = 0; i < toProcess.length; i += batchSize) {
    const batch = toProcess.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async(item, idx) => {
        const achievement = 'isRetry' in item ? item.achievement : item;
        const index = 'isRetry' in item ? item.index : i + idx;

        if (!achievement.title || !achievement.icon) {
          console.log(`⚠️ Skipping achievement without title or icon at index ${index}`);
          return; // Skip items without title or icon
        }

        try {
          // Create dash-separated filename based on achievement title
          const filename = createDashSeparatedFilename(achievement.title);
          const imgFilename = `${filename}.png`;
          const imgPath = path.join(imgDir, imgFilename);
          const publicImgPath = path.join(publicImgDir, imgFilename);
          const relativePath = path.relative(projectRoot, imgPath).replace(/\\/g, '/');
          const publicRelativePath = `/assets/achievements/${imgFilename}`;

          // Skip if file already exists
          if (existingFiles.has(imgFilename) && !('isRetry' in item)) {
            console.log(`⏭️ Skipped ${imgFilename} (already exists)`);

            // Still update the achievement with the local path
            if (!retryFailedDownloadsOnly) {
              enhancedIndexMap.set(index, {
                ...achievement,
                iconUrl: achievement.icon,
                iconLocal: relativePath,
                iconPublic: publicRelativePath,
              });
            }
            return;
          }

          // Download image
          await downloadImage(achievement.icon, imgPath);

          // Also copy to public directory
          copyFile(imgPath, publicImgPath);

          // Update the achievement object with local path
          if (!retryFailedDownloadsOnly) {
            enhancedIndexMap.set(index, {
              ...achievement,
              iconUrl: achievement.icon,
              iconLocal: relativePath,
              iconPublic: publicRelativePath,
            });
          } else {
            // For retries, we need to find the achievement in the main array
            const mainIndex = achievements.findIndex((a) => a.title === achievement.title);
            if (mainIndex !== -1) {
              achievements[mainIndex] = {
                ...achievements[mainIndex],
                iconUrl: achievement.icon,
                iconLocal: relativePath,
                iconPublic: publicRelativePath,
              };
            }
          }

          console.log(`✅ ${'isRetry' in item ? 'Retry succeeded' : 'Downloaded'} ${imgFilename}`);
        } catch (error) {
          console.error(`❌ Failed to download icon for "${achievement.title}": ${error instanceof Error ? error.message : String(error)}`);
          downloadFailures.push({
            achievement,
            index,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }),
    );
  }

  // Update achievements with local paths for new downloads
  if (!retryFailedDownloadsOnly && enhancedIndexMap.size > 0) {
    enhancedIndexMap.forEach((enhancedAchievement, index) => {
      achievements[index] = enhancedAchievement;
    });
  }

  // Save updated achievements data with local paths
  fs.writeFileSync(outputPath, JSON.stringify(achievements, null, 2));

  // Save failures for future retry
  if (downloadFailures.length > 0) {
    saveDownloadFailures(downloadFailures);
    console.log(
      `⚠️ ${downloadFailures.length} downloads failed. Run with retry option to attempt again.`,
    );
  } else if (previousFailures.length > 0) {
    // Clear the failures log if all retries succeeded
    saveDownloadFailures([]);
    console.log('✅ All previous failures have been resolved.');
  }

  // Copy all images to public directory
  copyImagesToPublic();

  console.log(
    `✅ ${toProcess.length - downloadFailures.length} images ${retryFailedDownloadsOnly ? 'retried' : 'downloaded'} successfully`,
  );
  console.log(`✅ Images saved to ${imgDir} and ${publicImgDir}`);

  return achievements;
}

// If you want to run this as a script directly
if (process.argv[1] === __filename) {
  const args = process.argv.slice(2);
  const shouldRetry = args.includes('--retry');

  fetchAchievements({ retryFailedDownloadsOnly: shouldRetry }).catch((error) => {
    console.error('❌ Error during achievement fetching:', error);
    process.exit(1);
  });
}
