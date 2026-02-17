import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(templates);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, exerciseIds } = body as {
      name: string;
      exerciseIds: number[];
    };
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: { name: name.trim() },
    });

    if (exerciseIds?.length) {
      await prisma.templateExercise.createMany({
        data: exerciseIds.map((exerciseId: number, index: number) => ({
          templateId: template.id,
          exerciseId,
          order: index,
        })),
      });
    }

    const withExercises = await prisma.template.findUnique({
      where: { id: template.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
    });
    return NextResponse.json(withExercises);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
