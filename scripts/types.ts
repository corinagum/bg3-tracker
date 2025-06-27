/**
 * Alias mapping for comparison between vite and tsconfig
 */
export interface AliasMapping {
  alias: string;
  vitePath: string;
  tsPath: string;
}

// Types for fetch-achievements
export interface CommunityAchievement {
  title: string;
  description: string;
  h5Description: string;
  icon: string;
  percentage: string;
  iconUrl?: string;
  iconLocal?: string;
  iconPublic?: string;
}

export interface DownloadFailure {
  achievement: CommunityAchievement;
  index: number;
  error: string;
}

export interface DownloadFailures {
  failures: DownloadFailure[];
}

export interface FetchOptions {
  retryFailedDownloadsOnly?: boolean;
}

export interface RetryItem extends DownloadFailure {
  isRetry: true;
}
