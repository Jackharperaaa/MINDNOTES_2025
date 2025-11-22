import { MindNotesApp } from '@/components/MindNotesApp';
import { useSession } from '@/contexts/SessionContext'; // Import useSession

const Index = () => {
  const { user, isLoading } = useSession(); // Get session state

  // If still loading, SessionContextProvider will show its own loading state.
  // If not loading and user is authenticated, render the app.
  if (user) {
    return <MindNotesApp />;
  }

  // If not loading and no user, SessionContextProvider should have already redirected to /login.
  // So, we return null here as this route won't be active for unauthenticated users.
  return null;
};

export default Index;