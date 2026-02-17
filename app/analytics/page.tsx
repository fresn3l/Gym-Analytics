"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type BodyWeightPoint = { date: string; weight: number };
type VolumePoint = { date: string; volume: number };

export default function AnalyticsPage() {
  const [bodyWeight, setBodyWeight] = useState<BodyWeightPoint[]>([]);
  const [volumeByWeek, setVolumeByWeek] = useState<VolumePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics?type=bodyWeight").then((r) => r.json()),
      fetch("/api/analytics?type=volumeByWeek").then((r) => r.json()),
    ])
      .then(([bw, vol]) => {
        setBodyWeight(bw);
        setVolumeByWeek(vol);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-500">Loading...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {bodyWeight.length > 0 && (
        <div>
          <h2 className="mb-2 font-medium">Body weight over time</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyWeight}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--foreground)",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (lbs)"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {volumeByWeek.length > 0 && (
        <div>
          <h2 className="mb-2 font-medium">Total volume per week (lbs)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeByWeek}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--foreground)",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="volume" name="Volume (lbs)" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {bodyWeight.length === 0 && volumeByWeek.length === 0 && (
        <p className="text-zinc-500">
          No data yet. Log workouts (and body weight) to see analytics here.
        </p>
      )}
    </div>
  );
}
