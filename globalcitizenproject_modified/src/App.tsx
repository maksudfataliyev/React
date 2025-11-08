import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PeerSupport from "./pages/PeerSupport";
import GroupChats from "./pages/GroupChats";
import DailyCheckIn from "./pages/DailyCheckIn";
import MoodHistory from "./pages/MoodHistory";
import Webinars from "./pages/Webinars";
import FindProfessional from "./pages/FindProfessional";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/peer-support" element={<PeerSupport />} />
          <Route path="/group-chats" element={<GroupChats />} />
          <Route path="/daily-checkin" element={<DailyCheckIn />} />
          <Route path="/mood-history" element={<MoodHistory />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/find-professional" element={<FindProfessional />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
