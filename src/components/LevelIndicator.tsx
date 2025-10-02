import { motion } from 'framer-motion';
import { UserProgress } from '@/types';
import { PixelMascot } from './PixelMascot';

interface LevelIndicatorProps {
  userProgress: UserProgress;
}

export const LevelIndicator = ({
  userProgress,
}: LevelIndicatorProps) => {
  const progressPercentage = userProgress.experienceToNext > 0 ? (userProgress.experience % 100) / 100 * 100 : 100;

  const getMascotState = () => {
    if (userProgress.level >= 5) return 'excellent';
    if (userProgress.level >= 2) return 'happy';
    return 'neutral';
  };

  return (
    <motion.div 
      className="fixed bottom-4 left-4 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-2">
        <PixelMascot state={getMascotState()} />
        <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-lg relative">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              LV. {userProgress.level}
            </span>
            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {userProgress.experience} XP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};