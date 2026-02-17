"use client";

export default function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
      role="alert"
    >
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-200 px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-300 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}
