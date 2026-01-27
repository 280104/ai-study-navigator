const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-accent flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-xs">A</span>
          </div>
          <span className="font-serif text-sm font-medium text-foreground">
            AI Counsellor
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Guided decisions for your study abroad journey.
        </p>
        
        <p className="text-xs text-muted-foreground">
          © 2026 AI Counsellor. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
