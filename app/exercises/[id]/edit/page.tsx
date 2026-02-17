"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type MuscleGroup = { id: number; name: string };
type Exercise = {
  id: number;
  name: string;
  equipment: string | null;
  isCustom: boolean;
  muscleGroups: { muscleGroupId: number; muscleGroup: MuscleGroup; isPrimary: boolean }[];
};

export default function EditExercisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [name, setName] = useState("");
  const [equipment, setEquipment] = useState("");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<
    { muscleGroupId: number; isPrimary: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/exercises/${id}`).then((r) => r.json()),
      fetch("/api/muscle-groups").then((r) => r.json()),
    ])
      .then(([ex, mg]) => {
        setExercise(ex);
        setName(ex.name);
        setEquipment(ex.equipment ?? "");
        setMuscleGroups(mg);
        setSelectedMuscles(
          ex.muscleGroups.map((m: { muscleGroupId: number; isPrimary: boolean }) => ({
            muscleGroupId: m.muscleGroupId,
            isPrimary: m.isPrimary,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleMuscle = (mgId: number, isPrimary: boolean) => {
    setSelectedMuscles((prev) => {
      const exists = prev.find((m) => m.muscleGroupId === mgId);
      if (exists) {
        if (exists.isPrimary === isPrimary) {
          return prev.filter((m) => m.muscleGroupId !== mgId);
        }
        return prev.map((m) =>
          m.muscleGroupId === mgId ? { ...m, isPrimary } : m
        );
      }
      return [...prev, { muscleGroupId: mgId, isPrimary }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !exercise?.isCustom) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          equipment: equipment.trim() || null,
          muscleGroupIds: selectedMuscles,
        }),
      });
      if (res.ok) router.push("/exercises");
      else {
        const err = await res.json();
        alert(err.error || "Failed to update");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !exercise) return <p className="text-zinc-500">Loading...</p>;
  if (!exercise.isCustom) {
    return (
      <p className="text-zinc-500">
        Built-in exercises cannot be edited. You can hide them or create a custom
        copy.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit exercise</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Equipment
          </label>
          <input
            type="text"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Muscle groups
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {muscleGroups.map((mg) => {
              const sel = selectedMuscles.find((m) => m.muscleGroupId === mg.id);
              return (
                <div key={mg.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleMuscle(mg.id, true)}
                    className={`rounded px-2 py-1 text-sm ${sel?.isPrimary ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900" : "bg-zinc-200 dark:bg-zinc-700"}`}
                  >
                    {mg.name} (primary)
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMuscle(mg.id, false)}
                    className={`rounded px-2 py-1 text-sm ${sel && !sel.isPrimary ? "bg-zinc-600 text-white dark:bg-zinc-400" : "bg-zinc-100 dark:bg-zinc-800"}`}
                  >
                    (sec)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
