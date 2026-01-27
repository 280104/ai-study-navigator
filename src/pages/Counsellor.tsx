import { useState } from 'react';
import { useAuth, OnboardingData } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { universities, University } from '@/data/universities';
import { 
  ArrowLeft, 
  Send, 
  Sparkles,
  GraduationCap,
  Target,
  Shield,
  Plus,
  Check
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  universities?: University[];
  action?: 'shortlist' | 'lock';
}

const Counsellor = () => {
  const { 
    user, 
    onboardingData, 
    shortlistedUniversities,
    shortlistUniversity,
    lockUniversity
  } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !onboardingData?.completed) {
    navigate('/login');
    return null;
  }

  const isShortlisted = (id: string) => shortlistedUniversities.some(u => u.id === id);

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Profile analysis
    if (lowerMessage.includes('profile') || lowerMessage.includes('strength') || lowerMessage.includes('analyze')) {
      return createProfileAnalysis(onboardingData);
    }
    
    // University recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('university') || lowerMessage.includes('universities')) {
      return createRecommendations(onboardingData);
    }

    // Dream universities
    if (lowerMessage.includes('dream')) {
      const dreamUnis = universities.filter(u => u.tier === 'dream');
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Here are the **Dream Universities** that match your profile. These are highly competitive but worth aiming for if you have strong credentials:\n\n*Note: These universities have very low acceptance rates (3-18%). I recommend having backup options.*`,
        universities: dreamUnis.slice(0, 4),
      };
    }

    // Target universities
    if (lowerMessage.includes('target') || lowerMessage.includes('realistic')) {
      const targetUnis = universities.filter(u => u.tier === 'target');
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Here are your **Target Universities** - realistic options where you have a good chance of admission based on your profile:`,
        universities: targetUnis.slice(0, 4),
      };
    }

    // Safe universities
    if (lowerMessage.includes('safe') || lowerMessage.includes('backup')) {
      const safeUnis = universities.filter(u => u.tier === 'safe');
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Here are your **Safe Universities** - strong programs where admission is more likely:`,
        universities: safeUnis.slice(0, 4),
      };
    }

    // Shortlist action
    if (lowerMessage.includes('shortlist') || lowerMessage.includes('add to list')) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I can help you shortlist universities. You currently have **${shortlistedUniversities.length} universities** shortlisted.\n\nWould you like me to show you:\n- Dream universities (ambitious)\n- Target universities (realistic)\n- Safe universities (backup)\n\nOr you can visit the **Universities** page to browse and shortlist directly.`,
      };
    }

    // Lock action
    if (lowerMessage.includes('lock') || lowerMessage.includes('commit') || lowerMessage.includes('focus')) {
      if (shortlistedUniversities.length === 0) {
        return {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `You haven't shortlisted any universities yet. I recommend shortlisting at least 3-5 universities before locking one as your primary target.\n\nWould you like me to show you some recommendations based on your profile?`,
        };
      }
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `You have ${shortlistedUniversities.length} universities shortlisted. Locking a university means you'll focus your application efforts on it.\n\nVisit the **Universities** page to lock your primary target. Once locked, I'll generate a personalized application checklist for you.`,
      };
    }

    // Default response
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `I'm your AI study abroad counsellor. I can help you with:\n\n• **Analyze your profile** - Understand your strengths and gaps\n• **Recommend universities** - Dream, Target, and Safe options\n• **Shortlist universities** - Build your application list\n• **Lock a target** - Focus on one university for execution\n\nWhat would you like to explore?`,
    };
  };

  const createProfileAnalysis = (data: OnboardingData): Message => {
    const strengths: string[] = [];
    const gaps: string[] = [];

    // Analyze GPA
    if (data.academicBackground.gpa) {
      strengths.push(`Academic background in ${data.academicBackground.field}`);
    }

    // Analyze exams
    if (data.exams.gre) {
      strengths.push(`GRE score: ${data.exams.gre}`);
    } else {
      gaps.push('No GRE score submitted');
    }

    if (data.exams.toefl || data.exams.ielts) {
      strengths.push(`English proficiency: ${data.exams.toefl ? `TOEFL ${data.exams.toefl}` : `IELTS ${data.exams.ielts}`}`);
    } else {
      gaps.push('No English proficiency test scores');
    }

    // Analyze SOP
    if (['refining', 'ready'].includes(data.sopReadiness)) {
      strengths.push('SOP preparation is advanced');
    } else {
      gaps.push('SOP still needs work');
    }

    // Budget analysis
    const budgetNote = data.budget.needScholarship 
      ? 'You need scholarship support - we\'ll prioritize universities with funding'
      : 'Self-funded - more flexibility in university choices';

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `## Profile Analysis\n\n**Strengths:**\n${strengths.map(s => `✓ ${s}`).join('\n')}\n\n**Areas to Improve:**\n${gaps.map(g => `○ ${g}`).join('\n')}\n\n**Budget:** ${budgetNote}\n\n**Target:** ${data.studyGoal.degree} in ${data.studyGoal.targetField}\n**Countries:** ${data.studyGoal.preferredCountries.join(', ')}\n\nWould you like me to recommend universities based on this profile?`,
    };
  };

  const createRecommendations = (data: OnboardingData): Message => {
    const preferredCountries = data.studyGoal.preferredCountries;
    
    let recommendations = universities;
    if (preferredCountries.length > 0) {
      recommendations = universities.filter(u => preferredCountries.includes(u.country));
    }

    const dream = recommendations.filter(u => u.tier === 'dream').slice(0, 2);
    const target = recommendations.filter(u => u.tier === 'target').slice(0, 2);
    const safe = recommendations.filter(u => u.tier === 'safe').slice(0, 2);

    const allRecs = [...dream, ...target, ...safe];

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Based on your profile studying **${data.studyGoal.targetField}** for a **${data.studyGoal.degree}**, here are my recommendations:\n\n🎯 **Dream** (ambitious but possible)\n💼 **Target** (realistic match)\n🛡️ **Safe** (strong backup)\n\nClick "Add to shortlist" to save universities you're interested in:`,
      universities: allRecs,
    };
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

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 800);
  };

  const handleShortlist = (university: University) => {
    if (!isShortlisted(university.id)) {
      shortlistUniversity(university);
    }
  };

  const getTierIcon = (tier: University['tier']) => {
    switch (tier) {
      case 'dream': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'target': return <Target className="w-4 h-4 text-primary" />;
      case 'safe': return <Shield className="w-4 h-4 text-emerald-500" />;
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
            <span className="font-medium text-foreground">AI Counsellor</span>
          </div>

          <button
            onClick={() => navigate('/universities')}
            className="text-sm text-primary hover:underline"
          >
            View Universities
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
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                I'm your AI study abroad counsellor. I understand your profile and can help you make informed decisions.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  'Analyze my profile',
                  'Recommend universities',
                  'Show dream universities',
                  'Show safe options',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => handleSend(), 100);
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

                    {/* University Cards */}
                    {message.universities && (
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
                                <h4 className="font-medium text-foreground">{uni.name}</h4>
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
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-100" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-200" />
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
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about universities, profile analysis, or next steps..."
              className="flex-1 h-12"
            />
            <Button
              variant="hero"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counsellor;
