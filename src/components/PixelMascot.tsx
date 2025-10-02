import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type MascotState = 'neutral' | 'happy' | 'excellent';

interface PixelMascotProps {
  state: MascotState;
}

const states = {
  neutral: {
    body: 'bg-gray-400',
    eyes: 'bg-black',
    mouth: 'w-2 h-px bg-black',
  },
  happy: {
    body: 'bg-blue-400',
    eyes: 'bg-black',
    mouth: 'w-3 h-2 border-b-2 border-l-2 border-r-2 border-black rounded-b-full',
  },
  excellent: {
    body: 'bg-green-400',
    eyes: 'bg-white',
    mouth: 'w-4 h-2 border-b-2 border-l-2 border-r-2 border-white rounded-b-full',
  },
};

export const PixelMascot = ({ state }: PixelMascotProps) => {
  const currentState = states[state];

  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      {state === 'excellent' && (
        <motion.div
          className="absolute w-16 h-16 bg-yellow-300 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <motion.div
        key={state}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative w-10 h-10 rounded-sm shadow-lg",
          currentState.body
        )}
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Eyes */}
        <div className="absolute top-3 left-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentState.eyes }}></div>
        <div className="absolute top-3 right-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentState.eyes }}></div>

        {/* Mouth */}
        <div className={cn("absolute bottom-2 left-1/2 -translate-x-1/2", currentState.mouth)}></div>
      </motion.div>
    </div>
  );
};