import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Plus, FileText, Trash2, Link, Image, Video, FileImage, Copy, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EditorBlock as BlockType } from '@/types';
import { cn } from '@/lib/utils';
import { TextFormattingToolbar } from './TextFormattingToolbar';

interface EditorBlockProps {
  block: BlockType;
  index: number;
  onUpdate: (index: number, block: BlockType) => void;
  onDelete: (index: number) => void;
  onAddBlock: (index: number, type: string) => void;
  onCreateSubpage: (title: string) => void;
  level?: number;
}

export const EditorBlock = ({ 
  block, 
  index, 
  onUpdate, 
  onDelete, 
  onAddBlock,
  onCreateSubpage,
  level = 0 
}: EditorBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateContent = (content: string) => {
    onUpdate(index, { ...block, content });
  };

  const updateChecked = (checked: boolean) => {
    onUpdate(index, { ...block, checked });
  };

  const toggleCollapsed = () => {
    onUpdate(index, { ...block, collapsed: !block.collapsed });
  };

  const updateMetadata = (metadata: Partial<BlockType['metadata']>) => {
    onUpdate(index, { 
      ...block, 
      metadata: { ...block.metadata, ...metadata } 
    });
  };

  const addImageUrl = (url: string) => {
    const currentUrls = block.metadata?.urls || [];
    updateMetadata({ urls: [...currentUrls, url] });
  };

  const removeImageUrl = (urlIndex: number) => {
    const currentUrls = block.metadata?.urls || [];
    const newUrls = currentUrls.filter((_, index) => index !== urlIndex);
    updateMetadata({ urls: newUrls });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (block.type === 'numbered' || block.type === 'bullet' || block.type === 'checklist') {
        onAddBlock(index + 1, block.type);
      } else {
        onAddBlock(index + 1, 'text');
      }
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      e.stopPropagation();
      onDelete(index);
    }
  };

  const handleFormat = (format: string, value?: string) => {
    // This function is now handled by the TextFormattingToolbar directly using execCommand
    // We keep it for backward compatibility but the toolbar handles formatting directly
    setShowToolbar(false);
  };

  const renderContent = () => {
    const baseClasses = "w-full bg-transparent border-none outline-none resize-none";
  
  const getStyleClasses = () => {
    const styleClasses = [];
    if (block.style?.color) {
      styleClasses.push(`text-[${block.style.color}]`);
    }
    if (block.style?.backgroundColor) {
      styleClasses.push(`bg-[${block.style.backgroundColor}]`);
    }
    return styleClasses.join(' ');
  };

  const truncateUrl = (url: string, maxLength: number = 30) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
    
    const calculateToolbarPosition = () => {
      const activeElement = inputRef.current;
      if (!activeElement) return;

      const rect = activeElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Position toolbar above the input/textarea
      const x = rect.left + rect.width / 2 - 200; // Center horizontally (400px width / 2)
      const y = rect.top + scrollTop - 60; // 60px above the element
      
      setToolbarPosition({ 
        x: Math.max(10, x), // Ensure it doesn't go off the left edge
        y: Math.max(10, y)  // Ensure it doesn't go off the top edge
      });
    };

    const commonProps = {
      onMouseUp: () => {
        setTimeout(() => {
          const activeElement = inputRef.current;
          if (activeElement) {
            const start = activeElement.selectionStart || 0;
            const end = activeElement.selectionEnd || 0;
            const hasSelection = start !== end;
            setShowToolbar(hasSelection);
            if (hasSelection) {
              calculateToolbarPosition();
            }
          }
        }, 0);
      },
      onKeyUp: () => {
        setTimeout(() => {
          const activeElement = inputRef.current;
          if (activeElement) {
            const start = activeElement.selectionStart || 0;
            const end = activeElement.selectionEnd || 0;
            const hasSelection = start !== end;
            setShowToolbar(hasSelection);
            if (hasSelection) {
              calculateToolbarPosition();
            }
          }
        }, 0);
      },
      onBlur: () => {
        // Keep toolbar visible for a longer time to allow color palette and link dialog interactions
        setTimeout(() => setShowToolbar(false), 500);
      }
    };
    
    switch (block.type) {
      case 'heading1':
        return (
          <div
            ref={inputRef as React.RefObject<HTMLDivElement>}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const target = e.target as HTMLDivElement;
              updateContent(target.innerHTML);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                onAddBlock(index + 1, 'text');
              } else if (e.key === 'Backspace' && (e.target as HTMLDivElement).innerHTML === '') {
                e.preventDefault();
                e.stopPropagation();
                onDelete(index);
              }
            }}
            className={cn(baseClasses, "text-3xl font-bold text-foreground min-h-[48px] outline-none border border-transparent focus:border-border rounded p-2", getStyleClasses())}
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
            data-placeholder="Heading 1"
            {...{
              onMouseUp: () => {
                setTimeout(() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const hasSelection = !range.collapsed;
                    setShowToolbar(hasSelection);
                    if (hasSelection) {
                      const rect = range.getBoundingClientRect();
                      setToolbarPosition({
                        x: rect.left + window.scrollX - 50,
                        y: rect.top + window.scrollY - 50
                      });
                    }
                  }
                }, 0);
              },
              onKeyUp: () => {
                setTimeout(() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const hasSelection = !range.collapsed;
                    setShowToolbar(hasSelection);
                    if (hasSelection) {
                      const rect = range.getBoundingClientRect();
                      setToolbarPosition({
                        x: rect.left + window.scrollX - 50,
                        y: rect.top + window.scrollY - 50
                      });
                    }
                  }
                }, 0);
              },
              onBlur: () => {
                // Increase timeout to allow interaction with toolbar elements
                setTimeout(() => setShowToolbar(false), 1000);
              }
            }}
          />
        );
      
      case 'heading2':
        return (
          <div
            ref={inputRef as React.RefObject<HTMLDivElement>}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const target = e.target as HTMLDivElement;
              updateContent(target.innerHTML);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                onAddBlock(index + 1, 'text');
              } else if (e.key === 'Backspace' && (e.target as HTMLDivElement).innerHTML === '') {
                e.preventDefault();
                e.stopPropagation();
                onDelete(index);
              }
            }}
            className={cn(baseClasses, "text-2xl font-semibold text-foreground min-h-[40px] outline-none border border-transparent focus:border-border rounded p-2", getStyleClasses())}
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
            data-placeholder="Heading 2"
            {...{
              onMouseUp: () => {
                setTimeout(() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const hasSelection = !range.collapsed;
                    setShowToolbar(hasSelection);
                    if (hasSelection) {
                      const rect = range.getBoundingClientRect();
                      setToolbarPosition({
                        x: rect.left + window.scrollX - 50,
                        y: rect.top + window.scrollY - 50
                      });
                    }
                  }
                }, 0);
              },
              onKeyUp: () => {
                setTimeout(() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const hasSelection = !range.collapsed;
                    setShowToolbar(hasSelection);
                    if (hasSelection) {
                      const rect = range.getBoundingClientRect();
                      setToolbarPosition({
                        x: rect.left + window.scrollX - 50,
                        y: rect.top + window.scrollY - 50
                      });
                    }
                  }
                }, 0);
              },
              onBlur: () => {
                // Increase timeout to allow interaction with toolbar elements  
                setTimeout(() => setShowToolbar(false), 1000);
              }
            }}
          />
        );
      
      case 'heading3':
        return (
          <div
            ref={inputRef as React.RefObject<HTMLDivElement>}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const target = e.target as HTMLDivElement;
              updateContent(target.innerHTML);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                onAddBlock(index + 1, 'text');
              } else if (e.key === 'Backspace' && (e.target as HTMLDivElement).innerHTML === '') {
                e.preventDefault();
                e.stopPropagation();
                onDelete(index);
              }
            }}
            className={cn(baseClasses, "text-xl font-medium text-foreground min-h-[32px] outline-none border border-transparent focus:border-border rounded p-2", getStyleClasses())}
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
            data-placeholder="Heading 3"
            {...{
              onMouseUp: () => {
                setTimeout(() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const hasSelection = !range.collapsed;
                    setShowToolbar(hasSelection);
                    if (hasSelection) {
                      const rect = range.getBoundingClientRect();
                      setToolbarPosition({
                        x: rect.left + window.scrollX - 50,
                        y: rect.top + window.scrollY - 50
                      });
                    }
                  }
                }, 0);
              },
              onKeyUp: () => {
                setTimeout(() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const hasSelection = !range.collapsed;
                    setShowToolbar(hasSelection);
                    if (hasSelection) {
                      const rect = range.getBoundingClientRect();
                      setToolbarPosition({
                        x: rect.left + window.scrollX - 50,
                        y: rect.top + window.scrollY - 50
                      });
                    }
                  }
                }, 0);
              },
              onBlur: () => {
                // Increase timeout to allow interaction with toolbar elements
                setTimeout(() => setShowToolbar(false), 1000);
              }
            }}
          />
        );
      
      case 'code':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={block.content}
            onChange={(e) => updateContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(baseClasses, "font-mono text-sm bg-secondary p-3 rounded border-border text-foreground min-h-[60px]", getStyleClasses())}
            placeholder="Enter code..."
            {...commonProps}
          />
        );
      
      case 'quote':
        return (
          <div className="border-l-4 border-primary pl-4 bg-accent/10">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(baseClasses, "italic text-foreground/80 min-h-[40px]", getStyleClasses())}
              placeholder="Quote..."
              {...commonProps}
            />
          </div>
        );
      
      case 'highlight':
        return (
          <div className={cn(
            "p-3 rounded-md border-l-4",
            block.style?.backgroundColor === 'yellow' && "bg-yellow-100 border-yellow-400",
            block.style?.backgroundColor === 'blue' && "bg-blue-100 border-blue-400",
            block.style?.backgroundColor === 'green' && "bg-green-100 border-green-400",
            block.style?.backgroundColor === 'red' && "bg-red-100 border-red-400",
            !block.style?.backgroundColor && "bg-accent/20 border-primary"
          )}>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(baseClasses, "text-foreground min-h-[40px]")}
              placeholder="Highlight note..."
              {...commonProps}
            />
          </div>
        );
      
      case 'bullet':
        return (
          <div className="flex items-start gap-2">
            <span className="text-foreground mt-2">•</span>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(baseClasses, "text-foreground min-h-[24px] flex-1")}
              placeholder="List item"
              {...commonProps}
            />
          </div>
        );
      
      case 'numbered':
        return (
          <div className="flex items-start gap-2">
            <span className="text-foreground mt-2">{index + 1}.</span>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(baseClasses, "text-foreground min-h-[24px] flex-1")}
              placeholder="List item"
              {...commonProps}
            />
          </div>
        );
      
      case 'checklist':
        return (
          <div className="flex items-start gap-2">
            <Checkbox
              checked={block.checked || false}
              onCheckedChange={updateChecked}
              className="mt-1"
            />
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                baseClasses, 
                "text-foreground min-h-[24px] flex-1",
                block.checked && "line-through opacity-60"
              )}
              placeholder="Task"
              {...commonProps}
            />
          </div>
        );
      
      case 'toggle':
        return (
          <Collapsible open={!block.collapsed} onOpenChange={toggleCollapsed}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
              {block.collapsed ? (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(baseClasses, "text-foreground flex-1")}
                placeholder="Toggle list"
                {...commonProps}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-6 mt-2">
              <div className="text-sm text-muted-foreground p-2 border rounded">
                Nested content area (coming soon)
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      
      case 'link':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border rounded-md bg-accent/10 hover:bg-accent/20">
              <Link className="w-4 h-4 text-primary" />
              {block.metadata?.url ? (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-muted-foreground">
                    {truncateUrl(block.metadata.url)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(block.metadata?.url || '', 'link')}
                    className="w-5 h-5 p-0"
                    title="Copy URL"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <input
                  type="url"
                  value={block.metadata?.url || ''}
                  onChange={(e) => updateMetadata({ url: e.target.value })}
                  placeholder="Enter URL..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground"
                />
              )}
            </div>
            {block.metadata?.url && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <a
                  href={block.metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline"
                >
                  {block.content || 'Click to open link'}
                </a>
              </div>
            )}
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Link text..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground"
            />
          </div>
        );
      
      case 'image':
        const imageUrls = block.metadata?.urls || [];
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
                      reader.onload = (event) => {
                        addImageUrl(event.target?.result as string);
                      };
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
                      onClick={() => setExpandedImage(url)}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImageUrl(urlIndex)}
                    >
                      ×
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 left-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50"
                      onClick={() => copyToClipboard(url, `image-${urlIndex}`)}
                      title="Copy URL"
                    >
                      {copiedStates[`image-${urlIndex}`] ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-white" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Image caption..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border rounded-md bg-accent/10">
              <Video className="w-4 h-4 text-primary" />
              {block.metadata?.url ? (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-muted-foreground">
                    {truncateUrl(block.metadata.url)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(block.metadata?.url || '', 'link')}
                    className="w-5 h-5 p-0"
                    title="Copy URL"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <input
                  type="url"
                  value={block.metadata?.url || ''}
                  onChange={(e) => updateMetadata({ url: e.target.value })}
                  placeholder="Video URL..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground"
                />
              )}
              <label className="bg-black text-white px-3 py-1 rounded text-xs cursor-pointer hover:bg-gray-800 transition-colors">
                UPLOAD
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        updateMetadata({ url: event.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            {block.metadata?.url && (
              <div className="relative inline-block">
                <div className="relative w-32 h-20 bg-gray-200 rounded-md border overflow-hidden">
                  <video
                    src={block.metadata.url}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
                  onClick={() => updateMetadata({ url: '' })}
                >
                  ×
                </Button>
              </div>
            )}
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Video caption..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
        );
      
      case 'gif':
        const gifUrls = block.metadata?.urls || [];
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border rounded-md bg-accent/10">
              <FileImage className="w-4 h-4 text-primary" />
              <input
                type="url"
                placeholder="GIF URL..."
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
                  accept="image/gif"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        addImageUrl(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="hidden"
                />
              </label>
            </div>
            
            {gifUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {gifUrls.map((url, urlIndex) => (
                  <div key={urlIndex} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`GIF ${urlIndex + 1}`}
                      className="w-full h-full object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setExpandedImage(url)}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImageUrl(urlIndex)}
                    >
                      ×
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 left-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50"
                      onClick={() => copyToClipboard(url, `gif-${urlIndex}`)}
                      title="Copy URL"
                    >
                      {copiedStates[`gif-${urlIndex}`] ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-white" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="GIF caption..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <div
              ref={inputRef as React.RefObject<HTMLDivElement>}
              contentEditable
              suppressContentEditableWarning
            onInput={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const target = e.target as HTMLDivElement;
              updateContent(target.innerHTML);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                onAddBlock(index + 1, 'text');
              } else if (e.key === 'Backspace' && (e.target as HTMLDivElement).innerHTML === '') {
                e.preventDefault();
                e.stopPropagation();
                onDelete(index);
              }
            }}
              className={cn(
                baseClasses, 
                "text-foreground min-h-[24px] outline-none border border-transparent focus:border-border rounded p-2",
                getStyleClasses()
              )}
              dangerouslySetInnerHTML={{ __html: block.content || '' }}
              data-placeholder="Type something..."
              style={{
                minHeight: '24px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
              {...{
                onMouseUp: () => {
                  setTimeout(() => {
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                      const range = selection.getRangeAt(0);
                      const hasSelection = !range.collapsed;
                      setShowToolbar(hasSelection);
                      if (hasSelection) {
                        const rect = range.getBoundingClientRect();
                        setToolbarPosition({
                          x: rect.left + window.scrollX - 50,
                          y: rect.top + window.scrollY - 50
                        });
                      }
                    }
                  }, 0);
                },
                onKeyUp: () => {
                  setTimeout(() => {
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                      const range = selection.getRangeAt(0);
                      const hasSelection = !range.collapsed;
                      setShowToolbar(hasSelection);
                      if (hasSelection) {
                        const rect = range.getBoundingClientRect();
                        setToolbarPosition({
                          x: rect.left + window.scrollX - 50,
                          y: rect.top + window.scrollY - 50
                        });
                      }
                    }
                  }, 0);
                },
                onBlur: () => {
                  // Increase timeout to allow interaction with toolbar elements
                  setTimeout(() => setShowToolbar(false), 1000);
                }
              }}
            />
            {/* Preview Area */}
            {block.content && (
              <div className="p-3 bg-muted/30 rounded-md border border-muted">
                <div className="text-xs text-muted-foreground mb-2">Preview:</div>
                <div 
                  className="text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={containerRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "group relative",
        level > 0 && "ml-6",
        block.type === 'divider' && "my-2"
      )}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Block controls */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -left-8 top-0 flex flex-col gap-1"
          >
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={() => onAddBlock(index + 1, 'text')}
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
              onClick={() => onDelete(index)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block content */}
      <div className="mb-2">
        {renderContent()}
      </div>

      {/* Rich text formatting toolbar */}
      {showToolbar && (
        <TextFormattingToolbar 
          onFormat={handleFormat} 
          visible={showToolbar}
          position={toolbarPosition}
        />
      )}

      {/* Image expansion modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={expandedImage}
                alt="Expanded view"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-4 right-4 w-8 h-8 p-0"
                onClick={() => setExpandedImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};