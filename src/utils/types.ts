import type { Achievement } from '../components/types';

/**
 * Download failure record
 */
export interface DownloadFailure {
  achievement: Achievement;
  index: number;
  error: string;
}

/**
 * Collection of download failures
 */
export interface DownloadFailures {
  failures: DownloadFailure[];
}

/**
 * Options for fetching achievements
 */
export interface FetchOptions {
  retryFailedDownloadsOnly?: boolean;
}

/**
 * Retry item extending download failure
 */
export interface RetryItem extends DownloadFailure {
  isRetry: boolean;
}
