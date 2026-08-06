import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import BottomNavigation from "@/components/BottomNavigation";
import NewPostSheet, { NewEntryMode } from "@/components/NewPostSheet";
import { useEffect, useState } from "react";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Users from "./pages/Users";
import Destinations from "./pages/Destinations";
import Trips from "./pages/Trips";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Experiences from "./pages/Experiences";
import Friends from "./pages/Friends";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import NewPost from "./pages/NewPost";
import About from "./pages/About";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppShell = () => {
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [mode, setMode] = useState<NewEntryMode | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setMode(detail?.mode ?? null);
      setNewPostOpen(true);
    };
    window.addEventListener("open-new-post", handler);
    return () => window.removeEventListener("open-new-post", handler);
  }, []);

  return (
    <>
      <BottomNavigation
        onNewPost={() => {
          setMode(null);
          setNewPostOpen(true);
        }}
      />
      <NewPostSheet open={newPostOpen} onOpenChange={setNewPostOpen} initialMode={mode} />
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="pb-16">
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/map" element={<Index />} />
              <Route path="/users" element={<Users />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:userId" element={<Chat />} />
              <Route path="/post" element={<NewPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/u/:userId" element={<PublicProfile />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <AppShell />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
