import { EditorBlock as BlockType } from '@/types';
import { RefObject } from 'react';

export interface BlockProps {
  block: BlockType;
  onUpdate: (block: Partial<BlockType>) => void;
  onDelete: () => void;
  onAddBlock: (type: string) => void;
  commonProps: Record<string, any>;
  contentEditableRef: RefObject<any>;
  index: number;
  setExpandedImageUrl?: (url: string | null) => void;
}