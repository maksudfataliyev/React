import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import PuzzleGraphic from "@/components/PuzzleGraphic";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-foreground">
              HELLO, <span className="text-primary">USER 67</span>
            </h1>
            
            <p className="text-lg text-foreground leading-relaxed">
              YUnity is a safe, supportive platform for youth (15-24) to share stories, 
              track moods, access webinars related to mental health awareness and connect 
              with peers or mental health professionals. We empower young people, reduce 
              stigma, and build emotional resilience through community support, education, 
              and opportunities for growth — <span className="italic font-medium">because every story matters.</span>
            </p>

            <Button variant="hero" size="lg" className="text-lg px-12 py-6">
              START
            </Button>

            <div className="pt-6 space-y-3">
              <a href="tel:+6267676967" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                <div className="bg-primary rounded-full p-2">
                  <Phone className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-medium">+62 67676967</span>
              </a>
              
              <div className="space-y-2">
                <a href="mailto:YUnity.hub@gmail.com" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <div className="bg-primary rounded-full p-2">
                    <Mail className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-medium">YUnity.hub@gmail.com</span>
                </a>
                <a href="mailto:YUnitycareers@gmail.com" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors ml-11">
                  <span className="font-medium">YUnitycareers@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right column - Puzzle graphic */}
          <div className="flex items-center justify-center">
            <PuzzleGraphic />
          </div>
        </div>

        {/* Features section */}
        <section className="mt-20 grid md:grid-cols-4 gap-8">
          <div className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-yunity-teal">
            <h3 className="text-xl font-bold text-primary mb-3">Chat</h3>
            <p className="text-muted-foreground">
              Connect with peers in a safe space. Share your experiences and support others on their journey.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-yunity-yellow">
            <h3 className="text-xl font-bold text-foreground mb-3">Mood Tracker</h3>
            <p className="text-muted-foreground">
              Monitor your emotional well-being with daily check-ins and gain insights into your mental health patterns.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-yunity-coral">
            <h3 className="text-xl font-bold text-foreground mb-3">Education</h3>
            <p className="text-muted-foreground">
              Access expert-led webinars, articles, and resources to better understand mental health.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-yunity-mint">
            <h3 className="text-xl font-bold text-foreground mb-3">Consult</h3>
            <p className="text-muted-foreground">
              Connect with licensed mental health professionals for personalized support and guidance.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
