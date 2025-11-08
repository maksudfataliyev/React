import { Video, Calendar, Clock, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Webinars = () => {
  const upcomingWebinars = [
    {
      title: "Understanding Anxiety: Tools for Teens",
      presenter: "Dr. Sarah Chen, Clinical Psychologist",
      date: "Nov 15, 2025",
      time: "6:00 PM EST",
      duration: "60 min",
      attendees: 234,
      topics: ["Anxiety", "Coping Skills", "Mindfulness"]
    },
    {
      title: "Building Healthy Relationships",
      presenter: "James Rivera, LCSW",
      date: "Nov 20, 2025",
      time: "7:00 PM EST",
      duration: "90 min",
      attendees: 187,
      topics: ["Relationships", "Communication", "Boundaries"]
    },
    {
      title: "Sleep and Mental Health",
      presenter: "Dr. Emily Watson, Sleep Specialist",
      date: "Nov 25, 2025",
      time: "5:30 PM EST",
      duration: "45 min",
      attendees: 156,
      topics: ["Sleep", "Self-care", "Wellness"]
    }
  ];

  const pastWebinars = [
    {
      title: "Stress Management for Students",
      presenter: "Dr. Michael Lee",
      views: 1234,
      rating: 4.8
    },
    {
      title: "Depression: What You Need to Know",
      presenter: "Dr. Amanda Foster",
      views: 2156,
      rating: 4.9
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Mental Health Webinars</h1>
            <p className="text-lg text-muted-foreground">
              Learn from experts and connect with others in live educational sessions.
            </p>
          </div>

          {/* Upcoming Webinars */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Webinars</h2>
            <div className="space-y-6">
              {upcomingWebinars.map((webinar, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 bg-primary/10 rounded-lg p-8 flex items-center justify-center">
                      <Video className="w-16 h-16 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{webinar.title}</h3>
                      <p className="text-muted-foreground mb-4">{webinar.presenter}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {webinar.topics.map((topic) => (
                          <Badge key={topic} variant="secondary">{topic}</Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{webinar.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{webinar.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{webinar.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{webinar.attendees} registered</span>
                        </div>
                      </div>

                      <Button variant="hero">Register Now</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Past Webinars */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Watch Past Webinars</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pastWebinars.map((webinar, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-primary/10 rounded-lg mb-4 flex items-center justify-center">
                    <Video className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{webinar.title}</h3>
                  <p className="text-muted-foreground mb-4">{webinar.presenter}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{webinar.views.toLocaleString()} views</span>
                      <span>⭐ {webinar.rating}</span>
                    </div>
                    <Button variant="default">Watch Now</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Webinars;
