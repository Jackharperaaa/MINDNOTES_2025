import React from 'react';
import { cn } from '@/lib/utils';
import { ContentEditableDiv } from '../ContentEditableDiv';
import { BlockProps } from './types';

export const TextBlock: React.FC<BlockProps> = ({ block, onUpdate, onDelete, onAddBlock, commonProps, contentEditableRef }) => {
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
    <ContentEditableDiv
      ref={contentEditableRef}
      initialHTML={block.content || ''}
      onHTMLChange={(html) => onUpdate({ content: html })}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full bg-transparent border-none outline-none resize-none text-foreground min-h-[24px] p-2",
        "border border-transparent focus:border-border rounded"
      )}
      data-placeholder="Type something..."
      style={{
        minHeight: '24px',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
      }}
      {...commonProps}
    />
  );
};