import { MindNotesApp } from '@/components/MindNotesApp';
import { useSession } from '@/contexts/SessionContext'; // Import useSession

const Index = () => {
  const { user, isReady } = useSession(); // Get session state and isReady flag

  // While the session context is not ready, show a loading state.
  // SessionContextProvider itself will show a global loading, but this is a safeguard.
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Preparing app...
      </div>
    );
  }

  // If isReady is true and a user is authenticated, render the main app.
  if (user) {
    return <MindNotesApp />;
  }

  // If isReady is true and no user, the SessionContextProvider should have already
  // redirected to /login. So, this component should not render anything here.
  return null;
};

export default Index;