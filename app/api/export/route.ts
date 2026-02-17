import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json"; // json | csv

  try {
    const [workouts, templates, exercises, bodyWeightLogs] = await Promise.all([
      prisma.workout.findMany({
        include: {
          template: true,
          exercises: {
            include: {
              exercise: true,
              sets: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { date: "asc" },
      }),
      prisma.template.findMany({
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
      }),
      prisma.exercise.findMany({
        include: {
          muscleGroups: { include: { muscleGroup: true } },
        },
      }),
      prisma.bodyWeightLog.findMany({ orderBy: { date: "asc" } }),
    ]);

    const workoutsSerialized = workouts.map((w) => ({
      id: w.id,
      date: new Date(w.date).toISOString().slice(0, 10),
      bodyWeight: w.bodyWeight,
      templateId: w.templateId,
      templateName: w.template?.name ?? null,
      notes: w.notes,
      exercises: w.exercises.map((we) => ({
        exerciseId: we.exerciseId,
        exerciseName: we.exercise.name,
        order: we.order,
        sets: we.sets.map((s) => ({
          setIndex: s.setIndex,
          reps: s.reps,
          weight: s.weight,
          rpe: s.rpe,
          restSeconds: s.restSeconds,
        })),
      })),
    }));

    const bodyWeightSerialized = bodyWeightLogs.map((l) => ({
      date: new Date(l.date).toISOString().slice(0, 10),
      weight: l.weight,
    }));

    if (format === "csv") {
      const rows: string[] = [];
      rows.push("workout_date,body_weight,template_name,exercise_name,set_index,reps,weight");
      for (const w of workoutsSerialized) {
        const date = w.date;
        const bodyWeight = w.bodyWeight ?? "";
        const templateName = w.templateName ?? "";
        if (w.exercises.length === 0) {
          rows.push(`${date},${bodyWeight},${escapeCsv(templateName)},,,,`);
        } else {
          for (const ex of w.exercises) {
            for (const s of ex.sets) {
              rows.push(
                `${date},${bodyWeight},${escapeCsv(templateName)},${escapeCsv(ex.exerciseName)},${s.setIndex},${s.reps},${s.weight}`
              );
            }
          }
        }
      }
      const csv = rows.join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="gym-analytics-workouts-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const json = {
      exportedAt: new Date().toISOString(),
      workouts: workoutsSerialized,
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        exercises: t.exercises.map((e) => ({ order: e.order, exerciseId: e.exerciseId, exerciseName: e.exercise.name })),
      })),
      exercises: exercises.map((e) => ({
        id: e.id,
        name: e.name,
        equipment: e.equipment,
        isCustom: e.isCustom,
        hidden: e.hidden,
        muscleGroups: e.muscleGroups.map((mg) => ({ name: mg.muscleGroup.name, isPrimary: mg.isPrimary })),
      })),
      bodyWeightLogs: bodyWeightSerialized,
    };
    return NextResponse.json(json, {
      headers: {
        "Content-Disposition": `attachment; filename="gym-analytics-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

function escapeCsv(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
