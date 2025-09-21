import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

function Login() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-foreground text-center mb-6">
          {t('loginTitle')}
        </h1>
        <Auth
          supabaseClient={supabase}
          providers={[]} // You can add 'google', 'github', etc. here if needed
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                  inputBackground: 'hsl(var(--secondary))',
                  inputBorder: 'hsl(var(--border))',
                  inputBorderHover: 'hsl(var(--primary))',
                  inputBorderFocus: 'hsl(var(--primary))',
                  inputText: 'hsl(var(--foreground))',
                  inputPlaceholder: 'hsl(var(--muted-foreground))',
                  messageText: 'hsl(var(--foreground))',
                  messageBackground: 'hsl(var(--accent))',
                  messageActionHover: 'hsl(var(--accent-foreground))',
                  anchorTextColor: 'hsl(var(--primary))',
                  anchorTextHoverColor: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="dark" // Using dark theme to match your app's aesthetic
          localization={{
            variables: {
              sign_in: {
                email_label: t('emailLabel'),
                password_label: t('passwordLabel'),
                email_input_placeholder: t('emailPlaceholder'),
                password_input_placeholder: t('passwordPlaceholder'),
                button_label: t('signInButton'),
                social_auth_button: t('signInWithSocial'),
                link_text: t('alreadyHaveAccount'),
              },
              sign_up: {
                email_label: t('emailLabel'),
                password_label: t('passwordLabel'),
                email_input_placeholder: t('emailPlaceholder'),
                password_input_placeholder: t('passwordPlaceholder'),
                button_label: t('signUpButton'),
                social_auth_button: t('signUpWithSocial'),
                link_text: t('dontHaveAccount'),
              },
              forgotten_password: {
                email_label: t('emailLabel'),
                password_label: t('passwordLabel'),
                email_input_placeholder: t('emailPlaceholder'),
                button_label: t('sendResetInstructions'),
                link_text: t('forgotPassword'),
              },
              update_password: {
                password_label: t('passwordLabel'),
                password_input_placeholder: t('passwordPlaceholder'),
                button_label: t('updatePassword'),
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default Login;