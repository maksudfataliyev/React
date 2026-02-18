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
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 md:mb-3">Mental Health Webinars</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Learn from experts and connect with others in live educational sessions.
            </p>
          </div>

          {/* Upcoming Webinars */}
          <section className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">Upcoming Webinars</h2>
            <div className="space-y-4 md:space-y-6">
              {upcomingWebinars.map((webinar, index) => (
                <Card key={index} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-shrink-0 bg-primary/10 rounded-lg p-4 md:p-8 flex items-center justify-center">
                      <Video className="w-10 h-10 md:w-16 md:h-16 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg md:text-2xl font-bold text-foreground mb-1 md:mb-2">{webinar.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">{webinar.presenter}</p>
                      
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                        {webinar.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs md:text-sm">{topic}</Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{webinar.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{webinar.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{webinar.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{webinar.attendees} registered</span>
                        </div>
                      </div>

                      <Button variant="hero" className="w-full sm:w-auto">Register Now</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Past Webinars */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">Watch Past Webinars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {pastWebinars.map((webinar, index) => (
                <Card key={index} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-primary/10 rounded-lg mb-3 md:mb-4 flex items-center justify-center">
                    <Video className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-foreground mb-1 md:mb-2">{webinar.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">{webinar.presenter}</p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
                      <span>{webinar.views.toLocaleString()} views</span>
                      <span>⭐ {webinar.rating}</span>
                    </div>
                    <Button variant="default" size="sm" className="text-xs md:text-sm">Watch Now</Button>
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
