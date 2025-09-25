import React, { useState, useEffect, useRef, RefObject } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Underline, 
  Palette,
  Link,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkDialog } from './LinkDialog';

interface TextFormattingToolbarProps {
  onFormat: (format: string, value?: string) => void;
  visible: boolean;
  position?: { x: number; y: number };
  toolbarRef: RefObject<HTMLDivElement>;
  savedSelectionRange: Range | null;
  onSelectionChange: (range: Range | null) => void;
}

// HSB to RGB conversion
const hsbToRgb = (h: number, s: number, b: number) => {
  s /= 100; b /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return {
    r: Math.round(255 * f(5)),
    g: Math.round(255 * f(3)),
    b: Math.round(255 * f(1))
  };
};

// RGB to Hex conversion
const rgbToHex = (r: number, g: number, b: number) => `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;

export const TextFormattingToolbar = ({ onFormat, visible, position = { x: 0, y: 0 }, toolbarRef, savedSelectionRange, onSelectionChange }: TextFormattingToolbarProps) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isLinkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  
  const [currentHue, setCurrentHue] = useState(0);
  const [currentSaturation, setSaturation] = useState(100);
  const [currentBrightness, setBrightness] = useState(100);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const dragControls = useDragControls();

  useEffect(() => {
    if (visible) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        setSelectedText(selection.toString());
      }
    }
  }, [visible]);

  useEffect(() => {
    if (showColorPalette && savedSelectionRange) {
      const selectionRect = savedSelectionRange.getBoundingClientRect();
      const pickerWidth = 300;
      const pickerHeight = 300;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let initialX = selectionRect.left + window.scrollX + (selectionRect.width / 2) - (pickerWidth / 2);
      let initialY = selectionRect.top + window.scrollY - pickerHeight - 10;

      if (initialY < 10) initialY = selectionRect.bottom + window.scrollY + 10;
      if (initialX < 10) initialX = 10;
      if (initialX + pickerWidth > viewportWidth - 10) initialX = viewportWidth - pickerWidth - 10;
      if (initialY + pickerHeight > viewportHeight - 10) initialY = viewportHeight - pickerHeight - 10;

      setColorPickerPosition({ x: initialX, y: initialY });
    }
  }, [showColorPalette, savedSelectionRange]);

  const applyFormat = (format: string, value?: string) => {
    if (savedSelectionRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRange);
      }
    } else {
      return;
    }

    document.execCommand(format === 'link' ? 'createLink' : format, false, value);

    const newSelection = window.getSelection();
    if (newSelection && !newSelection.isCollapsed && newSelection.rangeCount > 0) {
      const newRange = newSelection.getRangeAt(0);
      onSelectionChange(newRange);
      const parentContentEditable = newRange.commonAncestorContainer.parentElement?.closest('[contenteditable="true"]');
      if (parentContentEditable instanceof HTMLElement) {
        parentContentEditable.focus();
      }
    } else {
      onSelectionChange(null);
    }
  };

  const handleColorSelect = (color: string) => {
    if (savedSelectionRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRange);
        
        // Create a span element with the selected color
        const span = document.createElement('span');
        span.style.color = color;
        
        // Apply the color to the selection
        document.execCommand('insertHTML', false, span.outerHTML);
        
        // Restore the selection after applying the color
        const newSelection = window.getSelection();
        if (newSelection) {
          newSelection.removeAllRanges();
          newSelection.addRange(savedSelectionRange);
        }
      }
    }
  };

  const handleGradientClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const saturation = ((e.clientX - rect.left) / rect.width) * 100;
    const brightness = ((rect.height - (e.clientY - rect.top)) / rect.height) * 100;
    setSaturation(saturation);
    setBrightness(brightness);
    const rgb = hsbToRgb(currentHue, saturation, brightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setSelectedColor(hex);
    handleColorSelect(hex);
  };

  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hue = ((e.clientY - rect.top) / rect.height) * 360;
    setCurrentHue(hue);
    const rgb = hsbToRgb(hue, currentSaturation, currentBrightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setSelectedColor(hex);
    handleColorSelect(hex);
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }
    setSelectedText(selection.toString());
    setLinkDialogOpen(true);
  };

  const handleLinkSubmit = (url: string) => {
    if (url.trim()) {
      applyFormat('link', url);
      setLinkDialogOpen(false);
    }
  };

  if (!visible && !isLinkDialogOpen) return null;

  return (
    <>
      {visible && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-50 bg-background border border-border rounded-lg shadow-lg px-2 py-1.5"
          style={{ left: position.x, top: position.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat('bold')} title="Negrito"><Bold className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat('italic')} title="Itálico"><Italic className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormat('underline')} title="Sublinhado"><Underline className="h-4 w-4" /></Button>
            <div className="h-6 w-px bg-border mx-1" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowColorPalette(!showColorPalette)} title="Cor"><Palette className="h-4 w-4" /></Button>
            <div className="h-6 w-px bg-border mx-1" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleLinkClick} title="Adicionar Link"><Link className="h-4 w-4" /></Button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showColorPalette && (
          <motion.div
            drag dragControls={dragControls} dragListener={false}
            dragConstraints={{ left: 0, right: window.innerWidth - 300, top: 0, bottom: window.innerHeight - 300 }}
            onDragEnd={(e, info) => setColorPickerPosition({ x: info.point.x, y: info.point.y })}
            style={{ x: colorPickerPosition.x, y: colorPickerPosition.y }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, dragElastic: 0.2 }}
            className="fixed z-60 bg-popover border border-border rounded-xl shadow-2xl p-4 w-[300px]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 cursor-grab" onPointerDown={(e) => dragControls.start(e)}>
              <div className="text-sm font-semibold text-foreground">Seletor de Cores</div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowColorPalette(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="relative w-48 h-32 cursor-crosshair rounded border border-border overflow-hidden" style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${currentHue}, 100%, 50%))` }} onMouseDown={handleGradientClick}>
                <div className="absolute w-2 h-2 border border-white rounded-full transform -translate-x-1 -translate-y-1 pointer-events-none" style={{ left: `${currentSaturation}%`, top: `${100 - currentBrightness}%`, boxShadow: '0 0 0 1px rgba(0,0,0,0.5)' }} />
              </div>
              <div className="relative w-4 h-32 cursor-pointer rounded border border-border overflow-hidden" style={{ background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }} onMouseDown={handleHueClick}>
                <div className="absolute w-full h-1 border-t border-b border-white pointer-events-none" style={{ top: `${(currentHue / 360) * 100}%`, boxShadow: '0 0 0 1px rgba(0,0,0,0.5)' }} />
              </div>
            </div>
            <div className="flex-1"><div className="text-xs text-muted-foreground mb-1">Nova cor:</div><div className="w-full h-8 rounded border border-border" style={{ backgroundColor: selectedColor }} /></div>
            <div className="mt-3"><div className="text-xs text-muted-foreground mb-1">Código hex:</div><input type="text" value={selectedColor} onChange={(e) => { const v = e.target.value; if (v.match(/^#[0-9A-Fa-f]{0,6}$/)) { setSelectedColor(v); if (v.length === 7) handleColorSelect(v); } }} className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground" /></div>
          </motion.div>
        )}
      </AnimatePresence>

      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSubmit={handleLinkSubmit}
        selectedText={selectedText}
      />
    </>
  );
};