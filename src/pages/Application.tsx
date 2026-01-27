import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Lock,
  FileText,
  GraduationCap,
  Send,
  Users,
  ClipboardList,
  CheckCircle2,
  Circle,
  PartyPopper
} from 'lucide-react';

const Application = () => {
  const { 
    user, 
    onboardingData, 
    applicationTasks,
    toggleTaskComplete,
    getLockedUniversity
  } = useAuth();
  const navigate = useNavigate();

  if (!user || !onboardingData?.completed) {
    navigate('/login');
    return null;
  }

  const lockedUniversity = getLockedUniversity();

  if (!lockedUniversity) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>

            <h1 className="font-serif text-lg font-medium text-foreground">Application</h1>

            <div className="w-20" />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
            No University Locked
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Lock a university from your shortlist to unlock personalized application guidance with tasks and timeline.
          </p>
          <Button
            variant="hero"
            size="heroMd"
            onClick={() => navigate('/universities')}
          >
            Browse Universities
          </Button>
        </main>
      </div>
    );
  }

  const completedTasks = applicationTasks.filter(t => t.completed).length;
  const totalTasks = applicationTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isComplete = completedTasks === totalTasks && totalTasks > 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sop': return <FileText className="w-5 h-5" />;
      case 'lor': return <Users className="w-5 h-5" />;
      case 'exams': return <GraduationCap className="w-5 h-5" />;
      case 'documents': return <ClipboardList className="w-5 h-5" />;
      case 'forms': return <Send className="w-5 h-5" />;
      default: return <Circle className="w-5 h-5" />;
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

  // Group tasks by category
  const tasksByCategory = applicationTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof applicationTasks>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>

          <h1 className="font-serif text-lg font-medium text-foreground">Application</h1>

          <button
            onClick={() => navigate('/universities')}
            className="text-sm text-primary hover:underline"
          >
            Change University
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Locked University Card */}
        <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applying to</p>
                <h2 className="text-xl font-semibold text-foreground">{lockedUniversity.name}</h2>
                <p className="text-sm text-muted-foreground">{lockedUniversity.country}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold text-foreground">{completedTasks}/{totalTasks}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full gradient-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Completion State */}
        {isComplete && (
          <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center mb-8">
            <PartyPopper className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Ready to Submit!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You've completed all application tasks for {lockedUniversity.name}. 
              Review everything one more time and submit your application.
            </p>
          </div>
        )}

        {/* Tasks by Category */}
        <div className="space-y-6">
          {Object.entries(tasksByCategory).map(([category, tasks]) => {
            const categoryComplete = tasks.every(t => t.completed);
            
            return (
              <div key={category} className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    categoryComplete ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {categoryComplete ? <CheckCircle2 className="w-5 h-5" /> : getCategoryIcon(category)}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{getCategoryLabel(category)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tasks.filter(t => t.completed).length} of {tasks.length} completed
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        task.completed 
                          ? 'bg-muted/50 border-border/50' 
                          : 'bg-background border-border hover:border-primary/30'
                      }`}
                    >
                      <Checkbox 
                        checked={task.completed}
                        className="mt-0.5 pointer-events-none"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
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
      </main>
    </div>
  );
};

export default Application;
