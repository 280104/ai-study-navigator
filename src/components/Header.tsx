import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="font-serif text-lg font-medium text-foreground tracking-tight">
            AI Counsellor
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#journey" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        <Link 
          to="/login" 
          className="text-sm text-foreground hover:text-primary transition-colors"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
};

export default Header;
