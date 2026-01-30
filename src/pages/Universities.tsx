import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { universities, University, getAllCountries } from '@/data/universities';
import { 
  ArrowLeft, 
  ArrowRight,
  Search,
  Sparkles,
  Target,
  Shield,
  Plus,
  Check,
  Lock,
  Unlock,
  X,
  Home
} from 'lucide-react';

const Universities = () => {
  const { 
    user, 
    onboardingData, 
    shortlistedUniversities,
    shortlistUniversity,
    removeFromShortlist,
    lockUniversity,
    unlockUniversity,
    getLockedUniversities
  } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  if (!user || !onboardingData?.completed) {
    navigate('/login');
    return null;
  }

  const lockedUniversities = getLockedUniversities();

  const isShortlisted = (id: string) => shortlistedUniversities.some(u => u.id === id);
  const isLocked = (id: string) => shortlistedUniversities.find(u => u.id === id)?.locked || false;

  const filteredUniversities = universities.filter(uni => {
    if (searchQuery && !uni.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !uni.country.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterTier !== 'all' && uni.tier !== filterTier) {
      return false;
    }
    if (filterCountry !== 'all' && uni.country !== filterCountry) {
      return false;
    }
    if (showShortlistOnly && !isShortlisted(uni.id)) {
      return false;
    }
    return true;
  });

  const getTierIcon = (tier: University['tier']) => {
    switch (tier) {
      case 'dream': return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'target': return <Target className="w-3.5 h-3.5 text-primary" />;
      case 'safe': return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getTierStyle = (tier: University['tier']) => {
    switch (tier) {
      case 'dream': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'target': return 'bg-primary/10 text-primary border-primary/20';
      case 'safe': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  const handleLock = (id: string) => {
    if (lockedUniversities.length >= 5) {
      alert('You can commit to a maximum of 5 universities.');
      return;
    }
    lockUniversity(id);
  };

  const handleUnlock = (id: string) => {
    if (window.confirm('This will remove the application tasks for this university. Continue?')) {
      unlockUniversity(id);
    }
  };

  const getPrimaryAction = () => {
    if (lockedUniversities.length > 0) {
      return { label: 'Continue Application', route: '/application' };
    }
    if (shortlistedUniversities.length >= 3) {
      return { label: 'Commit to a University', route: '' };
    }
    return { label: 'Get AI Recommendations', route: '/counsellor' };
  };

  const primaryAction = getPrimaryAction();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <span className="font-serif text-lg font-medium text-foreground">Universities</span>

          {primaryAction.route && (
            <Button
              variant="hero"
              size="sm"
              onClick={() => navigate(primaryAction.route)}
              className="text-xs"
            >
              {primaryAction.label}
            </Button>
          )}
          {!primaryAction.route && (
            <button
              onClick={() => navigate('/counsellor')}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              AI Counsellor
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-8">
        {/* Status Banner */}
        {lockedUniversities.length > 0 ? (
          <div className="mb-8 p-5 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Committed to</p>
                  <p className="font-medium text-foreground">
                    {lockedUniversities.map(u => u.name).join(', ')}
                  </p>
                </div>
              </div>
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/application')}
                className="text-xs"
              >
                Continue Application
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ) : shortlistedUniversities.length < 3 ? (
          <div className="text-center mb-10 p-8 rounded-xl border border-border/60">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Build Your Shortlist
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
              Add at least 3 universities to your shortlist, then commit to one to start your application.
            </p>
            <Button
              variant="hero"
              size="heroLg"
              onClick={() => navigate('/counsellor')}
            >
              Get AI Recommendations
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="mb-8 p-5 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <p className="text-foreground">
                  Ready to commit! Lock a university to start your application.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shortlist Toggle */}
        {shortlistedUniversities.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {shortlistedUniversities.length} shortlisted
            </p>
            <button
              onClick={() => setShowShortlistOnly(!showShortlistOnly)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {showShortlistOnly ? 'Show All' : 'Show Shortlisted Only'}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 border-border/60"
            />
          </div>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="h-10 px-3 rounded-md border border-border/60 bg-background text-sm"
          >
            <option value="all">All Tiers</option>
            <option value="dream">Dream</option>
            <option value="target">Target</option>
            <option value="safe">Safe</option>
          </select>

          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="h-10 px-3 rounded-md border border-border/60 bg-background text-sm"
          >
            <option value="all">All Countries</option>
            {getAllCountries().map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* University Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUniversities.map((uni) => (
            <div 
              key={uni.id}
              className={`p-5 rounded-xl border bg-card transition-all ${
                isLocked(uni.id) 
                  ? 'border-primary/40 shadow-medium' 
                  : isShortlisted(uni.id) 
                    ? 'border-primary/20' 
                    : 'border-border/60 hover:border-border'
              }`}
            >
              {/* Tier Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getTierStyle(uni.tier)}`}>
                  {getTierIcon(uni.tier)}
                  {uni.tier.charAt(0).toUpperCase() + uni.tier.slice(1)}
                </div>
                {isLocked(uni.id) && (
                  <Lock className="w-4 h-4 text-primary" />
                )}
              </div>

              {/* Info */}
              <h3 className="font-medium text-foreground mb-1">{uni.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{uni.country}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Ranking</p>
                  <p className="font-medium text-foreground">#{uni.ranking}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Acceptance</p>
                  <p className="font-medium text-foreground">{uni.acceptanceRate}</p>
                </div>
              </div>

              {/* Programs */}
              <div className="flex flex-wrap gap-1 mb-4">
                {uni.programs.slice(0, 2).map((program) => (
                  <span 
                    key={program}
                    className="px-2 py-0.5 text-xs bg-muted/50 rounded text-muted-foreground"
                  >
                    {program}
                  </span>
                ))}
                {uni.programs.length > 2 && (
                  <span className="px-2 py-0.5 text-xs text-muted-foreground">
                    +{uni.programs.length - 2}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isShortlisted(uni.id) ? (
                  <>
                    {isLocked(uni.id) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleUnlock(uni.id)}
                      >
                        <Unlock className="w-3.5 h-3.5 mr-1" />
                        Uncommit
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="hero"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleLock(uni.id)}
                        >
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          Commit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromShortlist(uni.id)}
                          className="px-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => shortlistUniversity(uni)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Shortlist
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No universities match your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterTier('all');
                setFilterCountry('all');
                setShowShortlistOnly(false);
              }}
              className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </button>
            {lockedUniversities.length > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/application')}
                className="text-xs"
              >
                Continue Application
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/counsellor')}
                className="text-xs"
              >
                Get AI Recommendations
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Universities;
