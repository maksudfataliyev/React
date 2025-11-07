import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Activity, Sun, BookOpen, Phone } from "lucide-react";

const Solutions = () => {
  const solutions = [
    {
      icon: Heart,
      title: "Self-Care Practices",
      description: "Prioritize activities that nourish your mind and body",
      tips: [
        "Maintain a regular sleep schedule (7-9 hours)",
        "Practice mindfulness and meditation daily",
        "Engage in regular physical exercise",
        "Eat a balanced, nutritious diet",
        "Limit alcohol and avoid substance use"
      ]
    },
    {
      icon: Users,
      title: "Professional Support",
      description: "Seeking help is a sign of strength, not weakness",
      tips: [
        "Consult with a mental health professional",
        "Consider therapy (CBT, DBT, or talk therapy)",
        "Discuss medication options with a psychiatrist",
        "Join support groups in your community",
        "Utilize employee assistance programs (EAP)"
      ]
    },
    {
      icon: Activity,
      title: "Healthy Coping Strategies",
      description: "Build resilience through positive habits",
      tips: [
        "Practice deep breathing exercises",
        "Journal your thoughts and feelings",
        "Set realistic goals and celebrate small wins",
        "Learn to identify and challenge negative thoughts",
        "Develop a crisis management plan"
      ]
    },
    {
      icon: Sun,
      title: "Lifestyle Adjustments",
      description: "Small changes can make a big difference",
      tips: [
        "Establish a daily routine and stick to it",
        "Spend time outdoors and in nature",
        "Limit social media and news consumption",
        "Practice gratitude daily",
        "Engage in hobbies and creative activities"
      ]
    },
    {
      icon: BookOpen,
      title: "Education & Awareness",
      description: "Knowledge empowers recovery",
      tips: [
        "Learn about your condition and triggers",
        "Read books on mental health and wellness",
        "Attend workshops and educational sessions",
        "Stay informed about treatment options",
        "Share your knowledge with others"
      ]
    },
    {
      icon: Users,
      title: "Social Connection",
      description: "We heal together, not alone",
      tips: [
        "Reach out to friends and family regularly",
        "Join online or in-person support communities",
        "Volunteer and help others",
        "Be open about your struggles with trusted people",
        "Build a support network you can rely on"
      ]
    }
  ];

  return (
    <section id="solutions" className="py-20 px-6 bg-primary/50">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Solutions & Coping Strategies
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Recovery is possible. Here are evidence-based strategies to help you on your journey to wellness.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <Card key={index} className="bg-card/60 border-secondary/30 backdrop-blur hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{solution.title}</CardTitle>
                  </div>
                  <CardDescription className="text-secondary">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-secondary text-sm">
                    {solution.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
