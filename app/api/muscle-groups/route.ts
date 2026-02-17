import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.muscleGroup.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(groups);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch muscle groups" },
      { status: 500 }
    );
  }
}
