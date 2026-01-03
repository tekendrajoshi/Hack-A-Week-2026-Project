.
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
