import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};

interface SessionContextProviderProps {
  children: ReactNode;
}

export const SessionContextProvider: React.FC<SessionContextProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setIsLoading(false);

      // Redirect logic based on initial session check
      if (!currentSession && window.location.pathname !== '/login') {
        navigate('/login');
      } else if (currentSession && window.location.pathname === '/login') {
        navigate('/');
      }
    };

    checkSession(); // Perform initial session check when component mounts

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      // No need to set isLoading here, as it's already handled by checkSession
      // and subsequent state changes don't necessarily mean a "loading" state for the whole app.

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (currentSession && window.location.pathname === '/login') {
          navigate('/');
        }
      } else if (event === 'SIGNED_OUT') {
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Render a loading state while the session is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};