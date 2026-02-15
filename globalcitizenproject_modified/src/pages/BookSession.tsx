import { Calendar, Clock, Video, MapPin, CheckCircle } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const BookSession = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const dates = ["Feb 17", "Feb 18", "Feb 19", "Feb 20", "Feb 21"];
  const times = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];
  const sessionTypes = [
    { label: "Video Call", icon: Video, description: "Face-to-face virtual session" },
    { label: "In-Person", icon: MapPin, description: "Visit the therapist's office" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Book a Session</h1>
            <p className="text-lg text-muted-foreground">Schedule a one-on-one session with a mental health professional.</p>
          </div>

          <div className="space-y-8">
            <Card className="p-6">
              <Label className="text-lg font-semibold mb-4 block">Session Type</Label>
              <div className="grid grid-cols-2 gap-4">
                {sessionTypes.map((type) => (
                  <button
                    key={type.label}
                    onClick={() => setSelectedType(type.label)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedType === type.label ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <type.icon className="w-8 h-8 text-primary" />
                    <span className="font-semibold">{type.label}</span>
                    <span className="text-xs text-muted-foreground">{type.description}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <Label className="text-lg font-semibold mb-4 block"><Calendar className="w-5 h-5 inline mr-2" />Select Date</Label>
              <div className="flex gap-3 flex-wrap">
                {dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-5 py-3 rounded-lg border-2 font-medium transition-all ${
                      selectedDate === date ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <Label className="text-lg font-semibold mb-4 block"><Clock className="w-5 h-5 inline mr-2" />Select Time</Label>
              <div className="flex gap-3 flex-wrap">
                {times.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-5 py-3 rounded-lg border-2 font-medium transition-all ${
                      selectedTime === time ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <Label className="text-lg font-semibold mb-4 block">What would you like to discuss? (optional)</Label>
              <Textarea placeholder="Share any topics or concerns you'd like to address..." className="min-h-[100px]" />
            </Card>

            <Button variant="hero" size="lg" className="w-full" disabled={!selectedDate || !selectedTime || !selectedType}>
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirm Booking
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookSession;
