import React, { useState, useRef, useEffect, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorBlock as BlockType } from '@/types';
import { cn } from '@/lib/utils';
import { TextFormattingToolbar } from './TextFormattingToolbar';
import { LinkDialog } from './LinkDialog';
import { BlockRenderer } from './BlockRenderer';

interface EditorBlockProps {
  block: BlockType;
  index: number;
  onUpdate: (index: number, block: Partial<BlockType>) => void;
  onDelete: (index: number) => void;
  onAddBlock: (index: number, type: string) => void;
  onCreateSubpage: (title: string) => void;
  level?: number;
}

export const EditorBlock = ({ 
  block, 
  index, 
  onUpdate, 
  onDelete, 
  onAddBlock,
  level = 0 
}: EditorBlockProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [lastSelectionRange, setLastSelectionRange] = useState<Range | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  
  const contentEditableRef = useRef<HTMLDivElement | HTMLTextAreaElement>(null);
  const blockContainerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const calculateToolbarPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowToolbar(false);
      setLastSelectionRange(null);
      return;
    }

    const range = selection.getRangeAt(0);
    setLastSelectionRange(range.cloneRange());

    const rect = range.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const x = rect.left + window.scrollX + rect.width / 2 - 150;
    const y = rect.top + scrollTop - 50;
    
    setToolbarPosition({ x: Math.max(10, x), y: Math.max(10, y) });
    setShowToolbar(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        blockContainerRef.current && !blockContainerRef.current.contains(event.target as Node) &&
        toolbarRef.current && !toolbarRef.current.contains(event.target as Node)
      ) {
        setShowToolbar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (link && link.href) {
      e.preventDefault();
      e.stopPropagation();
      window.open(link.href, '_blank');
    }
  };

  const applyFormat = (command: string, value?: string) => {
    if (lastSelectionRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(lastSelectionRange);
        document.execCommand(command, false, value);
        
        if (contentEditableRef.current) {
          (contentEditableRef.current as HTMLElement).focus();
        }
        
        if (selection.rangeCount > 0) {
          setLastSelectionRange(selection.getRangeAt(0).cloneRange());
        }
      }
    }
  };

  const handleLinkSubmit = (url: string) => {
    applyFormat('createLink', url);
    setIsLinkDialogOpen(false);
  };

  const commonProps = {
    onMouseUp: calculateToolbarPosition,
    onKeyUp: calculateToolbarPosition,
    onFocus: () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) calculateToolbarPosition();
    },
    onBlur: () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        setLastSelectionRange(selection.getRangeAt(0).cloneRange());
      }
    },
    onClick: handleContentClick,
  };

  return (
    <motion.div
      ref={blockContainerRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("group relative", level > 0 && "ml-6")}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -left-8 top-0 flex flex-col gap-1"
          >
            <Button size="sm" variant="ghost" className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => onAddBlock(index + 1, 'text')}>
              <Plus className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => onDelete(index)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-2">
        <BlockRenderer
          block={block}
          index={index}
          onUpdate={(idx, partialBlock) => onUpdate(idx, { ...block, ...partialBlock })}
          onDelete={() => onDelete(index)}
          onAddBlock={(type) => onAddBlock(index + 1, type)}
          commonProps={commonProps}
          contentEditableRef={contentEditableRef}
          setExpandedImageUrl={setExpandedImageUrl}
        />
      </div>

      {showToolbar && (
        <TextFormattingToolbar 
          toolbarRef={toolbarRef}
          onFormat={applyFormat}
          onLinkClick={() => setIsLinkDialogOpen(true)}
          visible={showToolbar}
          position={toolbarPosition}
        />
      )}

      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onSubmit={handleLinkSubmit}
        selectedText={lastSelectionRange?.toString()}
      />

      <AnimatePresence>
        {expandedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setExpandedImageUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={expandedImageUrl} alt="Expanded view" className="max-w-full max-h-full object-contain rounded-lg" />
              <Button size="sm" variant="destructive" className="absolute top-4 right-4 w-8 h-8 p-0" onClick={() => setExpandedImageUrl(null)}>
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};