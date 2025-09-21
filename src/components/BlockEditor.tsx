import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorBlock } from './EditorBlock';
import { FormatMenu } from './FormatMenu';
import { EditorBlock as BlockType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
interface BlockEditorProps {
  blocks: BlockType[];
  onBlocksChange: (blocks: BlockType[]) => void;
  onCreateSubpage: (title: string) => void;
}
export const BlockEditor = ({
  blocks,
  onBlocksChange,
  onCreateSubpage
}: BlockEditorProps) => {
  const {
    t
  } = useLanguage();
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const createBlock = (type: string, content: string = ''): BlockType => {
    return {
      id: `block-${Date.now()}-${Math.random()}`,
      type: type as BlockType['type'],
      content,
      ...(type === 'checklist' && {
        checked: false
      }),
      ...(type === 'toggle' && {
        collapsed: false,
        children: []
      }),
      ...(type === 'link' && {
        metadata: {
          url: ''
        }
      }),
      ...(type === 'image' && {
        metadata: {
          url: '',
          alt: ''
        }
      }),
      ...(type === 'video' && {
        metadata: {
          url: ''
        }
      }),
      ...(type === 'gif' && {
        metadata: {
          url: '',
          alt: ''
        }
      })
    };
  };
  const addBlock = (index: number, type: string) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    onBlocksChange(newBlocks);
  };
  const updateBlock = (index: number, block: BlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index] = block;
    onBlocksChange(newBlocks);
  };
  const deleteBlock = (index: number) => {
    if (blocks.length === 1) return; // Keep at least one block
    const newBlocks = blocks.filter((_, i) => i !== index);
    onBlocksChange(newBlocks);
  };
  const handleFormatSelect = (type: string, value?: string) => {
    if (selectedBlockIndex !== null) {
      const newBlock = createBlock(type, value || '');
      addBlock(selectedBlockIndex + 1, type);
    } else {
      const newBlock = createBlock(type, value || '');
      onBlocksChange([...blocks, newBlock]);
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
  return <div className="flex-1 relative">
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
          {blocks.map((block, index) => <EditorBlock key={block.id} block={block} index={index} onUpdate={updateBlock} onDelete={deleteBlock} onAddBlock={(blockIndex, type) => {
          addBlock(blockIndex, type);
        }} onCreateSubpage={onCreateSubpage} />)}
        </AnimatePresence>
      </div>

      {/* Add block at end */}
      <div className="mt-4">
        
      </div>
    </div>;
};