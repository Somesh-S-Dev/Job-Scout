import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { Job } from './gemini.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export type PlanType = 'free' | 'plus' | 'pro';

export interface SearchSession {
  id: string;
  timestamp: number;
  keywords: string;
  location: string;
  experience: string;
  jobs: Job[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  currentPlan: PlanType;
  lastReset: number;
  scrapsUsed: number;
  aiSuggestionsUsed: number;
  savedJobs: Job[];
  searchHistory: SearchSession[];
  isLoggedIn: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Guest User',
  email: 'guest@example.com',
  phone: '',
  resumeText: '',
  currentPlan: 'free',
  lastReset: Date.now(),
  scrapsUsed: 0,
  aiSuggestionsUsed: 0,
  savedJobs: [],
  searchHistory: [],
  isLoggedIn: false
};

const PLAN_LIMITS = {
  free: { scrap: 5, ai: 5, resetHours: 168 }, // 1 week
  plus: { scrap: 20, ai: 20, resetHours: 72 }, // 3 days
  pro: { scrap: 20, ai: 20, resetHours: 36 }, // 36 hours
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private storageKey = 'jobscout_user_v1';
  private registryKey = 'jobscout_registered_users_v1';
  private platformId = inject(PLATFORM_ID);
  
  // Signals
  user = signal<UserProfile>(this.loadUser());

  private getRegisteredUsers(): { email: string, name: string }[] {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.registryKey);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  }

  isEmailRegistered(email: string): boolean {
    return this.getRegisteredUsers().some(u => u.email === email);
  }

  // Computed
  planLimits = computed(() => PLAN_LIMITS[this.user().currentPlan]);
  
  remainingScraps = computed(() => {
    const limit = this.planLimits().scrap;
    return Math.max(0, limit - this.user().scrapsUsed);
  });

  remainingAi = computed(() => {
    const limit = this.planLimits().ai;
    return Math.max(0, limit - this.user().aiSuggestionsUsed);
  });

  savedJobs = computed(() => this.user().savedJobs);
  searchHistory = computed(() => this.user().searchHistory);
  isLoggedIn = computed(() => this.user().isLoggedIn);

  constructor(private router: Router) {
    // Auto-save effect
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.user()));
      }
    });

    this.checkReset();
  }

  private loadUser(): UserProfile {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure new fields exist for migrated data
        return { 
          ...DEFAULT_PROFILE, 
          ...parsed, 
          savedJobs: parsed.savedJobs || [],
          searchHistory: parsed.searchHistory || [],
          isLoggedIn: parsed.isLoggedIn || false
        };
      }
    }
    return DEFAULT_PROFILE;
  }

  private checkReset() {
    const user = this.user();
    const now = Date.now();
    const resetTime = user.lastReset + (PLAN_LIMITS[user.currentPlan].resetHours * 60 * 60 * 1000);

    if (now > resetTime) {
      this.user.update(u => ({
        ...u,
        scrapsUsed: 0,
        aiSuggestionsUsed: 0,
        lastReset: now
      }));
    }
  }

  updateProfile(data: Partial<UserProfile>) {
    this.user.update(u => ({ ...u, ...data }));
  }

  upgradePlan(plan: PlanType) {
    this.user.update(u => ({
      ...u,
      currentPlan: plan,
      scrapsUsed: 0,
      aiSuggestionsUsed: 0,
      lastReset: Date.now()
    }));
  }

  incrementScrapUsage() {
    this.checkReset();
    if (this.remainingScraps() > 0) {
      this.user.update(u => ({ ...u, scrapsUsed: u.scrapsUsed + 1 }));
      return true;
    }
    return false;
  }

  incrementAiUsage() {
    this.checkReset();
    if (this.remainingAi() > 0) {
      this.user.update(u => ({ ...u, aiSuggestionsUsed: u.aiSuggestionsUsed + 1 }));
      return true;
    }
    return false;
  }

  toggleSaveJob(job: Job) {
    this.user.update(u => {
      const exists = u.savedJobs.some(j => j.id === job.id);
      let newSavedJobs;
      if (exists) {
        newSavedJobs = u.savedJobs.filter(j => j.id !== job.id);
      } else {
        newSavedJobs = [...u.savedJobs, job];
      }
      return { ...u, savedJobs: newSavedJobs };
    });
  }

  isJobSaved(jobId: string): boolean {
    return this.user().savedJobs.some(j => j.id === jobId);
  }

  addSearchSession(session: SearchSession) {
    this.user.update(u => ({
      ...u,
      searchHistory: [session, ...u.searchHistory]
    }));
  }

  login(email: string, password?: string) {
    const users = this.getRegisteredUsers();
    const registered = users.find(u => u.email === email);
    
    this.user.update(u => ({
      ...u,
      email,
      name: registered ? registered.name : u.name,
      isLoggedIn: true
    }));
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.user.update(u => ({
      ...u,
      isLoggedIn: false
    }));
    this.router.navigate(['/login']);
  }

  signup(email: string, name: string) {
    if (isPlatformBrowser(this.platformId)) {
      const users = this.getRegisteredUsers();
      if (!users.some(u => u.email === email)) {
        users.push({ email, name });
        localStorage.setItem(this.registryKey, JSON.stringify(users));
      }
    }

    this.user.set({
      ...DEFAULT_PROFILE,
      email,
      name,
      isLoggedIn: true
    });
    this.router.navigate(['/dashboard']);
  }
}
