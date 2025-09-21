import React, { useState, useEffect, useRef, forwardRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Palette,
  Link,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkDialog } from './LinkDialog';

interface TextFormattingToolbarProps {
  onFormat: (format: string, value?: string) => void;
  visible: boolean; // This prop now indicates if text is selected
  position?: { x: number; y: number };
}

// Convert HSB to RGB
const hsbToRgb = (h: number, s: number, b: number) => {
  s = s / 100;
  b = b / 100;
  const c = b * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = b - c;
  let r = 0, g = 0, blue = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; blue = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; blue = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; blue = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; blue = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; blue = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; blue = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((blue + m) * 255)
  };
};

// Convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number) => {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const TextFormattingToolbar = ({ onFormat, visible, position = { x: 0, y: 0 } }: TextFormattingToolbarProps) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedText, setSelectedText] = useState('');

  // Photoshop-style color picker state
  const [currentHue, setCurrentHue] = useState(0);
  const [currentSaturation, setSaturation] = useState(100);
  const [currentBrightness, setBrightness] = useState(100);
  const [selectedColor, setSelectedColor] = useState('#FF0000');

  // Captura o texto selecionado quando o toolbar aparece
  useEffect(() => {
    if (visible) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        setSelectedText(selection.toString());
        setLinkText(selection.toString());
      }
    } else {
      // If toolbar becomes invisible (no selection), close dialogs
      // This ensures dialogs don't persist if the user clicks far away
      // and the toolbar itself is no longer relevant.
      setShowColorPalette(false);
      setShowLinkDialog(false);
    }
  }, [visible]);

  const applyFormat = (format: string, value?: string) => {
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
      case 'color':
        if (value) {
          document.execCommand('foreColor', false, value);
        }
        break;
      case 'link':
        if (value) {
          document.execCommand('createLink', false, value);
        }
        break;
      default:
        onFormat(format, value);
    }
  };

  const handleColorSelect = (color: string) => {
    applyFormat('color', color);
    setSelectedColor(color); // Update selected color for preview
  };

  // Handle gradient area click
  const handleGradientClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const saturation = (x / rect.width) * 100;
    const brightness = ((rect.height - y) / rect.height) * 100;

    setSaturation(saturation);
    setBrightness(brightness);

    const rgb = hsbToRgb(currentHue, saturation, brightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setSelectedColor(hex);
    handleColorSelect(hex);
  };

  // Handle hue slider click
  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hue = (y / rect.height) * 360;

    setCurrentHue(hue);

    const rgb = hsbToRgb(hue, currentSaturation, currentBrightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setSelectedColor(hex);
    handleColorSelect(hex);
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    setSelectedText(selection ? selection.toString() : '');
    setLinkText(selection ? selection.toString() : '');
    setShowLinkDialog(true);
  };

  const handleLinkSubmit = (url: string, text?: string) => {
    if (url.trim()) {
      let validUrl = url.trim();
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      try {
        new URL(validUrl); // Validate URL
        applyFormat('link', validUrl);
        setShowLinkDialog(false);
        setLinkUrl('');
        setLinkText('');
      } catch (error) {
        alert('Por favor, insira uma URL válida');
      }
    }
  };

  const handleLinkCancel = () => {
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Only render the toolbar component if 'visible' (text selected) OR a dialog is open
  if (!visible && !showColorPalette && !showLinkDialog) return null;

  return (
    <>
      {/* Main Toolbar Buttons - only visible if 'visible' prop is true */}
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-50 bg-background border border-border rounded-lg shadow-lg px-2 py-1.5"
          style={{
            left: position.x,
            top: position.y,
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent contentEditable from blurring
        >
          <div className="flex items-center gap-1">
            {/* Formatação básica */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => applyFormat('bold')}
              title="Negrito"
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => applyFormat('italic')}
              title="Itálico"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => applyFormat('underline')}
              title="Sublinhado"
            >
              <Underline className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Botão de Cor do Texto */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPalette(!showColorPalette);
              }}
              title="Seletor de Cores Avançado"
            >
              <Palette className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Botão de Link */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleLinkClick();
              }}
              title="Adicionar Link"
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Photoshop-Style Color Picker - Rendered as a sibling, independent of 'visible' prop */}
      <AnimatePresence>
        {showColorPalette && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-60 bg-popover border border-border rounded-xl shadow-2xl p-4 w-[300px]"
            style={{
              left: position.x, // Position relative to the toolbar button
              top: position.y + 50, // Below the toolbar
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-foreground">Seletor de Cores</div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPalette(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Color picker area */}
            <div className="flex gap-3 mb-4">
              {/* Main gradient area */}
              <div
                className="relative w-48 h-32 cursor-crosshair rounded border border-border overflow-hidden"
                style={{
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${currentHue}, 100%, 50%))`
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGradientClick(e);
                }}
              >
                {/* Crosshair indicator */}
                <div
                  className="absolute w-2 h-2 border border-white rounded-full transform -translate-x-1 -translate-y-1 pointer-events-none"
                  style={{
                    left: `${currentSaturation}%`,
                    top: `${100 - currentBrightness}%`,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)'
                  }}
                />
              </div>

              {/* Hue slider */}
              <div
                className="relative w-4 h-32 cursor-pointer rounded border border-border overflow-hidden"
                style={{
                  background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleHueClick(e);
                }}
              >
                {/* Hue indicator */}
                <div
                  className="absolute w-full h-1 border-t border-b border-white pointer-events-none"
                  style={{
                    top: `${(currentHue / 360) * 100}%`,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5)'
                  }}
                />
              </div>
            </div>

            {/* Color preview */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Nova cor:</div>
                <div
                  className="w-full h-8 rounded border border-border"
                  style={{ backgroundColor: selectedColor }}
                />
              </div>
            </div>

            {/* Hex input */}
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">Código hex:</div>
              <input
                type="text"
                value={selectedColor}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  const value = e.target.value;
                  if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                    setSelectedColor(value);
                    if (value.length === 7) {
                      handleColorSelect(value);
                    }
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
                placeholder="#000000"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Dialog - Rendered as a sibling, controlled by showLinkDialog */}
      <LinkDialog
        isOpen={showLinkDialog}
        onClose={handleLinkCancel}
        onSubmit={handleLinkSubmit}
        selectedText={selectedText}
      />
    </>
  );
};