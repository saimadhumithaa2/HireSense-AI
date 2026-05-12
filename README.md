# HireSense AI | Enterprise Intelligence Suite

**HireSense AI** is a high-performance, industrial-grade mock interview platform designed for elite technical candidates. Built with an "Obsidian & Bronze" aesthetic, it leverages the Gemini 1.5 Flash engine and Supabase to provide rigorous technical assessments, real-time performance diagnostics, and persistent career roadmaps.

## 🏭 Core Features

- **Simulation Chamber**: Rigorous mock interview environment with live hardware diagnostics and mock-stream fallback.
- **Architect Engine**: AI persona tuned to "Senior Technical Architect @ Google" standards, specifically for AI/ML and CSE roles.
- **STAR Matrix**: Granular evaluation of the STAR (Situation, Task, Action, Result) method with 4-bar visualization.
- **Performance Pro**: Deep analytics tracking efficiency trends over time using JetBrains Mono technical readouts.
- **Hybrid Sync**: Multi-layer data persistence using Supabase Cloud and local vault backups.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Intelligence**: Google Gemini 1.5 Flash API
- **Backend**: Supabase (PostgreSQL, Auth, Profiles)
- **Analytics**: Recharts, JetBrains Mono typography

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd HireSense-AI
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add the following keys:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Launch Development Server
```bash
npm run dev
```

## 🔒 Deployment

The project is optimized for deployment on **Vercel** or **Netlify**. Ensure all environment variables are added to the deployment dashboard.

---
*Created with focus on technical excellence and industrial design.*
