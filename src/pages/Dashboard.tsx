import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight,
  GraduationCap,
  DollarSign,
  BookOpen,
  ChevronRight,
  Lock
} from 'lucide-react';

const Dashboard = () => {
  const { 
    user, 
    onboardingData, 
    shortlistedUniversities, 
    applicationTasks,
    currentStage,
    logout,
    getLockedUniversities
  } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!onboardingData?.completed) {
    navigate('/onboarding');
    return null;
  }

  const lockedUniversities = getLockedUniversities();
  const completedTasks = applicationTasks.filter(t => t.completed).length;
  const totalTasks = applicationTasks.length;

  const getStageInfo = () => {
    switch (currentStage) {
      case 1:
        return {
          label: 'Onboarding',
          description: 'Complete your profile to get started',
          action: 'Complete Onboarding',
          route: '/onboarding',
        };
      case 2:
        return {
          label: 'Discovery',
          description: 'Explore universities and build your shortlist',
          action: 'Talk to AI Counsellor',
          route: '/counsellor',
        };
      case 3:
        return {
          label: 'Application',
          description: 'Complete your application tasks',
          action: 'Continue Application',
          route: '/application',
        };
      case 4:
        return {
          label: 'Ready to Submit',
          description: 'Your applications are ready for submission',
          action: 'Review Application',
          route: '/application',
        };
      default:
        return {
          label: 'Getting Started',
          description: 'Begin your study abroad journey',
          action: 'Get Started',
          route: '/counsellor',
        };
    }
  };

  const stageInfo = getStageInfo();

  const getProfileStrength = () => {
    let strength = 0;
    let factors: { label: string; met: boolean }[] = [];

    const hasGoodGPA = onboardingData.academicBackground.gpa !== '';
    factors.push({ label: 'Academic records', met: hasGoodGPA });
    if (hasGoodGPA) strength += 20;

    const hasExams = onboardingData.exams.gre || onboardingData.exams.toefl || 
                     onboardingData.exams.ielts || onboardingData.exams.gmat;
    factors.push({ label: 'Standardized tests', met: !!hasExams });
    if (hasExams) strength += 25;

    const sopReady = ['refining', 'ready'].includes(onboardingData.sopReadiness);
    factors.push({ label: 'SOP preparation', met: sopReady });
    if (sopReady) strength += 20;

    const hasShortlist = shortlistedUniversities.length >= 3;
    factors.push({ label: 'University shortlist', met: hasShortlist });
    if (hasShortlist) strength += 15;

    factors.push({ label: 'University committed', met: lockedUniversities.length > 0 });
    if (lockedUniversities.length > 0) strength += 20;

    return { strength, factors };
  };

  const profileStrength = getProfileStrength();

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border/40 bg-background sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
          <span className="font-serif text-lg font-medium text-foreground tracking-tight">
            AI Counsellor
          </span>

          <nav className="flex items-center gap-8">
            <button 
              onClick={() => navigate('/counsellor')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Counsellor
            </button>
            <button 
              onClick={() => navigate('/universities')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Universities
            </button>
            <button 
              onClick={() => navigate('/application')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Application
            </button>
            <button
              onClick={logout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
        {/* Welcome */}
        <div className="mb-16">
          <p className="text-sm text-muted-foreground mb-2">Welcome back</p>
          <h1 className="font-serif text-4xl font-semibold text-foreground tracking-tight">
            {user.name.split(' ')[0]}
          </h1>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left - Current Stage (3 cols) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stage Card - Visual Anchor */}
            <div className="space-y-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Current Stage</p>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">{stageInfo.label}</h2>
                </div>
                <span className="text-sm text-muted-foreground">Step {currentStage} of 4</span>
              </div>

              {/* Calm Progress */}
              <div className="progress-calm">
                <div 
                  className="progress-calm-fill"
                  style={{ width: `${(currentStage / 4) * 100}%` }}
                />
              </div>

              <p className="text-muted-foreground">{stageInfo.description}</p>

              {/* Primary CTA */}
              <Button
                variant="hero"
                size="heroLg"
                onClick={() => navigate(stageInfo.route)}
                className="w-full"
              >
                {stageInfo.action}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/40">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Shortlisted</p>
                <p className="text-2xl font-medium text-foreground">{shortlistedUniversities.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Committed</p>
                <p className="text-2xl font-medium text-foreground">{lockedUniversities.length}</p>
              </div>
            </div>

            {/* Locked Universities */}
            {lockedUniversities.length > 0 && (
              <div className="pt-6 border-t border-border/40">
                <p className="text-sm text-muted-foreground mb-4">Your Target Universities</p>
                <div className="space-y-3">
                  {lockedUniversities.map((uni) => {
                    const uniTasks = applicationTasks.filter(t => t.universityId === uni.id);
                    const completedUniTasks = uniTasks.filter(t => t.completed).length;
                    const progress = uniTasks.length > 0 ? (completedUniTasks / uniTasks.length) * 100 : 0;
                    
                    return (
                      <button
                        key={uni.id}
                        onClick={() => navigate('/application')}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-border/60 hover:border-border transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <Lock className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{uni.name}</p>
                            <p className="text-sm text-muted-foreground">{completedUniTasks}/{uniTasks.length} tasks</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary/80 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right - Profile (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Strength */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Profile Strength</p>
                <span className="text-lg font-medium text-foreground">{profileStrength.strength}%</span>
              </div>
              
              <div className="progress-calm mb-6">
                <div 
                  className="progress-calm-fill"
                  style={{ width: `${profileStrength.strength}%` }}
                />
              </div>

              <div className="space-y-3">
                {profileStrength.factors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${factor.met ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                    <span className={`text-sm ${factor.met ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {factor.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Summary */}
            <div className="pt-6 border-t border-border/40">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Your Profile</p>
                <button
                  onClick={() => navigate('/onboarding?edit=true')}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Edit
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Field</p>
                    <p className="text-sm text-foreground">{onboardingData.studyGoal.targetField || onboardingData.academicBackground.field}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Degree</p>
                    <p className="text-sm text-foreground">{onboardingData.studyGoal.degree}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-sm text-foreground">{onboardingData.budget.totalBudget.replace('-', ' – $')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
