# Gym Analytics — Implementation Guide

## Overview

A local-first workout tracker and analytics app built with **Next.js** and **SQLite**. Single user, single device; no cloud sync. Focus: detailed workout logging, templates, exercise library (editable/custom), and in-depth analytics including volume, progress over time, and muscle-group distribution.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14+ (App Router) | React, SSR/API routes, file-based routing |
| Language | TypeScript | Type safety, better refactors |
| Database | SQLite via Prisma | Local file, no server; Prisma gives type-safe queries and migrations |
| Styling | Tailwind CSS | Fast UI, consistent design |
| Charts | Recharts | React-native, good for line/bar charts |
| ORM | Prisma | Migrations, seed scripts, singleton client for Next.js |

---

## Data Model

### Core entities

- **MuscleGroup** — Canonical list (Chest, Back, Lats, Biceps, Triceps, Shoulders, Forearms, Quads, Hamstrings, Glutes, Calves, Core). Used for analytics and filtering.
- **Exercise** — Name, equipment (optional), `isCustom`, `hidden`, optional `basedOnId` to clone muscle mapping. Many-to-many with MuscleGroup (primary + secondary).
- **ExerciseMuscleGroup** — Join: `exerciseId`, `muscleGroupId`, `isPrimary` (boolean). Enables “lat pulldown → lats + biceps”.
- **Template** — Named workout (e.g. “Chest & Tris”). Ordered list of exercises.
- **TemplateExercise** — `templateId`, `exerciseId`, `order`.
- **Workout** — Single session: `date`, `bodyWeight` (once per day), optional `templateId`, `notes`.
- **WorkoutExercise** — `workoutId`, `exerciseId`, `order` (allows same exercise twice in one workout).
- **WorkoutSet** — `workoutExerciseId`, `setIndex`, `reps`, `weight`, optional `rpe`, `restSeconds`.

### Optional / future

- **BodyWeightLog** — Separate `(date, weight)` for logging weight on rest days (Phase 2+).
- **Calorie / nutrition** — Future phase; same app, new models and UI section.

### Design decisions

- **Volume** = sum over sets of `reps × weight` (tonnage). Stored per set; aggregated in queries/analytics.
- **Custom exercises** — New `Exercise` row with `isCustom = true`, optional `basedOnId` to copy muscle groups. Built-in exercises can be `hidden`, not deleted.
- **Templates** — Only store exercise order; actual sets/reps/weight entered when logging the workout.

---

## Phases

### Phase 1 — MVP (Current)

**Goal:** Log workouts, use templates, manage exercise library, view history and basic analytics.

1. **Scaffold**
   - Next.js 14+ (App Router), TypeScript, Tailwind, ESLint.
   - Prisma + SQLite; singleton Prisma client; `prisma/dev.db` (and in `.gitignore`).

2. **Schema & seed**
   - All tables above (excluding BodyWeightLog and nutrition).
   - Seed: muscle groups + 40–60 common exercises with muscle mappings (multi-muscle where relevant).
   - Seed script: `npx prisma db seed`.

3. **Exercise library**
   - List exercises (filter by muscle, search); show muscle groups per exercise.
   - Add custom exercise (name, equipment, clone muscle mapping from existing).
   - “Hide” built-in exercises; “Restore” hidden.
   - Edit custom exercises (name, equipment, muscle groups).

4. **Templates**
   - List templates; create/edit/delete.
   - Create: name + ordered list of exercises (drag or add/remove).
   - Edit: change name or exercise order.

5. **Log workout**
   - Pick date; enter body weight (once per day).
   - Option: “Start from template” (pre-fill exercises) or add exercises manually.
   - Per exercise: add sets (reps, weight); optional RPE/rest later.
   - Save workout → creates Workout, WorkoutExercises, WorkoutSets.

6. **Workout history**
   - List workouts by date (newest first); click → workout detail (exercises, sets, volume per exercise).

7. **Basic analytics**
   - Body weight over time (line chart).
   - Total volume per week (bar or line).
   - One “progress” view: e.g. volume or top exercise over time (simple line).

8. **Run locally**
   - `npm run dev`; data in `prisma/dev.db`.

---

### Phase 2 — Deeper analytics

- Volume by **muscle group** (per week/month); which muscles trained most/least.
- **Per-exercise** analytics: volume over time, average weight/reps, estimated 1RM trend (e.g. Epley/Brzycki).
- **Per-workout** averages and totals.
- Optional: BodyWeightLog for rest days; show on same chart as workout-day body weight.

---

### Phase 3 — Polish & export

- UI polish, loading/error states, responsive layout.
- Export data (CSV/JSON) for backup or external analysis.
- Optional: dark/light theme, settings page.

---

### Future — Nutrition

- Daily calorie/macro logging; same app, new section.
- Analytics: intake over time, averages, correlation with body weight (if desired).

---

## Project structure (target)

```
/app
  /api          # REST or tRPC if needed later
  /(dashboard)  # layout with nav
    /page.tsx   # dashboard home
    /workouts   # list + [id]
    /log        # log workout
    /templates  # list + create/edit
    /exercises  # library + add/edit
    /analytics  # charts
/components
/lib
  /prisma.ts    # singleton client
  /db.ts        # server-only DB helpers if needed
/prisma
  schema.prisma
  seed.ts
  /migrations
```

---

## API surface (Phase 1)

- **Exercises:** GET list (filter by muscle, search), GET one, POST (custom), PATCH (edit custom / hide), DELETE not used (hide only).
- **Templates:** GET list, GET one, POST, PATCH, DELETE.
- **Workouts:** GET list (paginated/by date), GET one, POST (create with sets), PATCH (edit), DELETE.
- All via Next.js Route Handlers (App Router) or Server Actions; no separate backend process.

---

## Testing strategy

- **Phase 1:** Manual E2E: create workout from template, log sets, view history and charts.
- **Later:** Optional unit tests for volume/aggregation logic; optional Playwright for critical flows.

---

## Git workflow

- `main` — stable; each phase merged when “done” (tested, committed with clear message).
- Feature branches as needed (e.g. `phase-1-mvp`, `phase-2-analytics`). Commit after each logical chunk; push after each phase.

---

## References

- Prisma + SQLite: [Prisma SQLite Quickstart](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/sqlite); [Next.js Prisma client practices](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices).
- Volume: Sets × Reps × Weight (tonnage); 10–20 sets per muscle group per week as reference (MEV/MAV/MRV).
- Exercise–muscle: Primary + secondary muscles per exercise; many-to-many for analytics.
