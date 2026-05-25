import type { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ballknowledge.com";
export const siteName = "Ball Knowledge";
export const defaultDescription =
  "Play Ball Knowledge, a fresh daily football trivia game with five questions, one attempt, instant scoring, and deeper football quiz categories.";

export const categories = [
  {
    slug: "world-cup-trivia",
    title: "World Cup Trivia",
    navLabel: "World Cup",
    h1: "World Cup trivia",
    kicker: "Tournament knowledge",
    description:
      "A focused World Cup trivia quiz for fans who remember finals, shocks, hosts, scorers, managers, and tournament details beyond the obvious.",
    intro:
      "World Cup quiz questions reward the details that stick with real football fans: famous knockout matches, golden boot races, underdog runs, penalty drama, and the tournament context around each answer.",
    keywords: ["World Cup trivia", "World Cup quiz", "football trivia game", "FIFA World Cup questions"],
    sections: [
      {
        heading: "What the quiz covers",
        body:
          "Expect questions across men's FIFA World Cup history, including finals, group-stage surprises, iconic players, host nations, scorelines, awards, and moments that shaped the tournament."
      },
      {
        heading: "Built for daily play",
        body:
          "Ball Knowledge keeps the format tight: five multiple-choice questions, one attempt, server-scored answers, and explanations after you finish."
      }
    ],
    faq: [
      {
        question: "Is this a daily World Cup trivia quiz?",
        answer:
          "Ball Knowledge runs a fresh daily football quiz and regularly features World Cup history, especially during tournament-focused campaigns."
      },
      {
        question: "How many World Cup trivia questions are in each game?",
        answer: "The daily format is five multiple-choice football questions, designed to be quick but challenging."
      }
    ]
  },
  {
    slug: "premier-league-quiz",
    title: "Premier League Quiz",
    navLabel: "Premier League",
    h1: "Premier League quiz",
    kicker: "Club football memory",
    description:
      "Test your Premier League knowledge with football quiz questions built around champions, relegation fights, cult players, managers, grounds, derbies, and memorable seasons.",
    intro:
      "A good Premier League quiz should go beyond naming the biggest stars. Ball Knowledge is built for sharper football memory: odd league-table twists, title races, transfers, managers, grounds, and details from the modern English top flight.",
    keywords: ["Premier League quiz", "football trivia game", "football quiz questions", "English football trivia"],
    sections: [
      {
        heading: "Question style",
        body:
          "Questions are written as multiple choice, with plausible wrong answers and concise explanations so each round feels like a useful football memory check."
      },
      {
        heading: "Fast enough for every day",
        body:
          "Five questions keeps the daily quiz easy to fit around fixtures, fantasy checks, work breaks, and group chats."
      }
    ],
    faq: [
      {
        question: "Does Ball Knowledge include Premier League questions?",
        answer:
          "Yes. Ball Knowledge is a football trivia game that can cover Premier League seasons, clubs, managers, players, venues, and memorable matches."
      },
      {
        question: "Is the Premier League quiz free?",
        answer: "Yes. The daily Ball Knowledge football quiz is free to play in the browser."
      }
    ]
  },
  {
    slug: "easy-football-questions",
    title: "Easy Football Questions",
    navLabel: "Easy Questions",
    h1: "Easy football questions",
    kicker: "Warm-up round",
    description:
      "Practice easy football questions before the daily quiz, from basic football facts to famous players, clubs, tournaments, positions, and rules.",
    intro:
      "Need a gentler football quiz before the hard stuff? This page is for easy football questions that help newer fans, families, classrooms, and pub quiz hosts get warmed up.",
    keywords: ["easy football questions", "football quiz questions", "football trivia questions", "daily trivia quiz"],
    sections: [
      {
        heading: "Good for quick practice",
        body:
          "Easy questions work best when they are clear, specific, and answerable without needing a spreadsheet open. Ball Knowledge keeps choices readable and gives explanations once the round is done."
      },
      {
        heading: "Move up to the daily quiz",
        body:
          "The daily game is usually tougher than a beginner quiz, but the same five-question format makes it simple to build a streak and learn as you go."
      }
    ],
    faq: [
      {
        question: "What are examples of easy football questions?",
        answer:
          "Easy football questions often cover famous tournaments, basic rules, major clubs, well-known players, common positions, and landmark football moments."
      },
      {
        question: "Can beginners play Ball Knowledge?",
        answer:
          "Yes. Some daily questions are challenging, but the format is short and every completed quiz gives answer explanations."
      }
    ]
  }
] as const;

export type Category = (typeof categories)[number];

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  keywords = []
}: {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords: [...keywords],
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      images: [
        {
          url: absoluteUrl("/assets/football-cafe-hero.png"),
          width: 1200,
          height: 630,
          alt: "Ball Knowledge daily football quiz"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/assets/football-cafe-hero.png")]
    }
  };
}
