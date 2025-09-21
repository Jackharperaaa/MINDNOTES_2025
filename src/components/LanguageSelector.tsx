import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'zh' as Language, name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'es' as Language, name: 'Spanish', flag: '🇪🇸' },
  { code: 'ar' as Language, name: 'Arabic', flag: '🇸🇦' },
  { code: 'id' as Language, name: 'Indonesian', flag: '🇮🇩' },
  { code: 'pt' as Language, name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'fr' as Language, name: 'French', flag: '🇫🇷' },
  { code: 'ja' as Language, name: 'Japanese', flag: '🇯🇵' },
  { code: 'ru' as Language, name: 'Russian', flag: '🇷🇺' },
];

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-border bg-card hover:bg-accent transition-colors"
        >
          <Globe className="h-4 w-4 mr-2" />
          {currentLanguage?.flag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-popover border-border shadow-card"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer hover:bg-accent transition-colors ${
              language === lang.code ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};