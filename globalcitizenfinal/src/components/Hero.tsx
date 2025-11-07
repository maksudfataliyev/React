import { Button } from "@/components/ui/button";
import yunityLogo from "@/assets/yunity-logo.jpeg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary/20 opacity-90" />
      
      <div className="container max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <img 
            src={yunityLogo} 
            alt="YUNITY - Pieces of peace" 
            className="w-full max-w-2xl h-auto rounded-2xl shadow-2xl"
          />
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Finding Peace, One Piece at a Time
            </h1>
            <p className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto">
              Understanding mental health challenges like depression and anxiety is the first step. 
              Together, we can build a complete picture of wellness.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              variant="cta" 
              size="lg"
              onClick={() => scrollToSection("understanding")}
            >
              Learn More
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-secondary/10 border-secondary text-foreground hover:bg-secondary/20"
              onClick={() => scrollToSection("solutions")}
            >
              Find Solutions
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
