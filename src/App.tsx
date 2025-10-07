import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AIErrorBoundary } from "@/components/AIErrorBoundary";
import { useChatbot } from "@/hooks/useChatbot";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize the chatbot
  const { isLoaded, isError, error } = useChatbot();

  // Optional: Log chatbot status (can be removed in production)
  if (isError && error) {
    console.warn('Chatbot failed to load:', error.message);
  } else if (isLoaded) {
    console.log('Chatbot loaded successfully');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AIErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AIErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
