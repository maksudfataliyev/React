import { Phone, Mail, ArrowRight, MessageCircle, Heart, BookOpen, Users, Sparkles, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import PuzzleGraphic from "@/components/PuzzleGraphic";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "500+", label: "Support Chats" },
    { value: "50+", label: "Professionals" },
    { value: "98%", label: "Satisfaction" },
  ];

  const testimonials = [
    { text: "YUnity helped me realize I'm not alone. The peer support community changed my life.", author: "User 34", role: "College Student" },
    { text: "The mood tracker gave me insights I never would have noticed on my own. Game changer.", author: "User 72", role: "High School Senior" },
    { text: "Finding a therapist through YUnity was so easy. I booked my first session in minutes.", author: "User 19", role: "Gap Year" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-5 md:space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                Safe space for youth mental health
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                HELLO, <span className="text-primary">{isAuthenticated ? user?.name?.toUpperCase() : "THERE"}</span>
              </h1>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                YUnity is a safe, supportive platform for youth (15-24) to share stories, 
                track moods, access webinars related to mental health awareness and connect 
                with peers or mental health professionals. We empower young people, reduce 
                stigma, and build emotional resilience — <span className="italic font-medium text-foreground">because every story matters.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="hero" size="lg" className="text-base md:text-lg px-8 py-5 md:py-6 w-full sm:w-auto" onClick={() => navigate(isAuthenticated ? "/daily-checkin" : "/auth")}>
                  {isAuthenticated ? "CHECK IN" : "GET STARTED"}
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="text-base md:text-lg px-6 py-5 md:py-6 w-full sm:w-auto" onClick={() => navigate("/peer-support")}>
                  Explore
                </Button>
              </div>

              <div className="pt-2 space-y-3">
                <a href="tel:+6267676967" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <div className="bg-primary rounded-full p-2 flex-shrink-0">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                  </div>
                  <span className="font-medium text-sm md:text-base">+62 67676967</span>
                </a>
                <a href="mailto:YUnity.hub@gmail.com" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <div className="bg-primary rounded-full p-2 flex-shrink-0">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
                  </div>
                  <span className="font-medium text-sm md:text-base">YUnity.hub@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center mt-4 md:mt-0">
              <div className="w-full max-w-[320px] md:max-w-none">
                <PuzzleGraphic />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary py-10 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary-foreground">{stat.value}</p>
                  <p className="text-primary-foreground/70 mt-1 text-sm md:text-base">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Everything You Need</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">Four pillars of support designed to help you thrive.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            <Card className="p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-yunity-teal cursor-pointer group" onClick={() => navigate("/peer-support")}>
              <div className="bg-primary/10 rounded-lg p-3 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary mb-2 md:mb-3">Chat</h3>
              <p className="text-sm md:text-base text-muted-foreground">Connect with peers in a safe space. Share your experiences and support others.</p>
            </Card>

            <Card className="p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-yunity-yellow cursor-pointer group" onClick={() => navigate("/daily-checkin")}>
              <div className="bg-secondary/10 rounded-lg p-3 w-fit mb-4 group-hover:bg-secondary/20 transition-colors">
                <Heart className="w-7 h-7 md:w-8 md:h-8 text-secondary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">Mood Tracker</h3>
              <p className="text-sm md:text-base text-muted-foreground">Monitor your emotional well-being with daily check-ins and gain insights.</p>
            </Card>

            <Card className="p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-yunity-coral cursor-pointer group" onClick={() => navigate("/webinars")}>
              <div className="bg-accent/10 rounded-lg p-3 w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">Education</h3>
              <p className="text-sm md:text-base text-muted-foreground">Access expert-led webinars, articles, and resources on mental health.</p>
            </Card>

            <Card className="p-5 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-yunity-mint cursor-pointer group" onClick={() => navigate("/find-professional")}>
              <div className="bg-yunity-mint/20 rounded-lg p-3 w-fit mb-4 group-hover:bg-yunity-mint/30 transition-colors">
                <Users className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">Consult</h3>
              <p className="text-sm md:text-base text-muted-foreground">Connect with licensed professionals for personalized support.</p>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted py-12 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Stories from Our Community</h2>
              <p className="text-base md:text-lg text-muted-foreground">Hear from young people who found support through YUnity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              {testimonials.map((t, i) => (
                <Card key={i} className="p-6 md:p-8 relative">
                  <Star className="w-7 h-7 md:w-8 md:h-8 text-secondary mb-4" />
                  <p className="text-foreground mb-5 md:mb-6 italic text-sm md:text-base">"{t.text}"</p>
                  <div>
                    <p className="font-bold text-foreground">{t.author}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <Card className="p-8 md:p-12 text-center bg-primary/5 border-primary/20">
            <Shield className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-5 md:mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Ready to Start Your Journey?</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6 md:mb-8">
              Join thousands of young people building resilience, finding support, and growing together.
            </p>
            <Button variant="hero" size="lg" className="text-base md:text-lg px-8 md:px-12 py-5 md:py-6 w-full sm:w-auto" onClick={() => navigate(isAuthenticated ? "/daily-checkin" : "/auth")}>
              {isAuthenticated ? "Go to Dashboard" : "Join YUnity Today"}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Button>
          </Card>
        </section>

        {/* Footer */}
        <footer className="bg-primary text-primary-foreground py-10 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-lg font-bold mb-3 md:mb-4">YUnity</h3>
                <p className="text-primary-foreground/70 text-sm">Pieces of peace. A safe space for youth mental health.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Chat</h4>
                <div className="space-y-1.5 md:space-y-2 text-sm text-primary-foreground/70">
                  <p className="hover:text-secondary cursor-pointer" onClick={() => navigate("/peer-support")}>Peer Support</p>
                  <p className="hover:text-secondary cursor-pointer" onClick={() => navigate("/group-chats")}>Group Chats</p>
                  <p className="hover:text-secondary cursor-pointer" onClick={() => navigate("/message-board")}>Message Board</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Learn</h4>
                <div className="space-y-1.5 md:space-y-2 text-sm text-primary-foreground/70">
                  <p className="hover:text-secondary cursor-pointer" onClick={() => navigate("/webinars")}>Webinars</p>
                  <p className="hover:text-secondary cursor-pointer" onClick={() => navigate("/resources")}>Resources</p>
                  <p className="hover:text-secondary cursor-pointer" onClick={() => navigate("/articles")}>Articles</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Contact</h4>
                <div className="space-y-1.5 md:space-y-2 text-sm text-primary-foreground/70">
                  <p>YUnity.hub@gmail.com</p>
                  <p>+62 67676967</p>
                  <p className="hover:text-secondary cursor-pointer" onClick={() => navigate("/crisis-support")}>Crisis Support</p>
                </div>
              </div>
            </div>
            <div className="border-t border-primary-foreground/20 mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-primary-foreground/50">
              © 2026 YUnity. All rights reserved. Every story matters.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
