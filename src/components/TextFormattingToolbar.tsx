import React, { useState, useEffect, useRef, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Underline, 
  Palette,
  Link,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TextFormattingToolbarProps {
  onFormat: (format: string, value?: string) => void;
  visible: boolean;
  position?: { x: number; y: number };
  toolbarRef: RefObject<HTMLDivElement>; // Add toolbarRef prop
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

export const TextFormattingToolbar = ({ onFormat, visible, position = { x: 0, y: 0 }, toolbarRef }: TextFormattingToolbarProps) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  
  const [currentHue, setCurrentHue] = useState(0);
  const [currentSaturation, setSaturation] = useState(100);
  const [currentBrightness, setBrightness] = useState(100);
  const [selectedColor, setSelectedColor] = useState('#FF0000');

  // State for draggable color picker position
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (visible) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        setSelectedText(selection.toString());
        setLinkText(selection.toString());
      }
    }
  }, [visible]);

  useEffect(() => {
    if (showColorPalette && toolbarRef.current) {
      const toolbarRect = toolbarRef.current.getBoundingClientRect();
      // Position it below the toolbar, slightly to the right
      setColorPickerPosition({
        x: toolbarRect.left + window.scrollX + 50, // 50px offset from toolbar left
        y: toolbarRect.bottom + window.scrollY + 10, // 10px below toolbar
      });
    }
  }, [showColorPalette, toolbarRef]);

  const applyFormat = (format: string, value?: string) => {
    // Ensure the contentEditable element is focused before applying format
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Restore selection if it was lost due to blur
      if (range.startContainer.nodeType === Node.ELEMENT_NODE && (range.startContainer as HTMLElement).contentEditable === 'true') {
        // The selection is still within a contentEditable, good.
      } else {
        // Try to re-focus the original contentEditable if possible
        // For now, rely on execCommand working on the last active contentEditable.
      }
    }

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
      case 'highlight': // Background color for highlight
        if (value) {
          document.execCommand('backColor', false, value);
        }
        break;
      case 'link':
        if (value) {
          document.execCommand('createLink', false, value);
        }
        break;
      default:
        // Fallback for other formats if needed, though execCommand covers most basic ones
        onFormat(format, value);
    }
  };

  const handleColorSelect = (color: string) => {
    applyFormat('color', color);
  };

  const handleHighlightSelect = (color: string) => {
    applyFormat('highlight', color);
  };

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
    handleColorSelect(hex); // Apply text color
  };

  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hue = (y / rect.height) * 360;
    
    setCurrentHue(hue);
    
    const rgb = hsbToRgb(hue, currentSaturation, currentBrightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setSelectedColor(hex);
    handleColorSelect(hex); // Apply text color
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      alert('Selecione o texto que deseja transformar em link');
      return;
    }
    
    setSelectedText(selection.toString());
    setLinkText(selection.toString());
    setShowLinkDialog(true);
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      let validUrl = linkUrl.trim();
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      
      try {
        new URL(validUrl);
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

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={toolbarRef} // Assign the passed ref here
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed z-50 bg-background border border-border rounded-lg shadow-lg px-2 py-1.5"
        style={{
          left: position.x,
          top: position.y,
        }}
        // Crucial: Stop propagation for all mouse events on the toolbar itself
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
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
          <div className="relative">
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
          </div>

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

        {/* Photoshop-Style Color Picker (draggable) */}
        <AnimatePresence>
          {showColorPalette && (
            <motion.div
              drag
              dragConstraints={{ left: 0, right: window.innerWidth - 300, top: 0, bottom: window.innerHeight - 300 }} // Assuming 300px width/height for picker
              onDragEnd={(event, info) => {
                setColorPickerPosition({ x: info.point.x, y: info.point.y });
              }}
              style={{ x: colorPickerPosition.x, y: colorPickerPosition.y }} // Use x, y for framer-motion drag
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="fixed z-60 bg-popover border border-border rounded-xl shadow-2xl p-4 w-[300px]"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
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

        {/* Dialog de Link Moderno */}
        <AnimatePresence>
          {showLinkDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onMouseDown={(e) => {
                // Only close if clicking on the backdrop, not the dialog
                if (e.target === e.currentTarget) {
                  handleLinkCancel();
                }
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleLinkCancel();
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-background border border-border rounded-xl shadow-2xl p-6 w-full max-w-md"
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
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Adicionar Link</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLinkCancel();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Texto selecionado */}
                {selectedText && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Texto selecionado:</div>
                    <div className="text-sm font-medium text-foreground">"{selectedText}"</div>
                  </div>
                )}

                {/* Campos do formulário */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      URL do Link
                    </label>
                    <Input
                      type="url"
                      placeholder="https://exemplo.com"
                      value={linkUrl}
                      onFocus={(e) => e.stopPropagation()}
                      onBlur={(e) => e.stopPropagation()}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLinkSubmit();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleLinkCancel();
                        }
                      }}
                      className="w-full"
                      autoFocus
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Digite a URL completa (com https://)
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Texto do Link (opcional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Texto que aparecerá como link"
                      value={linkText}
                      onFocus={(e) => e.stopPropagation()}
                      onBlur={(e) => e.stopPropagation()}
                      onChange={(e) => setLinkText(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLinkSubmit();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleLinkCancel();
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleLinkCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleLinkSubmit}
                    disabled={!linkUrl.trim()}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Adicionar Link
                  </Button>
                </div>

                {/* Dica de uso */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    💡 <strong>Dica:</strong> Selecione o texto que deseja transformar em link antes de clicar no botão de link.
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};