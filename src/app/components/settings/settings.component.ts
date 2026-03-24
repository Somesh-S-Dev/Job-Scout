import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div class="md:grid md:grid-cols-3 md:gap-6">
          <div class="md:col-span-1">
            <h3 class="text-lg font-medium leading-6 text-gray-900">Profile</h3>
            <p class="mt-1 text-sm text-gray-500">
              This information will be used to personalize your job search and cover letters.
            </p>
          </div>
          <div class="mt-5 md:mt-0 md:col-span-2">
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="grid grid-cols-6 gap-6">
                <div class="col-span-6 sm:col-span-4">
                  <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" formControlName="name" id="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                </div>

                <div class="col-span-6 sm:col-span-4">
                  <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
                  <input type="email" formControlName="email" id="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                </div>
                
                <div class="col-span-6 sm:col-span-4">
                  <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" formControlName="phone" id="phone" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                </div>
              </div>
              
              <div class="mt-6">
                <button type="submit" [disabled]="profileForm.invalid || isSaving()" class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
                  {{ isSaving() ? 'Saving...' : 'Save Profile' }}
                </button>
                <span *ngIf="saveMessage()" class="ml-3 text-sm text-green-600">{{ saveMessage() }}</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div class="md:grid md:grid-cols-3 md:gap-6">
          <div class="md:col-span-1">
            <h3 class="text-lg font-medium leading-6 text-gray-900">Resume</h3>
            <p class="mt-1 text-sm text-gray-500">
              Paste your resume text here. This will be used by the AI to analyze job fit and generate cover letters.
            </p>
          </div>
          <div class="mt-5 md:mt-0 md:col-span-2">
            <div class="space-y-4">
              <div>
                <label for="resume" class="block text-sm font-medium text-gray-700">Resume Content</label>
                <div class="mt-1">
                  <textarea id="resume" rows="15" [formControl]="resumeControl" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Paste your resume text here..."></textarea>
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  Tip: Copy and paste the text from your PDF or Word document.
                </p>
              </div>
              
              <div class="flex justify-end">
                <button (click)="saveResume()" [disabled]="isSavingResume()" class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
                   {{ isSavingResume() ? 'Saving...' : 'Update Resume' }}
                </button>
              </div>
               <span *ngIf="resumeMessage()" class="block text-right text-sm text-green-600 mt-2">{{ resumeMessage() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  userService = inject(UserService);
  fb = inject(FormBuilder);

  profileForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  resumeControl = this.fb.control('');

  isSaving = signal(false);
  saveMessage = signal('');
  
  isSavingResume = signal(false);
  resumeMessage = signal('');

  constructor() {
    const user = this.userService.user();
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone
    });
    this.resumeControl.setValue(user.resumeText);
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isSaving.set(true);
      // Simulate API delay
      setTimeout(() => {
        this.userService.updateProfile(this.profileForm.value as any);
        this.isSaving.set(false);
        this.saveMessage.set('Profile updated successfully!');
        setTimeout(() => this.saveMessage.set(''), 3000);
      }, 500);
    }
  }

  saveResume() {
    this.isSavingResume.set(true);
    setTimeout(() => {
      this.userService.updateProfile({ resumeText: this.resumeControl.value || '' });
      this.isSavingResume.set(false);
      this.resumeMessage.set('Resume updated successfully!');
      setTimeout(() => this.resumeMessage.set(''), 3000);
    }, 500);
  }
}
