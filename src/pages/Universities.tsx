import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { universities, University, getAllCountries, getAllPrograms } from '@/data/universities';
import { 
  ArrowLeft, 
  Search,
  Sparkles,
  Target,
  Shield,
  Plus,
  Check,
  Lock,
  Unlock,
  X,
  Filter
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
    getLockedUniversity
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

  const lockedUniversity = getLockedUniversity();

  const isShortlisted = (id: string) => shortlistedUniversities.some(u => u.id === id);
  const isLocked = (id: string) => shortlistedUniversities.find(u => u.id === id)?.locked || false;

  const filteredUniversities = universities.filter(uni => {
    // Search filter
    if (searchQuery && !uni.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !uni.country.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Tier filter
    if (filterTier !== 'all' && uni.tier !== filterTier) {
      return false;
    }

    // Country filter
    if (filterCountry !== 'all' && uni.country !== filterCountry) {
      return false;
    }

    // Shortlist filter
    if (showShortlistOnly && !isShortlisted(uni.id)) {
      return false;
    }

    return true;
  });

  const getTierIcon = (tier: University['tier']) => {
    switch (tier) {
      case 'dream': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'target': return <Target className="w-4 h-4 text-primary" />;
      case 'safe': return <Shield className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getTierColor = (tier: University['tier']) => {
    switch (tier) {
      case 'dream': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'target': return 'bg-primary/10 text-primary border-primary/20';
      case 'safe': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    }
  };

  const handleLock = (id: string) => {
    if (lockedUniversity && lockedUniversity.id !== id) {
      // Warn user about unlocking current
      if (window.confirm(`This will unlock ${lockedUniversity.name} and lock this university instead. Continue?`)) {
        lockUniversity(id);
      }
    } else {
      lockUniversity(id);
    }
  };

  const handleUnlock = (id: string) => {
    if (window.confirm('Unlocking will reset your application tasks. Are you sure?')) {
      unlockUniversity(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>

          <h1 className="font-serif text-lg font-medium text-foreground">Universities</h1>

          <button
            onClick={() => navigate('/counsellor')}
            className="text-sm text-primary hover:underline"
          >
            AI Counsellor
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Shortlist Summary */}
        {shortlistedUniversities.length > 0 && (
          <div className="mb-8 p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                Your Shortlist ({shortlistedUniversities.length})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortlistOnly(!showShortlistOnly)}
              >
                {showShortlistOnly ? 'Show All' : 'View Only Shortlisted'}
              </Button>
            </div>

            {lockedUniversity ? (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Locked Target</p>
                      <p className="font-medium text-foreground">{lockedUniversity.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/application')}
                  >
                    View Application Tasks
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Lock a university to focus your application and get a personalized task list.
              </p>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search universities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="h-11 px-4 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All Tiers</option>
            <option value="dream">Dream</option>
            <option value="target">Target</option>
            <option value="safe">Safe</option>
          </select>

          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="h-11 px-4 rounded-md border border-input bg-background text-sm"
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
                  ? 'border-primary shadow-lg' 
                  : isShortlisted(uni.id) 
                    ? 'border-primary/30' 
                    : 'border-border hover:border-border/80'
              }`}
            >
              {/* Tier Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getTierColor(uni.tier)}`}>
                  {getTierIcon(uni.tier)}
                  {uni.tier.charAt(0).toUpperCase() + uni.tier.slice(1)}
                </div>
                {isLocked(uni.id) && (
                  <Lock className="w-4 h-4 text-primary" />
                )}
              </div>

              {/* University Info */}
              <h3 className="font-semibold text-foreground mb-1">{uni.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{uni.country}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Ranking</p>
                  <p className="font-medium text-foreground">#{uni.ranking}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Acceptance</p>
                  <p className="font-medium text-foreground">{uni.acceptanceRate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Tuition</p>
                  <p className="font-medium text-foreground">{uni.tuition}</p>
                </div>
              </div>

              {/* Programs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {uni.programs.slice(0, 3).map((program) => (
                  <span 
                    key={program}
                    className="px-2 py-0.5 text-xs bg-muted rounded-md text-muted-foreground"
                  >
                    {program}
                  </span>
                ))}
                {uni.programs.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-muted-foreground">
                    +{uni.programs.length - 3}
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
                        className="flex-1"
                        onClick={() => handleUnlock(uni.id)}
                      >
                        <Unlock className="w-4 h-4 mr-1" />
                        Unlock
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="hero"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleLock(uni.id)}
                        >
                          <Lock className="w-4 h-4 mr-1" />
                          Lock
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromShortlist(uni.id)}
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
                    className="flex-1"
                    onClick={() => shortlistUniversity(uni)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add to Shortlist
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No universities match your filters.</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFilterTier('all');
                setFilterCountry('all');
                setShowShortlistOnly(false);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Universities;
