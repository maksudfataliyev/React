import { Users, Lock, Globe, MessageSquare } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GroupChats = () => {
  const groups = [
    {
      id: 1,
      name: "Teen Anxiety Support",
      members: 124,
      online: 12,
      description: "A supportive group for teens dealing with anxiety and stress.",
      isPrivate: false,
      color: "yunity-teal"
    },
    {
      id: 2,
      name: "College Life Balance",
      members: 89,
      online: 8,
      description: "Discussing work-life balance, studying tips, and managing college stress.",
      isPrivate: false,
      color: "yunity-yellow"
    },
    {
      id: 3,
      name: "LGBTQ+ Safe Space",
      members: 156,
      online: 15,
      description: "A welcoming community for LGBTQ+ youth to share experiences and support.",
      isPrivate: true,
      color: "yunity-coral"
    },
    {
      id: 4,
      name: "Creative Minds",
      members: 67,
      online: 5,
      description: "For young people using creativity and art as mental health tools.",
      isPrivate: false,
      color: "yunity-mint"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Group Chats</h1>
            <p className="text-lg text-muted-foreground">
              Join communities of peers who share similar experiences and interests.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-lg transition-all duration-300 border-t-4 border-yunity-teal">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`bg-${group.color} rounded-full p-3`}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{group.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        {group.isPrivate ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {group.isPrivate ? "Private" : "Public"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-foreground mb-4">{group.description}</p>

                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {group.members} members
                  </Badge>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">{group.online} online</span>
                  </div>
                </div>

                <Button variant="default" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
              </Card>
            ))}
          </div>

          <Card className="mt-8 p-8 bg-primary/5 border-primary">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Want to start your own group?
              </h3>
              <p className="text-muted-foreground mb-6">
                Create a safe space for others who share your experiences.
              </p>
              <Button variant="hero">
                <Users className="w-5 h-5 mr-2" />
                Create New Group
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default GroupChats;
