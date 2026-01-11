import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import Reading from "./pages/Reading";
import Shows from "./pages/Shows";
import Songs from "./pages/Songs";
import SavedWords from "./pages/SavedWords";
import DailyChallenge from "./pages/DailyChallenge";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/reading" element={<Reading />} />
              <Route path="/shows" element={<Shows />} />
              <Route path="/songs" element={<Songs />} />
              <Route path="/saved-words" element={<SavedWords />} />
              <Route path="/daily-challenge" element={<DailyChallenge />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              {/* Auth page hidden for now */}
              {/* <Route path="/auth" element={<Auth />} /> */}
              <Route path="/install" element={<Install />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
