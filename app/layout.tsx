import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ball Knowledge",
  description: "A five-question daily football quiz."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="shell">
          <header className="topbar">
            <Link className="brand" href="/">
              <span>Ball</span>
              <strong>Knowledge</strong>
            </Link>
            <nav className="nav" aria-label="Primary navigation">
              <Link href="/play">Play</Link>
              <Link href="/leaderboard">Leaderboard</Link>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
