import React from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Underline, Palette, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelectionManager } from '@/hooks/useSelectionManager';
import { AdvancedColorPicker } from './AdvancedColorPicker';
import { LinkDialog } from './LinkDialog';

interface TextFormattingToolbarProps {
  visible: boolean;
  position?: { x: number; y: number };
}

export const TextFormattingToolbar = ({ visible, position = { x: 0, y: 0 } }: TextFormattingToolbarProps) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const { savedSelectionRange, saveSelection, applyToSelection } = useSelectionManager();

  const applyFormat = (format: string, value?: string) => {
    applyToSelection((range) => {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        
        switch (format) {
          case 'bold':
            document.execCommand('bold', false);
            break;
          case 'italic':
            document.execCommand('italic', false);
            break;
          case 'underline':
            document.execCommand('underline', false);
            break;
          case 'link':
            if (value) document.execCommand('createLink', false, value);
            break;
          default:
            if (value) document.execCommand(format, false, value);
        }
      }
    });
  };

  const handleColorSelect = (color: string) => {
    applyFormat('foreColor', color);
    setShowColorPicker(false);
  };

  const handleLinkSubmit = (url: string) => {
    applyFormat('link', url);
    setShowLinkDialog(false);
  };

  if (!visible) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed z-50 bg-background border border-border rounded-lg shadow-lg px-2 py-1.5"
        style={{ left: position.x, top: position.y }}
      >
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              saveSelection();
              applyFormat('bold');
            }}
            title="Negrito"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              saveSelection();
              applyFormat('italic');
            }}
            title="Itálico"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              saveSelection();
              applyFormat('underline');
            }}
            title="Sublinhado"
          >
            <Underline className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              saveSelection();
              setShowColorPicker(true);
            }}
            title="Cor do Texto"
          >
            <Palette className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              saveSelection();
              setShowLinkDialog(true);
            }}
            title="Adicionar Link"
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <AdvancedColorPicker
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onColorSelect={handleColorSelect}
      />

      <LinkDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onSubmit={handleLinkSubmit}
        selectedText={savedSelectionRange?.toString() || ''}
      />
    </>
  );
};