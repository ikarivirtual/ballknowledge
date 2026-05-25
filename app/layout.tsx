import type { Metadata } from "next";
import Link from "next/link";
import { defaultDescription, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ball Knowledge | Daily Football Trivia Game",
    template: `%s | ${siteName}`
  },
  description: defaultDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "game",
  alternates: {
    canonical: "/"
  }
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
              <Link href="/">Home</Link>
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
