import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, PlanType } from '../../services/user.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:flex-col sm:align-center">
        <h1 class="text-5xl font-extrabold text-gray-900 sm:text-center">Pricing Plans</h1>
        <p class="mt-5 text-xl text-gray-500 sm:text-center">
          Choose the right plan for your job search intensity.
        </p>
      </div>
      <div class="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
        
        <!-- Free Plan -->
        <div class="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
          <div class="p-6">
            <h2 class="text-lg leading-6 font-medium text-gray-900">Free</h2>
            <p class="mt-4 text-sm text-gray-500">Perfect for casual browsing.</p>
            <p class="mt-8">
              <span class="text-4xl font-extrabold text-gray-900">$0</span>
              <span class="text-base font-medium text-gray-500">/mo</span>
            </p>
            <button (click)="selectPlan('free')" [disabled]="currentPlan() === 'free'" 
              class="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
              {{ currentPlan() === 'free' ? 'Current Plan' : 'Select Free' }}
            </button>
          </div>
          <div class="pt-6 pb-8 px-6">
            <h3 class="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
            <ul class="mt-6 space-y-4">
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">5 Job Scraps / week</span>
              </li>
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">5 AI Analyses / week</span>
              </li>
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">Resets every 7 days</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Plus Plan -->
        <div class="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white relative">
           <div class="absolute top-0 right-0 -mt-2 -mr-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            Popular
          </div>
          <div class="p-6">
            <h2 class="text-lg leading-6 font-medium text-gray-900">Plus</h2>
            <p class="mt-4 text-sm text-gray-500">For active job seekers.</p>
            <p class="mt-8">
              <span class="text-4xl font-extrabold text-gray-900">$19</span>
              <span class="text-base font-medium text-gray-500">/mo</span>
            </p>
            <button (click)="selectPlan('plus')" [disabled]="currentPlan() === 'plus'"
              class="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
              {{ currentPlan() === 'plus' ? 'Current Plan' : 'Upgrade to Plus' }}
            </button>
          </div>
          <div class="pt-6 pb-8 px-6">
            <h3 class="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
            <ul class="mt-6 space-y-4">
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">20 Job Scraps / 3 days</span>
              </li>
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">20 AI Analyses / 3 days</span>
              </li>
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">Resets every 72 hours</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Pro Plan -->
        <div class="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
          <div class="p-6">
            <h2 class="text-lg leading-6 font-medium text-gray-900">Pro</h2>
            <p class="mt-4 text-sm text-gray-500">Power users & urgent needs.</p>
            <p class="mt-8">
              <span class="text-4xl font-extrabold text-gray-900">$49</span>
              <span class="text-base font-medium text-gray-500">/mo</span>
            </p>
            <button (click)="selectPlan('pro')" [disabled]="currentPlan() === 'pro'"
              class="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
              {{ currentPlan() === 'pro' ? 'Current Plan' : 'Upgrade to Pro' }}
            </button>
          </div>
          <div class="pt-6 pb-8 px-6">
            <h3 class="text-xs font-medium text-gray-900 tracking-wide uppercase">What's included</h3>
            <ul class="mt-6 space-y-4">
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">20 Job Scraps / 36 hours</span>
              </li>
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">20 AI Analyses / 36 hours</span>
              </li>
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">Resets every 36 hours</span>
              </li>
              <li class="flex space-x-3">
                <mat-icon class="flex-shrink-0 h-5 w-5 text-green-500">check</mat-icon>
                <span class="text-sm text-gray-500">Priority Support</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  `
})
export class SubscriptionComponent {
  userService = inject(UserService);
  
  currentPlan = computed(() => this.userService.user().currentPlan);

  selectPlan(plan: PlanType) {
    if (confirm(`Are you sure you want to switch to the ${plan} plan? This will reset your current usage limits.`)) {
      this.userService.upgradePlan(plan);
    }
  }
}
