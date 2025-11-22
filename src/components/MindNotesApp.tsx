import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState, TaskList, Task, UserProgress, FreeFormNote, EditorBlock } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { addExperience, getExperienceForTaskListCompletion } from '@/utils/levelSystem';
import { Sidebar } from './Sidebar';
import { LevelIndicator } from './LevelIndicator';
import { NotesSection } from './NotesSection';
import { ChatSection } from './ChatSection';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { LevelUpCelebration } from './LevelUpCelebration';
import { useSession } from '@/contexts/SessionContext'; // Import useSession
import { Button } from '@/components/ui/button'; // Import Button component
import { LogIn, LogOut } from 'lucide-react'; // Import icons
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const initialUserProgress: UserProgress = {
  level: 0,
  experience: 0,
  experienceToNext: 100,
  completedTaskLists: 0,
};

export const MindNotesApp = () => {
  const { t } = useLanguage();
  const { user, isLoading: isSessionLoading } = useSession(); // Get user and session loading state
  const navigate = useNavigate();

  const [appState, setAppState] = useLocalStorage<AppState>('mindnotes-state', {
    activeTab: 'notes',
    taskLists: [],
    freeFormNotes: [],
    userProgress: initialUserProgress,
  });

  // Ensure freeFormNotes exists (for backwards compatibility)
  const safeAppState = {
    ...appState,
    freeFormNotes: appState.freeFormNotes || []
  };
  
  const [showLevelUp, setShowLevelUp] = useState(false);

  const handleTabChange = (tab: AppState['activeTab']) => {
    setAppState(prev => ({ ...prev, activeTab: tab }));
  };

  const createTaskList = (title: string, taskTexts: string[], videoUrl?: string) => {
    if (!user) return; // Only allow if logged in
    const tasks: Task[] = taskTexts.map(text => ({
      id: `task-${Date.now()}-${Math.random()}`,
      text,
      completed: false,
      createdAt: new Date(),
    }));

    const newTaskList: TaskList = {
      id: `list-${Date.now()}`,
      title,
      tasks,
      createdAt: new Date(),
      ...(videoUrl && { videoUrl }),
    };

    setAppState(prev => ({
      ...prev,
      freeFormNotes: prev.freeFormNotes || [], // Ensure it exists
      taskLists: [newTaskList, ...prev.taskLists],
    }));
  };

  const toggleTask = (listId: string, taskId: string) => {
    if (!user) return; // Only allow if logged in
    setAppState(prev => ({
      ...prev,
      taskLists: prev.taskLists.map(list =>
        list.id === listId
          ? {
              ...list,
              // Set startedAt when first task is being worked on
              startedAt: list.startedAt || new Date(),
              tasks: list.tasks.map(task =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : list
      ),
    }));
  };

  const deleteTask = (listId: string, taskId: string) => {
    if (!user) return; // Only allow if logged in
    setAppState(prev => ({
      ...prev,
      taskLists: prev.taskLists.map(list =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.filter(task => task.id !== taskId),
            }
          : list
      ),
    }));
  };

  const deleteTaskList = (listId: string) => {
    if (!user) return; // Only allow if logged in
    setAppState(prev => ({
      ...prev,
      taskLists: prev.taskLists.filter(list => list.id !== listId),
    }));
  };

  const completeTaskList = (listId: string, completionTimeMinutes: number) => {
    if (!user) return; // Only allow if logged in
    const taskList = appState.taskLists.find(list => list.id === listId);
    if (!taskList || taskList.completedAt) return;

    const xpGained = getExperienceForTaskListCompletion(taskList.tasks.length, completionTimeMinutes);
    const previousLevel = appState.userProgress.level;
    const newProgress = addExperience(appState.userProgress, xpGained);
    
    setAppState(prev => ({
      ...prev,
      taskLists: prev.taskLists.map(list =>
        list.id === listId
          ? { ...list, completedAt: new Date() }
          : list
      ),
      userProgress: {
        ...newProgress,
        completedTaskLists: prev.userProgress.completedTaskLists + 1,
      },
    }));

    // Show level up animation if leveled up
    if (newProgress.level > previousLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  };

  // Free form note functions
  const createFreeFormNote = (title: string, content: string, blocks?: EditorBlock[]) => {
    if (!user) return; // Only allow if logged in
    const newNote: FreeFormNote = {
      id: `note-${Date.now()}`,
      title,
      content,
      blocks: blocks || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAppState(prev => ({
      ...prev,
      freeFormNotes: [newNote, ...(prev.freeFormNotes || [])],
    }));
  };

  const updateFreeFormNote = (id: string, title: string, content: string, blocks?: EditorBlock[]) => {
    if (!user) return; // Only allow if logged in
    setAppState(prev => ({
      ...prev,
      freeFormNotes: (prev.freeFormNotes || []).map(note =>
        note.id === id
          ? { ...note, title, content, blocks: blocks || note.blocks || [], updatedAt: new Date() }
          : note
      ),
    }));
  };

  const deleteFreeFormNote = (id: string) => {
    if (!user) return; // Only allow if logged in
    setAppState(prev => ({
      ...prev,
      freeFormNotes: (prev.freeFormNotes || []).filter(note => note.id !== id),
    }));
  };

  const createTaskListFromAI = (title: string, tasks: string[], videoUrl?: string) => {
    if (!user) return; // Only allow if logged in
    const newTasks: Task[] = tasks.map(text => ({
      id: `task-${Date.now()}-${Math.random()}`,
      text,
      completed: false,
      createdAt: new Date(),
    }));

    const newTaskList: TaskList = {
      id: `list-${Date.now()}`,
      title,
      tasks: newTasks,
      createdAt: new Date(),
      ...(videoUrl && { videoUrl }),
    };

    // Single state update to avoid race conditions
    setAppState(prev => ({
      ...prev,
      freeFormNotes: prev.freeFormNotes || [], // Ensure it exists
      taskLists: [newTaskList, ...prev.taskLists],
      activeTab: 'notes',
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The SessionContextProvider will handle the redirect to /login
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        activeTab={safeAppState.activeTab} 
        onTabChange={handleTabChange} 
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-gradient-main border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-foreground uppercase tracking-wide">
              {safeAppState.activeTab === 'notes' ? t('notes') : t('aiChat')}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSelector />
            {user ? (
              <Button 
                variant="outline" 
                size="sm"
                className="border-border bg-card hover:bg-accent transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="border-border bg-card hover:bg-accent transition-colors"
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          {user ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={safeAppState.activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.2,
                  ease: "easeInOut"
                }}
                className="absolute inset-0"
              >
                {safeAppState.activeTab === 'notes' ? (
                  <NotesSection
                    taskLists={safeAppState.taskLists}
                    freeFormNotes={safeAppState.freeFormNotes}
                    userProgress={safeAppState.userProgress}
                    onCreateTaskList={createTaskList}
                    onCreateFreeFormNote={createFreeFormNote}
                    onUpdateFreeFormNote={updateFreeFormNote}
                    onDeleteFreeFormNote={deleteFreeFormNote}
                    onToggleTask={toggleTask}
                    onDeleteTask={deleteTask}
                    onDeleteList={deleteTaskList}
                    onTaskListComplete={completeTaskList}
                  />
                ) : (
                  <ChatSection onCreateTaskListFromAI={createTaskListFromAI} />
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">Bem-vindo ao Mind Notes!</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Para organizar suas ideias com o poder da IA e gerenciar suas tarefas, por favor, faça login.
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3"
                onClick={handleLogin}
              >
                <LogIn className="h-5 w-5 mr-2" />
                Fazer Login
              </Button>
            </div>
          )}
          
          {/* Level Indicator - Fixed Position (only if user is logged in) */}
          {user && (
            <LevelIndicator 
              userProgress={safeAppState.userProgress} 
            />
          )}
        </div>
      </div>

      <LevelUpCelebration 
        isVisible={showLevelUp} 
        newLevel={safeAppState.userProgress.level} 
      />
    </div>
  );
};