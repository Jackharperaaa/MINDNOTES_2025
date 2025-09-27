import React, { useState, useEffect, RefObject, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Underline, 
  Palette,
  Link,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextFormattingToolbarProps {
  onFormat: (format: string, value?: string) => void;
  onLinkClick: () => void;
  visible: boolean;
  position?: { x: number; y: number };
  toolbarRef: RefObject<HTMLDivElement>;
  selectionRange: Range | null;
}

const hsbToRgb = (h: number, s: number, b: number) => {
  s /= 100;
  b /= 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return {
    r: Math.round(255 * f(5)),
    g: Math.round(255 * f(3)),
    b: Math.round(255 * f(1)),
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

export const TextFormattingToolbar = ({ onFormat, onLinkClick, visible, position = { x: 0, y: 0 }, toolbarRef, selectionRange }: TextFormattingToolbarProps) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [currentHue, setCurrentHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState<object | boolean>(false);

  useLayoutEffect(() => {
    const updateConstraints = () => {
      if (pickerRef.current) {
        const rect = pickerRef.current.getBoundingClientRect();
        setDragConstraints({
          top: 0,
          left: 0,
          right: window.innerWidth - rect.width,
          bottom: window.innerHeight - rect.height,
        });
      }
    };

    if (showColorPalette) {
      updateConstraints();
      window.addEventListener('resize', updateConstraints);
      return () => window.removeEventListener('resize', updateConstraints);
    } else {
      setDragConstraints(false);
    }
  }, [showColorPalette]);

  useEffect(() => {
    if (showColorPalette && selectionRange && pickerRef.current) {
      const pickerWidth = pickerRef.current.offsetWidth;
      const pickerHeight = pickerRef.current.offsetHeight;
      const margin = 15;

      const rangeRect = selectionRange.getBoundingClientRect();
      if (rangeRect.width === 0 && rangeRect.height === 0) return;

      let newX = rangeRect.left + window.scrollX + (rangeRect.width / 2) - (pickerWidth / 2);
      let newY = rangeRect.bottom + window.scrollY + margin;

      newX = Math.max(margin, newX);
      newX = Math.min(newX, window.innerWidth - pickerWidth - margin);

      if (newY + pickerHeight > window.innerHeight - margin) {
        newY = rangeRect.top + window.scrollY - pickerHeight - margin;
      }
      
      newY = Math.max(margin, newY);

      setColorPickerPosition({ x: newX, y: newY });
    }
  }, [showColorPalette, selectionRange]);

  const handleFormatClick = (e: React.MouseEvent, format: string, value?: string) => {
    e.preventDefault();
    e.stopPropagation();
    onFormat(format, value);
  };

  const handleColorChange = (hue: number, sat: number, bright: number) => {
    const rgb = hsbToRgb(hue, sat, bright);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    onFormat('foreColor', hex);
  };

  const handleGradientClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newSaturation = (x / rect.width) * 100;
    const newBrightness = ((rect.height - y) / rect.height) * 100;
    setSaturation(newSaturation);
    setBrightness(newBrightness);
    handleColorChange(currentHue, newSaturation, newBrightness);
  };

  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newHue = (y / rect.height) * 360;
    setCurrentHue(newHue);
    handleColorChange(newHue, saturation, brightness);
  };

  if (!visible) return null;

  return (
    <>
      <motion.div
        ref={toolbarRef}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed z-50 bg-background border border-border rounded-lg shadow-lg px-2 py-1.5"
        style={{ left: position.x, top: position.y }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleFormatClick(e, 'bold')} title="Negrito">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleFormatClick(e, 'italic')} title="Itálico">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleFormatClick(e, 'underline')} title="Sublinhado">
            <Underline className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => { e.preventDefault(); setShowColorPalette(!showColorPalette); }}
            title="Cor do Texto"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.preventDefault(); onLinkClick(); }} title="Adicionar Link">
            <Link className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showColorPalette && (
          <motion.div
            ref={pickerRef}
            drag
            dragConstraints={dragConstraints}
            style={{ 
              position: 'fixed',
              left: colorPickerPosition.x, 
              top: colorPickerPosition.y 
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="z-60 bg-popover border border-border rounded-xl shadow-2xl p-4 w-[300px] cursor-grab"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-foreground">Seletor de Cores</div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowColorPalette(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-3">
              <div
                className="relative w-full h-32 cursor-crosshair rounded border border-border overflow-hidden"
                style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${currentHue}, 100%, 50%))` }}
                onMouseDown={handleGradientClick}
              >
                <div
                  className="absolute w-2 h-2 border border-white rounded-full transform -translate-x-1 -translate-y-1 pointer-events-none"
                  style={{ left: `${saturation}%`, top: `${100 - brightness}%`, boxShadow: '0 0 0 1px rgba(0,0,0,0.5)' }}
                />
              </div>
              <div
                className="relative w-4 h-32 cursor-pointer rounded border border-border overflow-hidden"
                style={{ background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
                onMouseDown={handleHueClick}
              >
                <div
                  className="absolute w-full h-1 border-t border-b border-white pointer-events-none"
                  style={{ top: `${(currentHue / 360) * 100}%`, boxShadow: '0 0 0 1px rgba(0,0,0,0.5)' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};