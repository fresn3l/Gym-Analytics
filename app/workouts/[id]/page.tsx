"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Workout = {
  id: number;
  date: string;
  bodyWeight: number | null;
  template: { name: string } | null;
  notes: string | null;
  exercises: {
    exercise: { name: string };
    sets: { setIndex: number; reps: number; weight: number }[];
  }[];
};

export default function WorkoutDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/workouts/${id}`)
      .then((r) => r.json())
      .then(setWorkout)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-zinc-500">Loading...</p>;
  if (!workout) return <p className="text-zinc-500">Workout not found.</p>;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{formatDate(workout.date)}</h1>
          {workout.template && (
            <p className="text-sm text-zinc-500">{workout.template.name}</p>
          )}
          {workout.bodyWeight != null && (
            <p className="text-sm text-zinc-500">Body weight: {workout.bodyWeight} lbs</p>
          )}
        </div>
        <Link
          href="/workouts"
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          ← Back to history
        </Link>
      </div>
      {workout.notes && (
        <p className="rounded-lg bg-zinc-100 p-3 text-sm dark:bg-zinc-800">
          {workout.notes}
        </p>
      )}
      <div className="space-y-4">
        {workout.exercises.map((we, i) => {
          const volume = we.sets.reduce((s, set) => s + set.reps * set.weight, 0);
          return (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="mb-2 flex justify-between">
                <span className="font-medium">{we.exercise.name}</span>
                <span className="text-sm text-zinc-500">
                  Volume: {volume.toLocaleString()} lbs
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-1 text-left">Set</th>
                    <th className="py-1 text-right">Reps</th>
                    <th className="py-1 text-right">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {we.sets.map((s) => (
                    <tr key={s.setIndex} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-1">{s.setIndex}</td>
                      <td className="text-right">{s.reps}</td>
                      <td className="text-right">{s.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
