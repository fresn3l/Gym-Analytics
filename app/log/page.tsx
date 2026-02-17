"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Exercise = { id: number; name: string };
type Template = {
  id: number;
  name: string;
  exercises: { order: number; exercise: Exercise }[];
};

type LogExercise = {
  exerciseId: number;
  name: string;
  order: number;
  sets: { setIndex: number; reps: number; weight: number }[];
};

export default function LogWorkoutPage() {
  const router = useRouter();
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [bodyWeight, setBodyWeight] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [logExercises, setLogExercises] = useState<LogExercise[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/templates").then((r) => r.json()),
      fetch("/api/exercises").then((r) => r.json()),
    ]).then(([t, ex]) => {
      setTemplates(t);
      setExercises(ex);
    });
  }, []);

  const applyTemplate = () => {
    if (!selectedTemplateId) return;
    const t = templates.find((x) => x.id === Number(selectedTemplateId));
    if (!t) return;
    setLogExercises(
      t.exercises
        .sort((a, b) => a.order - b.order)
        .map((e, i) => ({
          exerciseId: e.exercise.id,
          name: e.exercise.name,
          order: i,
          sets: [{ setIndex: 1, reps: 0, weight: 0 }],
        }))
    );
  };

  const addExercise = (ex: Exercise) => {
    if (logExercises.some((e) => e.exerciseId === ex.id)) return;
    setLogExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        name: ex.name,
        order: prev.length,
        sets: [{ setIndex: 1, reps: 0, weight: 0 }],
      },
    ]);
  };

  const removeExercise = (order: number) => {
    setLogExercises((prev) =>
      prev
        .filter((e) => e.order !== order)
        .map((e, i) => ({ ...e, order: i }))
    );
  };

  const addSet = (order: number) => {
    setLogExercises((prev) =>
      prev.map((e) => {
        if (e.order !== order) return e;
        const nextIndex = e.sets.length + 1;
        return {
          ...e,
          sets: [...e.sets, { setIndex: nextIndex, reps: 0, weight: 0 }],
        };
      })
    );
  };

  const updateSet = (
    order: number,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setLogExercises((prev) =>
      prev.map((e) => {
        if (e.order !== order) return e;
        return {
          ...e,
          sets: e.sets.map((s) =>
            s.setIndex === setIndex ? { ...s, [field]: value } : s
          ),
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    try {
      const payload = {
        date,
        bodyWeight: bodyWeight ? Number(bodyWeight) : undefined,
        templateId: selectedTemplateId ? Number(selectedTemplateId) : undefined,
        notes: notes.trim() || undefined,
        exercises: logExercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          order: ex.order,
          sets: ex.sets.map((s) => ({
            setIndex: s.setIndex,
            reps: s.reps,
            weight: s.weight,
          })),
        })),
      };
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push("/workouts");
      else {
        const err = await res.json();
        alert(err.error || "Failed to save workout");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Log Workout</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Body weight (optional)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              placeholder="e.g. 180"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Start from template
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">— None —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={applyTemplate}
              className="rounded-md bg-zinc-200 px-3 py-2 text-sm hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              Apply template
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Add exercise
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => addExercise(ex)}
                className="rounded bg-zinc-200 px-2 py-1 text-sm hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
        {logExercises.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-medium">Exercises & sets</h2>
            {logExercises.map((ex) => (
              <div
                key={ex.order}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{ex.name}</span>
                  <button
                    type="button"
                    onClick={() => removeExercise(ex.order)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th className="py-1 text-left">Set</th>
                        <th className="py-1 text-right">Reps</th>
                        <th className="py-1 text-right">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((s) => (
                        <tr key={s.setIndex} className="border-b border-zinc-100 dark:border-zinc-800">
                          <td className="py-1">{s.setIndex}</td>
                          <td className="text-right">
                            <input
                              type="number"
                              min="0"
                              value={s.reps || ""}
                              onChange={(e) =>
                                updateSet(ex.order, s.setIndex, "reps", Number(e.target.value) || 0)
                              }
                              className="w-16 rounded border border-zinc-300 bg-white px-2 py-1 text-right dark:border-zinc-700 dark:bg-zinc-900"
                            />
                          </td>
                          <td className="text-right">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={s.weight || ""}
                              onChange={(e) =>
                                updateSet(ex.order, s.setIndex, "weight", Number(e.target.value) || 0)
                              }
                              className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 text-right dark:border-zinc-700 dark:bg-zinc-900"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => addSet(ex.order)}
                  className="mt-2 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  + Add set
                </button>
              </div>
            ))}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || logExercises.length === 0}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? "Saving..." : "Save workout"}
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
