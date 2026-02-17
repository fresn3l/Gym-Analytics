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
  Legend,
} from "recharts";

type BodyWeightPoint = { date: string; weight: number };
type VolumePoint = { date: string; volume: number };
type MuscleSummaryPoint = { name: string; volume: number };
type ExerciseProgressPoint = { date: string; volume: number; e1rm: number | null };

const MUSCLE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#ef4444",
  "#a855f7",
  "#ec4899",
  "#f97316",
  "#06b6d4",
  "#84cc16",
  "#6366f1",
  "#14b8a6",
  "#f43f5e",
];

export default function AnalyticsPage() {
  const [bodyWeight, setBodyWeight] = useState<BodyWeightPoint[]>([]);
  const [volumeByWeek, setVolumeByWeek] = useState<VolumePoint[]>([]);
  const [volumeByMuscleGroup, setVolumeByMuscleGroup] = useState<{
    data: Record<string, number>[];
    muscles: string[];
  } | null>(null);
  const [muscleGroupSummary, setMuscleGroupSummary] = useState<MuscleSummaryPoint[]>([]);
  const [exerciseList, setExerciseList] = useState<{ name: string; id?: number }[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgressPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [bodyWeightForm, setBodyWeightForm] = useState({ date: "", weight: "" });
  const [savingWeight, setSavingWeight] = useState(false);

  const fetchBodyWeight = () =>
    fetch("/api/analytics?type=bodyWeight")
      .then((r) => r.json())
      .then(setBodyWeight);

  useEffect(() => {
    Promise.all([
      fetchBodyWeight(),
      fetch("/api/analytics?type=volumeByWeek").then((r) => r.json()).then(setVolumeByWeek),
      fetch("/api/analytics?type=volumeByMuscleGroup")
        .then((r) => r.json())
        .then(setVolumeByMuscleGroup)
        .catch(() => setVolumeByMuscleGroup(null)),
      fetch("/api/analytics?type=muscleGroupSummary")
        .then((r) => r.json())
        .then(setMuscleGroupSummary)
        .catch(() => setMuscleGroupSummary([])),
      fetch("/api/analytics?type=volumeByExercise")
        .then((r) => r.json())
        .then((list: { name: string }[]) =>
          setExerciseList(list.map((e) => ({ name: e.name })))
        )
        .catch(() => setExerciseList([])),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedExercise) {
      setExerciseProgress([]);
      return;
    }
    const params = new URLSearchParams({
      type: "exerciseProgress",
      exerciseName: selectedExercise,
    });
    fetch(`/api/analytics?${params}`)
      .then((r) => r.json())
      .then(setExerciseProgress)
      .catch(() => setExerciseProgress([]));
  }, [selectedExercise]);

  const handleLogBodyWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyWeightForm.date || !bodyWeightForm.weight) return;
    setSavingWeight(true);
    try {
      const res = await fetch("/api/body-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: bodyWeightForm.date,
          weight: Number(bodyWeightForm.weight),
        }),
      });
      if (res.ok) {
        await fetchBodyWeight();
        setBodyWeightForm({ date: "", weight: "" });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } finally {
      setSavingWeight(false);
    }
  };

  if (loading) return <p className="text-zinc-500">Loading...</p>;

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {/* Body weight */}
      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-medium">Body weight over time</h2>
          <form
            onSubmit={handleLogBodyWeight}
            className="flex flex-wrap items-end gap-2"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-500">Log (rest day)</span>
              <input
                type="date"
                value={bodyWeightForm.date}
                onChange={(e) =>
                  setBodyWeightForm((p) => ({ ...p, date: e.target.value }))
                }
                required
                className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-500">Weight (lbs)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                value={bodyWeightForm.weight}
                onChange={(e) =>
                  setBodyWeightForm((p) => ({ ...p, weight: e.target.value }))
                }
                required
                className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
            <button
              type="submit"
              disabled={savingWeight}
              className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {savingWeight ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
        {bodyWeight.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyWeight}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-zinc-200 dark:stroke-zinc-700"
                />
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
        ) : (
          <p className="text-sm text-zinc-500">
            Log body weight on a workout (Log Workout) or use the form above for rest days.
          </p>
        )}
      </section>

      {/* Total volume per week */}
      {volumeByWeek.length > 0 && (
        <section>
          <h2 className="mb-2 font-medium">Total volume per week (lbs)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeByWeek}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-zinc-200 dark:stroke-zinc-700"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--foreground)",
                    borderRadius: "6px",
                  }}
                />
                <Bar
                  dataKey="volume"
                  name="Volume (lbs)"
                  fill="hsl(var(--foreground))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Volume by muscle group (stacked bar per week) */}
      {volumeByMuscleGroup && volumeByMuscleGroup.data.length > 0 && volumeByMuscleGroup.muscles.length > 0 && (
        <section>
          <h2 className="mb-2 font-medium">Volume by muscle group (per week)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeByMuscleGroup.data}
                margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-zinc-200 dark:stroke-zinc-700"
                />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--foreground)",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                {volumeByMuscleGroup.muscles.slice(0, 12).map((muscle, i) => (
                  <Bar
                    key={muscle}
                    dataKey={muscle}
                    stackId="a"
                    fill={MUSCLE_COLORS[i % MUSCLE_COLORS.length]}
                    name={muscle}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Most / least trained muscle groups */}
      {muscleGroupSummary.length > 0 && (
        <section>
          <h2 className="mb-2 font-medium">Muscle group summary (total volume)</h2>
          <p className="mb-2 text-sm text-zinc-500">
            Most trained → least trained (volume in lbs)
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[200px] rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500">Most trained</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {muscleGroupSummary.slice(0, 6).map((m, i) => (
                  <li key={m.name} className="flex justify-between gap-2">
                    <span>{m.name}</span>
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                      {m.volume.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-[200px] rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-500">Least trained</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {muscleGroupSummary.slice(-6).reverse().map((m) => (
                  <li key={m.name} className="flex justify-between gap-2">
                    <span>{m.name}</span>
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                      {m.volume.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Per-exercise progress: volume + estimated 1RM */}
      {exerciseList.length > 0 && (
        <section>
          <h2 className="mb-2 font-medium">Per-exercise progress</h2>
          <p className="mb-2 text-sm text-zinc-500">
            Volume and estimated 1-rep max over time (Epley formula)
          </p>
          <div className="mb-4">
            <label className="block text-sm text-zinc-500">Select exercise</label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="mt-1 rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">— Choose —</option>
              {exerciseList.map((e) => (
                <option key={e.name} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          {selectedExercise && exerciseProgress.length > 0 && (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseProgress}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-zinc-200 dark:stroke-zinc-700"
                  />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--foreground)",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="volume"
                    name="Volume (lbs)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="e1rm"
                    name="Est. 1RM (lbs)"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {selectedExercise && exerciseProgress.length === 0 && (
            <p className="text-sm text-zinc-500">No data for this exercise yet.</p>
          )}
        </section>
      )}

      {bodyWeight.length === 0 &&
        volumeByWeek.length === 0 &&
        muscleGroupSummary.length === 0 &&
        exerciseList.length === 0 && (
          <p className="text-zinc-500">
            No data yet. Log workouts (and body weight) to see analytics here.
          </p>
        )}
    </div>
  );
}
