import React, { useState, useMemo } from 'react';
import { Video, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlockProps } from './types';

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  let videoId = '';
  
  // YouTube
  let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (match) {
    videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Vimeo
  match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match) {
    videoId = match[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return null;
};

export const VideoBlock: React.FC<BlockProps> = ({ block, onUpdate }) => {
  const [inputUrl, setInputUrl] = useState(block.metadata?.url || '');
  const embedUrl = useMemo(() => getEmbedUrl(block.metadata?.url || ''), [block.metadata?.url]);

  const handleEmbed = () => {
    onUpdate({ metadata: { ...block.metadata, url: inputUrl } });
  };

  return (
    <div className="space-y-2 my-2">
      {!embedUrl ? (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-accent/10">
          <Video className="w-4 h-4 text-primary" />
          <Input
            type="url"
            placeholder="Cole um link do YouTube ou Vimeo e pressione Enter..."
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
        <div className="aspect-video relative">
          <iframe
            src={embedUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          ></iframe>
        </div>
      )}
      <input
        type="text"
        value={block.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Legenda do vídeo..."
        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm text-center"
      />
    </div>
  );
};