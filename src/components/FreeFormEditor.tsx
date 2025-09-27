import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlockEditor } from './BlockEditor';
import { useLanguage } from '@/contexts/LanguageContext';
import { FreeFormNote, EditorBlock } from '@/types';

interface FreeFormEditorProps {
  note?: FreeFormNote;
  onSave: (title: string, content: string, blocks: EditorBlock[]) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export const FreeFormEditor = ({ note, onSave, onDelete, onCancel }: FreeFormEditorProps) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState(note?.title || '');
  const [blocks, setBlocks] = useState<EditorBlock[]>(note?.blocks || []);

  // Convert legacy content to blocks on first load
  useEffect(() => {
    if (note && note.content && (!note.blocks || note.blocks.length === 0)) {
      // Convert HTML content to a single text block for legacy notes
      const legacyBlock: EditorBlock = {
        id: `block-${Date.now()}`,
        type: 'text',
        content: note.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
      };
      setBlocks([legacyBlock]);
    }
  }, [note]);

  const handleSave = () => {
    if (title.trim()) {
      // Convert blocks back to HTML for backward compatibility and simple previews
      const htmlContent = blocks.map(block => {
        const content = block.content || '';
        switch (block.type) {
          case 'heading1': return `<h1>${content}</h1>`;
          case 'heading2': return `<h2>${content}</h2>`;
          case 'heading3': return `<h3>${content}</h3>`;
          case 'quote': return `<blockquote>${content}</blockquote>`;
          case 'code': return `<pre><code>${content}</code></pre>`;
          case 'bullet': return `<ul><li>${content}</li></ul>`; // Simplified for preview
          case 'numbered': return `<ol><li>${content}</li></ol>`; // Simplified for preview
          case 'checklist': return `<div>[${block.checked ? 'x' : ' '}] ${content}</div>`;
          case 'link': return `<a href="${block.metadata?.url || '#'}">${block.metadata?.url || content}</a>`;
          case 'image': return `<img src="${block.metadata?.urls?.[0] || ''}" alt="${content}" />`;
          case 'video': return `<p>Vídeo: ${block.metadata?.url || ''}</p>`;
          case 'gif': return `<img src="${block.metadata?.url || ''}" alt="${content}" />`;
          case 'divider': return '<hr>';
          default: return `<p>${content}</p>`;
        }
      }).join('');
      
      onSave(title.trim(), htmlContent, blocks);
    }
  };

  const handleCreateSubpage = (subpageTitle: string) => {
    // For now, just show an alert. This would need to be implemented
    // with proper navigation and page management
    alert(`Subpage "${subpageTitle}" feature coming soon!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('enterTitle')}
          className="text-xl font-semibold bg-transparent border-none p-0 focus:ring-0"
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
          <Button size="sm" onClick={handleSave} disabled={!title.trim()}>
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
    </motion.div>
  );
};