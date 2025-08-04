import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import BottomNavigation from "@/components/BottomNavigation";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Users from "./pages/Users";
import Destinations from "./pages/Destinations";
import Trips from "./pages/Trips";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Experiences from "./pages/Experiences";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
              <Route path="/about" element={<About />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <BottomNavigation />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
