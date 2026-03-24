import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserService, SearchSession } from '../../services/user.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
      <!-- Navbar -->
      <nav class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <button (click)="toggleSidebar()" class="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden">
                <mat-icon>menu</mat-icon>
              </button>
              <div class="flex-shrink-0 flex items-center">
                <mat-icon class="text-indigo-600 mr-2">work_outline</mat-icon>
                <span class="text-xl font-bold text-slate-900 tracking-tight">JobScout AI</span>
              </div>
              <div class="hidden md:ml-6 md:flex md:space-x-8">
                <a routerLink="/dashboard" routerLinkActive="border-indigo-500 text-slate-900" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Dashboard
                </a>
                <a routerLink="/search" routerLinkActive="border-indigo-500 text-slate-900" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Search Jobs
                </a>
                <a routerLink="/saved-jobs" routerLinkActive="border-indigo-500 text-slate-900" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Saved Jobs
                </a>
                <a routerLink="/settings" routerLinkActive="border-indigo-500 text-slate-900" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Settings
                </a>
                <a routerLink="/subscription" routerLinkActive="border-indigo-500 text-slate-900" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Plans
                </a>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="hidden sm:flex items-center text-sm text-slate-500 mr-2">
                <mat-icon class="text-xs mr-1">person</mat-icon>
                {{ userService.user().name }}
              </div>
              <div class="flex-shrink-0">
                <button (click)="logout()" class="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="flex flex-1 overflow-hidden">
        <!-- Desktop Sidebar (Chat History Style) -->
        <aside class="hidden lg:flex lg:flex-shrink-0">
          <div class="flex flex-col w-64 border-r border-slate-200 bg-white">
            <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div class="flex items-center flex-shrink-0 px-4 mb-5">
                <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search History</h3>
              </div>
              <nav class="mt-2 flex-1 px-2 space-y-1">
                <div *ngIf="userService.searchHistory().length === 0" class="px-4 py-10 text-center text-slate-400">
                  <mat-icon class="text-3xl mb-2 opacity-20">history</mat-icon>
                  <p class="text-xs">No history yet</p>
                </div>
                
                <a *ngFor="let session of userService.searchHistory()" 
                   (click)="loadSession(session)"
                   class="group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors"
                   [ngClass]="activeSessionId() === session.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
                  <mat-icon class="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-500" [ngClass]="{'text-indigo-500': activeSessionId() === session.id}">chat_bubble_outline</mat-icon>
                  <div class="flex-1 truncate">
                    <div class="font-semibold truncate">{{ session.keywords }}</div>
                    <div class="text-[10px] opacity-60">{{ session.timestamp | date:'MMM d, h:mm a' }}</div>
                  </div>
                </a>
              </nav>
              
              <div class="mt-auto p-4 border-t border-slate-100">
                 <button (click)="newSearch()" class="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                  <mat-icon class="mr-2 text-sm">add</mat-icon> New Search
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Mobile Sidebar Drawer -->
        <div *ngIf="showSidebar()" class="fixed inset-0 flex z-40 lg:hidden" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-slate-600 bg-opacity-75" (click)="toggleSidebar()"></div>
          <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div class="absolute top-0 right-0 -mr-12 pt-2">
              <button (click)="toggleSidebar()" class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <mat-icon class="text-white">close</mat-icon>
              </button>
            </div>
            <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div class="flex-shrink-0 flex items-center px-4">
                <mat-icon class="text-indigo-600 mr-2">work_outline</mat-icon>
                <span class="text-xl font-bold text-slate-900">JobScout AI</span>
              </div>
              <nav class="mt-5 px-2 space-y-1">
                <a routerLink="/dashboard" routerLinkActive="bg-slate-100 text-slate-900" class="text-slate-600 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                  <mat-icon class="mr-4 text-slate-400 group-hover:text-slate-500">dashboard</mat-icon> Dashboard
                </a>
                <a routerLink="/search" routerLinkActive="bg-slate-100 text-slate-900" class="text-slate-600 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                  <mat-icon class="mr-4 text-slate-400 group-hover:text-slate-500">search</mat-icon> Search Jobs
                </a>
                <a routerLink="/saved-jobs" routerLinkActive="bg-slate-100 text-slate-900" class="text-slate-600 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                  <mat-icon class="mr-4 text-slate-400 group-hover:text-slate-500">bookmark</mat-icon> Saved Jobs
                </a>
                <a routerLink="/settings" routerLinkActive="bg-slate-100 text-slate-900" class="text-slate-600 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                  <mat-icon class="mr-4 text-slate-400 group-hover:text-slate-500">settings</mat-icon> Settings
                </a>
                <a routerLink="/subscription" routerLinkActive="bg-slate-100 text-slate-900" class="text-slate-600 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                  <mat-icon class="mr-4 text-slate-400 group-hover:text-slate-500">card_membership</mat-icon> Plans
                </a>
                <div class="pt-4 pb-2 px-2">
                  <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search History</h3>
                </div>
                <a *ngFor="let session of userService.searchHistory()" 
                   (click)="loadSession(session)"
                   class="text-slate-600 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer">
                  <mat-icon class="mr-4 text-slate-400 group-hover:text-slate-500">chat_bubble_outline</mat-icon> {{ session.keywords }}
                </a>
              </nav>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <main class="flex-1 relative overflow-y-auto focus:outline-none">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
      </div>

      <!-- Footer -->
      <footer class="bg-white border-t border-slate-200 mt-auto">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p class="text-center text-xs text-slate-500">
            &copy; 2024 JobScout AI. Powered by Gemini.
          </p>
        </div>
      </footer>
    </div>
  `
})
export class LayoutComponent {
  userService = inject(UserService);
  geminiService = inject(GeminiService);
  router = inject(Router);
  
  showSidebar = signal(false);
  activeSessionId = signal<string | null>(null);

  toggleSidebar() {
    this.showSidebar.update(v => !v);
  }

  newSearch() {
    this.geminiService.currentJobs.set([]);
    this.geminiService.isSearching.set(false);
    this.geminiService.lastSearchParams.set({
      keywords: '',
      location: '',
      experience: 'Mid Level'
    });
    this.activeSessionId.set(null);
    this.router.navigate(['/search']);
    if (this.showSidebar()) this.toggleSidebar();
  }

  loadSession(session: SearchSession) {
    this.activeSessionId.set(session.id);
    if (this.showSidebar()) this.toggleSidebar();
    this.router.navigate(['/search'], { queryParams: { sessionId: session.id } });
  }

  logout() {
    this.userService.logout();
  }
}
