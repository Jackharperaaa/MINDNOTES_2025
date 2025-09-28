import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorBlock } from './editor/EditorBlock';
import { FormatMenu } from './FormatMenu';
import { EditorBlock as BlockType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlockEditorProps {
  blocks: BlockType[];
  onBlocksChange: (blocks: BlockType[] | ((prevBlocks: BlockType[]) => BlockType[])) => void;
  onCreateSubpage: (title: string) => void;
}

export const BlockEditor = ({
  blocks,
  onBlocksChange,
  onCreateSubpage
}: BlockEditorProps) => {
  const { t } = useLanguage();
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);

  const createBlock = (type: string, content: string = ''): BlockType => {
    return {
      id: `block-${Date.now()}-${Math.random()}`,
      type: type as BlockType['type'],
      content,
      ...(type === 'checklist' && { checked: false }),
      ...(type === 'toggle' && { collapsed: false, children: [] }),
      ...(type === 'link' && { metadata: { url: '' } }),
      ...(type === 'image' && { metadata: { url: '', alt: '' } }),
      ...(type === 'video' && { metadata: { url: '' } }),
      ...(type === 'gif' && { metadata: { url: '', alt: '' } })
    };
  };

  const addBlock = (index: number, type: string) => {
    const newBlock = createBlock(type);
    onBlocksChange(prevBlocks => {
      const newBlocks = [...prevBlocks];
      newBlocks.splice(index, 0, newBlock);
      return newBlocks;
    });
  };

  const updateBlock = (index: number, partialBlock: Partial<BlockType>) => {
    onBlocksChange(prevBlocks => {
      const newBlocks = [...prevBlocks];
      const currentBlock = newBlocks[index];
      if (currentBlock) {
        newBlocks[index] = { ...currentBlock, ...partialBlock };
      }
      return newBlocks;
    });
  };

  const deleteBlock = (index: number) => {
    if (blocks.length === 1) return; // Keep at least one block
    onBlocksChange(prevBlocks => prevBlocks.filter((_, i) => i !== index));
  };

  const handleFormatSelect = (type: string, value?: string) => {
    if (selectedBlockIndex !== null) {
      addBlock(selectedBlockIndex + 1, type);
    } else {
      const newBlock = createBlock(type, value || '');
      onBlocksChange(prevBlocks => [...prevBlocks, newBlock]);
    }
    setShowFormatMenu(false);
    setSelectedBlockIndex(null);
  };

  // Initialize with one empty text block if no blocks exist
  useEffect(() => {
    if (blocks.length === 0) {
      onBlocksChange([createBlock('text')]);
    }
  }, [blocks.length, onBlocksChange]);

  return (
    <div className="flex-1 relative">
      {/* Add block button */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => {
          setSelectedBlockIndex(null);
          setShowFormatMenu(!showFormatMenu);
        }} className="text-primary">
          <Plus className="w-4 h-4 mr-2" />
          {t('add')}
        </Button>
      </div>

      {/* Format menu */}
      <AnimatePresence>
        {showFormatMenu && (
          <FormatMenu 
            onSelect={handleFormatSelect} 
            onClose={() => {
              setShowFormatMenu(false);
              setSelectedBlockIndex(null);
            }} 
          />
        )}
      </AnimatePresence>

      {/* Editor blocks */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {blocks.map((block, index) => (
            <EditorBlock
              key={block.id}
              block={block}
              index={index}
              onUpdate={updateBlock}
              onDelete={deleteBlock}
              onAddBlock={(blockIndex, type) => addBlock(blockIndex + 1, type)}
              onCreateSubpage={onCreateSubpage}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add block at end */}
      <div className="mt-4"></div>
    </div>
  );
};