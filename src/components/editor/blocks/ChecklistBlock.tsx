import React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { BlockProps } from './types';

export const ChecklistBlock: React.FC<BlockProps> = ({ block, onUpdate, onDelete, onAddBlock, contentEditableRef }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onAddBlock('checklist');
    } else if (e.key === 'Backspace' && (e.target as HTMLTextAreaElement).value === '') {
      e.preventDefault();
      e.stopPropagation();
      onDelete();
    }
  };

  return (
    <div className="flex items-start gap-2">
      <Checkbox
        checked={block.checked || false}
        onCheckedChange={(checked) => onUpdate({ checked: !!checked })}
        className="mt-1"
      />
      <textarea
        ref={contentEditableRef}
        value={block.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none text-foreground min-h-[24px] flex-1",
          block.checked && "line-through opacity-60"
        )}
        placeholder="Task"
      />
    </div>
  );
};