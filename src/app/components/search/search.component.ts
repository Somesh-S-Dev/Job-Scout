import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, Job, AiAnalysis } from '../../services/gemini.service';
import { UserService } from '../../services/user.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { JobDetailComponent } from './job-detail.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, JobDetailComponent],
  template: `
    <div class="space-y-6">
      <!-- Search Form -->
      <div class="bg-white shadow-sm px-4 py-5 sm:rounded-2xl sm:p-8 border border-slate-200">
        <div class="md:grid md:grid-cols-3 md:gap-8">
          <div class="md:col-span-1">
            <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Job Search</h3>
            <p class="mt-2 text-sm text-slate-500 leading-relaxed">
              Enter keywords and location to discover active opportunities across the web.
            </p>
            <div class="mt-6 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div class="flex items-center">
                <mat-icon class="text-indigo-500 mr-3">info</mat-icon>
                <p class="text-sm text-indigo-700 font-medium">
                  Scraps Remaining: <span class="font-bold">{{ userService.remainingScraps() }}</span>
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 md:mt-0 md:col-span-2">
            <form (ngSubmit)="onSearch()" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Keywords</label>
                  <input type="text" [(ngModel)]="searchParams.keywords" name="keywords" class="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-all" placeholder="e.g. Senior Angular Developer">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                  <input type="text" [(ngModel)]="searchParams.location" name="location" class="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-all" placeholder="e.g. Remote, New York">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Experience Level</label>
                <select [(ngModel)]="searchParams.experience" name="experience" class="block w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-all">
                  <option value="Entry Level">Entry Level (0-2 years)</option>
                  <option value="Mid Level">Mid Level (3-5 years)</option>
                  <option value="Senior Level">Senior Level (5+ years)</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
              <div class="pt-2">
                <button type="submit" [disabled]="geminiService.isSearching() || userService.remainingScraps() <= 0" class="w-full inline-flex justify-center items-center rounded-xl border border-transparent bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]">
                  <svg *ngIf="geminiService.isSearching()" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ geminiService.isSearching() ? 'Scouting the web...' : 'Find New Opportunities' }}
                </button>
                <p *ngIf="userService.remainingScraps() <= 0" class="mt-3 text-xs text-red-500 text-center font-medium">
                  You've reached your scrap limit for this period. <a routerLink="/subscription" class="underline hover:text-red-600">Upgrade your plan</a> for more.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Results List -->
      <div *ngIf="geminiService.currentJobs().length > 0" class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-slate-900">Found {{ geminiService.currentJobs().length }} Opportunities</h3>
        </div>
        <div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          <div *ngFor="let job of geminiService.currentJobs()" 
               class="bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-md transition-all cursor-pointer border border-slate-200 hover:border-indigo-300 group relative" 
               (click)="selectJob(job)">
            <div class="px-6 py-6">
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                  <h4 class="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{{ job.title }}</h4>
                  <p class="text-sm font-semibold text-indigo-600 mt-0.5">{{ job.company }}</p>
                </div>
                <div class="flex items-center space-x-2">
                   <button (click)="toggleSave($event, job)" class="text-slate-300 hover:text-indigo-600 focus:outline-none transition-colors" [class.text-indigo-600]="userService.isJobSaved(job.id)">
                    <mat-icon>{{ userService.isJobSaved(job.id) ? 'bookmark' : 'bookmark_border' }}</mat-icon>
                  </button>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                    {{ job.salary || 'Salary N/A' }}
                  </span>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                <span class="flex items-center bg-slate-50 px-2 py-1 rounded-md"><mat-icon class="text-slate-400 text-sm mr-1 h-4 w-4">location_on</mat-icon> {{ job.location }}</span>
                <span class="flex items-center bg-slate-50 px-2 py-1 rounded-md"><mat-icon class="text-slate-400 text-sm mr-1 h-4 w-4">work_history</mat-icon> {{ job.experience }}</span>
              </div>
              <p class="mt-4 text-sm text-slate-600 line-clamp-3 leading-relaxed">{{ job.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Job Detail Modal -->
      <app-job-detail *ngIf="selectedJob()" [job]="selectedJob()!" (close)="selectedJob.set(null)"></app-job-detail>
    </div>
  `
})
export class SearchComponent implements OnInit {
  geminiService = inject(GeminiService);
  userService = inject(UserService);
  route = inject(ActivatedRoute);

  searchParams = {
    keywords: '',
    location: '',
    experience: 'Mid Level'
  };

  selectedJob = signal<Job | null>(null);

  ngOnInit() {
    // Sync local params with service state
    const lastParams = this.geminiService.lastSearchParams();
    this.searchParams = { ...lastParams };

    this.route.queryParams.subscribe(params => {
      const sessionId = params['sessionId'];
      if (sessionId) {
        this.loadSession(sessionId);
      }
    });
  }

  loadSession(sessionId: string) {
    const session = this.userService.searchHistory().find(s => s.id === sessionId);
    if (session) {
      this.searchParams = {
        keywords: session.keywords,
        location: session.location,
        experience: session.experience
      };
      this.geminiService.currentJobs.set(session.jobs);
      this.geminiService.lastSearchParams.set({ ...this.searchParams });
    }
  }

  async onSearch() {
    if (!this.searchParams.keywords) return;

    try {
      await this.geminiService.searchJobs(
        this.searchParams.keywords,
        this.searchParams.location,
        this.searchParams.experience
      );
    } catch (error: any) {
      alert(error.message || 'Search failed');
    }
  }

  selectJob(job: Job) {
    this.selectedJob.set(job);
  }

  toggleSave(event: Event, job: Job) {
    event.stopPropagation();
    this.userService.toggleSaveJob(job);
  }
}
