/**
 * Achievement data structure
 */
export type Achievement = {
  title?: string;
  description?: string;
  h5Description?: string;
  icon?: string;
  iconUrl?: string;
  iconLocal?: string;
  iconPublic?: string;
  percentage?: string;
  achieved?: boolean;
  unlockTime?: number;
};
