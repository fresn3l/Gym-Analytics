import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "bodyWeight" | "volumeByWeek" | "volumeByExercise"

  try {
    if (type === "bodyWeight") {
      const workouts = await prisma.workout.findMany({
        where: { bodyWeight: { not: null } },
        orderBy: { date: "asc" },
        select: { date: true, bodyWeight: true },
      });
      const data = workouts
        .filter((w) => w.bodyWeight != null)
        .map((w) => ({
          date: w.date.toISOString().slice(0, 10),
          weight: w.bodyWeight,
        }));
      return NextResponse.json(data);
    }

    if (type === "volumeByWeek") {
      const workouts = await prisma.workout.findMany({
        include: {
          exercises: {
            include: { sets: true },
          },
        },
        orderBy: { date: "asc" },
      });

      const weekToVolume: Record<string, number> = {};
      for (const w of workouts) {
        let vol = 0;
        for (const we of w.exercises) {
          for (const s of we.sets) {
            vol += s.reps * s.weight;
          }
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

    return NextResponse.json(
      { error: "Invalid type. Use bodyWeight, volumeByWeek, or volumeByExercise" },
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
