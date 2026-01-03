### Project Title  **Gyansathi**

### One-Line Description  
Gyansathi is a student-driven learning platform that connects students, learners, innovators, and researchers to discuss, collaborate, and support each other through structured peer learning.

### Hackathon Context  
This project was developed as part of **LOCUS Hack A Week 2026**.  
**Team Name:** Tensor
---

## 🧠 Problem Summary

- **Information vs. Interaction Gap:** There is no lack of learning resources, but what students truly lack is discussion and interaction. When confusion arises, students often do not know whom to ask, and their friend circle may not always be available to help.
- **Limited Senior–Junior Mentorship:** The traditional senior–junior mentoring culture exists only locally within campuses and institutions, not at a national or broader level.
- **High Cost of Home Tuition:** Not every student can afford costly home tutoring services. At the same time, many students do not need full-time tuition—often they only need guidance or doubt clearing.
- **Lack of a Dedicated Student Community:** Students currently rely on platforms like Facebook or Telegram for academic discussions. These platforms are designed for entertainment, not learning, leading to distractions such as reels, memes, and notifications. Additionally, discussions are unstructured and mixed across different academic levels.
---

## 💡 Solution: What Our Platform Provides

- **Level-Based Peer Q&A Community:** Our platform connects students with peers of similar academic levels as well as with seniors. By simply creating an account and setting academic information, users become part of a focused learning community. This reduces distractions and promotes a healthy learning culture.
- **Digital Senior–Junior Mentorship:** Our platform digitalizes the traditional senior–junior mentoring culture found locally in campuses like Pulchowk and expands it into a broader, nationwide community.
- **Peer-to-Peer Tutoring and Discussion Model:** Students can help each other through discussions, explanations, and mentoring without the pressure of formal tuition.
- **Points and Leaderboard System:** Users earn points based on the number of likes received on their answers. Higher points indicate better contributors and potential tutors. This system motivates students to help others and also enables parents to identify good tutors, creating earning opportunities for students.
- **Direct Communication for Deeper Learning:** For detailed discussions, our platform enables: 
  - One-to-one messaging  
  - Audio and video calls  
  - Shared whiteboard and screen sharing(in Future)
- **AI Tutor as Support, Not Replacement:** An AI Tutor assists students when human help is unavailable, supporting learning without replacing peer interaction.

---
## ✨ Key Features

### 📘 Level-Based Q&A
- Students view and post questions relevant to their education level
- Anyone can answer questions, similar to comment-based discussions
- Answers can be liked to reward helpful contributors

### 🎓 Help Juniors Section
- Senior students can view and answer questions posted by juniors
- Encourages mentorship and academic guidance across levels

### 🏆 Contribution Leaderboard
- Users earn points based on likes received on answers
- Public leaderboard ranks contributors
- Acts as motivation and credibility for potential tutoring opportunities

### 💬 Messaging & Communication
- Direct one-to-one messaging between users
- Enables discussion beyond public comments
- Designed to support academic collaboration

### 📞 Audio / Video Calls (WebRTC)
- Users can initiate real-time audio/video calls
- Call UI integrated directly into the platform
- Lays foundation for future whiteboard and screen-sharing features

### 🤖 AI Tutor
- AI-powered tutor assists students with academic questions
- Implemented using a backend edge function
- Considers user context such as education level and field of study

### 👤 User Profiles
- Each user has a profile with academic details
- Profile completion required for full access
- Tracks contribution points and activity

---
## 🔄 Application Flow
1. User signs up and completes their academic profile
2. User accesses level-based questions
3. User asks or answers questions
4. Helpful answers receive likes
5. Likes increase user points
6. Users appear on the public leaderboard
7. Users can message or call each other for deeper discussion
8. AI Tutor provides additional academic assistance when needed
---
## 🧩 System Architecture

- **Frontend**: React + TypeScript for a modular and scalable UI
- **Backend**: Supabase for authentication, database, and real-time features
- **Database**: Relational schema with row-level security
- **Realtime**: Messaging, notifications, and call signaling
- **AI**: Edge Function used for AI tutoring
- **Calls**: WebRTC for peer-to-peer audio/video communication

---
## 🟢 Database Overview

Gyansathi uses a structured relational database designed for scalability, security, and real-time interaction.

### Core Tables
- **profiles** – Stores user information such as name, education level, and contribution points  
- **posts** – Contains academic questions posted by users  
- **comments** – Stores answers and discussions related to questions  
- **likes** – Tracks likes on answers to calculate contribution points  
- **messages** – Handles private one-to-one conversations between users  
- **notifications** – Stores system alerts and activity updates  

---

## 🛠️ Running the Project Locally

#### Prerequisites
- **Node.js** and **npm** installed  
  (Recommended: install via `nvm`) Install nvm from: https://github.com/nvm-sh/nvm#installing-and-updating
#### Steps

```bash
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>
# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>
# Step 3: Install dependencies
npm install
# Step 4: Start the development server (with auto-reloading)
npm run dev
```
---
## 🟢 Future Improvements

Planned enhancements beyond the current MVP include:
- Shared whiteboard during audio/video calls(making learning effective and easier)
- Screen sharing for interactive learning
- Tutor discovery and booking system
- Advanced moderation and content reporting
- Improved AI tutor contextual understanding
- Mobile-first performance and UX improvements

---

## 🟢 Team / Author Information

**Team Name:** Tensor  
**Team Members:**
- **Tekendra Joshi**
- **Pragyan Neupane**
Computer Engineering, IOE Pulchowk Campus

---
### 🔍 Quick Navigation Guide
This section highlights where to find each major feature in the codebase.

#### 📌 Core Application Pages
- **Main Q&A Board (same-level students)**  `src/pages/Questions.tsx`
- **Help Juniors Section**  `src/pages/HelpJuniors.tsx`
- **Contribution Leaderboard**  `src/pages/Leaderboard.tsx`
- **Private Messaging & Calls**  `src/pages/Messages.tsx`
- **User Profile (view/edit)**   `src/pages/Profile.tsx`
- **Authentication (Login / Signup)**  `src/pages/Auth.tsx`
- **Profile Completion Flow**  `src/pages/CompleteProfile.tsx`
- **AI Tutor Interface**   `src/pages/AITutor.tsx`
- **Reusable UI Components**  `src/components/ui/`
- **App Routing & Global Providers**  `src/App.tsx`
- **Main Layout (Navbar, Navigation, Notifications, Call Overlay)**`src/components/Layout.tsx`
- **Question Creation Modal**  `src/components/CreatePostDialog.tsx`
- **Question & Answer Display (likes, comments)**  `src/components/PostCard.tsx`
- **Points & Ranking Logic**  `src/pages/Leaderboard.tsx`
- **WebRTC Call Logic (Audio/Video)**  `src/hooks/useWebRTC.ts`
- **Realtime Notifications Dropdown**  `src/components/NotificationBell.tsx`
- **Auth State & Profile Management**  `src/contexts/AuthContext.tsx`
- **Supabase Client Setup**  `src/integrations/supabase/client.ts`
- **Database Type Definitions**  `src/integrations/supabase/types.ts`
- **Database Migrations & Policies**  `supabase/migrations/` (Defines tables: profiles, posts, comments, likes, messages, notifications and Row Level Security (RLS) policies)

---
## Complete Project Structure
```
├── README.md          
├── components.json                  # shadcn/ui configuration and component aliases
├── eslint.config.js                 # ESLint rules for code quality
├── index.html                       # HTML entry point (root div, meta tags)
├── package.json                     # Project dependencies and npm scripts
├── postcss.config.js                # PostCSS configuration (used by Tailwind)
├── tailwind.config.ts               # Tailwind CSS theme and design system config
├── tsconfig.app.json                # TypeScript config for the frontend app
├── tsconfig.json                    # Base TypeScript configuration
├── tsconfig.node.json               # TypeScript config for Vite/Node files
├── vite.config.ts                   # Vite configuration (build, dev server, aliases)
│
├── src/                             # Frontend source code
│   ├── App.tsx                      # Root React component (providers + routing)
│   ├── main.tsx                     # React entry point (renders App)
│   ├── App.css                      # Basic app-level styles
│   ├── index.css                    # Global styles + Tailwind CSS variables
│   ├── vite-env.d.ts                # Vite environment type definitions
│   │
│   ├── assets/                      # Static assets (images, icons)
│   │
│   ├── components/                  # Reusable UI and app-level components
│   │   ├── Layout.tsx               # Main layout (navbar, navigation, profile menu)
│   │   ├── CreatePostDialog.tsx     # Modal for posting new questions
│   │   ├── PostCard.tsx             # Displays a question, answers, and likes
│   │   ├── NotificationBell.tsx     # Realtime notifications dropdown
│   │   ├── NavLink.tsx              # Styled navigation link helper
│   │   ├── VideoCall.tsx            # Audio/video call UI (WebRTC)
│   │   └── ui/                      # shadcn/ui primitives
│   │       └── (Button, Card, Dialog, Input, Select, Toast, Table, Tooltip, etc.) # This folder contains low-level reusable UI building blocks.
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication context (Supabase auth + user profile)
│   │
│   ├── hooks/
│   │   ├── useWebRTC.ts              # WebRTC logic for audio/video calls
│   │   ├── use-toast.ts              # Toast notification helper hook
│   │   └── use-mobile.tsx            # Responsive screen-size detection hook
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts             # Supabase client initialization
│   │       └── types.ts              # TypeScript types for database tables
│   │
│   ├── lib/
│   │   └── utils.ts                  # Shared utility/helper functions
│   │
│   └── pages/                        # Application routes (each file = one page)
│       ├── Index.tsx                # Home / dashboard page
│       ├── Questions.tsx            # Main Q&A board (same-level students)
│       ├── HelpJuniors.tsx           # Help Juniors section
│       ├── Leaderboard.tsx           # Contribution leaderboard (points-based)
│       ├── Messages.tsx              # Private messaging + call initiation
│       ├── Profile.tsx               # User profile view/edit page
│       ├── Auth.tsx                  # Login / registration page
│       ├── CompleteProfile.tsx       # Profile completion after signup
│       ├── AITutor.tsx               # AI-powered tutoring interface
│       └── NotFound.tsx              # 404 page
│
└── supabase/                         # Backend configuration (Supabase)
    ├── config.toml                   # Supabase project configuration
    ├── functions/
    │   └── ai-tutor/index.ts # Edge function for AI tutoring responses
    └── migrations/                   # Database schema & security
```