import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockEditor } from './BlockEditor';
import { useLanguage } from '@/contexts/LanguageContext';
import { FreeFormNote, EditorBlock } from '@/types';
import { ContentEditableDiv } from './editor/ContentEditableDiv';
import { TextFormattingToolbar } from './editor/TextFormattingToolbar';
import { LinkDialog } from './editor/LinkDialog';

interface FreeFormEditorProps {
  note?: FreeFormNote;
  onSave: (title: string, content: string, blocks: EditorBlock[]) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export const FreeFormEditor = ({ note, onSave, onDelete, onCancel }: FreeFormEditorProps) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);

  // Toolbar state for title
  const [showTitleToolbar, setShowTitleToolbar] = useState(false);
  const [titleToolbarPosition, setTitleToolbarPosition] = useState({ x: 0, y: 0 });
  const [lastTitleSelectionRange, setLastTitleSelectionRange] = useState<Range | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const titleEditableRef = useRef<HTMLDivElement>(null);
  const titleToolbarRef = useRef<HTMLDivElement>(null);

  // Effect to initialize and update state when the note prop changes
  useEffect(() => {
    setTitle(note?.title || '');

    const initialBlock = { id: `block-${Date.now()}`, type: 'text' as const, content: '' };

    if (note) {
      if (note.blocks && note.blocks.length > 0) {
        setBlocks(note.blocks);
      } else if (note.content) {
        setBlocks([{ ...initialBlock, content: note.content.replace(/<[^>]*>/g, '') }]);
      } else {
        setBlocks([initialBlock]);
      }
    } else {
      setBlocks([initialBlock]);
    }
  }, [note]);

  // Toolbar logic for title
  const calculateTitleToolbarPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setShowTitleToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    if (titleEditableRef.current && titleEditableRef.current.contains(range.commonAncestorContainer)) {
      setLastTitleSelectionRange(range.cloneRange());
      const rect = range.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const x = rect.left + window.scrollX + rect.width / 2 - 150;
      const y = rect.top + scrollTop - 50;
      
      setTitleToolbarPosition({ x: Math.max(10, x), y: Math.max(10, y) });
      setShowTitleToolbar(true);
    } else {
      setShowTitleToolbar(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        titleToolbarRef.current && !titleToolbarRef.current.contains(event.target as Node) &&
        titleEditableRef.current && !titleEditableRef.current.contains(event.target as Node)
      ) {
        setShowTitleToolbar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTitleFormat = (command: string, value?: string) => {
    if (lastTitleSelectionRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(lastTitleSelectionRange);
        document.execCommand(command, false, value);
        titleEditableRef.current?.focus();
        if (selection.rangeCount > 0) {
          setLastTitleSelectionRange(selection.getRangeAt(0).cloneRange());
        }
      }
    }
  };

  const handleTitleLinkSubmit = (url: string) => {
    applyTitleFormat('createLink', url);
    setIsLinkDialogOpen(false);
  };

  const handleSave = () => {
    const plainTitle = title.replace(/<[^>]*>/g, '').trim();
    if (plainTitle) {
      const htmlContent = blocks.map(block => {
        const content = block.content || '';
        switch (block.type) {
          case 'heading1': return `<h1>${content}</h1>`;
          case 'heading2': return `<h2>${content}</h2>`;
          case 'heading3': return `<h3>${content}</h3>`;
          case 'quote': return `<blockquote>${content}</blockquote>`;
          case 'code': return `<pre><code>${content}</code></pre>`;
          case 'bullet': return `<ul><li>${content}</li></ul>`;
          case 'numbered': return `<ol><li>${content}</li></ol>`;
          case 'checklist': return `<div>[${block.checked ? 'x' : ' '}] ${content}</div>`;
          case 'link': return `<a href="${block.metadata?.url || '#'}">${block.metadata?.url || content}</a>`;
          case 'image': return `<img src="${block.metadata?.urls?.[0] || ''}" alt="${content}" />`;
          case 'video': return `<p>Vídeo: ${block.metadata?.url || ''}</p>`;
          case 'gif': return `<img src="${block.metadata?.url || ''}" alt="${content}" />`;
          case 'divider': return '<hr>';
          default: return `<p>${content}</p>`;
        }
      }).join('');
      
      onSave(title, htmlContent, blocks);
    }
  };

  const handleCreateSubpage = (subpageTitle: string) => {
    alert(`Subpage "${subpageTitle}" feature coming soon!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 h-full flex flex-col relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <ContentEditableDiv
          ref={titleEditableRef}
          initialHTML={title}
          onHTMLChange={setTitle}
          className="text-xl font-semibold bg-transparent border-none p-0 focus:ring-0 w-full outline-none"
          data-placeholder={t('enterTitle')}
          onMouseUp={calculateTitleToolbarPosition}
          onKeyUp={calculateTitleToolbarPosition}
          onBlur={() => {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
              setLastTitleSelectionRange(selection.getRangeAt(0).cloneRange());
            }
          }}
        />
        <div className="flex gap-2">
          {onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!title.replace(/<[^>]*>/g, '').trim()}>
            <Save className="w-4 h-4 mr-2" />
            {t('save')}
          </Button>
        </div>
      </div>

      {/* Content Editor */}
      <BlockEditor
        blocks={blocks}
        onBlocksChange={setBlocks}
        onCreateSubpage={handleCreateSubpage}
      />

      {/* Toolbar for Title */}
      {showTitleToolbar && (
        <TextFormattingToolbar
          toolbarRef={titleToolbarRef}
          onFormat={applyTitleFormat}
          onLinkClick={() => setIsLinkDialogOpen(true)}
          visible={showTitleToolbar}
          position={titleToolbarPosition}
          selectionRange={lastTitleSelectionRange}
        />
      )}
      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onSubmit={handleTitleLinkSubmit}
        selectedText={lastTitleSelectionRange?.toString()}
      />
    </motion.div>
  );
};