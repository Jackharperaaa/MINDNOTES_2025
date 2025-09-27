import React from 'react';
import { cn } from '@/lib/utils';
import { BlockProps } from './types';

export const CodeBlock: React.FC<BlockProps> = ({ block, onUpdate, onDelete, onAddBlock, contentEditableRef }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onAddBlock('text');
    } else if (e.key === 'Backspace' && (e.target as HTMLTextAreaElement).value === '') {
      e.preventDefault();
      e.stopPropagation();
      onDelete();
    }
  };

  return (
    <textarea
      ref={contentEditableRef}
      value={block.content}
      onChange={(e) => onUpdate({ content: e.target.value })}
      onKeyDown={handleKeyDown}
      className={cn("w-full bg-secondary p-3 rounded border-border text-foreground font-mono text-sm min-h-[60px] resize-none")}
      placeholder="Enter code..."
    />
  );
};