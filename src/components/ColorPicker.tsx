import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Type, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  onColorSelect: (color: string, isBackground: boolean) => void;
  onClose: () => void;
  currentTextColor?: string;
  currentBackgroundColor?: string;
}

export const ColorPicker = ({ 
  onColorSelect, 
  onClose, 
  currentTextColor, 
  currentBackgroundColor 
}: ColorPickerProps) => {
  const [activeTab, setActiveTab] = useState<'text' | 'background'>('text');

  const textColors = [
    { name: 'Default', value: 'default', class: 'bg-foreground' },
    { name: 'Gray', value: 'gray', class: 'bg-gray-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  ];

  const backgroundColors = [
    { name: 'None', value: 'none', class: 'bg-transparent border-2 border-gray-300' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-200' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-200' },
    { name: 'Red', value: 'red', class: 'bg-red-200' },
    { name: 'Green', value: 'green', class: 'bg-green-200' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-200' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-200' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-200' },
    { name: 'Gray', value: 'gray', class: 'bg-gray-200' },
  ];

  const colors = activeTab === 'text' ? textColors : backgroundColors;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-12 left-0 z-50 bg-popover border border-border rounded-lg shadow-lg p-4 min-w-[300px]"
    >
      {/* Tab Headers */}
      <div className="flex gap-1 mb-4">
        <Button
          variant={activeTab === 'text' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('text')}
          className="flex-1"
        >
          <Type className="w-4 h-4 mr-2" />
          Text
        </Button>
        <Button
          variant={activeTab === 'background' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('background')}
          className="flex-1"
        >
          <Square className="w-4 h-4 mr-2" />
          Background
        </Button>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {colors.map((color) => (
          <button
            key={color.value}
            className={cn(
              "w-8 h-8 rounded-md border-2 transition-all hover:scale-110",
              color.class,
              activeTab === 'text' && currentTextColor === color.value && "ring-2 ring-primary",
              activeTab === 'background' && currentBackgroundColor === color.value && "ring-2 ring-primary"
            )}
            onClick={() => onColorSelect(color.value, activeTab === 'background')}
            title={color.name}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Custom {activeTab === 'text' ? 'Text' : 'Background'} Color:
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            className="w-8 h-8 rounded border border-border cursor-pointer"
            onChange={(e) => onColorSelect(e.target.value, activeTab === 'background')}
          />
          <input
            type="text"
            placeholder="#000000"
            className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
            onChange={(e) => {
              if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                onColorSelect(e.target.value, activeTab === 'background');
              }
            }}
          />
        </div>
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-4"
        onClick={onClose}
      >
        Close
      </Button>
    </motion.div>
  );
};

