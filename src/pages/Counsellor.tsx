import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { universities, University } from '@/data/universities';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ArrowRight,
  Send, 
  Sparkles,
  Target,
  Shield,
  Plus,
  Check,
  Volume2,
  VolumeX,
  Loader2,
  Home,
  Mic,
  MicOff
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
    getLockedUniversities
  } = useAuth();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  if (!user || !onboardingData?.completed) {
    navigate('/login');
    return null;
  }

  const isShortlisted = (id: string) => shortlistedUniversities.some(u => u.id === id);
  const lockedUniversities = getLockedUniversities();

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
    lockedUniversities: lockedUniversities.map(u => u.name),
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
        title: "University committed",
        description: `${uni.name} is now your target. Application tasks created.`,
      });
    }
  };

  const extractUniversitiesFromContent = (content: string): University[] => {
    const mentioned: University[] = [];
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

    if (isListening) {
      stopListening();
    }
    resetTranscript();

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
      const mentionedUniversities = extractUniversitiesFromContent(data.content);

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        universities: mentionedUniversities.length > 0 ? mentionedUniversities : undefined,
      };

      setMessages(prev => [...prev, aiMessage]);

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

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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
      case 'dream': return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'target': return <Target className="w-3.5 h-3.5 text-primary" />;
      case 'safe': return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getStageLabel = () => {
    switch (currentStage) {
      case 2: return 'Discovery Phase';
      case 3: return `${lockedUniversities.length} universities committed`;
      case 4: return 'Application Execution';
      default: return 'Getting Started';
    }
  };

  const getPrimaryAction = () => {
    switch (currentStage) {
      case 2:
        return { label: 'Discover Universities', route: '/universities' };
      case 3:
        return { label: 'Continue Application', route: '/application' };
      case 4:
        return { label: 'View Application', route: '/application' };
      default:
        return { label: 'Discover Universities', route: '/universities' };
    }
  };

  const primaryAction = getPrimaryAction();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border/40 bg-background sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="text-center">
            <span className="font-serif text-lg font-medium text-foreground">AI Counsellor</span>
          </div>

          <Button
            variant="hero"
            size="sm"
            onClick={() => navigate(primaryAction.route)}
            className="text-xs"
          >
            {primaryAction.label}
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {messages.length === 0 ? (
            <div className="text-center py-16 animate-fade-up">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{getStageLabel()}</p>
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
                Hello, {user.name.split(' ')[0]}
              </h2>
              <p className="text-muted-foreground mb-12 max-w-md mx-auto">
                I have your profile. Ask me about university recommendations, application gaps, or what to focus on next.
              </p>

              {/* Primary CTA */}
              <Button
                variant="hero"
                size="heroLg"
                onClick={() => navigate(primaryAction.route)}
                className="mb-12"
              >
                {primaryAction.label}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

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
                    className="p-4 text-sm text-left text-muted-foreground border border-border/60 rounded-lg hover:border-border hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message) => (
                <div key={message.id} className={`${message.role === 'user' ? 'ml-8' : 'mr-8'}`}>
                  {message.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-5 py-3 max-w-xl">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* AI Message - Clean, readable */}
                      <div className="ai-message rounded-2xl rounded-bl-md px-6 py-5 max-w-xl">
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                          {message.content}
                        </p>
                        
                        <button
                          onClick={() => handleSpeak(message.content)}
                          className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                      </div>

                      {/* University Cards - Compact */}
                      {message.universities && message.universities.length > 0 && (
                        <div className="space-y-2 ml-2">
                          {message.universities.map((uni) => (
                            <div 
                              key={uni.id}
                              className="flex items-center justify-between p-3 bg-card border border-border/60 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {getTierIcon(uni.tier)}
                                <div>
                                  <p className="text-sm font-medium text-foreground">{uni.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {uni.country} · #{uni.ranking}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={isShortlisted(uni.id) ? 'secondary' : 'outline'}
                                onClick={() => handleShortlist(uni)}
                                disabled={isShortlisted(uni.id)}
                                className="text-xs h-8"
                              >
                                {isShortlisted(uni.id) ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5 mr-1" />
                                    Shortlist
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="mr-8">
                  <div className="ai-message rounded-2xl rounded-bl-md px-6 py-5 max-w-xl">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-border/40 bg-background">
        <div className="max-w-3xl mx-auto px-6 py-4 space-y-4">
          <div className="flex items-center gap-3">
            {isSupported && (
              <button
                onClick={handleMicClick}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${
                  isListening 
                    ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse' 
                    : 'border-border hover:border-foreground/20'
                }`}
                title={isListening ? "Stop listening" : "Speak"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            )}
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask about universities, gaps, or next steps..."}
              className="flex-1 h-11 border-border/60"
              disabled={isLoading}
            />
            <Button
              variant="hero"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-11 w-11 rounded-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {isListening && (
            <p className="text-center text-xs text-primary">Listening... speak now</p>
          )}

          {/* Bottom Nav */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
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
              onClick={() => navigate(primaryAction.route)}
              className="text-xs"
            >
              {primaryAction.label}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counsellor;
