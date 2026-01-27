import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-[85vh] flex flex-col justify-center px-6 lg:px-12 gradient-hero">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Main content */}
          <div className="space-y-8">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-accent px-4 py-2 rounded-full mb-8">
                <Compass className="w-4 h-4" />
                <span>Study Abroad Guidance</span>
              </div>
              
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.1] tracking-tight text-foreground text-balance">
                Your personal AI study abroad counsellor
              </h1>
            </div>

            <div className="animate-fade-up-delay space-y-6">
              <p className="text-lg sm:text-xl text-muted-foreground font-light tracking-wide">
                Guided. Stage-based. Decision-first.
              </p>
              
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                Go from confusion to a locked university and a realistic application plan—in one cohesive flow.
              </p>
            </div>

            <div className="animate-fade-up-delay-2 flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="hero" size="heroLg" asChild>
                <Link to="/signup">
                  Get started in 3 minutes
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="heroLg" asChild>
                <a href="#journey">View guided journey</a>
              </Button>
            </div>
          </div>

          {/* Right: Quick overview */}
          <div className="hidden lg:block animate-fade-up-delay-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl" />
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 space-y-6">
                <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                  What you'll achieve
                </p>
                <ul className="space-y-4">
                  {[
                    "Clear understanding of your options",
                    "Shortlist of matched universities",
                    "One locked target to focus on",
                    "Complete application roadmap",
                    "Task-based execution plan",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
