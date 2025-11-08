import { ChevronDown, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "./Logo";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-primary text-primary-foreground py-4 px-6 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <button onClick={() => navigate("/")} className="cursor-pointer">
          <Logo />
        </button>
        
        <div className="flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-semibold uppercase text-sm hover:text-secondary transition-colors">
              Chat <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/peer-support")}>Peer Support</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/group-chats")}>Group Chats</DropdownMenuItem>
              <DropdownMenuItem>Message Board</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-semibold uppercase text-sm hover:text-secondary transition-colors">
              Edu <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/webinars")}>Webinars</DropdownMenuItem>
              <DropdownMenuItem>Resources</DropdownMenuItem>
              <DropdownMenuItem>Articles</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-semibold uppercase text-sm hover:text-secondary transition-colors">
              Mood Tracker <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/daily-checkin")}>Daily Check-in</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/mood-history")}>Mood History</DropdownMenuItem>
              <DropdownMenuItem>Insights</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-semibold uppercase text-sm hover:text-secondary transition-colors">
              Consult <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/find-professional")}>Find a Professional</DropdownMenuItem>
              <DropdownMenuItem>Book Session</DropdownMenuItem>
              <DropdownMenuItem>Crisis Support</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-foreground/20">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
