import Link from "next/link";
import type { Metadata, Route } from "next";
import { categories, defaultDescription, pageMetadata, siteName, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Daily Football Trivia Game",
  description: defaultDescription,
  path: "/",
  keywords: ["football trivia game", "daily trivia quiz", "football quiz", "daily football quiz"]
});

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    url: absoluteUrl("/"),
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    description: defaultDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    featureList: [
      "Five-question daily football quiz",
      "One attempt per daily set",
      "Instant score with speed bonus",
      "Daily, weekly, and all-time leaderboards",
      "Answer explanations after submission"
    ]
  };

  return (
    <section className="stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="hero">
        <p className="kicker">Daily football trivia game</p>
        <h1>Ball Knowledge</h1>
        <p className="subtitle">
          Five fresh football questions every day. One shot, instant scoring, and no multiplayer clutter.
        </p>
        <div className="cta-row">
          <Link className="button" href="/play">
            Play today&apos;s quiz
          </Link>
          <Link className="link-button standalone-link" href="/leaderboard">
            View leaderboard
          </Link>
        </div>
      </div>

      <section className="panel stack" aria-labelledby="daily-football-quiz">
        <p className="kicker">Fresh every day</p>
        <h2 id="daily-football-quiz">A sharper daily trivia quiz for football fans</h2>
        <p className="muted">
          Ball Knowledge is built around a simple promise: a pure daily football knowledge quiz with five
          multiple-choice questions, one browser attempt, server-scored results, and explanations that make the
          football facts stick.
        </p>
        <div className="feature-grid">
          <div>
            <strong>5 questions</strong>
            <span>Quick enough for a coffee break, tough enough to start a group-chat argument.</span>
          </div>
          <div>
            <strong>One shot</strong>
            <span>No endless retries. Your first answers count toward the daily leaderboard.</span>
          </div>
          <div>
            <strong>Deep football</strong>
            <span>World Cup history, league memories, cult players, finals, venues, and tactical details.</span>
          </div>
        </div>
      </section>

      <section className="seo-grid" aria-label="Football quiz categories">
        {categories.map((category) => (
          <article className="panel mini-panel" key={category.slug}>
            <p className="kicker">{category.kicker}</p>
            <h2>{category.title}</h2>
            <p className="muted">{category.description}</p>
            <Link className="text-link" href={`/${category.slug}` as Route}>
              Explore {category.navLabel.toLowerCase()}
            </Link>
          </article>
        ))}
      </section>
    </section>
  );
}
