
---
## 🔍 Quick Navigation Guide (For Judges & Visitors)

This section highlights where to find each major feature in the codebase.

### 📌 Core Application Pages
- **Main Q&A Board (same-level students)**  `src/pages/Questions.tsx`
- **Help Juniors Section**  `src/pages/HelpJuniors.tsx`
- **Contribution Leaderboard**  `src/pages/Leaderboard.tsx`
- **Private Messaging & Calls**  `src/pages/Messages.tsx`
- **User Profile (view/edit)**   `src/pages/Profile.tsx`
- **Authentication (Login / Signup)**  `src/pages/Auth.tsx`
- **Profile Completion Flow**  `src/pages/CompleteProfile.tsx`
- **AI Tutor Interface**   `src/pages/AITutor.tsx`

---

### 🧠 Application Flow & Layout
- **App Routing & Global Providers**  `src/App.tsx`
- **Main Layout (Navbar, Navigation, Notifications, Call Overlay)** `src/components/Layout.tsx`
- **404 / Not Found Page**  `src/pages/NotFound.tsx`

---

### 💬 Q&A and Interaction
- **Question Creation Modal**  
  `src/components/CreatePostDialog.tsx`
- **Question & Answer Display (likes, comments)**  
  `src/components/PostCard.tsx`
- **Points & Ranking Logic**  
  `src/pages/Leaderboard.tsx`

---

### 📞 Messaging & Real-Time Communication
- **Messaging UI**  
  `src/pages/Messages.tsx`
- **WebRTC Call Logic (Audio/Video)**  
  `src/hooks/useWebRTC.ts`
- **Call UI Overlay**  
  `src/components/VideoCall.tsx`

---

### 🔔 Notifications & User Feedback
- **Realtime Notifications Dropdown**  
  `src/components/NotificationBell.tsx`
- **Toast Notifications**  
  `src/hooks/use-toast.ts`

---

### 🔐 Authentication & User Management
- **Auth State & Profile Management**  
  `src/contexts/AuthContext.tsx`
- **Supabase Client Setup**  
  `src/integrations/supabase/client.ts`
- **Database Type Definitions**  
  `src/integrations/supabase/types.ts`

---

### 🤖 AI Tutor (Backend)
- **AI Edge Function**  
  `supabase/functions/ai-tutor/index.ts`

---

### 🗄️ Database Schema & Security
- **Database Migrations & Policies**  
  `supabase/migrations/`  
  (Defines tables: profiles, posts, comments, likes, messages, notifications  
  and Row Level Security (RLS) policies)

---

### 🎨 UI & Design System
- **Reusable UI Components**  
  `src/components/ui/`
- **Global Styles & Theme**  
  `src/index.css`, `tailwind.config.ts`

---

### 🛠️ Configuration & Tooling
- **Build & Dev Configuration**  
  `vite.config.ts`
- **Linting Rules**  
  `eslint.config.js`
- **TypeScript Configuration**  
  `tsconfig*.json`

---

### ✅ Recommended Review Order
1. `README.md`
2. `src/pages/Questions.tsx`
3. `src/pages/HelpJuniors.tsx`
4. `src/pages/Leaderboard.tsx`
5. `src/pages/Messages.tsx` + `src/hooks/useWebRTC.ts`
6. `supabase/migrations/`
7. `supabase/functions/ai-tutor/index.ts`

---
## Complete File Structure
```
├── README.md                        # Project overview, features, setup instructions
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
├── public/
│   ├── robots.txt                   # Search engine crawling rules
│   └── favicon.ico                  # App icon shown in browser tab
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
│   │       └── (Button, Card, Dialog, Input, Select, Toast, Table, Tooltip, etc.)
│   │          # This folder contains low-level reusable UI building blocks.
│   │          # It is intentionally grouped to avoid cluttering the main structure.
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
    │   └── ai-tutor/
    │       └── index.ts              # Edge function for AI tutoring responses
    └── migrations/                   # Database schema & security definitions
        └── (SQL migration files)
            # This folder contains timestamped SQL files that define:
            # - Tables: profiles, posts, comments, likes, messages, notifications
            # - Relationships and indexes
            # - Row Level Security (RLS) policies
            # These migrations allow the database to be reproduced consistently.
```