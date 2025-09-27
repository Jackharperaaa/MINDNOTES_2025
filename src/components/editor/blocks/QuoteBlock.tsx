import React from 'react';
import { cn } from '@/lib/utils';
import { ContentEditableDiv } from '../ContentEditableDiv';
import { BlockProps } from './types';

export const QuoteBlock: React.FC<BlockProps> = ({ block, onUpdate, onDelete, onAddBlock, commonProps, contentEditableRef }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onAddBlock('text');
    } else if (e.key === 'Backspace' && e.currentTarget.innerHTML === '') {
      e.preventDefault();
      e.stopPropagation();
      onDelete();
    }
  };

  return (
    <blockquote className="border-l-4 border-primary pl-4 py-2 my-2">
      <ContentEditableDiv
        ref={contentEditableRef}
        initialHTML={block.content || ''}
        onBlur={(html) => onUpdate({ content: html })}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none text-foreground italic min-h-[24px]",
        )}
        data-placeholder="Citação"
        {...commonProps}
      />
    </blockquote>
  );
};