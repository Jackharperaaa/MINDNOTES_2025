import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { TaskList, Task, UserProgress, FreeFormNote, NoteType, EditorBlock } from '@/types';
import { TaskListCard } from './TaskListCard';
import { FreeFormEditor } from './FreeFormEditor';
import { CreateNoteDialog } from './CreateNoteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotesSectionProps {
  taskLists: TaskList[];
  freeFormNotes: FreeFormNote[];
  userProgress: UserProgress;
  onCreateTaskList: (title: string, tasks: string[], videoUrl?: string) => void;
  onCreateFreeFormNote: (title: string, content: string, blocks?: EditorBlock[]) => void;
  onUpdateFreeFormNote: (id: string, title: string, content: string, blocks?: EditorBlock[]) => void;
  onDeleteFreeFormNote: (id: string) => void;
  onToggleTask: (listId: string, taskId: string) => void;
  onDeleteTask: (listId: string, taskId: string) => void;
  onDeleteList: (listId: string) => void;
  onTaskListComplete: (listId: string, completionTimeMinutes: number) => void;
}

export const NotesSection = ({
  taskLists,
  freeFormNotes,
  userProgress,
  onCreateTaskList,
  onCreateFreeFormNote,
  onUpdateFreeFormNote,
  onDeleteFreeFormNote,
  onToggleTask,
  onDeleteTask,
  onDeleteList,
  onTaskListComplete,
}: NotesSectionProps) => {
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<FreeFormNote | null>(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [newTasks, setNewTasks] = useState<string[]>(['']);
  const [minimizedNotes, setMinimizedNotes] = useState<Set<string>>(new Set());

  const handleNoteTypeSelect = (type: NoteType) => {
    if (type === 'checklist') {
      setIsChecklistDialogOpen(true);
    } else {
      setEditingNote({
        id: '',
        title: '',
        content: '',
        blocks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  };

  const handleCreateList = () => {
    if (newListTitle.trim() && newTasks.some(task => task.trim())) {
      const validTasks = newTasks.filter(task => task.trim());
      onCreateTaskList(newListTitle.trim(), validTasks);
      setNewListTitle('');
      setNewTasks(['']);
      setIsChecklistDialogOpen(false);
    }
  };

  const handleSaveFreeFormNote = (title: string, content: string, blocks?: EditorBlock[]) => {
    if (editingNote?.id) {
      onUpdateFreeFormNote(editingNote.id, title, content, blocks);
    } else {
      onCreateFreeFormNote(title, content, blocks);
    }
    setEditingNote(null);
  };

  const handleDeleteFreeFormNote = () => {
    if (editingNote?.id) {
      onDeleteFreeFormNote(editingNote.id);
      setEditingNote(null);
    }
  };

  const addTaskField = () => {
    setNewTasks([...newTasks, '']);
  };

  const updateTask = (index: number, value: string) => {
    const updated = [...newTasks];
    updated[index] = value;
    setNewTasks(updated);
  };

  const removeTask = (index: number) => {
    if (newTasks.length > 1) {
      const updated = newTasks.filter((_, i) => i !== index);
      setNewTasks(updated);
    }
  };

  const totalNotes = taskLists.length + freeFormNotes.length;

  const toggleNoteMinimize = (noteId: string) => {
    const newMinimized = new Set(minimizedNotes);
    if (newMinimized.has(noteId)) {
      newMinimized.delete(noteId);
    } else {
      newMinimized.add(noteId);
    }
    setMinimizedNotes(newMinimized);
  };

  if (editingNote) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <FreeFormEditor
          note={editingNote.id ? editingNote : undefined}
          onSave={handleSaveFreeFormNote}
          onDelete={editingNote.id ? handleDeleteFreeFormNote : undefined}
          onCancel={() => setEditingNote(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">{t('notes')}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {totalNotes} notes • {userProgress.completedTaskLists} {t('completed').toLowerCase()}
            </p>
          </div>

          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 h-9"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('create').toUpperCase()}
          </Button>

          <CreateNoteDialog
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            onSelect={handleNoteTypeSelect}
          />

          <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{t('createTaskList')}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('taskListTitle')}
                </label>
                <Input
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder={t('enterTitle')}
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('tasks')}
                </label>
                <div className="space-y-2">
                  <AnimatePresence>
                    {newTasks.map((task, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                      >
                        <Input
                          value={task}
                          onChange={(e) => updateTask(index, e.target.value)}
                          placeholder={`${t('enterTask')} ${index + 1}...`}
                          className="bg-secondary border-border"
                        />
                        {newTasks.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTask(index)}
                            className="px-2"
                          >
                            ×
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTaskField}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addTask')}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsChecklistDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateList}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!newListTitle.trim() || !newTasks.some(task => task.trim())}
                >
                  {t('create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes */}
      <div className="grid gap-6">
        <AnimatePresence>
          {/* Free Form Notes */}
          {freeFormNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-border rounded-lg cursor-pointer"
              onClick={() => setEditingNote(note)}
            >
              <div
                className="flex items-center justify-between p-4 border-b border-border"
              >
                <h3
                  className="text-lg font-semibold text-foreground"
                  dangerouslySetInnerHTML={{ __html: note.title }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNoteMinimize(note.id);
                  }}
                  className="text-gray-400 hover:text-gray-300 transition-colors z-10 relative"
                >
                  {minimizedNotes.has(note.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <AnimatePresence>
                {!minimizedNotes.has(note.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 hover:bg-accent/50 transition-colors"
                  >
                    <div 
                      className="text-muted-foreground text-sm line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: note.content.substring(0, 200) + '...' }}
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Task Lists */}
          {taskLists.map((taskList) => (
            <TaskListCard
              key={taskList.id}
              taskList={taskList}
              onToggleTask={(taskId) => onToggleTask(taskList.id, taskId)}
              onDeleteTask={(taskId) => onDeleteTask(taskList.id, taskId)}
              onDeleteList={() => onDeleteList(taskList.id)}
              onComplete={(completionTimeMinutes) => onTaskListComplete(taskList.id, completionTimeMinutes)}
              isMinimized={minimizedNotes.has(taskList.id)}
              onToggleMinimize={() => toggleNoteMinimize(taskList.id)}
            />
          ))}
        </AnimatePresence>

        {totalNotes === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No task lists yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first task list to get started with organizing your thoughts
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Note
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};