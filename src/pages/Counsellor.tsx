import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { universities, University } from '@/data/universities';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Send, 
  Sparkles,
  Target,
  Shield,
  Plus,
  Check,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  universities?: University[];
}

interface AIAction {
  action: 'shortlist' | 'lock' | 'none';
  universityName?: string;
}

const Counsellor = () => {
  const { 
    user, 
    onboardingData, 
    shortlistedUniversities,
    applicationTasks,
    currentStage,
    shortlistUniversity,
    lockUniversity,
    getLockedUniversity
  } = useAuth();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !onboardingData?.completed) {
    navigate('/login');
    return null;
  }

  const isShortlisted = (id: string) => shortlistedUniversities.some(u => u.id === id);
  const lockedUni = getLockedUniversity();

  const buildContext = () => ({
    name: user.name,
    stage: currentStage,
    onboarding: {
      academicBackground: onboardingData.academicBackground,
      studyGoal: onboardingData.studyGoal,
      budget: onboardingData.budget,
      exams: onboardingData.exams,
      sopReadiness: onboardingData.sopReadiness,
    },
    shortlistedCount: shortlistedUniversities.length,
    shortlistedUniversities: shortlistedUniversities.map(u => u.name),
    lockedUniversity: lockedUni?.name || null,
    taskProgress: {
      completed: applicationTasks.filter(t => t.completed).length,
      total: applicationTasks.length,
    },
  });

  const findUniversityByName = (name: string): University | undefined => {
    const normalizedName = name.toLowerCase().trim();
    return universities.find(u => 
      u.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(u.name.toLowerCase())
    );
  };

  const executeAction = (action: AIAction) => {
    if (action.action === 'none' || !action.universityName) return;

    const uni = findUniversityByName(action.universityName);
    if (!uni) {
      toast({
        title: "University not found",
        description: `Couldn't find "${action.universityName}" in the database.`,
        variant: "destructive",
      });
      return;
    }

    if (action.action === 'shortlist') {
      if (!isShortlisted(uni.id)) {
        shortlistUniversity(uni);
        toast({
          title: "University shortlisted",
          description: `${uni.name} has been added to your shortlist.`,
        });
      }
    } else if (action.action === 'lock') {
      if (!isShortlisted(uni.id)) {
        shortlistUniversity(uni);
      }
      lockUniversity(uni.id);
      toast({
        title: "University locked",
        description: `${uni.name} is now your primary target. Application tasks created.`,
      });
    }
  };

  const extractUniversitiesFromContent = (content: string): University[] => {
    const mentioned: University[] = [];
    const patterns = [
      /\*\*([^*]+)\*\*\s*\((dream|target|safe)\)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+University|\s+Institute|\s+College)?)/g,
    ];

    // Match formatted universities first
    let match;
    while ((match = patterns[0].exec(content)) !== null) {
      const uni = findUniversityByName(match[1]);
      if (uni && !mentioned.find(m => m.id === uni.id)) {
        mentioned.push(uni);
      }
    }

    // If we found formatted ones, return those
    if (mentioned.length > 0) return mentioned.slice(0, 4);

    // Otherwise try to find any university mentions
    universities.forEach(uni => {
      if (content.toLowerCase().includes(uni.name.toLowerCase())) {
        if (!mentioned.find(m => m.id === uni.id)) {
          mentioned.push(uni);
        }
      }
    });

    return mentioned.slice(0, 4);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-counsellor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: input,
            context: buildContext(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      // Extract mentioned universities from response
      const mentionedUniversities = extractUniversitiesFromContent(data.content);

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        universities: mentionedUniversities.length > 0 ? mentionedUniversities : undefined,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Execute any actions
      if (data.action && data.action.action !== 'none') {
        executeAction(data.action);
      }
    } catch (error) {
      console.error('AI error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortlist = (university: University) => {
    if (!isShortlisted(university.id)) {
      shortlistUniversity(university);
      toast({
        title: "Added to shortlist",
        description: `${university.name} added to your list.`,
      });
    }
  };

  const handleSpeak = (content: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(content);
    }
  };

  const getTierIcon = (tier: University['tier']) => {
    switch (tier) {
      case 'dream': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'target': return <Target className="w-4 h-4 text-primary" />;
      case 'safe': return <Shield className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getStageLabel = () => {
    switch (currentStage) {
      case 2: return 'Discovery Phase';
      case 3: return `Focused on ${lockedUni?.name || 'locked university'}`;
      case 4: return 'Application Execution';
      default: return 'Getting Started';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-center">
              <span className="font-medium text-foreground block text-sm">AI Counsellor</span>
              <span className="text-xs text-muted-foreground">{getStageLabel()}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/universities')}
            className="text-sm text-primary hover:underline"
          >
            Universities ({shortlistedUniversities.length})
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                Hello, {user.name.split(' ')[0]}!
              </h2>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                I know your profile. Ask me about universities, your gaps, or what to do next.
              </p>
              <p className="text-xs text-muted-foreground mb-8">
                Stage {currentStage}: {getStageLabel()}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  'What are my profile gaps?',
                  'Recommend universities for me',
                  'What should I do next?',
                  currentStage >= 3 ? 'How are my tasks progressing?' : 'Help me shortlist universities',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(handleSend, 50);
                    }}
                    className="p-3 text-sm text-left border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-2xl px-5 py-4`}>
                    <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                      {message.content}
                    </div>

                    {/* Speak button for AI messages */}
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleSpeak(message.content)}
                        className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            Listen
                          </>
                        )}
                      </button>
                    )}

                    {/* University Cards */}
                    {message.universities && message.universities.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {message.universities.map((uni) => (
                          <div 
                            key={uni.id}
                            className="p-4 bg-background rounded-xl border border-border"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                  {getTierIcon(uni.tier)}
                                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                    {uni.tier}
                                  </span>
                                </div>
                                <h4 className="font-medium">{uni.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {uni.country} • Rank #{uni.ranking} • {uni.acceptanceRate} acceptance
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant={isShortlisted(uni.id) ? 'secondary' : 'outline'}
                                onClick={() => handleShortlist(uni)}
                                disabled={isShortlisted(uni.id)}
                                className="shrink-0"
                              >
                                {isShortlisted(uni.id) ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Shortlist
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing your profile...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about universities, gaps, or next steps..."
              className="flex-1 h-12"
              disabled={isLoading}
            />
            <Button
              variant="hero"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counsellor;
