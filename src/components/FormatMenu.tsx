import { motion } from 'framer-motion';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  ChevronDown, 
  Code, 
  Quote, 
  Minus, 
  Square,
  FileText,
  Plus,
  Link,
  Image,
  Video,
  FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface FormatMenuProps {
  onSelect: (type: string, value?: string) => void;
  onClose: () => void;
}

export const FormatMenu = ({ onSelect, onClose }: FormatMenuProps) => {
  const { t } = useLanguage();

  const formatOptions = [
    { type: 'text', icon: Type, label: t('normalText') },
    { type: 'heading1', icon: Heading1, label: t('largeHeading') },
    { type: 'heading2', icon: Heading2, label: t('mediumHeading') },
    { type: 'heading3', icon: Heading3, label: t('smallHeading') },
    { type: 'bullet', icon: List, label: t('bulletList') },
    { type: 'numbered', icon: ListOrdered, label: t('numberedList') },
    { type: 'checklist', icon: CheckSquare, label: t('taskList') },
    { type: 'code', icon: Code, label: 'Code Block' },
    { type: 'quote', icon: Quote, label: 'Quote' },
    { type: 'link', icon: Link, label: 'Link' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'video', icon: Video, label: 'Video' },
    { type: 'gif', icon: FileImage, label: 'GIF' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-20 left-4 right-4 z-[100] bg-popover border border-border rounded-lg shadow-xl p-2 grid grid-cols-3 gap-1 max-w-[500px] mx-auto"
      style={{
        maxHeight: 'calc(100vh - 6rem)',
        overflowY: 'auto'
      }}
    >
      {formatOptions.map((option) => {
        const Icon = option.icon;
        return (
          <Button
            key={option.type}
            variant="ghost"
            size="sm"
            className="justify-start gap-2 h-8 text-xs"
            onClick={() => onSelect(option.type)}
          >
            <Icon className="w-4 h-4" />
            {option.label}
          </Button>
        );
      })}
      
      <Button
        variant="ghost"
        size="sm"
        className="col-span-3 mt-2 text-xs"
        onClick={onClose}
      >
        {t('close')}
      </Button>
    </motion.div>
  );
};