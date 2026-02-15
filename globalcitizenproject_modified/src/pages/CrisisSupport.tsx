import { Phone, MessageCircle, Heart, AlertTriangle, Shield, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CrisisSupport = () => {
  const hotlines = [
    { name: "National Suicide Prevention Lifeline", number: "988", description: "24/7 free and confidential support", available: "24/7" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", description: "Free 24/7 crisis counseling via text", available: "24/7" },
    { name: "SAMHSA National Helpline", number: "1-800-662-4357", description: "Free referrals and information service", available: "24/7" },
    { name: "Trevor Project (LGBTQ+ Youth)", number: "1-866-488-7386", description: "Crisis intervention for LGBTQ+ young people", available: "24/7" },
  ];

  const safetySteps = [
    "Take a deep breath — you are not alone",
    "Remove yourself from immediate danger if possible",
    "Reach out to someone you trust — a friend, family member, or counselor",
    "Call a crisis hotline if you need immediate support",
    "Remember: this feeling is temporary, and help is available",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Emergency Banner */}
          <Card className="p-8 mb-8 bg-accent/10 border-accent border-2">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-10 h-10 text-accent flex-shrink-0" />
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">If you're in immediate danger, call 911</h1>
                <p className="text-lg text-muted-foreground">Your safety is the priority. Don't hesitate to reach out for help.</p>
              </div>
            </div>
          </Card>

          <h2 className="text-2xl font-bold text-foreground mb-6">Crisis Hotlines</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {hotlines.map((hotline, i) => (
              <Card key={i} className="p-6 border-t-4 border-primary hover:shadow-lg transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{hotline.name}</h3>
                    <p className="text-primary font-bold text-xl mt-1">{hotline.number}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-2">{hotline.description}</p>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{hotline.available}</span>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-6"><Shield className="w-6 h-6 inline mr-2" />Safety Plan Steps</h2>
          <Card className="p-8 mb-8">
            <div className="space-y-4">
              {safetySteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-foreground text-lg pt-1">{step}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-primary/5 border-primary text-center">
            <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-3">You Matter</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Whatever you're going through, you deserve support. Reaching out is a sign of strength, not weakness.
            </p>
            <Button variant="hero" size="lg">
              <MessageCircle className="w-5 h-5 mr-2" />
              Talk to Someone Now
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CrisisSupport;
