import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.bodyWeightLog.findMany({
      orderBy: { date: "asc" },
      select: { id: true, date: true, weight: true },
    });
    const data = logs.map((l) => ({
      id: l.id,
      date: new Date(l.date).toISOString().slice(0, 10),
      weight: l.weight,
    }));
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch body weight logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, weight } = body as { date: string; weight: number };
    if (!date || weight == null || Number.isNaN(Number(weight))) {
      return NextResponse.json(
        { error: "Date and weight are required" },
        { status: 400 }
      );
    }
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const existing = await prisma.bodyWeightLog.findFirst({
      where: {
        date: {
          gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
          lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
        },
      },
    });
    if (existing) {
      const updated = await prisma.bodyWeightLog.update({
        where: { id: existing.id },
        data: { weight: Number(weight) },
      });
      return NextResponse.json({
        id: updated.id,
        date: new Date(updated.date).toISOString().slice(0, 10),
        weight: updated.weight,
      });
    }
    const created = await prisma.bodyWeightLog.create({
      data: { date: d, weight: Number(weight) },
    });
    return NextResponse.json({
      id: created.id,
      date: new Date(created.date).toISOString().slice(0, 10),
      weight: created.weight,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to save body weight" },
      { status: 500 }
    );
  }
}
