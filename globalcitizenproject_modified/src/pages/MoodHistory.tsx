import { Calendar, TrendingUp, Heart } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MoodHistory = () => {
  const weekData = [
    { day: "Mon", mood: 7, label: "Good" },
    { day: "Tue", mood: 5, label: "Okay" },
    { day: "Wed", mood: 8, label: "Great" },
    { day: "Thu", mood: 6, label: "Good" },
    { day: "Fri", mood: 4, label: "Not Great" },
    { day: "Sat", mood: 7, label: "Good" },
    { day: "Sun", mood: 9, label: "Great" }
  ];

  const recentEntries = [
    { date: "Today", mood: "Great", energy: 8, note: "Had a productive day and connected with friends!" },
    { date: "Yesterday", mood: "Good", energy: 7, note: "Went for a walk and felt more relaxed." },
    { date: "2 days ago", mood: "Okay", energy: 5, note: "Bit stressed about upcoming exams." }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Mood History</h1>
            <p className="text-lg text-muted-foreground">
              Track your emotional journey and discover patterns over time.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border-t-4 border-yunity-teal">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-yunity-teal" />
                <h3 className="font-semibold text-muted-foreground">Check-in Streak</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">7 Days</p>
            </Card>

            <Card className="p-6 border-t-4 border-yunity-yellow">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-yunity-yellow" />
                <h3 className="font-semibold text-muted-foreground">Average Mood</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">Good</p>
            </Card>

            <Card className="p-6 border-t-4 border-yunity-coral">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-6 h-6 text-yunity-coral" />
                <h3 className="font-semibold text-muted-foreground">Total Entries</h3>
              </div>
              <p className="text-3xl font-bold text-foreground">42</p>
            </Card>
          </div>

          {/* Weekly Chart */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">This Week</h2>
            <div className="flex items-end justify-between gap-4 h-64">
              {weekData.map((day) => (
                <div key={day.day} className="flex flex-col items-center flex-1 h-full justify-end">
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${day.mood * 10}%` }}
                    ></div>
                  </div>
                  <Badge variant="secondary" className="mt-3 text-xs">{day.label}</Badge>
                  <span className="text-sm font-medium text-muted-foreground mt-2">{day.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Entries */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Entries</h2>
            <div className="space-y-4">
              {recentEntries.map((entry, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{entry.date}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-primary text-primary-foreground">{entry.mood}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Energy: {entry.energy}/10
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground">{entry.note}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MoodHistory;
