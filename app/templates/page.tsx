"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

type Template = {
  id: number;
  name: string;
  exercises: { order: number; exercise: { id: number; name: string } }[];
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = () => {
    setLoading(true);
    setError(null);
    fetch("/api/templates")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load templates");
        return r.json();
      })
      .then(setTemplates)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const deleteTemplate = async (id: number, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) setTemplates((prev) => prev.filter((t) => t.id !== id)); else setError("Failed to delete");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <Link
          href="/templates/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New template
        </Link>
      </div>
      <p className="text-zinc-600 dark:text-zinc-400">
        Use templates to quickly start a workout (e.g. Chest & Tris, Back & Biceps).
      </p>
      {loading ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <LoadingSpinner />
          <span>Loading templates…</span>
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchTemplates} />
      ) : templates.length === 0 ? (
        <p className="text-zinc-500">No templates yet. Create one to get started.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {templates.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <span className="font-medium">{t.name}</span>
                <p className="mt-1 text-sm text-zinc-500">
                  {t.exercises.length} exercise{t.exercises.length !== 1 ? "s" : ""}:{" "}
                  {t.exercises
                    .sort((a, b) => a.order - b.order)
                    .map((e) => e.exercise.name)
                    .join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/templates/${t.id}/edit`}
                  className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => deleteTemplate(t.id, t.name)}
                  className="text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
