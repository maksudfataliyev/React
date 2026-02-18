import { Clock, User, Heart, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Articles = () => {
  const articles = [
    { title: "5 Signs You Might Be Experiencing Burnout", author: "Dr. Sarah Chen", readTime: "5 min", likes: 234, category: "Wellness", excerpt: "Burnout is more than just feeling tired. Learn to recognize the warning signs and take action before it's too late." },
    { title: "How Social Media Affects Teen Mental Health", author: "James Rivera, LCSW", readTime: "7 min", likes: 456, category: "Digital Wellness", excerpt: "Understanding the impact of social media on young minds and strategies for healthier digital habits." },
    { title: "The Power of Journaling for Emotional Health", author: "Dr. Emily Watson", readTime: "4 min", likes: 189, category: "Self-Care", excerpt: "Discover how putting pen to paper can transform your emotional well-being and self-awareness." },
    { title: "Navigating Grief as a Young Person", author: "Amanda Foster, PhD", readTime: "8 min", likes: 312, category: "Grief", excerpt: "Grief doesn't have an age limit. Here's how young people can process loss in healthy ways." },
    { title: "Building Self-Esteem in Your 20s", author: "Michael Lee, PsyD", readTime: "6 min", likes: 567, category: "Self-Esteem", excerpt: "Practical strategies for building lasting confidence and self-worth during a transformative decade." },
    { title: "Why It's Okay to Not Be Okay", author: "YUnity Team", readTime: "3 min", likes: 891, category: "Mental Health", excerpt: "Breaking the stigma around mental health struggles and embracing vulnerability as strength." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 md:mb-3">Articles</h1>
            <p className="text-base md:text-lg text-muted-foreground">Expert-written articles on mental health, wellness, and personal growth.</p>
          </div>

          {/* Featured article */}
          <Card className="p-5 md:p-8 mb-6 md:mb-8 bg-primary/5 border-primary/20 hover:shadow-lg transition-all cursor-pointer">
            <Badge className="bg-accent text-accent-foreground mb-3 md:mb-4 text-xs">Featured</Badge>
            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">{articles[5].title}</h2>
            <p className="text-sm md:text-lg text-muted-foreground mb-3 md:mb-4">{articles[5].excerpt}</p>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-1"><User className="w-3 h-3 md:w-4 md:h-4" />{articles[5].author}</div>
              <div className="flex items-center gap-1"><Clock className="w-3 h-3 md:w-4 md:h-4" />{articles[5].readTime}</div>
              <div className="flex items-center gap-1"><Heart className="w-3 h-3 md:w-4 md:h-4" />{articles[5].likes}</div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {articles.slice(0, 5).map((article, i) => (
              <Card key={i} className="p-4 md:p-6 hover:shadow-lg transition-all cursor-pointer group">
                <Badge variant="secondary" className="mb-2 md:mb-3 text-xs">{article.category}</Badge>
                <h3 className="text-base md:text-xl font-bold text-foreground mb-1.5 md:mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                <p className="text-muted-foreground mb-3 md:mb-4 text-xs md:text-sm">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5 md:gap-3 text-xs text-muted-foreground">
                    <span className="truncate max-w-[120px] md:max-w-none">{article.author}</span>
                    <span>•</span>
                    <span>{article.readTime} read</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Articles;
