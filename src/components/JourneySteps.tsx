import { Check } from "lucide-react";

const journeySteps = [
  {
    number: "01",
    title: "Complete onboarding",
    description: "Share your background, budget, and exam scores",
  },
  {
    number: "02",
    title: "AI analysis",
    description: "Understand your strengths, gaps, and realistic options",
  },
  {
    number: "03",
    title: "Discover universities",
    description: "Browse and shortlist schools that match your profile",
  },
  {
    number: "04",
    title: "Lock one university",
    description: "Focus your energy on a single, strategic choice",
  },
  {
    number: "05",
    title: "Execute with guidance",
    description: "Follow your personalized application timeline and tasks",
  },
];

const JourneySteps = () => {
  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 animate-fade-up-delay-2">
          <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-3">
            The Journey
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground text-balance max-w-xl">
            From confusion to clarity in five guided stages
          </h2>
        </div>

        <div className="space-y-0">
          {journeySteps.map((step, index) => (
            <div
              key={step.number}
              className="group border-t border-border py-8 md:py-10 flex flex-col md:flex-row md:items-start gap-4 md:gap-12 transition-colors hover:bg-muted/30"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <div className="flex items-center gap-4 md:w-48 shrink-0">
                <span className="text-sm font-mono text-muted-foreground">
                  {step.number}
                </span>
                <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-colors">
                  <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl md:text-2xl font-medium text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
};

export default JourneySteps;
