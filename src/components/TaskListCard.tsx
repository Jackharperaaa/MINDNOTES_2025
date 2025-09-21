import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Task } from '@/types';
import { TaskItem } from './TaskItem';
import { Trash2, Circle, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskListCardProps {
  taskList: TaskList;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteList: (listId: string) => void;
  onComplete?: (completionTimeMinutes: number) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const TaskListCard = ({ 
  taskList, 
  onToggleTask, 
  onDeleteTask, 
  onDeleteList,
  onComplete,
  isMinimized = false,
  onToggleMinimize
}: TaskListCardProps) => {
  const { t } = useLanguage();
  const [isCompleted, setIsCompleted] = useState(false);
  const completedTasks = taskList.tasks.filter(task => task.completed).length;
  const totalTasks = taskList.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isFullyCompleted = completedTasks === totalTasks && totalTasks > 0;

  useEffect(() => {
    if (isFullyCompleted && !isCompleted && !taskList.completedAt) {
      setIsCompleted(true);
      
      // Calculate completion time in minutes
      const startTime = taskList.startedAt || taskList.createdAt;
      const completionTime = new Date();
      const completionTimeMinutes = Math.round((completionTime.getTime() - startTime.getTime()) / (1000 * 60));
      
      onComplete?.(completionTimeMinutes);
    }
  }, [isFullyCompleted, isCompleted, taskList.completedAt, taskList.startedAt, taskList.createdAt, onComplete]);

  return (
    <motion.div
        className={`
        bg-gradient-card border border-border rounded-lg p-5 shadow-card
        transition-all duration-300 relative
        ${isFullyCompleted ? 'border-success-border shadow-[0_0_20px_hsl(var(--success-neon))]' : ''}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-semibold text-foreground">
              {taskList.title}
            </h3>
            {taskList.videoUrl && (
              <motion.a
                href={taskList.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-md hover:bg-red-500/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-3 h-3" />
                {t('video')}
              </motion.a>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full transition-all duration-500 ${
                  isFullyCompleted ? 'bg-success' : 'bg-muted-foreground'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className={`text-xs font-medium ${
              isFullyCompleted ? 'text-success' : 'text-muted-foreground'
            }`}>
              {completedTasks}/{totalTasks}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-4">          
          {onToggleMinimize && (
            <motion.button
              onClick={onToggleMinimize}
              className="text-gray-400 hover:text-gray-300 transition-colors duration-200 p-1 hover:bg-accent rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMinimized ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </motion.button>
          )}
          
          <motion.button
            onClick={() => onDeleteList(taskList.id)}
            className="text-muted-foreground hover:text-destructive transition-colors duration-200 p-1 hover:bg-destructive/10 rounded"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* Tasks */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <AnimatePresence>
              {taskList.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  allTasksCompleted={isFullyCompleted}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};