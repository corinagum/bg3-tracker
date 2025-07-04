import fs from 'fs';
import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';
import { fileURLToPath } from 'url';
import type { CommunityAchievement, DownloadFailure, DownloadFailures, FetchOptions, RetryItem } from './types';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'src', 'data');
const outputPath = path.join(dataDir, 'bg3_achievements.json');
const imgDir = path.join(dataDir, 'img');
const publicImgDir = path.join(projectRoot, 'public', 'assets', 'achievements');
const downloadLogPath = path.join(dataDir, 'download-failures.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}
const publicAssetsDir = path.dirname(publicImgDir);
if (!fs.existsSync(publicAssetsDir)) {
  fs.mkdirSync(publicAssetsDir, { recursive: true });
}
if (!fs.existsSync(publicImgDir)) {
  fs.mkdirSync(publicImgDir, { recursive: true });
}

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

export function createDashSeparatedFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

export function copyFile(source: string, destination: string): boolean {
  try {
    fs.copyFileSync(source, destination);
    return true;
  } catch (error) {
    console.group(`Error copying file ${source} to ${destination}`);
    console.error(`${error instanceof Error ? error.message : String(error)}`);
    console.groupEnd();
    return false;
  }
}

export function copyImagesToPublic(): number {
  if (!fs.existsSync(imgDir)) {
    console.warn(`Image directory ${imgDir} does not exist. Nothing to copy.`);
    return 0;
  }
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
        console.group(`Failed to copy ${file} to public assets`);
        console.error(`${error instanceof Error ? error.message : String(error)}`);
        console.groupEnd();
      }
    }
  });
  console.log(`✅ Copied ${copiedCount} images to public assets directory`);
  return copiedCount;
}

export function loadDownloadFailures(): DownloadFailures {
  if (fs.existsSync(downloadLogPath)) {
    try {
      const data = fs.readFileSync(downloadLogPath, 'utf8');
      return JSON.parse(data) as DownloadFailures;
    } catch (error) {
      console.group('Failed to parse download failures log');
      console.error(`${error instanceof Error ? error.message : String(error)}`);
      console.groupEnd();
      return { failures: [] };
    }
  }
  return { failures: [] };
}

export function saveDownloadFailures(failures: DownloadFailure[]): void {
  fs.writeFileSync(downloadLogPath, JSON.stringify({ failures }, null, 2));
}

export async function fetchAchievements(options: FetchOptions = {}): Promise<CommunityAchievement[]> {
  const { retryFailedDownloadsOnly = false } = options;
  let achievements: CommunityAchievement[] = [];
  let downloadFailures: DownloadFailure[] = [];

  console.log('Starting achievement fetching process...');
  console.log(`Data directory: ${dataDir}`);
  console.log(`Image directory: ${imgDir}`);
  console.log(`Public image directory: ${publicImgDir}`);

  const previousFailures = loadDownloadFailures().failures;

  if (!retryFailedDownloadsOnly) {
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
      fs.writeFileSync(outputPath, JSON.stringify(achievements, null, 2));
      console.log(`✅ Extracted ${achievements.length} achievements to ${outputPath}`);
    } catch (error) {
      console.error(
        `❌ Error fetching achievements: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  } else if (fs.existsSync(outputPath)) {
    console.log('Loading existing achievements data for retry...');
    const data = fs.readFileSync(outputPath, 'utf8');
    achievements = JSON.parse(data) as CommunityAchievement[];
  } else {
    throw new Error('Cannot retry downloads: No existing achievements data found');
  }

  const toProcess: (CommunityAchievement | RetryItem)[] = retryFailedDownloadsOnly
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

  const batchSize = 5;
  downloadFailures = [];
  const existingFiles = new Set<string>();
  if (fs.existsSync(imgDir)) {
    fs.readdirSync(imgDir).forEach((file) => {
      existingFiles.add(file);
    });
  }
  const enhancedIndexMap = new Map<number, CommunityAchievement>();
  for (let i = 0; i < toProcess.length; i += batchSize) {
    const batch = toProcess.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async(item, idx) => {
        const achievement = 'isRetry' in item ? item.achievement : item;
        const index = 'isRetry' in item ? item.index : i + idx;
        if (!achievement.title || !achievement.icon) {
          console.log(`⚠️ Skipping achievement without title or icon at index ${index}`);
          return;
        }
        try {
          const filename = createDashSeparatedFilename(achievement.title);
          const imgFilename = `${filename}.png`;
          const imgPath = path.join(imgDir, imgFilename);
          const publicImgPath = path.join(publicImgDir, imgFilename);
          const relativePath = path.relative(projectRoot, imgPath).replace(/\\/g, '/');
          const publicRelativePath = `/assets/achievements/${imgFilename}`;
          if (existingFiles.has(imgFilename) && !('isRetry' in item)) {
            console.log(`⏭️ Skipped ${imgFilename} (already exists)`);
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
          await downloadImage(achievement.icon, imgPath);
          copyFile(imgPath, publicImgPath);
          if (!retryFailedDownloadsOnly) {
            enhancedIndexMap.set(index, {
              ...achievement,
              iconUrl: achievement.icon,
              iconLocal: relativePath,
              iconPublic: publicRelativePath,
            });
          } else {
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
          console.group(`❌ Failed to download icon for "${achievement.title}"`);
          console.error(`${error instanceof Error ? error.message : String(error)}`);
          console.groupEnd();
          downloadFailures.push({
            achievement,
            index,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }),
    );
  }
  if (!retryFailedDownloadsOnly && enhancedIndexMap.size > 0) {
    enhancedIndexMap.forEach((enhancedAchievement, index) => {
      achievements[index] = enhancedAchievement;
    });
  }
  fs.writeFileSync(outputPath, JSON.stringify(achievements, null, 2));
  if (downloadFailures.length > 0) {
    saveDownloadFailures(downloadFailures);
    console.log(
      `⚠️ ${downloadFailures.length} downloads failed. Run with retry option to attempt again.`,
    );
  } else if (previousFailures.length > 0) {
    saveDownloadFailures([]);
    console.log('✅ All previous failures have been resolved.');
  }
  copyImagesToPublic();
  console.log(
    `✅ ${toProcess.length - downloadFailures.length} images ${
      retryFailedDownloadsOnly ? 'retried' : 'downloaded'
    } successfully`,
  );
  console.log(`✅ Images saved to ${imgDir} and ${publicImgDir}`);
  return achievements;
}

if (process.argv[1] === __filename) {
  const args = process.argv.slice(2);
  const shouldRetry = args.includes('--retry');
  fetchAchievements({ retryFailedDownloadsOnly: shouldRetry }).catch((error) => {
    console.error('❌ Error during achievement fetching:', error);
    process.exit(1);
  });
}
