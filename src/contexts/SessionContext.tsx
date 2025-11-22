import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isReady: boolean; // New state to indicate if auth check is complete and redirects handled
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
  const [isLoading, setIsLoading] = useState(true); // Initial loading for session fetch
  const [isReady, setIsReady] = useState(false); // New state for when auth logic is fully processed
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const handleAuthStateChange = (event: string, currentSession: Session | null) => {
      if (!isMounted) return;

      setSession(currentSession);
      setUser(currentSession?.user || null);
      setIsLoading(false); // Auth state change means initial loading is done
      setIsReady(true); // Auth state change means we've processed auth logic

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (currentSession && location.pathname === '/login') {
          navigate('/');
        }
      } else if (event === 'SIGNED_OUT') {
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;

      setSession(initialSession);
      setUser(initialSession?.user || null);
      setIsLoading(false); // Initial session fetch is complete

      const needsLoginRedirect = !initialSession && location.pathname !== '/login';
      const needsAppRedirect = initialSession && location.pathname === '/login';

      if (needsLoginRedirect) {
        navigate('/login');
      } else if (needsAppRedirect) {
        navigate('/');
      }
      // In all cases, after this initial check, the auth logic is processed.
      // If a redirect happened, the new route will handle its own rendering.
      // If no redirect, we are ready to render children.
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]); // Depend on location.pathname to re-evaluate redirects if path changes

  // Only render children when the session context is fully ready
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Loading authentication...
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, user, isLoading, isReady }}>
      {children}
    </SessionContext.Provider>
  );
};