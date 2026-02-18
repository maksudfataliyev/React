import { BookOpen, Download, ExternalLink, FileText, Headphones, Video } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Resources = () => {
  const resources = [
    { title: "Understanding Anxiety: A Youth Guide", type: "PDF Guide", icon: FileText, category: "Anxiety", description: "A comprehensive guide to understanding and managing anxiety for young people.", downloads: 1234 },
    { title: "Mindfulness Meditation for Beginners", type: "Audio", icon: Headphones, category: "Mindfulness", description: "Guided meditation sessions designed specifically for teens and young adults.", downloads: 892 },
    { title: "Building Resilience Toolkit", type: "Interactive", icon: BookOpen, category: "Resilience", description: "Interactive exercises and worksheets to help build emotional resilience.", downloads: 567 },
    { title: "Coping with Depression", type: "Video Series", icon: Video, category: "Depression", description: "A 5-part video series by licensed therapists on managing depression.", downloads: 2045 },
    { title: "Healthy Relationships Workbook", type: "PDF Guide", icon: FileText, category: "Relationships", description: "Learn about healthy boundaries, communication, and self-worth in relationships.", downloads: 789 },
    { title: "Stress Management Techniques", type: "Interactive", icon: BookOpen, category: "Stress", description: "Practical techniques and exercises for managing daily stress.", downloads: 1456 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 md:mb-3">Resources Library</h1>
            <p className="text-base md:text-lg text-muted-foreground">Free guides, toolkits, and multimedia resources for your mental health journey.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {resources.map((resource, i) => (
              <Card key={i} className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="bg-primary/10 rounded-lg p-3 md:p-4 mb-3 md:mb-4 flex items-center justify-center">
                  <resource.icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </div>
                <Badge variant="secondary" className="w-fit mb-2 md:mb-3 text-xs">{resource.category}</Badge>
                <h3 className="text-base md:text-lg font-bold text-foreground mb-1.5 md:mb-2">{resource.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 flex-1">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{resource.downloads.toLocaleString()} downloads</span>
                  <Button variant="default" size="sm" className="text-xs md:text-sm"><Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />Get</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Resources;
