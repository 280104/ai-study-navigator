import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  ArrowRight,
  Lock,
  FileText,
  GraduationCap,
  Send,
  Users,
  ClipboardList,
  CheckCircle2,
  Circle,
  PartyPopper,
  Home,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Application = () => {
  const { 
    user, 
    onboardingData, 
    applicationTasks,
    toggleTaskComplete,
    getLockedUniversities,
    getTasksForUniversity
  } = useAuth();
  const navigate = useNavigate();
  const [expandedUniversities, setExpandedUniversities] = useState<Set<string>>(new Set());

  if (!user || !onboardingData?.completed) {
    navigate('/login');
    return null;
  }

  const lockedUniversities = getLockedUniversities();

  // Toggle expanded state
  const toggleExpanded = (uniId: string) => {
    setExpandedUniversities(prev => {
      const next = new Set(prev);
      if (next.has(uniId)) {
        next.delete(uniId);
      } else {
        next.add(uniId);
      }
      return next;
    });
  };

  // Expand all on first render if only one university
  if (lockedUniversities.length === 1 && expandedUniversities.size === 0) {
    setExpandedUniversities(new Set([lockedUniversities[0].id]));
  }

  if (lockedUniversities.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border/40 bg-background sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>

            <span className="font-serif text-lg font-medium text-foreground">Application</span>

            <Button
              variant="hero"
              size="sm"
              onClick={() => navigate('/universities')}
              className="text-xs"
            >
              Discover Universities
            </Button>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="max-w-md mx-auto">
            <Lock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-6" />
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
              No University Committed
            </h2>
            <p className="text-muted-foreground mb-8">
              Commit to a university from your shortlist to unlock personalized application tasks and guidance.
            </p>
            <Button
              variant="hero"
              size="heroLg"
              onClick={() => navigate('/universities')}
            >
              Discover Universities
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </main>

        <footer className="border-t border-border/40 bg-background">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/universities')}
                className="text-xs"
              >
                Discover Universities
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Calculate overall progress
  const completedTasks = applicationTasks.filter(t => t.completed).length;
  const totalTasks = applicationTasks.length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isAllComplete = completedTasks === totalTasks && totalTasks > 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sop': return <FileText className="w-4 h-4" />;
      case 'lor': return <Users className="w-4 h-4" />;
      case 'exams': return <GraduationCap className="w-4 h-4" />;
      case 'documents': return <ClipboardList className="w-4 h-4" />;
      case 'forms': return <Send className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sop': return 'Statement of Purpose';
      case 'lor': return 'Letters of Recommendation';
      case 'exams': return 'Standardized Tests';
      case 'documents': return 'Documents';
      case 'forms': return 'Application Forms';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <span className="font-serif text-lg font-medium text-foreground">Application</span>

          <Button
            variant="hero"
            size="sm"
            onClick={() => navigate('/counsellor')}
            className="text-xs"
          >
            Ask AI Counsellor
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
        {/* Overall Progress */}
        <div className="mb-12">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Overall Progress</p>
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                {lockedUniversities.length} {lockedUniversities.length === 1 ? 'University' : 'Universities'}
              </h1>
            </div>
            <span className="text-lg font-medium text-foreground">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="progress-calm">
            <div 
              className="progress-calm-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Completion Banner */}
        {isAllComplete && (
          <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center mb-8">
            <PartyPopper className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Ready to Submit!
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              You've completed all application tasks. Review everything and submit your applications.
            </p>
          </div>
        )}

        {/* AI Help CTA */}
        <div className="text-center mb-10 p-6 border border-border/60 rounded-xl">
          <p className="text-sm text-muted-foreground mb-4">
            Need help with any task? Get guidance from the AI Counsellor.
          </p>
          <Button
            variant="hero"
            size="heroLg"
            onClick={() => navigate('/counsellor')}
          >
            Get AI Help
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Universities - Each with its own tasks */}
        <div className="space-y-6">
          {lockedUniversities.map((university) => {
            const uniTasks = getTasksForUniversity(university.id);
            const completedUniTasks = uniTasks.filter(t => t.completed).length;
            const uniProgress = uniTasks.length > 0 ? (completedUniTasks / uniTasks.length) * 100 : 0;
            const isExpanded = expandedUniversities.has(university.id);
            const isUniComplete = completedUniTasks === uniTasks.length && uniTasks.length > 0;

            // Group tasks by category
            const tasksByCategory = uniTasks.reduce((acc, task) => {
              if (!acc[task.category]) {
                acc[task.category] = [];
              }
              acc[task.category].push(task);
              return acc;
            }, {} as Record<string, typeof uniTasks>);

            return (
              <div key={university.id} className="border border-border/60 rounded-xl overflow-hidden">
                {/* University Header */}
                <button
                  onClick={() => toggleExpanded(university.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isUniComplete ? 'bg-emerald-500/10' : 'bg-primary/10'
                    }`}>
                      {isUniComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{university.name}</h3>
                      <p className="text-sm text-muted-foreground">{university.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{completedUniTasks}/{uniTasks.length}</p>
                      <div className="w-20 h-1 bg-muted rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full transition-all ${isUniComplete ? 'bg-emerald-500' : 'bg-primary/80'}`}
                          style={{ width: `${uniProgress}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Tasks */}
                {isExpanded && (
                  <div className="border-t border-border/40 p-5 space-y-6 bg-muted/20">
                    {Object.entries(tasksByCategory).map(([category, tasks]) => {
                      const categoryComplete = tasks.every(t => t.completed);
                      
                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`${categoryComplete ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                              {categoryComplete ? <CheckCircle2 className="w-4 h-4" /> : getCategoryIcon(category)}
                            </div>
                            <span className="text-sm font-medium text-foreground">{getCategoryLabel(category)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({tasks.filter(t => t.completed).length}/{tasks.length})
                            </span>
                          </div>

                          <div className="space-y-2 ml-6">
                            {tasks.map((task) => (
                              <div 
                                key={task.id}
                                onClick={() => toggleTaskComplete(task.id)}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  task.completed 
                                    ? 'bg-muted/50 border-border/40' 
                                    : 'bg-background border-border/60 hover:border-border'
                                }`}
                              >
                                <Checkbox 
                                  checked={task.completed}
                                  className="mt-0.5 pointer-events-none"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                    {task.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {task.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/counsellor')}
              className="text-xs"
            >
              Get AI Help
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Application;
