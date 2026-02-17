# Gym Analytics

Local-first workout tracker and analytics app. Log workouts, use templates (e.g. Chest & Tris, Back & Biceps), manage an exercise library with muscle-group mappings, and view progress over time.

## Tech stack

- **Next.js 14+** (App Router), TypeScript, Tailwind CSS
- **SQLite** via Prisma ORM (local file: `prisma/dev.db`)
- **Recharts** for analytics (body weight, volume per week)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Create a `.env` file (or use the default):

   ```
   DATABASE_URL="file:./prisma/dev.db"
   ```

3. **Database**

   Generate the Prisma client and apply migrations (first-time or after clone):

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   ```

   To reset and reseed:

   ```bash
   npx prisma migrate reset
   ```

   To only seed (after migrations):

   ```bash
   npx prisma db seed
   ```

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Features

- **Exercise library**: Predefined exercises with muscle-group mappings (primary/secondary). Add custom exercises, hide built-in ones you don’t do.
- **Templates**: Create named templates (e.g. Chest & Tris) with an ordered list of exercises; apply a template when logging a workout.
- **Log workout**: Date, body weight (once per day), exercises and sets (reps, weight). Start from a template or add exercises manually.
- **Workout history**: List and view past workouts with volume per exercise.
- **Analytics**: Body weight over time (workout + rest-day log), total volume per week, volume by muscle group, most/least trained muscle groups, per-exercise progress (volume + estimated 1RM).
- **Settings**: Theme (light / dark / system), export all data as **JSON** or **CSV** for backup.

## Project structure

- `app/` — Next.js App Router (pages, API routes)
- `lib/prisma.ts` — Prisma client singleton (SQLite adapter)
- `prisma/` — Schema, migrations, seed (muscle groups + exercises)
- `IMPLEMENTATION_GUIDE.md` — Architecture and phases
- `TODO.md` — Phased task list

## Future

- Daily calorie/macro logging and nutrition analytics.
