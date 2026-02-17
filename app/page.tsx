import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Gym Analytics</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Track workouts, use templates, and view progress over time.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/log"
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <span className="font-medium">Log Workout</span>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Record today&apos;s session: exercises, sets, reps, weight, body weight.
          </p>
        </Link>
        <Link
          href="/workouts"
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <span className="font-medium">Workout History</span>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            View past workouts and details.
          </p>
        </Link>
        <Link
          href="/templates"
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <span className="font-medium">Templates</span>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Chest & Tris, Back & Biceps, Leg Day, etc.
          </p>
        </Link>
        <Link
          href="/exercises"
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <span className="font-medium">Exercise Library</span>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Browse and customize exercises; add custom or hide ones you don&apos;t do.
          </p>
        </Link>
        <Link
          href="/analytics"
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 sm:col-span-2"
        >
          <span className="font-medium">Analytics</span>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Body weight over time, volume per week, progress by exercise.
          </p>
        </Link>
        <Link
          href="/settings"
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <span className="font-medium">Settings</span>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Theme (light/dark/system), export data (JSON/CSV).
          </p>
        </Link>
      </div>
    </div>
  );
}
