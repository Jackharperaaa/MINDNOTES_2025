export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface TaskList {
  id: string;
  title: string;
  tasks: Task[];
  createdAt: Date;
  completedAt?: Date;
  videoUrl?: string;
  startedAt?: Date; // Track when user started working on tasks
}

export interface EditorBlock {
  id: string;
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'numbered' | 'checklist' | 'toggle' | 'code' | 'quote' | 'link' | 'image' | 'video' | 'gif' | 'highlight' | 'divider';
  content: string;
  checked?: boolean; // for checklists
  collapsed?: boolean; // for toggle lists
  children?: EditorBlock[]; // for nested content
  style?: {
    color?: string;
    backgroundColor?: string;
  };
  metadata?: {
    level?: number; // for nested lists
    url?: string; // for links and media
    urls?: string[]; // for multiple images/videos/gifs
    alt?: string; // for images
    width?: number; // for media
    height?: number; // for media
  };
}

export interface FreeFormNote {
  id: string;
  title: string;
  content: string;
  blocks: EditorBlock[];
  createdAt: Date;
  updatedAt: Date;
}

export type NoteType = 'checklist' | 'freeform';

export interface UserProgress {
  level: number;
  experience: number;
  experienceToNext: number;
  completedTaskLists: number;
}

export interface AppState {
  activeTab: 'notes' | 'chat';
  taskLists: TaskList[];
  freeFormNotes: FreeFormNote[];
  userProgress: UserProgress;
}