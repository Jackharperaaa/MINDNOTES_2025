import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { AppState } from '@/types';

export const useAppState = () => {
  const [appState, setAppState] = useLocalStorage<AppState>('mindnotes-state', {
    activeTab: 'notes',
    taskLists: [],
    freeFormNotes: [],
    userProgress: {
      level: 0,
      experience: 0,
      experienceToNext: 100,
      completedTaskLists: 0,
    },
  });

  // Funções memoizadas para melhor performance
  const createTaskList = useCallback((title: string, taskTexts: string[], videoUrl?: string) => {
    // ... implementação existente
  }, [appState.taskLists, setAppState]);

  const toggleTask = useCallback((listId: string, taskId: string) => {
    // ... implementação existente
  }, [appState.taskLists, setAppState]);

  // ... outras funções memoizadas

  return {
    appState,
    setAppState,
    createTaskList,
    toggleTask,
    // ... outras funções
  };
};