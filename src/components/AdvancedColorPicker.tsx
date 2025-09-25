import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, EyeDropper, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSelectionManager } from '@/hooks/useSelectionManager';
import { ModalPortal } from './ModalPortal';

interface AdvancedColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  initialColor?: string;
}

// Paletas de cores predefinidas baseadas em referências web
const COLOR_PALETTES = {
  material: [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#000000'
  ],
  tailwind: [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#84cc16', '#06b6d4', '#0ea5e9', '#a855f7', '#d946ef',
    '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#64748b'
  ],
  grayscale: [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da',
    '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529',
    '#000000'
  ]
};

export const AdvancedColorPicker = ({ 
  isOpen, 
  onClose, 
  onColorSelect, 
  initialColor = '#000000' 
}: AdvancedColorPickerProps) => {
  const [currentColor, setCurrentColor] = useState(initialColor);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [activePalette, setActivePalette] = keyofof COLOR_PALETTES>('material');
  const gradientRef = useRef<HTMLDivElement>(null);

  const { applyToSelection } = useSelectionManager();

  // Converter HSB para RGB
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

  // Converter RGB para Hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  };

  // Converter Hex para RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Converter RGB para HSB
  const rgbToHsb = (r: number, g: number, b: number) => {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }
    
    const s = max === 0 ? 0 : (delta / max) * 100;
    const bright = max * 100;
    
    return { h, s, b: bright };
  };

  // Atualizar cor quando HSB mudar
  useEffect(() => {
    const rgb = hsbToRgb(hue, saturation, brightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setCurrentColor(hex);
  }, [hue, saturation, brightness]);

  // Inicializar com cor inicial
  useEffect(() => {
    if (initialColor) {
      const rgb = hexToRgb(initialColor);
      const hsb = rgbToHsb(rgb.r, rgb.g, rgb.b);
      setHue(hsb.h);
      setSaturation(hsb.s);
      setBrightness(hsb.b);
      setCurrentColor(initialColor);
    }
  }, [initialColor]);

  const handleGradientClick = (e: React.MouseEvent) => {
    if (!gradientRef.current) return;
    
    const rect = gradientRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const newSaturation = (x / rect.width) * 100;
    const newBrightness = 100 - (y / rect.height) * 100;
    
    setSaturation(newSaturation);
    setBrightness(newBrightness);
  };

  const handleHueChange = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const newHue = (y / rect.height) * 360;
    setHue(newHue);
  };

  const handleColorSelect = () => {
    applyToSelection((range) => {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('foreColor', false, currentColor);
        onColorSelect(currentColor);
      }
    });
    onClose();
  };

  const handleQuickColorSelect = (color: string) => {
    applyToSelection((range) => {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('foreColor', false, color);
        onColorSelect(color);
      }
    });
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} className="bg-popover border border-border rounded-xl shadow-2xl p-6 w-[90vw] max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Seletor de Cores</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seletor HSB */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Seletor HSB</h3>
          
          <div className="flex gap-4">
            {/* Gradiente principal */}
            <div className="relative">
              <div
                ref={gradientRef}
                className="w-48 h-48 rounded border border-border cursor-crosshair overflow-hidden"
                style={{
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
                }}
                onMouseDown={handleGradientClick}
              />
              <div
                className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - brightness}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.5)'
                }}
              />
            </div>

            {/* Controle de matiz */}
            <div className="relative">
              <div
                className="w-6 h-48 rounded border border-border cursor-ns-resize overflow-hidden"
                style={{
                  background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
                onMouseDown={handleHueChange}
              />
              <div
                className="absolute w-full h-1 border-y border-white pointer-events-none"
                style={{
                  top: `${(hue / 360) * 100}%`,
                  transform: 'translateY(-50%)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.5)'
                }}
              />
            </div>
          </div>

          {/* Controles numéricos */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Matiz</label>
              <Input
                type="number"
                min="0"
                max="360"
                value={Math.round(hue)}
                onChange={(e) => setHue(Number(e.target.value))}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Saturação</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={Math.round(saturation)}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Brilho</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={Math.round(brightness)}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Paletas e preview */}
        <div className="space-y-6">
          {/* Preview da cor */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Cor Selecionada</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded border border-border"
                style={{ backgroundColor: currentColor }}
              />
              <div className="flex-1">
                <Input
                  value={currentColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/i.test(value)) {
                      setCurrentColor(value);
                      const rgb = hexToRgb(value);
                      const hsb = rgbToHsb(rgb.r, rgb.g, rgb.b);
                      setHue(hsb.h);
                      setSaturation(hsb.s);
                      setBrightness(hsb.b);
                    }
                  }}
                  className="font-mono text-sm mb-2"
                />
                <div className="text-xs text-muted-foreground">
                  RGB: {hexToRgb(currentColor).r}, {hexToRgb(currentColor).g}, {hexToRgb(currentColor).b}
                </div>
              </div>
            </div>
          </div>

          {/* Paletas rápidas */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Paletas Rápidas</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['material', 'tailwind', 'grayscale'] as const).map((palette) => (
                <Button
                  key={palette}
                  variant={activePalette === palette ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivePalette(palette)}
                  className="text-xs capitalize"
                >
                  {palette}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1">
              {COLOR_PALETTES[activePalette].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleQuickColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Botão de ação */}
          <Button
            onClick={handleColorSelect}
            className="w-full"
            size="lg"
          >
            <Check className="w-4 h-4 mr-2" />
            Aplicar Cor
          </Button>
        </div>
      </div>
    </ModalPortal>
  );
};