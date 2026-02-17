import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "Gym Analytics",
  description: "Workout tracker and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('gym-analytics-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider>
          <Nav />
          <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
