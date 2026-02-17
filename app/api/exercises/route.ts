import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const muscleGroupId = searchParams.get("muscleGroupId");
  const search = searchParams.get("search");
  const includeHidden = searchParams.get("includeHidden") === "true";

  try {
    const exercises = await prisma.exercise.findMany({
      where: {
        ...(includeHidden ? {} : { hidden: false }),
        ...(search
          ? { name: { contains: search } }
          : {}),
        ...(muscleGroupId
          ? {
              muscleGroups: {
                some: { muscleGroupId: Number(muscleGroupId) },
              },
            }
          : {}),
      },
      include: {
        muscleGroups: {
          include: { muscleGroup: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(exercises);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, equipment, basedOnId, muscleGroupIds } = body as {
      name: string;
      equipment?: string;
      basedOnId?: number;
      muscleGroupIds?: { muscleGroupId: number; isPrimary: boolean }[];
    };
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        name: name.trim(),
        equipment: equipment?.trim() || null,
        isCustom: true,
        hidden: false,
        basedOnId: basedOnId ?? null,
      },
    });

    if (muscleGroupIds?.length) {
      await prisma.exerciseMuscleGroup.createMany({
        data: muscleGroupIds.map((m: { muscleGroupId: number; isPrimary: boolean }) => ({
          exerciseId: exercise.id,
          muscleGroupId: m.muscleGroupId,
          isPrimary: m.isPrimary ?? true,
        })),
      });
    } else if (basedOnId) {
      const based = await prisma.exerciseMuscleGroup.findMany({
        where: { exerciseId: basedOnId },
      });
      if (based.length) {
        await prisma.exerciseMuscleGroup.createMany({
          data: based.map((b) => ({
            exerciseId: exercise.id,
            muscleGroupId: b.muscleGroupId,
            isPrimary: b.isPrimary,
          })),
        });
      }
    }

    const withRelations = await prisma.exercise.findUnique({
      where: { id: exercise.id },
      include: {
        muscleGroups: { include: { muscleGroup: true } },
      },
    });
    return NextResponse.json(withRelations);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
