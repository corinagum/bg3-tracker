/**
 * Achievement data structure
 */
export type Achievement = {
  title?: string;
  description?: string;
  icon?: string;
  iconPublic?: string;
  percentage?: string;
};

/**
 * Error component props
 */
export type ErrorProps = {
  title: string;
  message: string;
  buttonText?: string;
};

/**
 * Achievement component props
 */
export type AchievementProps = {
  achievement: Achievement;
};

/**
 * Achievement list component props
 */
export type AchievementListProps = {
  achievements: Achievement[];
};

/**
 * Error state props
 */
export type ErrorStateProps = {
  title: string;
  message: string;
}; 