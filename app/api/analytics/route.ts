import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Epley formula: e1RM ≈ weight * (1 + reps/30)
function estimated1RM(weight: number, reps: number): number {
  if (reps <= 0) return weight;
  if (reps >= 30) return weight * 2; // cap
  return weight * (1 + reps / 30);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const exerciseIdParam = searchParams.get("exerciseId");
  const exerciseNameParam = searchParams.get("exerciseName");

  try {
    if (type === "bodyWeight") {
      const [workouts, logs] = await Promise.all([
        prisma.workout.findMany({
          where: { bodyWeight: { not: null } },
          orderBy: { date: "asc" },
          select: { date: true, bodyWeight: true },
        }),
        prisma.bodyWeightLog.findMany({
          orderBy: { date: "asc" },
          select: { date: true, weight: true },
        }),
      ]);
      const byDate: Record<string, number> = {};
      for (const l of logs) {
        const key = new Date(l.date).toISOString().slice(0, 10);
        byDate[key] = l.weight;
      }
      for (const w of workouts) {
        if (w.bodyWeight == null) continue;
        const key = new Date(w.date).toISOString().slice(0, 10);
        byDate[key] = w.bodyWeight; // workout overwrites rest-day log for same date
      }
      const data = Object.entries(byDate)
        .map(([date, weight]) => ({ date, weight }))
        .sort((a, b) => a.date.localeCompare(b.date));
      return NextResponse.json(data);
    }

    if (type === "volumeByWeek") {
      const workouts = await prisma.workout.findMany({
        include: {
          exercises: { include: { sets: true } },
        },
        orderBy: { date: "asc" },
      });
      const weekToVolume: Record<string, number> = {};
      for (const w of workouts) {
        let vol = 0;
        for (const we of w.exercises) {
          for (const s of we.sets) vol += s.reps * s.weight;
        }
        const d = new Date(w.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().slice(0, 10);
        weekToVolume[key] = (weekToVolume[key] ?? 0) + vol;
      }
      const data = Object.entries(weekToVolume)
        .map(([date, volume]) => ({ date, volume }))
        .sort((a, b) => a.date.localeCompare(b.date));
      return NextResponse.json(data);
    }

    if (type === "volumeByExercise") {
      const workouts = await prisma.workout.findMany({
        include: {
          exercises: {
            include: { exercise: true, sets: true },
          },
        },
        orderBy: { date: "asc" },
      });
      const byExercise: Record<
        string,
        { name: string; points: { date: string; volume: number }[] }
      > = {};
      for (const w of workouts) {
        const dateStr = new Date(w.date).toISOString().slice(0, 10);
        for (const we of w.exercises) {
          const name = we.exercise.name;
          if (!byExercise[name]) byExercise[name] = { name, points: [] };
          let vol = 0;
          for (const s of we.sets) vol += s.reps * s.weight;
          byExercise[name].points.push({ date: dateStr, volume: vol });
        }
      }
      const data = Object.values(byExercise).filter((e) => e.points.length > 0);
      return NextResponse.json(data);
    }

    if (type === "volumeByMuscleGroup") {
      const workouts = await prisma.workout.findMany({
        include: {
          exercises: {
            include: {
              sets: true,
              exercise: { include: { muscleGroups: { include: { muscleGroup: true } } } },
            },
          },
        },
        orderBy: { date: "asc" },
      });
      const weekToMuscle: Record<string, Record<string, number>> = {};
      for (const w of workouts) {
        const d = new Date(w.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekKey = weekStart.toISOString().slice(0, 10);
        if (!weekToMuscle[weekKey]) weekToMuscle[weekKey] = {};
        for (const we of w.exercises) {
          const muscleIds = we.exercise.muscleGroups.map((mg) => mg.muscleGroup.id);
          const muscleNames = we.exercise.muscleGroups.map((mg) => mg.muscleGroup.name);
          const count = muscleIds.length || 1;
          for (const s of we.sets) {
            const vol = (s.reps * s.weight) / count;
            for (const name of muscleNames) {
              weekToMuscle[weekKey][name] = (weekToMuscle[weekKey][name] ?? 0) + vol;
            }
          }
        }
      }
      const allMuscles = new Set<string>();
      for (const week of Object.values(weekToMuscle)) {
        for (const name of Object.keys(week)) allMuscles.add(name);
      }
      const data = Object.entries(weekToMuscle)
        .map(([date, muscles]) => ({
          date,
          ...Object.fromEntries([...allMuscles].map((m) => [m, muscles[m] ?? 0])),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      return NextResponse.json({ data, muscles: [...allMuscles].sort() });
    }

    if (type === "muscleGroupSummary") {
      const workouts = await prisma.workout.findMany({
        include: {
          exercises: {
            include: {
              sets: true,
              exercise: { include: { muscleGroups: { include: { muscleGroup: true } } } },
            },
          },
        },
      });
      const totalByMuscle: Record<string, number> = {};
      for (const w of workouts) {
        for (const we of w.exercises) {
          const muscleNames = we.exercise.muscleGroups.map((mg) => mg.muscleGroup.name);
          const count = muscleNames.length || 1;
          for (const s of we.sets) {
            const vol = (s.reps * s.weight) / count;
            for (const name of muscleNames) {
              totalByMuscle[name] = (totalByMuscle[name] ?? 0) + vol;
            }
          }
        }
      }
      const sorted = Object.entries(totalByMuscle)
        .map(([name, volume]) => ({ name, volume }))
        .sort((a, b) => b.volume - a.volume);
      return NextResponse.json(sorted);
    }

    if (type === "exerciseProgress" && (exerciseIdParam || exerciseNameParam)) {
      const workouts = await prisma.workout.findMany({
        include: {
          exercises: {
            include: {
              exercise: true,
              sets: true,
            },
          },
        },
        orderBy: { date: "asc" },
      });
      const exerciseId = exerciseIdParam ? Number(exerciseIdParam) : null;
      const points: { date: string; volume: number; e1rm: number | null }[] = [];
      for (const w of workouts) {
        const dateStr = new Date(w.date).toISOString().slice(0, 10);
        let volume = 0;
        let bestE1RM: number | null = null;
        for (const we of w.exercises) {
          const match = exerciseId
            ? we.exerciseId === exerciseId
            : we.exercise.name === exerciseNameParam;
          if (!match) continue;
          for (const s of we.sets) {
            volume += s.reps * s.weight;
            const e1 = estimated1RM(s.weight, s.reps);
            if (bestE1RM == null || e1 > bestE1RM) bestE1RM = e1;
          }
        }
        if (volume > 0 || bestE1RM != null) {
          points.push({ date: dateStr, volume, e1rm: bestE1RM });
        }
      }
      return NextResponse.json(points);
    }

    return NextResponse.json(
      {
        error:
          "Invalid type. Use bodyWeight, volumeByWeek, volumeByExercise, volumeByMuscleGroup, muscleGroupSummary, or exerciseProgress (with exerciseId or exerciseName)",
      },
      { status: 400 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
