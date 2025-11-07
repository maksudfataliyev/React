import Hero from "@/components/Hero";
import Understanding from "@/components/Understanding";
import Solutions from "@/components/Solutions";
import Resources from "@/components/Resources";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Understanding />
      <Solutions />
      <Resources />
      
      <footer className="py-8 px-6 bg-primary/80 text-center">
        <p className="text-secondary">
          © 2024 YUNITY - Pieces of Peace. Mental health matters.
        </p>
        <p className="text-secondary text-sm mt-2">
          This website provides general information and is not a substitute for professional medical advice.
        </p>
      </footer>
    </main>
  );
};

export default Index;
