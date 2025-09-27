import React from 'react';
import { cn } from '@/lib/utils';
import { ContentEditableDiv } from '../ContentEditableDiv';
import { BlockProps } from './types';

export const HeadingBlock: React.FC<BlockProps> = ({ block, onUpdate, onDelete, onAddBlock, commonProps, contentEditableRef }) => {
  const level = parseInt(block.type.replace('heading', ''), 10);

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

  const classMap = {
    1: "text-3xl font-bold min-h-[48px]",
    2: "text-2xl font-semibold min-h-[40px]",
    3: "text-xl font-medium min-h-[32px]",
  };

  return (
    <ContentEditableDiv
      ref={contentEditableRef}
      initialHTML={block.content || ''}
      onBlur={(html) => onUpdate({ content: html })}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full bg-transparent border-none outline-none resize-none text-foreground p-2",
        "border border-transparent focus:border-border rounded",
        classMap[level as keyof typeof classMap]
      )}
      data-placeholder={`Heading ${level}`}
      {...commonProps}
    />
  );
};