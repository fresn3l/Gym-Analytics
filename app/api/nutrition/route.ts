import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serialize(n: { id: number; date: Date; calories: number | null; proteinGrams: number | null; carbsGrams: number | null; fatGrams: number | null; notes: string | null }) {
  return {
    id: n.id,
    date: new Date(n.date).toISOString().slice(0, 10),
    calories: n.calories,
    proteinGrams: n.proteinGrams,
    carbsGrams: n.carbsGrams,
    fatGrams: n.fatGrams,
    notes: n.notes,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from"); // ISO date
  const to = searchParams.get("to");
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 365);

  try {
    const where: { date?: { gte?: Date; lte?: Date } } = {};
    if (from) where.date = { ...where.date, gte: new Date(from) };
    if (to) where.date = { ...where.date, lte: new Date(to) };

    const logs = await prisma.dailyNutrition.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { date: "desc" },
      take: limit,
    });
    return NextResponse.json(logs.map(serialize));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch nutrition logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, calories, proteinGrams, carbsGrams, fatGrams, notes } = body as {
      date: string;
      calories?: number;
      proteinGrams?: number;
      carbsGrams?: number;
      fatGrams?: number;
      notes?: string;
    };
    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const created = await prisma.dailyNutrition.upsert({
      where: { date: d },
      create: {
        date: d,
        calories: calories != null ? Number(calories) : null,
        proteinGrams: proteinGrams != null ? Number(proteinGrams) : null,
        carbsGrams: carbsGrams != null ? Number(carbsGrams) : null,
        fatGrams: fatGrams != null ? Number(fatGrams) : null,
        notes: notes?.trim() || null,
      },
      update: {
        ...(calories !== undefined && { calories: calories == null ? null : Number(calories) }),
        ...(proteinGrams !== undefined && { proteinGrams: proteinGrams == null ? null : Number(proteinGrams) }),
        ...(carbsGrams !== undefined && { carbsGrams: carbsGrams == null ? null : Number(carbsGrams) }),
        ...(fatGrams !== undefined && { fatGrams: fatGrams == null ? null : Number(fatGrams) }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
    });
    return NextResponse.json(serialize(created));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to save nutrition log" },
      { status: 500 }
    );
  }
}
