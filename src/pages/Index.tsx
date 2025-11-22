import { MindNotesApp } from '@/components/MindNotesApp';
import { useSession } from '@/contexts/SessionContext'; // Import useSession

const Index = () => {
  const { isReady } = useSession(); // Get isReady flag

  // While the session context is not ready, show a loading state.
  // SessionContextProvider itself will show a global loading.
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Preparando o aplicativo...
      </div>
    );
  }

  // Once SessionContextProvider is ready, always render MindNotesApp.
  // MindNotesApp will now handle whether to show content or a login prompt.
  return <MindNotesApp />;
};

export default Index;