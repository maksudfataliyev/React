import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, HeartCrack } from "lucide-react";

const Understanding = () => {
  return (
    <section id="understanding" className="py-20 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Understanding Mental Health
          </h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Mental health conditions affect millions worldwide. Knowledge is the foundation of healing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-card/50 border-secondary/30 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-accent/20">
                  <Brain className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-3xl text-foreground">Depression</CardTitle>
              </div>
              <CardDescription className="text-secondary text-lg">
                More than just feeling sad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-secondary">
              <p>
                Depression is a common but serious mood disorder that affects how you feel, think, and handle daily activities. 
                It's characterized by persistent feelings of sadness, hopelessness, and loss of interest in activities once enjoyed.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Common Symptoms:</h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Persistent sad, anxious, or empty mood</li>
                  <li>Loss of interest in hobbies and activities</li>
                  <li>Changes in sleep patterns and appetite</li>
                  <li>Difficulty concentrating or making decisions</li>
                  <li>Feelings of worthlessness or guilt</li>
                  <li>Fatigue and decreased energy</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-secondary/30 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-lg bg-yunity-coral/20">
                  <HeartCrack className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-3xl text-foreground">Anxiety</CardTitle>
              </div>
              <CardDescription className="text-secondary text-lg">
                When worry becomes overwhelming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-secondary">
              <p>
                Anxiety disorders involve more than temporary worry or fear. The anxiety doesn't go away and can worsen over time, 
                interfering with daily activities such as job performance, schoolwork, and relationships.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Common Symptoms:</h4>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Excessive worry that's difficult to control</li>
                  <li>Restlessness or feeling on edge</li>
                  <li>Rapid heartbeat and shortness of breath</li>
                  <li>Difficulty concentrating</li>
                  <li>Muscle tension and sleep problems</li>
                  <li>Avoiding certain situations or places</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Understanding;
