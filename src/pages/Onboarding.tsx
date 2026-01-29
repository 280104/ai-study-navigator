import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, OnboardingData } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Academic Background', description: 'Tell us about your education' },
  { id: 2, title: 'Study Goals', description: 'What do you want to achieve?' },
  { id: 3, title: 'Budget & Funding', description: 'Your financial planning' },
  { id: 4, title: 'Exams & Readiness', description: 'Standardized tests and preparation' },
];

const COUNTRIES = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Netherlands', 'Singapore', 'Switzerland', 'Ireland'];

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    academicBackground: {
      currentLevel: '',
      field: '',
      gpa: '',
      university: '',
    },
    studyGoal: {
      degree: '',
      targetField: '',
      preferredCountries: [],
      intakeYear: '',
    },
    budget: {
      totalBudget: '',
      fundingSource: '',
      needScholarship: false,
    },
    exams: {
      gre: '',
      toefl: '',
      ielts: '',
      gmat: '',
    },
    sopReadiness: '',
    completed: false,
  });

  const { saveOnboarding, user, onboardingData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pre-populate form data in edit mode
  useEffect(() => {
    if (isEditMode && onboardingData) {
      setFormData(onboardingData);
    }
  }, [isEditMode, onboardingData]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const updateFormData = (section: keyof OnboardingData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...(prev[section] as object), [field]: value }
        : value,
    }));
  };

  const toggleCountry = (country: string) => {
    const current = formData.studyGoal.preferredCountries;
    const updated = current.includes(country)
      ? current.filter(c => c !== country)
      : [...current, country];
    updateFormData('studyGoal', 'preferredCountries', updated);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      saveOnboarding(formData);
      toast({
        title: isEditMode ? 'Profile updated!' : 'Profile complete!',
        description: isEditMode ? 'Your changes have been saved.' : 'You can now access your AI Counsellor.',
      });
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (isEditMode) {
      navigate('/dashboard');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Current Education Level</Label>
              <RadioGroup
                value={formData.academicBackground.currentLevel}
                onValueChange={(value) => updateFormData('academicBackground', 'currentLevel', value)}
                className="grid grid-cols-2 gap-3"
              >
                {['Undergraduate', 'Graduate', 'Working Professional', 'Other'].map(level => (
                  <div key={level} className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={level} id={level} />
                    <Label htmlFor={level} className="cursor-pointer flex-1">{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                placeholder="e.g., Computer Science, Business, Engineering"
                value={formData.academicBackground.field}
                onChange={(e) => updateFormData('academicBackground', 'field', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpa">GPA / Percentage</Label>
              <Input
                id="gpa"
                placeholder="e.g., 3.5/4.0 or 85%"
                value={formData.academicBackground.gpa}
                onChange={(e) => updateFormData('academicBackground', 'gpa', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">Current/Last University</Label>
              <Input
                id="university"
                placeholder="University name"
                value={formData.academicBackground.university}
                onChange={(e) => updateFormData('academicBackground', 'university', e.target.value)}
                className="h-12"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Target Degree</Label>
              <RadioGroup
                value={formData.studyGoal.degree}
                onValueChange={(value) => updateFormData('studyGoal', 'degree', value)}
                className="grid grid-cols-2 gap-3"
              >
                {["Master's", 'PhD', 'MBA', "Bachelor's"].map(degree => (
                  <div key={degree} className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={degree} id={degree} />
                    <Label htmlFor={degree} className="cursor-pointer flex-1">{degree}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetField">Target Field of Study</Label>
              <Input
                id="targetField"
                placeholder="e.g., Data Science, Finance, Machine Learning"
                value={formData.studyGoal.targetField}
                onChange={(e) => updateFormData('studyGoal', 'targetField', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-3">
              <Label>Preferred Countries (select multiple)</Label>
              <div className="grid grid-cols-3 gap-2">
                {COUNTRIES.map(country => (
                  <div
                    key={country}
                    onClick={() => toggleCountry(country)}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.studyGoal.preferredCountries.includes(country)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={formData.studyGoal.preferredCountries.includes(country)}
                      className="pointer-events-none"
                    />
                    <span className="text-sm">{country}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Target Intake Year</Label>
              <RadioGroup
                value={formData.studyGoal.intakeYear}
                onValueChange={(value) => updateFormData('studyGoal', 'intakeYear', value)}
                className="grid grid-cols-3 gap-3"
              >
                {['2025', '2026', '2027'].map(year => (
                  <div key={year} className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={year} id={year} />
                    <Label htmlFor={year} className="cursor-pointer flex-1">{year}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Total Budget (including living expenses)</Label>
              <RadioGroup
                value={formData.budget.totalBudget}
                onValueChange={(value) => updateFormData('budget', 'totalBudget', value)}
                className="space-y-3"
              >
                {[
                  { value: 'under-30k', label: 'Under $30,000/year' },
                  { value: '30k-50k', label: '$30,000 - $50,000/year' },
                  { value: '50k-80k', label: '$50,000 - $80,000/year' },
                  { value: 'above-80k', label: 'Above $80,000/year' },
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Primary Funding Source</Label>
              <RadioGroup
                value={formData.budget.fundingSource}
                onValueChange={(value) => updateFormData('budget', 'fundingSource', value)}
                className="grid grid-cols-2 gap-3"
              >
                {['Self-funded', 'Family', 'Education Loan', 'Employer Sponsored'].map(source => (
                  <div key={source} className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={source} id={source} />
                    <Label htmlFor={source} className="cursor-pointer flex-1">{source}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div
              onClick={() => updateFormData('budget', 'needScholarship', !formData.budget.needScholarship)}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.budget.needScholarship
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Checkbox
                checked={formData.budget.needScholarship}
                className="pointer-events-none"
              />
              <div>
                <p className="font-medium">I need scholarship/financial aid</p>
                <p className="text-sm text-muted-foreground">We'll prioritize universities with funding options</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">Leave blank if not taken yet</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gre">GRE Score</Label>
                <Input
                  id="gre"
                  placeholder="e.g., 320"
                  value={formData.exams.gre}
                  onChange={(e) => updateFormData('exams', 'gre', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmat">GMAT Score</Label>
                <Input
                  id="gmat"
                  placeholder="e.g., 700"
                  value={formData.exams.gmat}
                  onChange={(e) => updateFormData('exams', 'gmat', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toefl">TOEFL Score</Label>
                <Input
                  id="toefl"
                  placeholder="e.g., 105"
                  value={formData.exams.toefl}
                  onChange={(e) => updateFormData('exams', 'toefl', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ielts">IELTS Score</Label>
                <Input
                  id="ielts"
                  placeholder="e.g., 7.5"
                  value={formData.exams.ielts}
                  onChange={(e) => updateFormData('exams', 'ielts', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>SOP/Essay Readiness</Label>
              <RadioGroup
                value={formData.sopReadiness}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sopReadiness: value }))}
                className="space-y-3"
              >
                {[
                  { value: 'not-started', label: 'Haven\'t started yet' },
                  { value: 'brainstorming', label: 'Brainstorming ideas' },
                  { value: 'drafting', label: 'Working on first draft' },
                  { value: 'refining', label: 'Refining and editing' },
                  { value: 'ready', label: 'Ready to submit' },
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-sm">A</span>
            </div>
            <span className="font-serif text-lg font-medium text-foreground">
              AI Counsellor
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      currentStep > step.id
                        ? 'gradient-accent text-primary-foreground'
                        : currentStep === step.id
                        ? 'border-2 border-primary text-primary'
                        : 'border-2 border-border text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`text-xs mt-2 hidden sm:block ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 sm:w-24 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
                {isEditMode ? `Edit: ${STEPS[currentStep - 1].title}` : STEPS[currentStep - 1].title}
              </h1>
              <p className="text-muted-foreground">
                {STEPS[currentStep - 1].description}
              </p>
            </div>
            {isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 && isEditMode ? 'Cancel' : 'Back'}
          </Button>

          <Button
            variant="hero"
            size="heroMd"
            onClick={handleNext}
            className="gap-2"
          >
            {currentStep === 4 ? (isEditMode ? 'Save Changes' : 'Complete Profile') : 'Continue'}
            {currentStep < 4 && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
