import { UserProgress } from '@/types';

export const calculateExperienceForLevel = (level: number): number => {
  return level * 100 + (level - 1) * 50; // Progressive XP requirements
};

export const addExperience = (currentProgress: UserProgress, xpGained: number): UserProgress => {
  const newExperience = currentProgress.experience + xpGained;
  let newLevel = currentProgress.level;
  let experienceToNext = currentProgress.experienceToNext - xpGained;

  // Check for level up
  while (experienceToNext <= 0 && newLevel < 100) {
    newLevel++;
    const nextLevelXP = calculateExperienceForLevel(newLevel + 1);
    const currentLevelXP = calculateExperienceForLevel(newLevel);
    experienceToNext = nextLevelXP - newExperience;
  }

  return {
    ...currentProgress,
    level: newLevel,
    experience: newExperience,
    experienceToNext: Math.max(0, experienceToNext),
  };
};

export const getExperienceForTaskListCompletion = (
  taskCount: number, 
  completionTimeMinutes: number
): number => {
  // Base XP calculation
  const baseXP = Math.max(20, taskCount * 5);
  
  // Time-based multiplier
  let timeMultiplier = 1;
  
  if (completionTimeMinutes < 4) {
    // Very fast completion - minimum XP (1 XP)
    return 1;
  } else if (completionTimeMinutes >= 4 && completionTimeMinutes <= 10) {
    // Fast completion - reduced XP
    timeMultiplier = 0.3;
  } else if (completionTimeMinutes > 10 && completionTimeMinutes <= 30) {
    // Normal completion - standard XP
    timeMultiplier = 1;
  } else if (completionTimeMinutes > 30 && completionTimeMinutes <= 60) {
    // Longer completion - bonus XP
    timeMultiplier = 1.5;
  } else {
    // Very long completion - maximum bonus
    timeMultiplier = 2;
  }
  
  return Math.floor(baseXP * timeMultiplier);
};