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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const dateStr = (await params).date;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  if (Number.isNaN(d.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  try {
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    const log = await prisma.dailyNutrition.findFirst({
      where: { date: { gte: start, lt: end } },
    });
    if (!log) {
      return NextResponse.json(null);
    }
    return NextResponse.json(serialize(log));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch nutrition log" },
      { status: 500 }
    );
  }
}
