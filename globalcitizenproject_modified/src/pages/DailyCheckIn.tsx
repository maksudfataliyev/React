import { Smile, Meh, Frown, Heart, Cloud, Sun, CloudRain } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const DailyCheckIn = () => {
  const moods = [
    { icon: Sun, label: "Great", color: "text-yunity-yellow" },
    { icon: Smile, label: "Good", color: "text-yunity-mint" },
    { icon: Meh, label: "Okay", color: "text-yunity-teal" },
    { icon: Cloud, label: "Not Great", color: "text-muted-foreground" },
    { icon: CloudRain, label: "Difficult", color: "text-yunity-coral" }
  ];

  const activities = [
    "Exercise", "Social Time", "Therapy", "Meditation",
    "Creative Work", "Rest", "Learning", "Outdoor Time"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 md:mb-3">Daily Check-In</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Take a moment to reflect on how you're feeling today.
            </p>
          </div>

          <Card className="p-5 md:p-8 mb-5 md:mb-6">
            <div className="space-y-6 md:space-y-8">
              {/* Mood Selection */}
              <div>
                <Label className="text-base md:text-lg font-semibold mb-3 md:mb-4 block">How are you feeling today?</Label>
                <div className="grid grid-cols-5 gap-1.5 md:gap-4">
                  {moods.map((mood) => (
                    <button
                      key={mood.label}
                      className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <mood.icon className={`w-6 h-6 md:w-8 md:h-8 ${mood.color}`} />
                      <span className="text-[10px] md:text-sm font-medium text-center leading-tight">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <Label className="text-base md:text-lg font-semibold mb-3 md:mb-4 block">Energy Level</Label>
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">Low</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    defaultValue="5"
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-muted"
                  />
                  <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">High</span>
                </div>
              </div>

              {/* Activities */}
              <div>
                <Label className="text-base md:text-lg font-semibold mb-3 md:mb-4 block">Activities Today</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {activities.map((activity) => (
                    <button
                      key={activity}
                      className="p-2 md:p-3 text-xs md:text-sm rounded-lg border-2 border-border hover:border-secondary hover:bg-secondary/10 transition-all"
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-base md:text-lg font-semibold mb-3 md:mb-4 block">Notes (Optional)</Label>
                <Textarea 
                  placeholder="How was your day? Any thoughts you'd like to record?"
                  className="min-h-[100px] md:min-h-[120px] resize-none"
                />
              </div>

              {/* Gratitude */}
              <div>
                <Label className="text-base md:text-lg font-semibold mb-3 md:mb-4 block">
                  <Heart className="w-4 h-4 md:w-5 md:h-5 inline mr-2 text-accent" />
                  One thing you're grateful for today
                </Label>
                <Textarea 
                  placeholder="What brought you joy or peace today?"
                  className="min-h-[70px] md:min-h-[80px] resize-none"
                />
              </div>

              <Button variant="hero" size="lg" className="w-full">
                Save Check-In
              </Button>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-accent/10 border-accent">
            <div className="flex items-start gap-3 md:gap-4">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1 md:mb-2">Keep Going!</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  You're on a 7-day streak! Regular check-ins help you understand your patterns and celebrate progress.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DailyCheckIn;
