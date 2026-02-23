"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

type NutritionLog = {
  id: number;
  date: string;
  calories: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
  notes: string | null;
};

export default function NutritionPage() {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    calories: "",
    proteinGrams: "",
    carbsGrams: "",
    fatGrams: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const loadLogs = () => {
    setLoading(true);
    setError(null);
    fetch("/api/nutrition?limit=60")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load nutrition logs");
        return r.json();
      })
      .then(setLogs)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          calories: form.calories ? Number(form.calories) : undefined,
          proteinGrams: form.proteinGrams ? Number(form.proteinGrams) : undefined,
          carbsGrams: form.carbsGrams ? Number(form.carbsGrams) : undefined,
          fatGrams: form.fatGrams ? Number(form.fatGrams) : undefined,
          notes: form.notes.trim() || undefined,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setLogs((prev) => {
          const without = prev.filter((l) => l.date !== saved.date);
          return [saved, ...without];
        });
        if (editingDate === form.date) setEditingDate(null);
        setForm({
          date: new Date().toISOString().slice(0, 10),
          calories: "",
          proteinGrams: "",
          carbsGrams: "",
          fatGrams: "",
          notes: "",
        });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const fillForm = (log: NutritionLog) => {
    setForm({
      date: log.date,
      calories: log.calories != null ? String(log.calories) : "",
      proteinGrams: log.proteinGrams != null ? String(log.proteinGrams) : "",
      carbsGrams: log.carbsGrams != null ? String(log.carbsGrams) : "",
      fatGrams: log.fatGrams != null ? String(log.fatGrams) : "",
      notes: log.notes ?? "",
    });
    setEditingDate(log.date);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Nutrition</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Log daily calories and macros (protein, carbs, fat). One entry per day; saving again for the same date updates it.
      </p>

      <section>
        <h2 className="mb-3 font-medium">Log intake</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Calories (kcal)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.calories}
                onChange={(e) => setForm((p) => ({ ...p, calories: e.target.value }))}
                placeholder="e.g. 2200"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Protein (g)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.proteinGrams}
                onChange={(e) => setForm((p) => ({ ...p, proteinGrams: e.target.value }))}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Carbs (g)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.carbsGrams}
                onChange={(e) => setForm((p) => ({ ...p, carbsGrams: e.target.value }))}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Fat (g)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.fatGrams}
                onChange={(e) => setForm((p) => ({ ...p, fatGrams: e.target.value }))}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Optional"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {saving ? "Saving…" : editingDate ? "Update" : "Save"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-medium">Recent entries</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-500">
            <LoadingSpinner />
            <span>Loading…</span>
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadLogs} />
        ) : logs.length === 0 ? (
          <p className="text-zinc-500">No entries yet. Log your first day above.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
                <div>
                  <span className="font-medium">{log.date}</span>
                  <p className="mt-1 text-sm text-zinc-500">
                    {log.calories != null && `${log.calories} kcal`}
                    {(log.proteinGrams != null || log.carbsGrams != null || log.fatGrams != null) &&
                      ` · P ${log.proteinGrams ?? "—"} / C ${log.carbsGrams ?? "—"} / F ${log.fatGrams ?? "—"} g`}
                    {log.notes && ` · ${log.notes}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fillForm(log)}
                  className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
