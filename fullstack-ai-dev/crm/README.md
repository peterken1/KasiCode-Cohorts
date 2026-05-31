# MyCRM — Full-Stack AI Dev Reference Implementation

Production-grade AI-powered CRM built with Next.js 14, Supabase, Claude API, and Vercel.
Built as the capstone project for the **Full-Stack AI Dev** course by Prestige Platform.

---

## What's inside

- **Auth** — Supabase Auth with httpOnly cookies, middleware route protection, RLS
- **Contacts** — Full CRUD with Server Actions, dynamic routes, optimistic UI
- **Deals & Notes** — Relational data, foreign keys, nested Supabase queries, auto-activity logging
- **Dashboard** — Live stats with parallel Supabase queries via Promise.all
- **Pipeline** — Drag-and-drop kanban board with optimistic state and error rollback
- **AI Features** — Claude-powered contact summariser and email drafter (streaming)
- **Real-time** — Supabase real-time subscriptions
- **Demo login** — One-click demo access with pre-seeded realistic SA business data

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth & DB | Supabase (PostgreSQL + Auth + Real-time) |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Drag & Drop | @hello-pangea/dnd |
| Deployment | Vercel |
| Version control | GitHub |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/my-crm.git
cd my-crm
npm install
```

### 2. Create environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-api03-your-key
```

Get Supabase values from: **supabase.com → your project → Settings → API**  
Get Anthropic key from: **console.anthropic.com → API Keys**

### 3. Set up the database

1. Go to your Supabase project → **SQL Editor**
2. Open `supabase-setup.sql`
3. Run the entire file — this creates all tables, RLS policies, indexes, and triggers

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo data setup (reference/teacher deployment only)

To seed the database with realistic demo contacts, deals, notes, and activities:

1. Run the app and create a demo account at `/signup`
   - Use email: `demo@mycrm.app` and password: `demo1234`

2. Go to **Supabase → Authentication → Users**
   - Copy the UUID of the demo user

3. Open `supabase-setup.sql` and find:
   ```sql
   demo_user_id uuid := 'REPLACE_WITH_DEMO_USER_ID';
   ```
   Replace with the actual UUID.

4. Run the seed block (the `do $$ ... $$` section) in the Supabase SQL Editor

5. Add demo credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_DEMO_EMAIL=demo@mycrm.app
   NEXT_PUBLIC_DEMO_PASSWORD=demo1234
   ```

The login page will now show a **"Try the demo"** banner that auto-fills credentials.

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "initial CRM"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. **Do not deploy yet** — add environment variables first

### 3. Add environment variables in Vercel

Go to **Environment Variables** and add:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Safe to be public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Safe to be public |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | **Server only — no NEXT_PUBLIC_ prefix** |
| `NEXT_PUBLIC_DEMO_EMAIL` | demo@mycrm.app | For demo deployments only |
| `NEXT_PUBLIC_DEMO_PASSWORD` | demo1234 | For demo deployments only |

Set environment to: **Production**, **Preview**, and **Development** for all variables.

### 4. Deploy

Click **Deploy**. Build takes ~60 seconds.

### 5. Configure Supabase auth redirect URLs

After deployment, go to **Supabase → Authentication → URL Configuration**:

- **Site URL**: `https://your-crm.vercel.app`
- **Redirect URLs**: add `https://your-crm.vercel.app/**`

---

## Project structure

```
my-crm/
├── app/
│   ├── api/ai/
│   │   ├── summarise/route.ts       ← Claude contact summariser
│   │   └── draft-email/route.ts     ← Claude email drafter
│   ├── (dashboard)/
│   │   ├── layout.tsx               ← Sidebar layout wrapper
│   │   ├── dashboard/page.tsx       ← Home with live stats
│   │   ├── contacts/                ← Contacts CRUD
│   │   └── deals/                   ← Kanban pipeline
│   ├── auth/actions.ts              ← Sign out server action
│   ├── login/page.tsx               ← Login with demo banner
│   └── signup/page.tsx
├── components/
│   ├── ai/                          ← ContactSummariser, EmailDrafter
│   ├── activities/                  ← ActivityFeed
│   ├── contacts/                    ← ContactCard, ContactForm, DeleteButton
│   ├── dashboard/                   ← StatCard, RecentActivity
│   ├── deals/                       ← DealCard, DealForm
│   ├── layout/                      ← Sidebar, MobileNav
│   ├── notes/                       ← NoteForm, NoteList
│   └── pipeline/                    ← KanbanBoard, KanbanColumn, DealKanbanCard
├── utils/supabase/
│   ├── client.ts                    ← Browser Supabase client
│   └── server.ts                    ← Server Supabase client
├── middleware.ts                    ← Route protection
├── supabase-setup.sql               ← Full DB setup + demo seed
└── .env.example                     ← Environment variable template
```

---

## AI features

### Contact Summariser
- **Endpoint**: `POST /api/ai/summarise`
- **Input**: `{ contactId: string }`
- **What it does**: Fetches the contact's deals, notes, and activities, builds a context-rich prompt, and streams a 3-4 sentence briefing via Claude
- **Where it appears**: Contact detail page (teal panel)

### Email Drafter
- **Endpoint**: `POST /api/ai/draft-email`
- **Input**: `{ dealId: string }`
- **What it does**: Reads the deal stage, contact details, and recent notes — drafts a stage-appropriate follow-up email. Lead = warm outreach. Proposal = professional follow-up. Won = welcome email. Lost = gracious close.
- **Where it appears**: Each deal card on the contact detail page

Both features stream responses token by token using `ReadableStream`.

---

## Key concepts demonstrated

| Concept | Where |
|---|---|
| Server Actions | contacts/actions.ts, deals/actions.ts |
| API Routes for streaming | app/api/ai/*/route.ts |
| Optimistic UI + rollback | KanbanBoard.tsx |
| Nested Supabase select (joins) | contacts/[id]/page.tsx |
| Promise.all parallel queries | dashboard/page.tsx |
| Row Level Security | supabase-setup.sql |
| Streaming AI responses | ContactSummariser.tsx, EmailDrafter.tsx |
| Route groups | app/(dashboard)/ |
| Dynamic routes | contacts/[id]/ |
| useTransition | KanbanBoard.tsx |
| Real-time subscriptions | (via RealtimeRefresh pattern) |

---

## Course

This CRM is the capstone project for **Full-Stack AI Dev** by Prestige Platform.

- Course 1: VibeCode — build with AI, no code
- **Course 2: Full-Stack AI Dev — this project**
- Course 3: AgentCraft — autonomous AI agents

Learn more: [prestigeplatform.co.za](https://prestigeplatform.co.za)

---

## Licence

MIT — do whatever you want with it. You own the code.
