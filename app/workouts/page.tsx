"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

type Workout = {
  id: number;
  date: string;
  bodyWeight: number | null;
  template: { name: string } | null;
  exercises: {
    exercise: { name: string };
    sets: { reps: number; weight: number }[];
  }[];
};

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = () => {
    setLoading(true);
    setError(null);
    fetch("/api/workouts")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load workouts");
        return r.json();
      })
      .then((data: { workouts: Workout[] }) => setWorkouts(data.workouts ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalVolume = (w: Workout) => {
    let v = 0;
    for (const ex of w.exercises) {
      for (const s of ex.sets) v += s.reps * s.weight;
    }
    return v;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Workout History</h1>
        <Link
          href="/log"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Log workout
        </Link>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <LoadingSpinner />
          <span>Loading workouts…</span>
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchWorkouts} />
      ) : workouts.length === 0 ? (
        <p className="text-zinc-500">No workouts yet. Log your first workout to get started.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {workouts.map((w) => (
            <li key={w.id} className="py-4">
              <Link
                href={`/workouts/${w.id}`}
                className="block rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{formatDate(w.date)}</span>
                  {w.bodyWeight != null && (
                    <span className="text-sm text-zinc-500">
                      Body: {w.bodyWeight} lbs
                    </span>
                  )}
                </div>
                {w.template && (
                  <p className="mt-1 text-sm text-zinc-500">{w.template.name}</p>
                )}
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {w.exercises.length} exercise{w.exercises.length !== 1 ? "s" : ""} · Volume:{" "}
                  {totalVolume(w).toLocaleString()} lbs
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
