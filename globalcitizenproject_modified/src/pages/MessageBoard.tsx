import { MessageSquare, Pin, Clock, ArrowUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const MessageBoard = () => {
  const threads = [
    { id: 1, title: "Tips for managing exam stress", author: "User 23", replies: 34, views: 256, pinned: true, category: "Coping", lastActive: "10 min ago" },
    { id: 2, title: "How I overcame social anxiety — my story", author: "User 55", replies: 67, views: 892, pinned: true, category: "Stories", lastActive: "1 hr ago" },
    { id: 3, title: "Best meditation apps for teens?", author: "User 12", replies: 19, views: 134, pinned: false, category: "Resources", lastActive: "2 hrs ago" },
    { id: 4, title: "Anyone else feel lonely at uni?", author: "User 88", replies: 42, views: 567, pinned: false, category: "Support", lastActive: "3 hrs ago" },
    { id: 5, title: "Weekly gratitude thread 🌟", author: "Moderator", replies: 89, views: 1203, pinned: false, category: "Community", lastActive: "30 min ago" },
    { id: 6, title: "Setting healthy boundaries with friends", author: "User 41", replies: 15, views: 210, pinned: false, category: "Relationships", lastActive: "5 hrs ago" },
  ];

  const categoryColors: Record<string, string> = {
    Coping: "bg-primary text-primary-foreground",
    Stories: "bg-secondary text-secondary-foreground",
    Resources: "bg-yunity-mint text-foreground",
    Support: "bg-accent text-accent-foreground",
    Community: "bg-yunity-yellow text-secondary-foreground",
    Relationships: "bg-yunity-teal text-primary-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-3">Message Board</h1>
              <p className="text-lg text-muted-foreground">Share thoughts, ask questions, and connect with the community.</p>
            </div>
            <Button variant="hero"><MessageSquare className="w-5 h-5 mr-2" />New Thread</Button>
          </div>

          <Card className="p-4 mb-8">
            <Input placeholder="Search threads..." className="border-none shadow-none" />
          </Card>

          <div className="space-y-3">
            {threads.map((thread) => (
              <Card key={thread.id} className="p-5 hover:shadow-md transition-all cursor-pointer hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 text-muted-foreground min-w-[50px]">
                    <ArrowUp className="w-5 h-5 hover:text-primary cursor-pointer" />
                    <span className="text-sm font-semibold">{thread.replies}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {thread.pinned && <Pin className="w-4 h-4 text-primary" />}
                      <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">{thread.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{thread.author}</span>
                      <span>•</span>
                      <span>{thread.views} views</span>
                      <span>•</span>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{thread.lastActive}</div>
                    </div>
                  </div>
                  <Badge className={categoryColors[thread.category] || ""}>{thread.category}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessageBoard;
