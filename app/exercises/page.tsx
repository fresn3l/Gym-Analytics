"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

type MuscleGroup = { id: number; name: string };
type ExerciseMuscleGroup = { muscleGroup: MuscleGroup; isPrimary: boolean };
type Exercise = {
  id: number;
  name: string;
  equipment: string | null;
  isCustom: boolean;
  hidden: boolean;
  muscleGroups: ExerciseMuscleGroup[];
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMuscle, setFilterMuscle] = useState<string>("");
  const [search, setSearch] = useState("");
  const [includeHidden, setIncludeHidden] = useState(false);

  useEffect(() => {
    fetch("/api/muscle-groups")
      .then((r) => r.json())
      .then(setMuscleGroups)
      .catch(console.error);
  }, []);

  const fetchExercises = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filterMuscle) params.set("muscleGroupId", filterMuscle);
    if (search) params.set("search", search);
    if (includeHidden) params.set("includeHidden", "true");
    fetch(`/api/exercises?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load exercises");
        return r.json();
      })
      .then(setExercises)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExercises();
  }, [filterMuscle, search, includeHidden]);

  const toggleHidden = async (id: number, hidden: boolean) => {
    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !hidden }),
      });
      if (res.ok) {
        setExercises((prev) =>
          prev.map((e) => (e.id === id ? { ...e, hidden: !hidden } : e))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Exercise Library</h1>
        <Link
          href="/exercises/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add custom exercise
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">All muscle groups</option>
          {muscleGroups.map((mg) => (
            <option key={mg.id} value={mg.id}>
              {mg.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeHidden}
            onChange={(e) => setIncludeHidden(e.target.checked)}
          />
          Show hidden
        </label>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <LoadingSpinner />
          <span>Loading exercises…</span>
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchExercises} />
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {exercises.map((ex) => (
            <li
              key={ex.id}
              className={`flex flex-wrap items-center justify-between gap-2 py-3 ${ex.hidden ? "opacity-60" : ""}`}
            >
              <div>
                <span className="font-medium">{ex.name}</span>
                {ex.equipment && (
                  <span className="ml-2 text-sm text-zinc-500">
                    ({ex.equipment})
                  </span>
                )}
                <div className="mt-1 flex flex-wrap gap-1 text-xs text-zinc-500">
                  {ex.muscleGroups.map((mg) => (
                    <span
                      key={mg.muscleGroup.id}
                      className={`rounded px-1.5 py-0.5 ${mg.isPrimary ? "bg-zinc-200 dark:bg-zinc-700" : "bg-zinc-100 dark:bg-zinc-800"}`}
                    >
                      {mg.muscleGroup.name}
                      {mg.isPrimary ? "" : " (sec)"}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {ex.isCustom && (
                  <Link
                    href={`/exercises/${ex.id}/edit`}
                    className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                  >
                    Edit
                  </Link>
                )}
                {!ex.isCustom && (
                  <button
                    type="button"
                    onClick={() => toggleHidden(ex.id, ex.hidden)}
                    className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                  >
                    {ex.hidden ? "Restore" : "Hide"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
