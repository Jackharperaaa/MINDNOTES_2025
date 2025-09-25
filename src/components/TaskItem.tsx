import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Task } from '@/types';
import { memo } from 'react';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  allTasksCompleted?: boolean;
}

export const TaskItem = memo(({ task, onToggle, onDelete, allTasksCompleted = false }: TaskItemProps) => {
  return (
    <motion.div
      className="flex items-center gap-3 p-3 bg-secondary rounded-md border border-border group hover:bg-accent transition-colors"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5, scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <motion.button
        onClick={() => onToggle(task.id)}
        className={`
          w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 relative
          ${task.completed 
            ? allTasksCompleted 
              ? 'bg-success border-success text-success-foreground shadow-[0_0_10px_hsl(var(--success-neon))] scale-105' 
              : 'bg-primary border-primary text-primary-foreground'
            : 'border-muted-foreground hover:border-foreground hover:shadow-[0_0_5px_hsl(var(--foreground)/0.1)]'
          }
        `}
        whileHover={{ scale: task.completed ? 1.05 : 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence>
          {task.completed && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ duration: 0.3, ease: "backOut" }}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <motion.span
        className={`
          flex-1 text-sm transition-all duration-200
          ${task.completed 
            ? 'text-muted-foreground line-through opacity-50' 
            : 'text-foreground'
          }
        `}
        animate={{
          opacity: task.completed ? 0.5 : 1,
        }}
      >
        {task.text}
      </motion.span>

      <motion.button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-60 text-muted-foreground hover:text-destructive transition-all duration-200 p-1 hover:bg-destructive/10 rounded"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
});