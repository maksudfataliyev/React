import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import PeerSupport from "./pages/PeerSupport";
import GroupChats from "./pages/GroupChats";
import MessageBoard from "./pages/MessageBoard";
import DailyCheckIn from "./pages/DailyCheckIn";
import MoodHistory from "./pages/MoodHistory";
import Insights from "./pages/Insights";
import Webinars from "./pages/Webinars";
import Resources from "./pages/Resources";
import Articles from "./pages/Articles";
import FindProfessional from "./pages/FindProfessional";
import BookSession from "./pages/BookSession";
import CrisisSupport from "./pages/CrisisSupport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/peer-support" element={<PeerSupport />} />
            <Route path="/group-chats" element={<GroupChats />} />
            <Route path="/message-board" element={<MessageBoard />} />
            <Route path="/daily-checkin" element={<DailyCheckIn />} />
            <Route path="/mood-history" element={<MoodHistory />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/webinars" element={<Webinars />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/find-professional" element={<FindProfessional />} />
            <Route path="/book-session" element={<BookSession />} />
            <Route path="/crisis-support" element={<CrisisSupport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
