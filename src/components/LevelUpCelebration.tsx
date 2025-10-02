import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelMascot } from './PixelMascot';
import { useLanguage } from '@/contexts/LanguageContext';

interface LevelUpCelebrationProps {
  newLevel: number;
  isVisible: boolean;
}

const ConfettiPiece = ({ x, y, rotate, delay }: { x: number; y: number; rotate: number; delay: number }) => {
  const colors = ['#fde68a', '#fca5a5', '#86efac', '#93c5fd', '#c4b5fd'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute w-2 h-4"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: color,
      }}
      initial={{ opacity: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, 100, 200],
        rotate: [0, rotate, rotate * 2],
      }}
      transition={{
        duration: 2,
        delay,
        ease: 'easeOut',
      }}
    />
  );
};

export const LevelUpCelebration = ({ newLevel, isVisible }: LevelUpCelebrationProps) => {
  const { t } = useLanguage();
  const confetti = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * -50,
    rotate: Math.random() * 360,
    delay: Math.random() * 1.5,
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti container */}
          <div className="absolute inset-0 overflow-hidden">
            {confetti.map(c => (
              <ConfettiPiece key={c.id} {...c} />
            ))}
          </div>

          <motion.div
            className="relative flex flex-col items-center gap-4 p-8 bg-gradient-card border border-border rounded-xl shadow-2xl text-center"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
          >
            <PixelMascot state="excellent" />
            
            <motion.h1 
              className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-green-300 to-blue-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t('levelUp')}
            </motion.h1>

            <motion.div
              className="text-6xl font-bold text-foreground"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
            >
              LV. {newLevel}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};