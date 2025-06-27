import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

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
export async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filename, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`Error downloading ${url}: ${error.message}`);
    throw error;
  }
}

// Helper function to create a dash-separated filename from achievement title
export function createDashSeparatedFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with a single dash
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
    .substring(0, 100); // Limit length for filesystem compatibility
}

// Copy a single file from source to destination
export function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    return true;
  } catch (error) {
    console.error(`Error copying file ${source} to ${destination}: ${error.message}`);
    return false;
  }
}

// Copy all images from data directory to public assets
export function copyImagesToPublic() {
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
      file.endsWith('.png') ||
      file.endsWith('.jpg') ||
      file.endsWith('.jpeg') ||
      file.endsWith('.gif')
    ) {
      const sourcePath = path.join(imgDir, file);
      const destPath = path.join(publicImgDir, file);

      try {
        copyFile(sourcePath, destPath);
        copiedCount++;
      } catch (error) {
        console.error(`Failed to copy ${file} to public assets: ${error.message}`);
      }
    }
  });

  console.log(`✅ Copied ${copiedCount} images to public assets directory`);
  return copiedCount;
}

// Load previous download failures if any
export function loadDownloadFailures() {
  if (fs.existsSync(downloadLogPath)) {
    try {
      const data = fs.readFileSync(downloadLogPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn(`Failed to parse download failures log: ${error.message}`);
      return { failures: [] };
    }
  }
  return { failures: [] };
}

// Save download failures for future retry
export function saveDownloadFailures(failures) {
  fs.writeFileSync(downloadLogPath, JSON.stringify({ failures }, null, 2));
}

export async function fetchAchievements(options = {}) {
  const { retryFailedDownloadsOnly = false } = options;
  let achievements = [];
  let downloadFailures = [];

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
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      achievements = await page.evaluate(() => {
        const rows = document.querySelectorAll('.achieveRow');
        return Array.from(rows).map((row) => {
          const title = row.querySelector('.achieveTxt h3')?.innerText.trim();
          const description = row.querySelector('.achieveTxt .achieveDesc')?.innerText.trim();
          const icon = row.querySelector('.achieveImgHolder img')?.src;
          const percentage = row.querySelector('.achievePercent')?.innerText.trim();
          return { title, description, icon, percentage };
        });
      });

      await browser.close();

      // Write the fresh achievements data
      fs.writeFileSync(outputPath, JSON.stringify(achievements, null, 2));
      console.log(`✅ Extracted ${achievements.length} achievements to ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error fetching achievements: ${error.message}`);
      throw error;
    }
  } else if (fs.existsSync(outputPath)) {
    // When retrying downloads only, load existing achievements data
    console.log('Loading existing achievements data for retry...');
    const data = fs.readFileSync(outputPath, 'utf8');
    achievements = JSON.parse(data);
  } else {
    throw new Error('Cannot retry downloads: No existing achievements data found');
  }

  // Process to download or retry downloads
  const toProcess = retryFailedDownloadsOnly
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
    `⏱️ ${retryFailedDownloadsOnly ? 'Retrying' : 'Downloading'} ${toProcess.length} achievement icons...`
  );

  // Process downloads in groups of 5 to avoid overwhelming the server
  const batchSize = 5;
  downloadFailures = [];

  // Check which files already exist
  const existingFiles = new Set();
  if (fs.existsSync(imgDir)) {
    fs.readdirSync(imgDir).forEach((file) => {
      existingFiles.add(file);
    });
  }

  // Track which achievements have been updated with local paths
  const enhancedIndexMap = new Map();

  for (let i = 0; i < toProcess.length; i += batchSize) {
    const batch = toProcess.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (item, idx) => {
        const achievement = item.isRetry ? item.achievement : item;
        const index = item.isRetry ? item.index : i + idx;

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
          if (existingFiles.has(imgFilename) && !item.isRetry) {
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

          console.log(`✅ ${item.isRetry ? 'Retry succeeded' : 'Downloaded'} ${imgFilename}`);
        } catch (error) {
          console.error(`❌ Failed to download icon for "${achievement.title}": ${error.message}`);
          downloadFailures.push({
            achievement,
            index,
            error: error.message,
          });
        }
      })
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
      `⚠️ ${downloadFailures.length} downloads failed. Run with retry option to attempt again.`
    );
  } else if (previousFailures.length > 0) {
    // Clear the failures log if all retries succeeded
    saveDownloadFailures([]);
    console.log('✅ All previous failures have been resolved.');
  }

  // Copy all images to public directory
  copyImagesToPublic();

  console.log(
    `✅ ${toProcess.length - downloadFailures.length} images ${retryFailedDownloadsOnly ? 'retried' : 'downloaded'} successfully`
  );
  console.log(`✅ Images saved to ${imgDir} and ${publicImgDir}`);

  return achievements;
}

// If you want to run this as a script directly
if (import.meta.url === import.meta.main) {
  const args = process.argv.slice(2);
  const shouldRetry = args.includes('--retry');

  fetchAchievements({ retryFailedDownloadsOnly: shouldRetry }).catch((error) => {
    console.error('❌ Error during achievement fetching:', error);
    process.exit(1);
  });
}
