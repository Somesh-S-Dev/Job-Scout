import { Injectable, inject, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  description: string;
  link?: string;
}

export interface AiAnalysis {
  suggestions: string[];
  coverLetter: string;
  matchScore: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private userService = inject(UserService);
  private genAI: GoogleGenAI;

  // Persistent State
  currentJobs = signal<Job[]>([]);
  isSearching = signal(false);
  lastSearchParams = signal({
    keywords: '',
    location: '',
    experience: 'Mid Level'
  });

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY });
  }

  async searchJobs(keywords: string, location: string, experience: string): Promise<Job[]> {
    this.lastSearchParams.set({ keywords, location, experience });
    this.isSearching.set(true);

    try {
      if (!this.userService.incrementScrapUsage()) {
        throw new Error('Scrap limit reached for your current plan.');
      }

      const prompt = `
        Find 10 active job openings for "${keywords}" in "${location}" that require "${experience}" experience.
        
        Return the results as a JSON array of objects with the following keys:
        - title (string)
        - company (string)
        - location (string)
        - salary (string, estimate if not available)
        - experience (string)
        - description (string, a DETAILED and COMPREHENSIVE job description, at least 150 words if possible)
        - link (string, direct URL to the job application or posting. If not found, provide a Google Search URL for the job)
        
        Ensure the results are real and current. Prioritize jobs with direct application links.
      `;

      const result = await this.genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = result.text || '';
      const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
      
      const jobs = JSON.parse(jsonStr).map((j: any, index: number) => ({ 
        ...j, 
        id: `job-${Date.now()}-${index}` 
      }));

      this.currentJobs.set(jobs);
      
      // Save to history via UserService
      this.userService.addSearchSession({
        id: `session-${Date.now()}`,
        timestamp: Date.now(),
        keywords,
        location,
        experience,
        jobs
      });

      return jobs;
    } catch (e) {
      console.error('Search failed', e);
      throw e;
    } finally {
      this.isSearching.set(false);
    }
  }

  async analyzeRole(job: Job, resumeText: string): Promise<AiAnalysis> {
    if (!this.userService.incrementAiUsage()) {
      throw new Error('AI suggestion limit reached for your current plan.');
    }

    const prompt = `
      I am applying for the following job:
      Title: ${job.title}
      Company: ${job.company}
      Description: ${job.description}
      
      My Resume:
      ${resumeText}
      
      Please provide:
      1. A list of 3-5 specific suggestions to improve my resume for this specific role.
      2. A professional cover letter tailored to this role and my experience.
      3. A match score (0-100) based on skills and experience.
      
      Return as JSON:
      {
        "suggestions": ["s1", "s2"...],
        "coverLetter": "Dear Hiring Manager...",
        "matchScore": 85
      }
    `;

    const result = await this.genAI.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt
    });

    const text = result.text || '';
    
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse analysis JSON', e);
      throw new Error('Failed to analyze role.');
    }
  }
}
