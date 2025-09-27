import React from 'react';
import { cn } from '@/lib/utils';
import { ContentEditableDiv } from '../ContentEditableDiv';
import { BlockProps } from './types';

export const ListItemBlock: React.FC<BlockProps> = ({ block, onUpdate, onDelete, onAddBlock, commonProps, contentEditableRef }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onAddBlock(block.type);
    } else if (e.key === 'Backspace' && e.currentTarget.innerHTML === '') {
      e.preventDefault();
      e.stopPropagation();
      onDelete();
    }
  };

  const isNumbered = block.type === 'numbered';

  return (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 pt-1.5 select-none">
        {isNumbered ? (
          <span className="text-muted-foreground text-sm">1.</span>
        ) : (
          <span className="text-primary text-lg leading-none">•</span>
        )}
      </div>
      <ContentEditableDiv
        ref={contentEditableRef}
        initialHTML={block.content || ''}
        onBlur={(html) => onUpdate({ content: html })}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none text-foreground min-h-[24px] p-1",
          "border border-transparent focus:border-border rounded"
        )}
        data-placeholder="Item da lista"
        {...commonProps}
      />
    </div>
  );
};