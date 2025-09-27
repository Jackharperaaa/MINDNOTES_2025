import React from 'react';
import { EditorBlock as BlockType } from '@/types';
import { BlockProps } from './blocks/types';

// Import all block components
import { HeadingBlock } from './blocks/HeadingBlock';
import { TextBlock } from './blocks/TextBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ChecklistBlock } from './blocks/ChecklistBlock';
import { ImageBlock } from './blocks/ImageBlock';
// NOTE: For brevity, other block components like Quote, List, Video, etc. would be imported here.
// The current implementation will default to TextBlock for missing components.

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
  // TODO: Add other block types here
  // gif: GifBlock,
  // video: VideoBlock,
  // link: LinkBlock,
  // quote: QuoteBlock,
  // bullet: ListItemBlock,
  // numbered: ListItemBlock,
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