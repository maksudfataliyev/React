import { Search, MapPin, Award, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const FindProfessional = () => {
  const professionals = [
    {
      name: "Dr. Sarah Chen",
      credentials: "PhD, Clinical Psychologist",
      specialties: ["Anxiety", "Depression", "Teen Issues"],
      location: "Virtual & In-person",
      experience: "12 years",
      availability: "Available",
      rating: 4.9,
      reviews: 156
    },
    {
      name: "James Rivera",
      credentials: "LCSW, Licensed Therapist",
      specialties: ["Family Therapy", "Trauma", "LGBTQ+ Support"],
      location: "Virtual Only",
      experience: "8 years",
      availability: "Limited",
      rating: 4.8,
      reviews: 89
    },
    {
      name: "Dr. Emily Watson",
      credentials: "PsyD, Youth Counselor",
      specialties: ["Stress Management", "Academic Pressure", "Self-esteem"],
      location: "Virtual & In-person",
      experience: "15 years",
      availability: "Available",
      rating: 5.0,
      reviews: 203
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Find a Professional</h1>
            <p className="text-lg text-muted-foreground">
              Connect with licensed mental health professionals who specialize in youth care.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search by specialty, name, or issue..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4">
                <select className="px-4 py-2 rounded-md border border-input bg-background">
                  <option>All Locations</option>
                  <option>Virtual Only</option>
                  <option>In-person</option>
                </select>
                <select className="px-4 py-2 rounded-md border border-input bg-background">
                  <option>Availability</option>
                  <option>Available Now</option>
                  <option>This Week</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Professionals List */}
          <div className="space-y-6">
            {professionals.map((professional, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="w-24 h-24 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                      {professional.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{professional.name}</h3>
                        <p className="text-muted-foreground">{professional.credentials}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">⭐ {professional.rating}</div>
                        <p className="text-sm text-muted-foreground">{professional.reviews} reviews</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {professional.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{professional.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="w-4 h-4" />
                        <span>{professional.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className={professional.availability === "Available" ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                          {professional.availability}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="hero">Book Session</Button>
                      <Button variant="outline">View Profile</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Crisis Support Banner */}
          <Card className="mt-8 p-8 bg-accent/10 border-accent">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-3">
                In Crisis? Get Immediate Support
              </h3>
              <p className="text-muted-foreground mb-6">
                If you're experiencing a mental health emergency, reach out for immediate help.
              </p>
              <Button variant="hero" size="lg">
                Access Crisis Support
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FindProfessional;
