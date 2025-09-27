import React, { useState } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlockProps } from './types';

export const LinkBlock: React.FC<BlockProps> = ({ block, onUpdate }) => {
  const [inputUrl, setInputUrl] = useState(block.metadata?.url || '');
  const linkUrl = block.metadata?.url;

  const handleEmbed = () => {
    let finalUrl = inputUrl.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    onUpdate({ metadata: { ...block.metadata, url: finalUrl } });
  };

  if (!linkUrl) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-accent/10 my-2">
        <LinkIcon className="w-4 h-4 text-primary" />
        <Input
          type="url"
          placeholder="Cole uma URL e pressione Enter..."
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
          <Check className="w-4 h-4 mr-2" /> Criar Link
        </Button>
      </div>
    );
  }

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 my-2 border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <LinkIcon className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1 text-sm text-foreground truncate">{linkUrl}</div>
    </a>
  );
};