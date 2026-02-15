import { TrendingUp, Lightbulb, Target, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Insights = () => {
  const insights = [
    { title: "Your mood tends to dip on Mondays", description: "Over the last month, your Monday check-ins average 2 points lower than other days. Consider adding a Monday morning routine.", icon: TrendingUp, type: "Pattern" },
    { title: "Exercise boosts your mood significantly", description: "Days when you logged exercise showed a 40% improvement in mood scores. Keep moving!", icon: Target, type: "Correlation" },
    { title: "Social time is your superpower", description: "Your best mood days always included social activities. You thrive with connection.", icon: Sparkles, type: "Strength" },
    { title: "Evening journaling helps your sleep", description: "Nights when you completed a check-in, you reported better sleep the next day.", icon: Lightbulb, type: "Tip" },
  ];

  const weeklyScore = 7.2;
  const monthlyTrend = "+12%";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Your Insights</h1>
            <p className="text-lg text-muted-foreground">Personalized patterns and tips based on your mood data.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-8 border-t-4 border-yunity-teal text-center">
              <p className="text-sm text-muted-foreground mb-2">Weekly Mood Score</p>
              <p className="text-5xl font-bold text-primary">{weeklyScore}</p>
              <p className="text-sm text-muted-foreground mt-2">out of 10</p>
            </Card>
            <Card className="p-8 border-t-4 border-yunity-yellow text-center">
              <p className="text-sm text-muted-foreground mb-2">Monthly Trend</p>
              <p className="text-5xl font-bold text-secondary">{monthlyTrend}</p>
              <p className="text-sm text-muted-foreground mt-2">improvement</p>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-6">Key Insights</h2>
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <Card key={i} className="p-6 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                    <insight.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-foreground">{insight.title}</h3>
                      <Badge variant="secondary" className="text-xs">{insight.type}</Badge>
                    </div>
                    <p className="text-muted-foreground">{insight.description}</p>
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

export default Insights;
