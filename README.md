# Wedding Project Tracker

Invite-only Kanban board for planning your wedding together. Built with Next.js, Supabase auth + database + realtime, and Tailwind.

## Features
- Kanban columns: Backlog, This Month, In Progress, Waiting, Done
- Task details: title, notes, owner, due date, priority, labels, checklist, created/updated timestamps
- Drag-and-drop ordering with `dnd-kit`
- Filters: owner, label, due in next 7 days, search by title/notes
- Real-time sync via Supabase Realtime
- Invite-only access via `allowed_users` table + RLS policies

## Tech
- Next.js (App Router) + TypeScript
- Supabase (auth, database, realtime)
- Tailwind CSS

## Local Setup

### 1) Create Supabase project
1. Create a new Supabase project.
2. In **Authentication → Settings**, ensure **Email** sign-in is enabled and **Magic Link** is allowed.

### 2) Run migrations
Open the Supabase SQL editor and run the migration:
- `supabase/migrations/001_init.sql`

Then seed demo data:
- `supabase/seed.sql`

### 3) Enable realtime for tasks
In Supabase:
1. Go to **Database → Replication**.
2. Enable realtime for the `tasks` table.

### 4) Add allowed users
In Supabase SQL editor, add your emails:

```sql
insert into allowed_users (email)
values ('mickey@example.com'), ('shivani@example.com');
```

Replace with your real emails.

### 5) Set environment variables
Create `.env.local` from `.env.local.example` and fill:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

### 6) Install deps & run
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment (Vercel)
1. Push this repo to GitHub.
2. Create a new Vercel project from the repo.
3. Set the following environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

4. Deploy.

## Notes on Invite-Only Access
- RLS policies restrict tasks to `allowed_users`.
- Anyone can create a Supabase auth account, but only emails in `allowed_users` can read/write tasks.
- The app signs out users whose email is not allowed.

## Linting
```bash
npm run lint
```

## Project Structure
- `src/app` — Next.js routes
- `src/components` — UI components
- `src/lib` — Supabase helpers and types
- `supabase/migrations` — SQL schema + RLS
- `supabase/seed.sql` — demo seed data
