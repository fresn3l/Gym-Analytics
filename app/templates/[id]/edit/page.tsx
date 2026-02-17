"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Exercise = { id: number; name: string };
type Template = {
  id: number;
  name: string;
  exercises: { order: number; exerciseId: number; exercise: Exercise }[];
};

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [name, setName] = useState("");
  const [template, setTemplate] = useState<Template | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/templates/${id}`).then((r) => r.json()),
      fetch("/api/exercises").then((r) => r.json()),
    ])
      .then(([t, ex]) => {
        setTemplate(t);
        setName(t.name);
        setAllExercises(ex);
        const ordered = [...t.exercises].sort((a, b) => a.order - b.order);
        setSelectedIds(ordered.map((e) => e.exerciseId));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const toggleExercise = (exerciseId: number) => {
    setSelectedIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((x) => x !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index >= selectedIds.length - 1) return;
    setSelectedIds((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), exerciseIds: selectedIds }),
      });
      if (res.ok) router.push("/templates");
      else {
        const err = await res.json();
        alert(err.error || "Failed to update");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !template) return <p className="text-zinc-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit template</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Template name *
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
            Exercises (order = top to bottom)
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {allExercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => toggleExercise(ex.id)}
                className={`rounded px-3 py-1.5 text-sm ${selectedIds.includes(ex.id) ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-200 dark:bg-zinc-700"}`}
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div>
            <span className="text-sm font-medium">Order:</span>
            <ul className="mt-1 space-y-1">
              {selectedIds.map((exerciseId, index) => (
                <li key={exerciseId} className="flex items-center gap-2">
                  <span className="text-sm">{index + 1}.</span>
                  <span className="text-sm">
                    {allExercises.find((e) => e.id === exerciseId)?.name ?? exerciseId}
                  </span>
                  <button type="button" onClick={() => moveUp(index)} className="text-xs">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveDown(index)} className="text-xs">
                    ↓
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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
