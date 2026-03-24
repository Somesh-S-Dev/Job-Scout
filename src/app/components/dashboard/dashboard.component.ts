import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="min-w-0 flex-1">
          <h2 class="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back, {{ userService.user().name }}
          </h2>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Plan Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <mat-icon class="text-indigo-600 text-3xl h-8 w-8">stars</mat-icon>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Current Plan</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900 capitalize">{{ userService.user().currentPlan }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <a routerLink="/subscription" class="font-medium text-indigo-600 hover:text-indigo-500">
                Upgrade plan
              </a>
            </div>
          </div>
        </div>

        <!-- Scraps Used -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <mat-icon class="text-blue-500 text-3xl h-8 w-8">travel_explore</mat-icon>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Scraps Remaining</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">
                      {{ userService.remainingScraps() }} / {{ userService.planLimits().scrap }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm text-gray-500">
              Resets in {{ getHoursUntilReset() }} hours
            </div>
          </div>
        </div>

        <!-- AI Suggestions -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <mat-icon class="text-purple-500 text-3xl h-8 w-8">psychology</mat-icon>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">AI Credits Remaining</dt>
                  <dd>
                    <div class="text-lg font-medium text-gray-900">
                      {{ userService.remainingAi() }} / {{ userService.planLimits().ai }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <div class="text-sm text-gray-500">
              For resume analysis & cover letters
            </div>
          </div>
        </div>
      </div>

      <!-- Saved Jobs -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-base font-semibold leading-6 text-gray-900">Saved Jobs</h3>
        </div>
        <div class="px-4 py-5 sm:p-6">
          <div *ngIf="userService.savedJobs().length === 0" class="text-center py-6 text-gray-500">
            <mat-icon class="text-4xl text-gray-300 mb-2">bookmark_border</mat-icon>
            <p>No saved jobs yet. Go to Search to find and save jobs.</p>
          </div>
          <ul *ngIf="userService.savedJobs().length > 0" class="divide-y divide-gray-200">
            <li *ngFor="let job of userService.savedJobs()" class="py-4 flex items-center justify-between">
              <div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div class="truncate">
                  <div class="flex text-sm">
                    <p class="font-medium text-indigo-600 truncate">{{ job.title }}</p>
                    <p class="ml-1 flex-shrink-0 font-normal text-gray-500">at {{ job.company }}</p>
                  </div>
                  <div class="mt-2 flex">
                    <div class="flex items-center text-sm text-gray-500">
                      <mat-icon class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400">location_on</mat-icon>
                      <p>{{ job.location }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="ml-5 flex-shrink-0">
                <a routerLink="/search" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">View in Search</a>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Recent Activity Placeholder -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-base font-semibold leading-6 text-gray-900">Get Started</h3>
          <div class="mt-2 max-w-xl text-sm text-gray-500">
            <p>Start by uploading your resume in Settings, then head over to Search Jobs to find your next opportunity.</p>
          </div>
          <div class="mt-5">
            <a routerLink="/search" class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Search Jobs
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  userService = inject(UserService);

  getHoursUntilReset(): number {
    const user = this.userService.user();
    const limits = this.userService.planLimits();
    const resetTime = user.lastReset + (limits.resetHours * 60 * 60 * 1000);
    const diff = resetTime - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
  }
}
