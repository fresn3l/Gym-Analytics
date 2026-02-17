"use client";

import { useState } from "react";
import { useTheme } from "../components/ThemeProvider";
import LoadingSpinner from "../components/LoadingSpinner";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);

  const handleExport = async (format: "json" | "csv") => {
    setExporting(format);
    let url: string | null = null;
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gym-analytics-${format === "json" ? "export" : "workouts"}-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Export failed. Try again.");
    } finally {
      if (url) URL.revokeObjectURL(url);
      setExporting(null);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section>
        <h2 className="mb-3 font-medium">Theme</h2>
        <div className="flex flex-wrap gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`rounded-md border px-4 py-2 text-sm font-medium capitalize transition ${
                theme === t
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          System uses your device preference. Light/Dark override it.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-medium">Export data</h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Download all workouts, templates, exercises, and body weight logs for backup or use in another tool.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleExport("json")}
            disabled={exporting !== null}
            className="flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {exporting === "json" ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : null}
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => handleExport("csv")}
            disabled={exporting !== null}
            className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {exporting === "csv" ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : null}
            Export CSV
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          JSON includes full structure. CSV is a flat table of workout sets (date, body weight, template, exercise, set, reps, weight).
        </p>
      </section>
    </div>
  );
}
