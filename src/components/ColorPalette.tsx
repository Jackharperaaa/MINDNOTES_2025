import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ColorPaletteProps {
  onColorSelect: (color: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

// Paleta de cores organizada por categorias
const colorCategories = {
  basic: {
    name: 'Básicas',
    colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF', '#FF0000', '#00FF00']
  },
  warm: {
    name: 'Quentes',
    colors: ['#FF6B6B', '#FF8E53', '#FF6B35', '#F7931E', '#FFD93D', '#6BCF7F', '#4ECDC4', '#45B7D1']
  },
  cool: {
    name: 'Frias',
    colors: ['#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471']
  },
  dark: {
    name: 'Escuras',
    colors: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#E74C3C', '#E67E22']
  },
  vibrant: {
    name: 'Vibrantes',
    colors: ['#F39C12', '#F1C40F', '#2ECC71', '#1ABC9C', '#3498DB', '#9B59B6', '#E91E63', '#FF5722']
  },
  pastel: {
    name: 'Pastéis',
    colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E6E6FA', '#FFE4E1', '#F0F8FF']
  }
};

export const ColorPalette = ({ onColorSelect, onClose, isVisible }: ColorPaletteProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-10 left-0 z-60 bg-popover border border-border rounded-lg shadow-xl p-4 min-w-[280px] max-w-[320px]"
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
      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">Escolha uma cor</div>
        
        {/* Grid de cores por categoria */}
        <div className="space-y-3">
          {Object.entries(colorCategories).map(([key, category]) => (
            <div key={key}>
              <div className="text-xs text-muted-foreground mb-1">{category.name}</div>
              <div className="grid grid-cols-8 gap-1">
                {category.colors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border hover:border-primary hover:scale-110 transition-all duration-200 shadow-sm"
                    style={{ backgroundColor: color }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onColorSelect(color);
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Seletor de cor personalizada */}
        <div className="pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Cor personalizada:</div>
          <div className="flex gap-2">
            <input
              type="color"
              className="w-8 h-8 rounded border border-border cursor-pointer"
              onChange={(e) => {
                e.stopPropagation();
                onColorSelect(e.target.value);
              }}
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              title="Escolher cor personalizada"
            />
            <input
              type="text"
              placeholder="#000000"
              className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                  onColorSelect(e.target.value);
                }
              }}
            />
          </div>
        </div>

        {/* Botão fechar */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        >
          Fechar
        </Button>
      </div>
    </motion.div>
  );
};