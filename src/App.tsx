import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SessionContextProvider, useSession } from "@/contexts/SessionContext"; // Import SessionContextProvider and useSession
import Index from "./pages/Index";
import Login from "./pages/Login"; // Import Login page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useSession();

  if (isLoading) {
    // You can render a loading spinner here
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading application...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Index />
            </PrivateRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <SessionContextProvider> {/* Wrap with SessionContextProvider */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent /> {/* Render AppContent which uses useSession */}
        </TooltipProvider>
      </SessionContextProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;