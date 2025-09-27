import React, { useState } from 'react';
import { Image, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockProps } from './types';

export const ImageBlock: React.FC<BlockProps> = ({ block, onUpdate, setExpandedImageUrl }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const imageUrls = block.metadata?.urls || [];

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const addImageUrl = (url: string) => {
    onUpdate({ metadata: { ...block.metadata, urls: [...imageUrls, url] } });
  };

  const removeImageUrl = (urlIndex: number) => {
    const newUrls = imageUrls.filter((_, index) => index !== urlIndex);
    onUpdate({ metadata: { ...block.metadata, urls: newUrls } });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 border rounded-md bg-accent/10">
        <Image className="w-4 h-4 text-primary" />
        <input
          type="url"
          placeholder="Image URL..."
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const url = e.currentTarget.value.trim();
              if (url) {
                addImageUrl(url);
                e.currentTarget.value = '';
              }
            }
          }}
        />
        <label className="bg-black text-white px-3 py-1 rounded text-xs cursor-pointer hover:bg-gray-800 transition-colors">
          UPLOAD
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => addImageUrl(event.target?.result as string);
                reader.readAsDataURL(file);
              });
            }}
            className="hidden"
          />
        </label>
      </div>
      
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {imageUrls.map((url, urlIndex) => (
            <div key={urlIndex} className="relative group aspect-square">
              <img
                src={url}
                alt={`Image ${urlIndex + 1}`}
                className="w-full h-full object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setExpandedImageUrl?.(url)}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <Button size="sm" variant="destructive" className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImageUrl(urlIndex)}>×</Button>
              <Button size="sm" variant="ghost" className="absolute top-2 left-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50" onClick={() => copyToClipboard(url, `image-${urlIndex}`)} title="Copy URL">
                {copiedStates[`image-${urlIndex}`] ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white" />}
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <input
        type="text"
        value={block.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Image caption..."
        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm"
      />
    </div>
  );
};