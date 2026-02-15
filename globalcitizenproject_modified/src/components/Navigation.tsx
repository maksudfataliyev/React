import { ChevronDown, User, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "./Logo";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-primary text-primary-foreground py-4 px-6 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <button onClick={() => navigate("/")} className="cursor-pointer">
          <Logo />
        </button>
        
        <div className="flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-semibold uppercase text-sm hover:text-secondary transition-colors">
              Chat <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover z-50">
              <DropdownMenuItem onClick={() => navigate("/peer-support")}>Peer Support</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/group-chats")}>Group Chats</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/message-board")}>Message Board</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-semibold uppercase text-sm hover:text-secondary transition-colors">
              Edu <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover z-50">
              <DropdownMenuItem onClick={() => navigate("/webinars")}>Webinars</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/resources")}>Resources</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/articles")}>Articles</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-semibold uppercase text-sm hover:text-secondary transition-colors">
              Mood Tracker <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover z-50">
              <DropdownMenuItem onClick={() => navigate("/daily-checkin")}>Daily Check-in</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/mood-history")}>Mood History</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/insights")}>Insights</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-semibold uppercase text-sm hover:text-secondary transition-colors">
              Consult <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover z-50">
              <DropdownMenuItem onClick={() => navigate("/find-professional")}>Find a Professional</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/book-session")}>Book Session</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/crisis-support")}>Crisis Support</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-foreground/20">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover z-50" align="end">
                <DropdownMenuItem className="font-semibold">{user?.name}</DropdownMenuItem>
                <DropdownMenuItem className="text-muted-foreground text-xs">{user?.email}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate("/auth"); }}>
                  <LogOut className="w-4 h-4 mr-2" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" className="hover:bg-primary-foreground/20 gap-2" onClick={() => navigate("/auth")}>
              <LogIn className="w-4 h-4" /> Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
