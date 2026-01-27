import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Target, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  DollarSign,
  FileText,
  BookOpen
} from 'lucide-react';

const Dashboard = () => {
  const { 
    user, 
    onboardingData, 
    shortlistedUniversities, 
    applicationTasks,
    currentStage,
    logout,
    getLockedUniversity
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

  const lockedUniversity = getLockedUniversity();
  const completedTasks = applicationTasks.filter(t => t.completed).length;
  const totalTasks = applicationTasks.length;

  const getStageInfo = () => {
    switch (currentStage) {
      case 1:
        return {
          label: 'Onboarding',
          description: 'Complete your profile',
          action: 'Complete Onboarding',
          route: '/onboarding',
        };
      case 2:
        return {
          label: 'Discovery',
          description: 'Explore and shortlist universities',
          action: 'Talk to AI Counsellor',
          route: '/counsellor',
        };
      case 3:
        return {
          label: 'Execution',
          description: 'Complete application tasks',
          action: 'View Application Tasks',
          route: '/application',
        };
      case 4:
        return {
          label: 'Ready',
          description: 'Ready to submit application',
          action: 'Review Application',
          route: '/application',
        };
      default:
        return {
          label: 'Getting Started',
          description: 'Begin your journey',
          action: 'Get Started',
          route: '/counsellor',
        };
    }
  };

  const stageInfo = getStageInfo();

  const getProfileStrength = () => {
    let strength = 0;
    let factors: { label: string; met: boolean }[] = [];

    // Academic background
    const hasGoodGPA = onboardingData.academicBackground.gpa !== '';
    factors.push({ label: 'Academic records', met: hasGoodGPA });
    if (hasGoodGPA) strength += 20;

    // Exams
    const hasExams = onboardingData.exams.gre || onboardingData.exams.toefl || 
                     onboardingData.exams.ielts || onboardingData.exams.gmat;
    factors.push({ label: 'Standardized tests', met: !!hasExams });
    if (hasExams) strength += 25;

    // SOP readiness
    const sopReady = ['refining', 'ready'].includes(onboardingData.sopReadiness);
    factors.push({ label: 'SOP preparation', met: sopReady });
    if (sopReady) strength += 20;

    // Shortlist
    const hasShortlist = shortlistedUniversities.length >= 3;
    factors.push({ label: 'University shortlist', met: hasShortlist });
    if (hasShortlist) strength += 15;

    // Locked university
    factors.push({ label: 'Target university locked', met: !!lockedUniversity });
    if (lockedUniversity) strength += 20;

    return { strength, factors };
  };

  const profileStrength = getProfileStrength();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-sm">A</span>
            </div>
            <span className="font-serif text-lg font-medium text-foreground">
              AI Counsellor
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/counsellor')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              AI Counsellor
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

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's where you are in your study abroad journey
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Stage & Action */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Stage Card */}
            <div className="p-8 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Stage</p>
                  <h2 className="text-xl font-semibold text-foreground">{stageInfo.label}</h2>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{stageInfo.description}</p>

              {/* Stage Progress */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3, 4].map((stage) => (
                  <div
                    key={stage}
                    className={`flex-1 h-2 rounded-full ${
                      stage <= currentStage ? 'gradient-accent' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="hero"
                size="heroLg"
                onClick={() => navigate(stageInfo.route)}
                className="w-full gap-2"
              >
                {stageInfo.action}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Shortlisted</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">
                  {shortlistedUniversities.length} universities
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Locked Target</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">
                  {lockedUniversity ? '1 university' : 'None yet'}
                </p>
              </div>

              {lockedUniversity && (
                <div className="col-span-2 p-6 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Focused on</p>
                      <p className="font-semibold text-foreground">{lockedUniversity.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Tasks completed</p>
                      <p className="font-semibold text-foreground">{completedTasks}/{totalTasks}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Profile Strength */}
          <div className="space-y-6">
            {/* Profile Strength */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4">Profile Strength</h3>
              
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="fill-none stroke-muted"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="fill-none stroke-primary"
                    strokeWidth="12"
                    strokeDasharray={`${(profileStrength.strength / 100) * 352} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{profileStrength.strength}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {profileStrength.factors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {factor.met ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={`text-sm ${factor.met ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {factor.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Summary */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-4">Your Profile</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Studying</p>
                    <p className="text-foreground">{onboardingData.studyGoal.targetField || onboardingData.academicBackground.field}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target Degree</p>
                    <p className="text-foreground">{onboardingData.studyGoal.degree}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Range</p>
                    <p className="text-foreground">{onboardingData.budget.totalBudget.replace('-', ' - $')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Countries</p>
                    <p className="text-foreground">{onboardingData.studyGoal.preferredCountries.join(', ') || 'Not specified'}</p>
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
