import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        muscleGroups: { include: { muscleGroup: true } },
      },
    });
    if (!exercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(exercise);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch exercise" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const { name, equipment, hidden, muscleGroupIds } = body as {
      name?: string;
      equipment?: string;
      hidden?: boolean;
      muscleGroupIds?: { muscleGroupId: number; isPrimary: boolean }[];
    };

    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: { name?: string; equipment?: string | null; hidden?: boolean } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (equipment !== undefined) updateData.equipment = equipment?.trim() || null;
    if (hidden !== undefined && !exercise.isCustom) updateData.hidden = hidden;

    if (muscleGroupIds !== undefined && exercise.isCustom) {
      await prisma.exerciseMuscleGroup.deleteMany({ where: { exerciseId: id } });
      if (muscleGroupIds.length) {
        await prisma.exerciseMuscleGroup.createMany({
          data: muscleGroupIds.map((m: { muscleGroupId: number; isPrimary: boolean }) => ({
            exerciseId: id,
            muscleGroupId: m.muscleGroupId,
            isPrimary: m.isPrimary ?? true,
          })),
        });
      }
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: updateData,
      include: {
        muscleGroups: { include: { muscleGroup: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 }
    );
  }
}
