import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Globe } from "lucide-react";

const Resources = () => {
  const crisisLines = [
    {
      name: "National Suicide Prevention Lifeline",
      contact: "988",
      description: "24/7 free and confidential support for people in distress",
      type: "phone"
    },
    {
      name: "Crisis Text Line",
      contact: "Text HOME to 741741",
      description: "Free, 24/7 support via text message",
      type: "text"
    },
    {
      name: "SAMHSA National Helpline",
      contact: "1-800-662-4357",
      description: "Treatment referral and information service",
      type: "phone"
    }
  ];

  const resources = [
    {
      name: "National Alliance on Mental Illness (NAMI)",
      url: "nami.org",
      description: "Education, support, and advocacy for mental health"
    },
    {
      name: "Mental Health America",
      url: "mhanational.org",
      description: "Resources, screening tools, and community programs"
    },
    {
      name: "Anxiety and Depression Association",
      url: "adaa.org",
      description: "Information and support for anxiety disorders"
    }
  ];

  return (
    <section id="resources" className="py-20 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Help & Resources
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            You don't have to face this alone. Help is available 24/7.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Phone className="w-6 h-6 text-destructive" />
              Crisis Support Lines
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {crisisLines.map((line, index) => (
                <Card key={index} className="bg-destructive/10 border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      {line.type === "phone" ? (
                        <Phone className="w-5 h-5 text-destructive" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-destructive" />
                      )}
                      {line.name}
                    </CardTitle>
                    <CardDescription className="text-secondary">
                      {line.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {line.contact}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-accent" />
              Mental Health Organizations
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="bg-card/50 border-secondary/30 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-foreground">{resource.name}</CardTitle>
                    <CardDescription className="text-secondary">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="link" 
                      className="text-accent p-0 h-auto"
                      onClick={() => window.open(`https://${resource.url}`, '_blank')}
                    >
                      Visit {resource.url} →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-accent/20 rounded-xl border border-accent/30">
          <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
            Remember: You Are Not Alone
          </h3>
          <p className="text-secondary text-center text-lg max-w-3xl mx-auto">
            Mental health challenges are common, and seeking help is a courageous step. 
            Recovery is possible, and support is available. If you're in crisis, please reach out to one of the resources above immediately.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Resources;
