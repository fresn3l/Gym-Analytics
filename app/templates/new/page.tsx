"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Exercise = { id: number; name: string };

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((list: { id: number; name: string }[]) => setExercises(list))
      .catch(console.error);
  }, []);

  const toggleExercise = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), exerciseIds: selectedIds }),
      });
      if (res.ok) router.push("/templates");
      else {
        const err = await res.json();
        alert(err.error || "Failed to create");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New template</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Template name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chest & Tris"
            required
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Exercises (order = top to bottom)
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {exercises.map((ex) => (
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
              {selectedIds.map((id, index) => (
                <li key={id} className="flex items-center gap-2">
                  <span className="text-sm">{index + 1}.</span>
                  <span className="text-sm">
                    {exercises.find((e) => e.id === id)?.name ?? id}
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
            {saving ? "Saving..." : "Create"}
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
