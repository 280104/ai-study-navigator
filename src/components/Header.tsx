const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-sm">A</span>
          </div>
          <span className="font-serif text-lg font-medium text-foreground">
            AI Counsellor
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#journey" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          Sign in
        </button>
      </div>
    </header>
  );
};

export default Header;
