# Gym Analytics — Phased TODO

## Phase 1 — MVP

### 1.1 Scaffold & database
- [ ] Initialize Next.js 14+ (App Router, TypeScript, Tailwind, ESLint)
- [ ] Add Prisma; configure SQLite (`file:./dev.db`)
- [ ] Implement singleton Prisma client for Next.js
- [ ] Define schema: MuscleGroup, Exercise, ExerciseMuscleGroup, Template, TemplateExercise, Workout, WorkoutExercise, WorkoutSet
- [ ] Add `.env.example` and `.gitignore` (node_modules, .env, prisma/dev.db)
- [ ] Run initial migration; create seed script with muscle groups + 40–60 exercises and mappings
- [ ] Run seed and verify DB

### 1.2 Exercise library
- [ ] API: GET/POST/PATCH exercises (list with filters, create custom, update custom/hidden)
- [ ] Page: list exercises (search, filter by muscle group)
- [ ] Page: add custom exercise (name, equipment, clone muscles from existing)
- [ ] Page: edit custom exercise; hide/show built-in exercises

### 1.3 Templates
- [ ] API: GET/POST/PATCH/DELETE templates and template exercises
- [ ] Page: list templates; create template (name, add exercises in order)
- [ ] Page: edit template (reorder/add/remove exercises)

### 1.4 Log workout
- [ ] API: POST workout (date, bodyWeight, templateId?, exercises with sets)
- [ ] Page: “Log workout” — date, body weight, “Start from template” or add exercises manually
- [ ] UI: per exercise, add/remove sets (reps, weight); save workout

### 1.5 Workout history
- [ ] API: GET workouts (list by date); GET workout by id
- [ ] Page: workout list (newest first); click to view detail (exercises, sets, volume)

### 1.6 Basic analytics
- [ ] API or server helpers: body weight over time; total volume per week; optional per-exercise volume over time
- [ ] Page: analytics — body weight chart; volume per week chart; one “progress” chart (e.g. top exercise or total volume)

### 1.7 Polish & commit
- [ ] Dashboard home: recent workouts, quick links (log, templates, exercises, analytics)
- [ ] Navigation: layout with links to all sections
- [ ] Manual test: full flow (template → log workout → history → analytics)
- [ ] Commit with professional message; push to GitHub

---

## Phase 2 — Deeper analytics
- [x] Volume by muscle group (per week) — stacked bar chart
- [x] Most/least trained muscle groups — summary list
- [x] Per-exercise: volume over time, estimated 1RM trend (Epley formula)
- [x] BodyWeightLog for rest days; merge with workout body weight in chart

---

## Phase 3 — Polish & export
- [ ] UI polish, loading/error states, responsive
- [ ] Export data (CSV/JSON)
- [ ] Optional: theme, settings

---

## Future — Nutrition
- [ ] Daily calorie/macro logging
- [ ] Nutrition analytics
