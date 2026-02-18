import { useState } from "react";
import { ChevronDown, User, LogOut, LogIn, Menu, X, MessageCircle, BookOpen, Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import Logo from "./Logo";
import { useAuth } from "@/contexts/AuthContext";

const navSections = [
  {
    label: "Chat",
    icon: MessageCircle,
    items: [
      { label: "Peer Support", path: "/peer-support" },
      { label: "Group Chats", path: "/group-chats" },
      { label: "Message Board", path: "/message-board" },
    ],
  },
  {
    label: "Edu",
    icon: BookOpen,
    items: [
      { label: "Webinars", path: "/webinars" },
      { label: "Resources", path: "/resources" },
      { label: "Articles", path: "/articles" },
    ],
  },
  {
    label: "Mood Tracker",
    icon: Heart,
    items: [
      { label: "Daily Check-in", path: "/daily-checkin" },
      { label: "Mood History", path: "/mood-history" },
      { label: "Insights", path: "/insights" },
    ],
  },
  {
    label: "Consult",
    icon: Users,
    items: [
      { label: "Find a Professional", path: "/find-professional" },
      { label: "Book Session", path: "/book-session" },
      { label: "Crisis Support", path: "/crisis-support" },
    ],
  },
];

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setExpandedSection(null);
  };

  return (
    <nav className="bg-primary text-primary-foreground py-4 px-4 md:px-6 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <button onClick={() => navigate("/")} className="cursor-pointer flex-shrink-0">
          <Logo />
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navSections.map((section) => (
            <DropdownMenu key={section.label}>
              <DropdownMenuTrigger className="flex items-center gap-1 font-semibold uppercase text-sm hover:text-secondary transition-colors">
                {section.label} <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover z-50">
                {section.items.map((item) => (
                  <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

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

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated ? (
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-foreground/20" onClick={() => navigate("/auth")}>
              <User className="w-5 h-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="hover:bg-primary-foreground/20 gap-1 text-xs px-2" onClick={() => navigate("/auth")}>
              <LogIn className="w-4 h-4" /> Sign In
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/20">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-0 overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
                <Logo />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/20 text-primary-foreground">
                    <X className="w-5 h-5" />
                  </Button>
                </SheetClose>
              </div>

              {isAuthenticated && (
                <div className="p-4 border-b bg-muted/50">
                  <p className="font-bold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              )}

              <div className="py-2">
                {navSections.map((section) => {
                  const Icon = section.icon;
                  const isExpanded = expandedSection === section.label;
                  return (
                    <div key={section.label}>
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 font-semibold uppercase text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setExpandedSection(isExpanded ? null : section.label)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          {section.label}
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      {isExpanded && (
                        <div className="bg-muted/30 pl-10 pr-4">
                          {section.items.map((item) => (
                            <button
                              key={item.path}
                              className="w-full text-left py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-border/40 last:border-0"
                              onClick={() => handleNav(item.path)}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t mt-2">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => { logout(); navigate("/auth"); setMobileOpen(false); }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                ) : (
                  <Button variant="hero" className="w-full gap-2" onClick={() => handleNav("/auth")}>
                    <LogIn className="w-4 h-4" /> Sign In / Register
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
