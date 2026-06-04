export type TriviaFact = {
  id: string;
  topic: string;
  fact: string;
  source: string;
};

export const worldCupFacts: TriviaFact[] = [
  {
    id: "wc-1930-final",
    topic: "Finals",
    fact: "Uruguay hosted and won the first FIFA World Cup in 1930, beating Argentina 4-2 in the final in Montevideo.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1950-maracana",
    topic: "Finals",
    fact: "Uruguay beat Brazil 2-1 at the Maracana in the decisive final-round match of the 1950 World Cup.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1954-final",
    topic: "Finals",
    fact: "West Germany beat Hungary 3-2 in the 1954 World Cup final in Bern, a match often called the Miracle of Bern.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1958-pele-final",
    topic: "Players",
    fact: "Pele scored twice for Brazil in the 1958 World Cup final, a 5-2 win over Sweden.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1962-garrincha",
    topic: "Players",
    fact: "Garrincha was one of the standout players as Brazil won the 1962 World Cup in Chile.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1966-north-korea",
    topic: "Upsets",
    fact: "North Korea beat Italy 1-0 at Ayresome Park in the 1966 World Cup group stage, eliminating Italy.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1966-final",
    topic: "Finals",
    fact: "England beat West Germany 4-2 after extra time in the 1966 World Cup final at Wembley.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1970-final",
    topic: "Finals",
    fact: "Brazil beat Italy 4-1 in the 1970 World Cup final at the Estadio Azteca.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1974-cruyff-turn",
    topic: "Iconic moments",
    fact: "Johan Cruyff performed the famous Cruyff turn during the Netherlands' 1974 World Cup match against Sweden.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1978-final",
    topic: "Finals",
    fact: "Argentina beat the Netherlands 3-1 after extra time in the 1978 World Cup final in Buenos Aires.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1982-rossi-brazil",
    topic: "Players",
    fact: "Paolo Rossi scored a hat-trick as Italy beat Brazil 3-2 in the 1982 World Cup second group stage.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1982-final",
    topic: "Finals",
    fact: "Italy beat West Germany 3-1 in the 1982 World Cup final at the Santiago Bernabeu.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1986-hand-god",
    topic: "Iconic moments",
    fact: "Diego Maradona scored both the Hand of God goal and the Goal of the Century against England in the 1986 World Cup quarter-final.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1986-final",
    topic: "Finals",
    fact: "Argentina beat West Germany 3-2 in the 1986 World Cup final at the Estadio Azteca.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1990-final",
    topic: "Finals",
    fact: "West Germany beat Argentina 1-0 in the 1990 World Cup final, with Andreas Brehme scoring a late penalty.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1994-final",
    topic: "Finals",
    fact: "Brazil beat Italy on penalties in the 1994 World Cup final after a 0-0 draw at the Rose Bowl.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1994-golden-ball",
    topic: "Awards",
    fact: "Romario won the Golden Ball as the best player of the 1994 World Cup.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-1998-final",
    topic: "Finals",
    fact: "France beat Brazil 3-0 in the 1998 World Cup final at the Stade de France, with Zinedine Zidane scoring twice.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2002-final",
    topic: "Finals",
    fact: "Ronaldo scored both goals as Brazil beat Germany 2-0 in the 2002 World Cup final in Yokohama.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2006-final",
    topic: "Finals",
    fact: "Italy beat France on penalties in the 2006 World Cup final after a 1-1 draw in Berlin.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2006-zidane",
    topic: "Iconic moments",
    fact: "Zinedine Zidane was sent off in extra time of the 2006 World Cup final against Italy.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2010-final",
    topic: "Finals",
    fact: "Spain beat the Netherlands 1-0 after extra time in the 2010 World Cup final at Soccer City in Johannesburg.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2010-iniesta",
    topic: "Players",
    fact: "Andres Iniesta scored the winning goal for Spain in the 2010 World Cup final.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2014-germany-brazil",
    topic: "Upsets",
    fact: "Germany beat Brazil 7-1 in the 2014 World Cup semi-final in Belo Horizonte.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2014-final",
    topic: "Finals",
    fact: "Germany beat Argentina 1-0 after extra time in the 2014 World Cup final, with Mario Gotze scoring the winner.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2018-final",
    topic: "Finals",
    fact: "France beat Croatia 4-2 in the 2018 World Cup final in Moscow.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2022-final",
    topic: "Finals",
    fact: "Argentina beat France on penalties in the 2022 World Cup final after a 3-3 draw in Lusail.",
    source: "FIFA World Cup records"
  },
  {
    id: "wc-2022-mbappe",
    topic: "Players",
    fact: "Kylian Mbappe scored a hat-trick for France in the 2022 World Cup final.",
    source: "FIFA World Cup records"
  }
];

function dateDayNumber(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

function hashText(text: string) {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function factsForDate(date: string, count = 12) {
  const orderedFacts = [...worldCupFacts].sort((left, right) => hashText(left.id) - hashText(right.id));
  const start = (dateDayNumber(date) * count) % orderedFacts.length;

  return Array.from({ length: Math.min(count, orderedFacts.length) }, (_, index) => orderedFacts[(start + index) % orderedFacts.length]);
}

export function factsPrompt(facts: TriviaFact[]) {
  return facts.map((fact) => `- ${fact.id}: ${fact.fact} Source: ${fact.source}.`).join("\n");
}
