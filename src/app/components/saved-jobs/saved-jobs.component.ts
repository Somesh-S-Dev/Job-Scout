import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Job } from '../../services/gemini.service';
import { MatIconModule } from '@angular/material/icon';
import { JobDetailComponent } from '../search/job-detail.component';

@Component({
  selector: 'app-saved-jobs',
  standalone: true,
  imports: [CommonModule, MatIconModule, JobDetailComponent],
  template: `
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="min-w-0 flex-1">
          <h2 class="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Saved Jobs
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Keep track of opportunities you're interested in.
          </p>
        </div>
      </div>

      <div *ngIf="userService.savedJobs().length === 0" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <div class="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <mat-icon class="text-slate-300 text-3xl h-8 w-8">bookmark_border</mat-icon>
        </div>
        <h3 class="text-lg font-medium text-slate-900">No saved jobs yet</h3>
        <p class="mt-2 text-slate-500 max-w-sm mx-auto">
          Start searching for jobs and click the bookmark icon to save them for later.
        </p>
      </div>

      <div *ngIf="userService.savedJobs().length > 0" class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <div *ngFor="let job of userService.savedJobs()" 
             class="bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-md transition-all cursor-pointer border border-slate-200 hover:border-indigo-300 group"
             (click)="selectJob(job)">
          <div class="px-6 py-6">
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0">
                <h4 class="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{{ job.title }}</h4>
                <p class="text-sm font-semibold text-indigo-600 mt-0.5">{{ job.company }}</p>
              </div>
              <button (click)="toggleSave($event, job)" class="ml-4 text-indigo-600 hover:text-indigo-800 focus:outline-none">
                <mat-icon>bookmark</mat-icon>
              </button>
            </div>
            
            <div class="mt-4 flex flex-wrap gap-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                <mat-icon class="text-xs mr-1 h-3 w-3">location_on</mat-icon> {{ job.location }}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <mat-icon class="text-xs mr-1 h-3 w-3">payments</mat-icon> {{ job.salary || 'Salary N/A' }}
              </span>
            </div>
            
            <p class="mt-4 text-sm text-slate-600 line-clamp-3 leading-relaxed">
              {{ job.description }}
            </p>
            
            <div class="mt-6 flex items-center text-xs font-bold text-indigo-600 uppercase tracking-wider">
              View Details & Analyze <mat-icon class="ml-1 text-sm h-4 w-4">arrow_forward</mat-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Job Detail Modal -->
      <app-job-detail *ngIf="selectedJob()" [job]="selectedJob()!" (close)="selectedJob.set(null)"></app-job-detail>
    </div>
  `
})
export class SavedJobsComponent {
  userService = inject(UserService);
  selectedJob = signal<Job | null>(null);

  selectJob(job: Job) {
    this.selectedJob.set(job);
  }

  toggleSave(event: Event, job: Job) {
    event.stopPropagation();
    this.userService.toggleSaveJob(job);
  }
}
