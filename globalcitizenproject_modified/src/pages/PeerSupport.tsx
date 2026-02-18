import { MessageCircle, Heart, ThumbsUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const PeerSupport = () => {
  const posts = [
    {
      id: 1,
      author: "User 42",
      avatar: "U42",
      time: "2 hours ago",
      topic: "Dealing with Anxiety",
      content: "I've been struggling with anxiety lately, especially before exams. Does anyone have tips on how to cope?",
      replies: 12,
      likes: 24,
      tags: ["Anxiety", "Coping"]
    },
    {
      id: 2,
      author: "User 18",
      avatar: "U18",
      time: "5 hours ago",
      topic: "Small Victory Today",
      content: "I finally talked to my parents about how I've been feeling. It was scary but they were so supportive. Just wanted to share this win!",
      replies: 8,
      likes: 45,
      tags: ["Victory", "Family"]
    },
    {
      id: 3,
      author: "User 91",
      avatar: "U91",
      time: "1 day ago",
      topic: "Sleep Troubles",
      content: "Has anyone found good ways to improve sleep? My mind races at night and I can't seem to turn it off.",
      replies: 15,
      likes: 18,
      tags: ["Sleep", "Self-care"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 md:mb-3">Peer Support Forum</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              A safe space to share your story, support others, and connect with peers who understand.
            </p>
          </div>

          <div className="mb-6 md:mb-8">
            <Button variant="hero" size="lg" className="w-full sm:w-auto">
              <MessageCircle className="w-5 h-5 mr-2" />
              Start a New Discussion
            </Button>
          </div>

          <div className="space-y-4 md:space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 md:gap-4">
                  <Avatar className="bg-primary flex-shrink-0 w-9 h-9 md:w-10 md:h-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs md:text-sm">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-foreground text-sm md:text-base">{post.author}</h3>
                      <span className="text-xs md:text-sm text-muted-foreground">{post.time}</span>
                    </div>
                    
                    <h2 className="text-base md:text-xl font-semibold text-foreground mb-2">{post.topic}</h2>
                    <p className="text-sm md:text-base text-foreground mb-3">{post.content}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-6">
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs md:text-sm">{post.replies} replies</span>
                      </button>
                      
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs md:text-sm">{post.likes} likes</span>
                      </button>
                      
                      <button className="flex items-center gap-1.5 text-muted-foreground hover:text-secondary transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs md:text-sm">Support</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PeerSupport;
