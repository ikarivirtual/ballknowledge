import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { isoDateInUTC, startOfWeekUTC } from "@/lib/dates";
import { formatDuration } from "@/lib/scoring";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

const tabs = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "all-time", label: "All-time" }
];

async function getRows(tab: string) {
  const admin = createAdminClient();
  let query = admin
    .from("attempts")
    .select("player_name, score, correct_count, total_score, duration_seconds, completed_at, daily_sets!inner(quiz_date)")
    .order("total_score", { ascending: false })
    .order("duration_seconds", { ascending: true })
    .limit(50);

  if (tab === "daily") query = query.eq("daily_sets.quiz_date", isoDateInUTC());
  if (tab === "weekly") query = query.gte("completed_at", startOfWeekUTC());

  const { data, error } = await query;

  if (error) {
    return { rows: [], error: `Could not load leaderboard: ${error.message}` };
  }

  const rows = (data ?? []).map((row, index) => {
    return {
      rank: index + 1,
      name: row.player_name ?? "Guest",
      score: row.score as number,
      correctCount: ((row.correct_count as number | null) ?? row.score) as number,
      totalScore: ((row.total_score as number | null) ?? (row.score as number) * 1000) as number,
      durationSeconds: ((row.duration_seconds as number | null) ?? 0) as number,
      completedAt: row.completed_at as string
    };
  });

  return { rows, error: null };
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const active = tabs.some((tab) => tab.key === params.tab) ? params.tab! : "daily";
  const { rows, error } = await getRows(active);

  return (
    <section className="stack">
      <div className="hero">
        <p className="kicker">House scores</p>
        <h1>Leaderboard</h1>
        <p className="subtitle">Daily, weekly, and all-time scores ranked by points, with speed bonuses in play.</p>
      </div>
      <nav className="tabs" aria-label="Leaderboard range">
        {tabs.map((tab) => (
          <Link key={tab.key} href={`/leaderboard?tab=${tab.key}`} aria-current={active === tab.key ? "page" : undefined}>
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="panel">
        {error ? <p className="error">{error}</p> : null}
        {rows.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Points</th>
                <th>Correct</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.rank}-${row.completedAt}`}>
                  <td>{row.rank}</td>
                  <td>{row.name}</td>
                  <td>{row.totalScore.toLocaleString()}</td>
                  <td>{row.correctCount}/5</td>
                  <td>{formatDuration(row.durationSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No scores yet.</p>
        )}
      </div>
    </section>
  );
}
