import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Job, AiAnalysis, GeminiService } from '../../services/gemini.service';
import { UserService } from '../../services/user.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="fixed inset-0 flex items-center justify-center p-4 z-[9999] bg-slate-900/60 backdrop-blur-sm">
      <!-- Modal Content -->
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative border border-slate-200">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <div class="flex-1 min-w-0">
            <h3 class="text-2xl font-bold text-slate-900 truncate">{{ job?.title || 'Job Title' }}</h3>
            <p class="text-indigo-600 font-semibold truncate">{{ job?.company || 'Company Name' }}</p>
          </div>
          <div class="flex items-center space-x-2 ml-4">
            <button (click)="toggleSave($event)" class="p-2 text-slate-400 hover:text-indigo-600 transition-colors" [class.text-indigo-600]="job && userService.isJobSaved(job.id)">
              <mat-icon>{{ job && userService.isJobSaved(job.id) ? 'bookmark' : 'bookmark_border' }}</mat-icon>
            </button>
            <button (click)="close.emit()" class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-8">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center">
              <mat-icon class="text-indigo-500 mr-3">location_on</mat-icon>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                <p class="text-sm font-bold text-slate-700">{{ job?.location || 'N/A' }}</p>
              </div>
            </div>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center">
              <mat-icon class="text-indigo-500 mr-3">payments</mat-icon>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary</p>
                <p class="text-sm font-bold text-slate-700">{{ job?.salary || 'N/A' }}</p>
              </div>
            </div>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center">
              <mat-icon class="text-indigo-500 mr-3">work</mat-icon>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                <p class="text-sm font-bold text-slate-700">{{ job?.experience || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h4 class="text-lg font-bold text-slate-900 mb-4">Job Description</h4>
            <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {{ job?.description || 'No description provided.' }}
            </div>
          </div>

          <!-- Apply Link -->
          <div class="flex items-center justify-center py-4">
            <a *ngIf="job?.link" [href]="job.link" target="_blank" class="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95">
              Apply on Company Website <mat-icon class="ml-2 text-sm">open_in_new</mat-icon>
            </a>
            <p *ngIf="!job?.link" class="text-slate-400 italic text-sm">No direct application link found.</p>
          </div>

          <!-- AI Section -->
          <div class="border-t border-slate-100 pt-8">
            <div *ngIf="!analysis()" class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white text-center shadow-xl">
              <mat-icon class="text-4xl h-10 w-10 mb-4 opacity-80">auto_awesome</mat-icon>
              <h4 class="text-xl font-bold mb-2">AI Resume Analyzer</h4>
              <p class="text-indigo-100 text-sm mb-6 max-w-md mx-auto">
                Compare this job with your resume to get optimization tips and a custom cover letter.
              </p>
              <div class="flex flex-col items-center space-y-3">
                <button (click)="analyzeJob()" [disabled]="isAnalyzing() || userService.remainingAi() <= 0" class="inline-flex items-center px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50">
                  <mat-icon *ngIf="!isAnalyzing()" class="mr-2">auto_awesome</mat-icon>
                  <svg *ngIf="isAnalyzing()" class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isAnalyzing() ? 'Analyzing...' : 'Analyze & Generate' }}
                </button>
                <p class="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">
                  Costs 1 AI Credit ({{ userService.remainingAi() }} left)
                </p>
              </div>
            </div>

            <!-- Analysis Results -->
            <div *ngIf="analysis()" class="space-y-6">
              <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h5 class="font-bold text-slate-900 flex items-center">
                  <mat-icon class="text-indigo-500 mr-2">analytics</mat-icon> Analysis Results
                </h5>
                <div class="flex items-center">
                  <span class="text-xs font-bold text-slate-400 uppercase mr-2">Match Score</span>
                  <span class="text-2xl font-black text-indigo-600">{{ analysis()?.matchScore }}%</span>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div *ngFor="let s of analysis()?.suggestions" class="flex items-start p-4 bg-green-50 rounded-xl border border-green-100">
                  <mat-icon class="text-green-500 mr-3 text-sm h-5 w-5">check_circle</mat-icon>
                  <p class="text-sm text-green-800">{{ s }}</p>
                </div>
              </div>

              <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h5 class="font-bold text-slate-900 flex items-center">
                    <mat-icon class="text-indigo-500 mr-2">description</mat-icon> Cover Letter
                  </h5>
                  <button (click)="copyCoverLetter()" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
                    <mat-icon class="text-sm mr-1 h-4 w-4">content_copy</mat-icon> Copy
                  </button>
                </div>
                <div class="p-6 text-sm text-slate-600 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                  {{ analysis()?.coverLetter }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JobDetailComponent {
  @Input({ required: true }) job!: Job;
  @Output() close = new EventEmitter<void>();

  userService = inject(UserService);
  geminiService = inject(GeminiService);

  analysis = signal<AiAnalysis | null>(null);
  isAnalyzing = signal(false);

  toggleSave(event: Event) {
    event.stopPropagation();
    this.userService.toggleSaveJob(this.job);
  }

  async analyzeJob() {
    const resume = this.userService.user().resumeText;

    if (!resume) {
      alert('Please add your resume in Settings first!');
      return;
    }

    this.isAnalyzing.set(true);
    try {
      const result = await this.geminiService.analyzeRole(this.job, resume);
      this.analysis.set(result);
    } catch (error: any) {
      alert(error.message || 'Analysis failed');
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  copyCoverLetter() {
    const text = this.analysis()?.coverLetter;
    if (text) {
      navigator.clipboard.writeText(text);
      alert('Cover letter copied to clipboard!');
    }
  }
}
