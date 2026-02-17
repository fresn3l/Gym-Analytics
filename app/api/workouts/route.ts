import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const cursor = searchParams.get("cursor");

  try {
    const workouts = await prisma.workout.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
      orderBy: { date: "desc" },
      include: {
        template: true,
        exercises: {
          include: { exercise: true, sets: true },
          orderBy: { order: "asc" },
        },
      },
    });

    const hasMore = workouts.length > limit;
    const items = hasMore ? workouts.slice(0, limit) : workouts;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      workouts: items,
      nextCursor,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      date,
      bodyWeight,
      templateId,
      notes,
      exercises: exercisesPayload,
    } = body as {
      date: string; // ISO date
      bodyWeight?: number;
      templateId?: number;
      notes?: string;
      exercises: {
        exerciseId: number;
        order: number;
        sets: { setIndex: number; reps: number; weight: number; rpe?: number; restSeconds?: number }[];
      }[];
    };

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const workoutDate = new Date(date);
    workoutDate.setHours(0, 0, 0, 0);

    const workout = await prisma.workout.create({
      data: {
        date: workoutDate,
        bodyWeight: bodyWeight ?? null,
        templateId: templateId ?? null,
        notes: notes ?? null,
      },
    });

    for (const ex of exercisesPayload ?? []) {
      const we = await prisma.workoutExercise.create({
        data: {
          workoutId: workout.id,
          exerciseId: ex.exerciseId,
          order: ex.order,
        },
      });
      for (const set of ex.sets ?? []) {
        await prisma.workoutSet.create({
          data: {
            workoutExerciseId: we.id,
            setIndex: set.setIndex,
            reps: set.reps,
            weight: set.weight,
            rpe: set.rpe ?? null,
            restSeconds: set.restSeconds ?? null,
          },
        });
      }
    }

    const withRelations = await prisma.workout.findUnique({
      where: { id: workout.id },
      include: {
        template: true,
        exercises: {
          include: { exercise: true, sets: true },
          orderBy: { order: "asc" },
        },
      },
    });
    return NextResponse.json(withRelations);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
