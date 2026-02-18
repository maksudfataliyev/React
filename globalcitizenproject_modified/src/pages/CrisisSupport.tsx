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
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Emergency Banner */}
          <Card className="p-5 md:p-8 mb-6 md:mb-8 bg-accent/10 border-accent border-2">
            <div className="flex items-start gap-3 md:gap-4">
              <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-accent flex-shrink-0" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">If you're in immediate danger, call 911</h1>
                <p className="text-sm md:text-lg text-muted-foreground">Your safety is the priority. Don't hesitate to reach out for help.</p>
              </div>
            </div>
          </Card>

          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">Crisis Hotlines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            {hotlines.map((hotline, i) => (
              <Card key={i} className="p-4 md:p-6 border-t-4 border-primary hover:shadow-lg transition-all">
                <div className="flex items-start gap-3 mb-2 md:mb-3">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground text-base md:text-lg">{hotline.name}</h3>
                    <p className="text-primary font-bold text-lg md:text-xl mt-1">{hotline.number}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs md:text-sm mb-2">{hotline.description}</p>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{hotline.available}</span>
              </Card>
            ))}
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6"><Shield className="w-5 h-5 md:w-6 md:h-6 inline mr-2" />Safety Plan Steps</h2>
          <Card className="p-5 md:p-8 mb-6 md:mb-8">
            <div className="space-y-3 md:space-y-4">
              {safetySteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 md:gap-4">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs md:text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-foreground text-sm md:text-lg pt-0.5 md:pt-1">{step}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 bg-primary/5 border-primary text-center">
            <Heart className="w-10 h-10 md:w-12 md:h-12 text-accent mx-auto mb-3 md:mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3">You Matter</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-md mx-auto">
              Whatever you're going through, you deserve support. Reaching out is a sign of strength, not weakness.
            </p>
            <Button variant="hero" size="lg" className="w-full sm:w-auto">
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
