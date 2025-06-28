import type { UserProfile } from '@utils/user-data';

/**
 * Hard-coded test data for development and testing purposes
 * This data represents the achievements completed by ys-ys
 */
export const TEST_USER_DATA: UserProfile = {
  username: 'ys-ys',
  displayName: 'Yuri',
  // Intentionally non-existent file for now.
  avatarUrl: '/assets/ys.jpg',
  completedAchievements: [
    'Leave No One Behind',
    'Descent From Avernus',
    'The Plot Thickens',
    'The City Awaits',
    'Roleplayer',
    'Bedrolls and Breakfast',
    'Expand Your Mind',
    'Dig for Victory',
    'No Penny Required',
    'Escapologist',
    'Outsourcing',
    'Homebrewer',
    'You Have Two Hands for a Reason',
    'Rude, Crude, and Full of Attitude',
    'Forged in Blood and Fire',
    'Under Lock and Key',
    'Taking Blood',
    'Mind Blown',
    'Kill Two Birds With One Gnome',
    'Busker',
    'Action Surge',
    'Fists of Fury',
    'A Grym Fate',
    'Non-Invasive Procedure',
    'Penny Pincher',
    'No Free Lunches',
    'Crash Landing',
    'Bottoms Up',
    'Shove Off',
    'Bookworm',
    'Punch Drunk',
    'Fetch Quest',
    'Repairing the Weave',
    'The Lich-Queen\'s Wrath',
    'To Bloom in Darkest Night',
  ],
  totalAchievements: 0, // Will be set when achievements are loaded
};
