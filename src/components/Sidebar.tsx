import { motion } from 'framer-motion';
import { BookOpen, MessageCircle, Zap, LogOut } from 'lucide-react';
import { AppState } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { toast } from 'sonner'; // Import sonner for notifications

interface SidebarProps {
  activeTab: AppState['activeTab'];
  onTabChange: (tab: AppState['activeTab']) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { t } = useLanguage();
  const tabs = [
    { id: 'notes' as const, label: t('notes'), icon: BookOpen },
    { id: 'chat' as const, label: t('aiChat'), icon: MessageCircle },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      toast.error(t('logoutError'));
    } else {
      toast.success(t('logoutSuccess'));
    }
  };

  return (
    <div className="w-64 bg-gradient-main border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 flex items-center justify-center">
            <img 
              src="/lovable-uploads/e3eb03ed-d702-4438-a216-a2815d20ed54.png" 
              alt="Mind Notes Logo" 
              className="w-18 h-18" 
            />
          </div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            MIND NOTES
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm
                  transition-all duration-200 relative
                  ${isActive 
                    ? 'text-primary-foreground bg-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
                whileHover={{ x: isActive ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">{t('logout')}</span>
        </motion.button>
      </div>
    </div>
  );
};