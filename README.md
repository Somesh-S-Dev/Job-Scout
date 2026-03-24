# JobScout AI - Intelligent Job Search & Career Assistant

JobScout AI is a modern, AI-powered job search platform designed to streamline the career hunt. By leveraging the Gemini API, it provides real-time job scouting, resume analysis, and tailored cover letter generation, all within a sleek, persistent user interface.

## 🚀 Key Features

- **AI-Powered Job Scouting**: Uses Gemini's `googleSearch` tool to find active job openings based on keywords, location, and experience level.
- **Persistent Search State**: Background search processing allows users to navigate the app without losing search progress or results.
- **AI Resume Analysis**: Compares job descriptions with user resumes to provide a match score and specific optimization suggestions.
- **Automated Cover Letters**: Generates professional, tailored cover letters for any job found on the platform.
- **Search History**: A chat-like sidebar maintains a history of previous searches, allowing users to revisit and re-analyze past data.
- **Saved Jobs**: Bookmark interesting opportunities to track them in a dedicated dashboard.
- **Subscription Plans**: Tiered usage limits (Free, Plus, Pro) for AI analysis and job scouting.
- **Auth System**: Secure login and signup with route protection.

## 🛠 Tech Stack

- **Frontend**: [Angular v21](https://angular.dev/) (Zoneless, Signals-based state management)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (via `@google/genai`)
- **Icons**: [Angular Material Icons](https://material.angular.io/components/icon/overview)
- **Animations**: [Motion](https://motion.dev/)
- **Backend/SSR**: [Express](https://expressjs.com/) (Angular SSR)

## 🧠 Methods & Strategies

### 1. Persistent State Management
We use **Angular Signals** combined with a singleton service pattern (`GeminiService`). By storing the `currentJobs`, `isSearching` status, and `lastSearchParams` in a service rather than a component, the search process survives component destruction during navigation.

### 2. AI Integration Strategy
- **Job Scouting**: Uses `gemini-3-flash-preview` with the `googleSearch` tool to fetch real-time data.
- **Deep Analysis**: Uses `gemini-3.1-pro-preview` for complex reasoning tasks like resume matching and creative writing (cover letters).
- **Usage Tracking**: A `UserService` monitors "Scrap" and "AI" credits, enforcing limits based on the user's subscription tier.

### 3. UI/UX Design
- **Bento-Grid Layouts**: Used for dashboard and results display to maximize information density while maintaining scannability.
- **Glassmorphism & Modern Accents**: Subtle blurs and indigo/purple gradients create a premium, tech-forward feel.
- **Responsive Modals**: A custom `JobDetailComponent` with high z-index and backdrop filters ensures a focused viewing experience on any device.

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v20 or later)
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Create a `.env` file (or set environment variables) with your Gemini API Key:
```env
GEMINI_API_KEY=your_api_key_here
```

### Running the App
To start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Building for Production
To create a production build:
```bash
npm run build
```
The output will be in the `dist/` directory.

## 📁 Project Structure

- `src/app/components/`: UI components (Search, Dashboard, Settings, etc.)
- `src/app/services/`: Core logic (Gemini AI, User State, Auth)
- `src/app/guards/`: Route protection
- `src/environments/`: Configuration files

---
*Built with ❤️ using Angular and Gemini.*
