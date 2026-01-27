import Header from "@/components/Header";
import Hero from "@/components/Hero";
import JourneySteps from "@/components/JourneySteps";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Hero />
        <div id="journey">
          <JourneySteps />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
