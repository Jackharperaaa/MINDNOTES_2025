import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const Login = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-main p-4"
    >
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-card p-8">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/lovable-uploads/e3eb03ed-d702-4438-a216-a2815d20ed54.png" 
            alt="Mind Notes Logo" 
            className="w-24 h-24 mb-4" 
          />
          <h1 className="text-2xl font-bold text-foreground">Mind Notes</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t('chatWelcomeSubtitle')}
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={['google']}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                  brandButtonText: 'hsl(var(--primary-foreground))',
                  defaultButtonBackground: 'hsl(var(--secondary))',
                  defaultButtonBorder: 'hsl(var(--border))',
                  defaultButtonText: 'hsl(var(--foreground))',
                  inputBackground: 'hsl(var(--input))',
                  inputBorder: 'hsl(var(--border))',
                  inputBorderHover: 'hsl(var(--ring))',
                  inputBorderFocus: 'hsl(var(--ring))',
                  inputText: 'hsl(var(--foreground))',
                  inputLabelText: 'hsl(var(--muted-foreground))',
                  inputPlaceholder: 'hsl(var(--muted-foreground))',
                  messageText: 'hsl(var(--foreground))',
                  messageBackground: 'hsl(var(--card))',
                  messageAction: 'hsl(var(--primary))',
                  dividerBackground: 'hsl(var(--border))',
                  anchorTextColor: 'hsl(var(--primary))',
                  anchorTextHoverColor: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="dark" // Using dark theme to match your app's aesthetic
          redirectTo={window.location.origin}
        />
      </div>
    </motion.div>
  );
};

export default Login;