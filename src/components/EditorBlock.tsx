import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Bold,
  Italic,
  Underline,
  Link,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorBlock as BlockType } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelectionManager } from '@/hooks/useSelectionManager';
import { TextFormattingToolbar } from './TextFormattingToolbar';

interface EditorBlockProps {
  block: BlockType;
  index: number;
  onUpdate: (index: number, block: BlockType) => void;
  onDelete: (index: number) => void;
  onAddBlock: (index: number, type: string) => void;
  onCreateSubpage: (title: string) => void;
}

export const EditorBlock = ({
  block,
  index,
  onUpdate,
  onDelete,
  onAddBlock,
  onCreateSubpage
}: EditorBlockProps) => {
  const { t } = useLanguage();
  const { saveSelection } = useSelectionManager();
  const [isFocused, setIsFocused] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const calculateToolbarPosition = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && contentRef.current) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY - 40
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    setIsFocused(true);
    calculateToolbarPosition();
  };

  const handleContentBlur = () => {
    setIsFocused(false);
    setShowToolbar(false);
  };

  const handleContentChange = (html: string) => {
    onUpdate(index, { ...block, content: html });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBlock(index + 1, 'text');
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onDelete(index);
    }
  };

  const commonProps = {
    onMouseUp: () => {
      saveSelection();
      calculateToolbarPosition();
    },
    onKeyUp: () => {
      saveSelection();
      calculateToolbarPosition();
    },
    onFocus: () => {
      saveSelection();
      calculateToolbarPosition();
    },
    onClick: handleContentClick,
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading1':
        return (
          <h1
            ref={contentRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: block.content }}
            onBlur={(e) => handleContentChange(e.currentTarget.innerHTML)}
            onKeyDown={handleKeyDown}
            className="text-2xl font-bold outline-none"
            {...commonProps}
          />
        );
      
      case 'heading2':
        return (
          <h2
            ref={contentRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: block.content }}
            onBlur={(e) => handleContentChange(e.currentTarget.innerHTML)}
            onKeyDown={handleKeyDown}
            className="text-xl font-semibold outline-none"
            {...commonProps}
          />
        );
      
      case 'heading3':
        return (
          <h3
            ref={contentRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: block.content }}
            onBlur={(e) => handleContentChange(e.currentTarget.innerHTML)}
            onKeyDown={handleKeyDown}
            className="text-lg font-medium outline-none"
            {...commonProps}
          />
        );
      
      case 'checklist':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.checked}
              onChange={(e) => onUpdate(index, { ...block, checked: e.target.checked })}
              className="w-4 h-4"
            />
            <div
              ref={contentRef}
              contentEditable
              dangerouslySetInnerHTML={{ __html: block.content }}
              onBlur={(e) => handleContentChange(e.currentTarget.innerHTML)}
              onKeyDown={handleKeyDown}
              className="flex-1 outline-none"
              {...commonProps}
            />
          </div>
        );
      
      default:
        return (
          <div
            ref={contentRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: block.content }}
            onBlur={(e) => handleContentChange(e.currentTarget.innerHTML)}
            onKeyDown={handleKeyDown}
            className="outline-none"
            {...commonProps}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`relative group p-2 rounded-lg transition-colors ${
        isFocused ? 'bg-accent/50' : 'hover:bg-accent/20'
      }`}
    >
      {/* Block content */}
      {renderBlockContent()}

      {/* Toolbar de formatação */}
      <TextFormattingToolbar 
        visible={showToolbar}
        position={toolbarPosition}
      />

      {/* Add block button */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={() => setShowFormatMenu(true)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete button */}
      <AnimatePresence>
        {isFocused && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onDelete(index)}
            className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors p-1"
          >
            <Trash2 className="w-3 h-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};