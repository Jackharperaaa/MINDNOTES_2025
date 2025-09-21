import { motion, AnimatePresence } from 'framer-motion';
import { UserProgress } from '@/types';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
interface LevelIndicatorProps {
  userProgress: UserProgress;
  showLevelUp?: boolean;
}
export const LevelIndicator = ({
  userProgress,
  showLevelUp = false
}: LevelIndicatorProps) => {
  const {
    t
  } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (showLevelUp) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp]);
  const progressPercentage = userProgress.experienceToNext > 0 ? userProgress.experience % 100 / 100 * 100 : 100;
  
  return (
    <motion.div 
      className="fixed bottom-4 left-4 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-lg">
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
        
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
            >
              Level Up! +{userProgress.level}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};