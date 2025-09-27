import React, { useState } from 'react';
import { FileImage, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlockProps } from './types';

export const GifBlock: React.FC<BlockProps> = ({ block, onUpdate }) => {
  const [inputUrl, setInputUrl] = useState(block.metadata?.url || '');
  const gifUrl = block.metadata?.url;

  const handleEmbed = () => {
    onUpdate({ metadata: { ...block.metadata, url: inputUrl } });
  };

  return (
    <div className="space-y-2 my-2">
      {!gifUrl ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-accent/10">
          <FileImage className="w-4 h-4 text-primary" />
          <Input
            type="url"
            placeholder="Cole um link de GIF e pressione Enter..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleEmbed();
              }
            }}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground border-none focus:ring-0"
          />
          <Button size="sm" onClick={handleEmbed} disabled={!inputUrl}>
            <Check className="w-4 h-4 mr-2" /> Incorporar
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <img
            src={gifUrl}
            alt={block.content || 'GIF incorporado'}
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}
      <input
        type="text"
        value={block.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Legenda do GIF..."
        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm text-center"
      />
    </div>
  );
};