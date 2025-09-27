import React from 'react';
import { EditorBlock as BlockType } from '@/types';
import { BlockProps } from './blocks/types';

// Import all block components
import { HeadingBlock } from './blocks/HeadingBlock';
import { TextBlock } from './blocks/TextBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ChecklistBlock } from './blocks/ChecklistBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { ListItemBlock } from './blocks/ListItemBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { GifBlock } from './blocks/GifBlock';
import { LinkBlock } from './blocks/LinkBlock';

interface BlockRendererProps extends Omit<BlockProps, 'block' | 'onUpdate'> {
  block: BlockType;
  onUpdate: (index: number, block: Partial<BlockType>) => void;
}

const blockComponentMap: { [key: string]: React.FC<BlockProps> } = {
  text: TextBlock,
  heading1: HeadingBlock,
  heading2: HeadingBlock,
  heading3: HeadingBlock,
  code: CodeBlock,
  checklist: ChecklistBlock,
  image: ImageBlock,
  bullet: ListItemBlock,
  numbered: ListItemBlock,
  quote: QuoteBlock,
  video: VideoBlock,
  gif: GifBlock,
  link: LinkBlock,
};

export const BlockRenderer: React.FC<BlockRendererProps> = (props) => {
  const { block, index, onUpdate, ...rest } = props;

  const handleUpdate = (blockUpdate: Partial<BlockType>) => {
    onUpdate(index, blockUpdate);
  };

  const Component = blockComponentMap[block.type] || TextBlock;
  
  const componentProps: BlockProps = {
    ...rest,
    block,
    index,
    onUpdate: handleUpdate,
  };

  return <Component {...componentProps} />;
};