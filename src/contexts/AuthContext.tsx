import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { University } from '@/data/universities';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface OnboardingData {
  academicBackground: {
    currentLevel: string;
    field: string;
    gpa: string;
    university: string;
  };
  studyGoal: {
    degree: string;
    targetField: string;
    preferredCountries: string[];
    intakeYear: string;
  };
  budget: {
    totalBudget: string;
    fundingSource: string;
    needScholarship: boolean;
  };
  exams: {
    gre: string;
    toefl: string;
    ielts: string;
    gmat: string;
  };
  sopReadiness: string;
  completed: boolean;
}

export interface ShortlistedUniversity extends University {
  shortlistedAt: string;
  locked: boolean;
  lockedAt?: string;
}

export interface ApplicationTask {
  id: string;
  universityId: string;
  title: string;
  description: string;
  category: 'documents' | 'exams' | 'forms' | 'sop' | 'lor';
  completed: boolean;
  dueDate?: string;
}

interface AuthContextType {
  user: User | null;
  onboardingData: OnboardingData | null;
  shortlistedUniversities: ShortlistedUniversity[];
  applicationTasks: ApplicationTask[];
  currentStage: number;
  isLoading: boolean;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  saveOnboarding: (data: OnboardingData) => void;
  shortlistUniversity: (university: University) => void;
  removeFromShortlist: (universityId: string) => void;
  lockUniversity: (universityId: string) => void;
  unlockUniversity: (universityId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  getLockedUniversity: () => ShortlistedUniversity | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'ai_counsellor_user',
  USERS_DB: 'ai_counsellor_users_db',
  ONBOARDING: 'ai_counsellor_onboarding',
  SHORTLIST: 'ai_counsellor_shortlist',
  TASKS: 'ai_counsellor_tasks',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [shortlistedUniversities, setShortlistedUniversities] = useState<ShortlistedUniversity[]>([]);
  const [applicationTasks, setApplicationTasks] = useState<ApplicationTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate current stage based on progress
  const currentStage = React.useMemo(() => {
    if (!user) return 0;
    if (!onboardingData?.completed) return 1;
    const lockedUni = shortlistedUniversities.find(u => u.locked);
    if (!lockedUni) return 2;
    const allTasksComplete = applicationTasks.length > 0 && applicationTasks.every(t => t.completed);
    if (allTasksComplete) return 4;
    return 3;
  }, [user, onboardingData, shortlistedUniversities, applicationTasks]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Load user-specific data
      const storedOnboarding = localStorage.getItem(`${STORAGE_KEYS.ONBOARDING}_${parsedUser.id}`);
      const storedShortlist = localStorage.getItem(`${STORAGE_KEYS.SHORTLIST}_${parsedUser.id}`);
      const storedTasks = localStorage.getItem(`${STORAGE_KEYS.TASKS}_${parsedUser.id}`);
      
      if (storedOnboarding) setOnboardingData(JSON.parse(storedOnboarding));
      if (storedShortlist) setShortlistedUniversities(JSON.parse(storedShortlist));
      if (storedTasks) setApplicationTasks(JSON.parse(storedTasks));
    }
    setIsLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Get existing users
    const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '{}');
    
    // Check if email already exists
    if (usersDb[email]) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    // Store in "database"
    usersDb[email] = { ...newUser, password };
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(usersDb));
    
    // Set current user
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    setUser(newUser);
    
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '{}');
    const storedUser = usersDb[email];
    
    if (!storedUser || storedUser.password !== password) {
      return false;
    }

    const { password: _, ...userWithoutPassword } = storedUser;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);

    // Load user-specific data
    const storedOnboarding = localStorage.getItem(`${STORAGE_KEYS.ONBOARDING}_${userWithoutPassword.id}`);
    const storedShortlist = localStorage.getItem(`${STORAGE_KEYS.SHORTLIST}_${userWithoutPassword.id}`);
    const storedTasks = localStorage.getItem(`${STORAGE_KEYS.TASKS}_${userWithoutPassword.id}`);
    
    if (storedOnboarding) setOnboardingData(JSON.parse(storedOnboarding));
    if (storedShortlist) setShortlistedUniversities(JSON.parse(storedShortlist));
    if (storedTasks) setApplicationTasks(JSON.parse(storedTasks));

    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setOnboardingData(null);
    setShortlistedUniversities([]);
    setApplicationTasks([]);
  };

  const saveOnboarding = (data: OnboardingData) => {
    if (!user) return;
    const completedData = { ...data, completed: true };
    localStorage.setItem(`${STORAGE_KEYS.ONBOARDING}_${user.id}`, JSON.stringify(completedData));
    setOnboardingData(completedData);
  };

  const shortlistUniversity = (university: University) => {
    if (!user) return;
    const newShortlist: ShortlistedUniversity = {
      ...university,
      shortlistedAt: new Date().toISOString(),
      locked: false,
    };
    const updated = [...shortlistedUniversities, newShortlist];
    localStorage.setItem(`${STORAGE_KEYS.SHORTLIST}_${user.id}`, JSON.stringify(updated));
    setShortlistedUniversities(updated);
  };

  const removeFromShortlist = (universityId: string) => {
    if (!user) return;
    const updated = shortlistedUniversities.filter(u => u.id !== universityId);
    localStorage.setItem(`${STORAGE_KEYS.SHORTLIST}_${user.id}`, JSON.stringify(updated));
    setShortlistedUniversities(updated);
    
    // Also remove associated tasks
    const updatedTasks = applicationTasks.filter(t => t.universityId !== universityId);
    localStorage.setItem(`${STORAGE_KEYS.TASKS}_${user.id}`, JSON.stringify(updatedTasks));
    setApplicationTasks(updatedTasks);
  };

  const lockUniversity = (universityId: string) => {
    if (!user) return;
    const updated = shortlistedUniversities.map(u => 
      u.id === universityId 
        ? { ...u, locked: true, lockedAt: new Date().toISOString() }
        : { ...u, locked: false, lockedAt: undefined }
    );
    localStorage.setItem(`${STORAGE_KEYS.SHORTLIST}_${user.id}`, JSON.stringify(updated));
    setShortlistedUniversities(updated);

    // Generate application tasks for the locked university
    const university = updated.find(u => u.id === universityId);
    if (university) {
      const newTasks: ApplicationTask[] = [
        {
          id: crypto.randomUUID(),
          universityId,
          title: 'Complete Statement of Purpose',
          description: `Write a compelling SOP tailored for ${university.name}`,
          category: 'sop',
          completed: false,
        },
        {
          id: crypto.randomUUID(),
          universityId,
          title: 'Gather Letters of Recommendation',
          description: 'Request 2-3 LORs from professors or employers',
          category: 'lor',
          completed: false,
        },
        {
          id: crypto.randomUUID(),
          universityId,
          title: 'Submit Standardized Test Scores',
          description: 'Send official GRE/TOEFL/IELTS scores to the university',
          category: 'exams',
          completed: false,
        },
        {
          id: crypto.randomUUID(),
          universityId,
          title: 'Prepare Academic Transcripts',
          description: 'Get official transcripts from your current/previous institutions',
          category: 'documents',
          completed: false,
        },
        {
          id: crypto.randomUUID(),
          universityId,
          title: 'Complete Online Application Form',
          description: `Fill out the online application on ${university.name}'s portal`,
          category: 'forms',
          completed: false,
        },
        {
          id: crypto.randomUUID(),
          universityId,
          title: 'Pay Application Fee',
          description: 'Submit the application fee payment',
          category: 'forms',
          completed: false,
        },
      ];
      localStorage.setItem(`${STORAGE_KEYS.TASKS}_${user.id}`, JSON.stringify(newTasks));
      setApplicationTasks(newTasks);
    }
  };

  const unlockUniversity = (universityId: string) => {
    if (!user) return;
    const updated = shortlistedUniversities.map(u => 
      u.id === universityId 
        ? { ...u, locked: false, lockedAt: undefined }
        : u
    );
    localStorage.setItem(`${STORAGE_KEYS.SHORTLIST}_${user.id}`, JSON.stringify(updated));
    setShortlistedUniversities(updated);
  };

  const toggleTaskComplete = (taskId: string) => {
    if (!user) return;
    const updated = applicationTasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    localStorage.setItem(`${STORAGE_KEYS.TASKS}_${user.id}`, JSON.stringify(updated));
    setApplicationTasks(updated);
  };

  const getLockedUniversity = () => {
    return shortlistedUniversities.find(u => u.locked) || null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      onboardingData,
      shortlistedUniversities,
      applicationTasks,
      currentStage,
      isLoading,
      signup,
      login,
      logout,
      saveOnboarding,
      shortlistUniversity,
      removeFromShortlist,
      lockUniversity,
      unlockUniversity,
      toggleTaskComplete,
      getLockedUniversity,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
