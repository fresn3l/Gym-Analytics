"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/workouts", label: "Workouts" },
  { href: "/log", label: "Log Workout" },
  { href: "/templates", label: "Templates" },
  { href: "/exercises", label: "Exercises" },
  { href: "/analytics", label: "Analytics" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={
            pathname === href
              ? "rounded-md bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
              : "rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
