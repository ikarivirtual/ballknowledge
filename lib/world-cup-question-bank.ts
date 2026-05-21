import type { GeneratedSet } from "@/lib/question-schema";
import { factsForDate } from "@/lib/world-cup-facts";

const worldCupQuestionBank: Record<string, GeneratedSet["questions"][number]> = {
  "wc-1930-final": {
    prompt: "Which nation hosted and won the 1930 FIFA World Cup?",
    choices: ["Argentina", "Brazil", "Uruguay", "Italy"],
    correctChoice: 2,
    explanation: "Uruguay hosted the 1930 World Cup and beat Argentina 4-2 in the final in Montevideo."
  },
  "wc-1950-maracana": {
    prompt: "Which team beat Brazil in the decisive final-round match of the 1950 World Cup?",
    choices: ["Uruguay", "Italy", "Sweden", "Spain"],
    correctChoice: 0,
    explanation: "Uruguay beat Brazil 2-1 at the Maracana in the decisive final-round match of the 1950 World Cup."
  },
  "wc-1954-final": {
    prompt: "Which team did West Germany defeat in the 1954 World Cup final in Bern?",
    choices: ["Hungary", "Austria", "Yugoslavia", "Czechoslovakia"],
    correctChoice: 0,
    explanation: "West Germany beat Hungary 3-2 in Bern in the 1954 World Cup final, the Miracle of Bern."
  },
  "wc-1958-pele-final": {
    prompt: "Who scored twice for Brazil in the 1958 World Cup final against Sweden?",
    choices: ["Garrincha", "Didi", "Pele", "Vava"],
    correctChoice: 2,
    explanation: "Pele scored twice as Brazil beat Sweden 5-2 in the 1958 World Cup final."
  },
  "wc-1962-garrincha": {
    prompt: "Which Brazil player is linked here with a standout role in the 1962 World Cup in Chile?",
    choices: ["Garrincha", "Jairzinho", "Rivelino", "Tostao"],
    correctChoice: 0,
    explanation: "Garrincha was a standout player as Brazil won the 1962 World Cup in Chile."
  },
  "wc-1966-north-korea": {
    prompt: "Which country eliminated Italy with a 1-0 group-stage win at the 1966 World Cup?",
    choices: ["North Korea", "Chile", "Bulgaria", "Soviet Union"],
    correctChoice: 0,
    explanation: "North Korea beat Italy 1-0 at Ayresome Park in the 1966 World Cup group stage."
  },
  "wc-1966-final": {
    prompt: "Who did England beat in the 1966 World Cup final at Wembley?",
    choices: ["Portugal", "West Germany", "Argentina", "Soviet Union"],
    correctChoice: 1,
    explanation: "England beat West Germany 4-2 after extra time in the 1966 World Cup final at Wembley."
  },
  "wc-1970-final": {
    prompt: "Which opponent did Brazil defeat 4-1 in the 1970 World Cup final?",
    choices: ["Italy", "West Germany", "Uruguay", "England"],
    correctChoice: 0,
    explanation: "Brazil beat Italy 4-1 at the Estadio Azteca in the 1970 World Cup final."
  },
  "wc-1974-cruyff-turn": {
    prompt: "Against which team did Johan Cruyff perform the famous Cruyff turn at the 1974 World Cup?",
    choices: ["Sweden", "Brazil", "Argentina", "East Germany"],
    correctChoice: 0,
    explanation: "Johan Cruyff performed the Cruyff turn during the Netherlands' 1974 World Cup match against Sweden."
  },
  "wc-1978-final": {
    prompt: "Which team did Argentina beat after extra time in the 1978 World Cup final?",
    choices: ["Brazil", "Italy", "Netherlands", "West Germany"],
    correctChoice: 2,
    explanation: "Argentina beat the Netherlands 3-1 after extra time in the 1978 World Cup final in Buenos Aires."
  },
  "wc-1982-rossi-brazil": {
    prompt: "Who scored a hat-trick for Italy against Brazil in the 1982 World Cup second group stage?",
    choices: ["Marco Tardelli", "Paolo Rossi", "Bruno Conti", "Alessandro Altobelli"],
    correctChoice: 1,
    explanation: "Paolo Rossi scored a hat-trick as Italy beat Brazil 3-2 in the 1982 second group stage."
  },
  "wc-1982-final": {
    prompt: "At which stadium did Italy beat West Germany in the 1982 World Cup final?",
    choices: ["Camp Nou", "Santiago Bernabeu", "Ramon Sanchez Pizjuan", "Vicente Calderon"],
    correctChoice: 1,
    explanation: "Italy beat West Germany 3-1 at the Santiago Bernabeu in the 1982 World Cup final."
  },
  "wc-1986-hand-god": {
    prompt: "Which opponent faced Diego Maradona's Hand of God goal and Goal of the Century in 1986?",
    choices: ["Belgium", "England", "Italy", "Uruguay"],
    correctChoice: 1,
    explanation: "Maradona scored those goals against England in the 1986 World Cup quarter-final."
  },
  "wc-1986-final": {
    prompt: "Who did Argentina defeat in the 1986 World Cup final at the Estadio Azteca?",
    choices: ["West Germany", "France", "Belgium", "Brazil"],
    correctChoice: 0,
    explanation: "Argentina beat West Germany 3-2 at the Estadio Azteca in the 1986 World Cup final."
  },
  "wc-1990-final": {
    prompt: "Who scored West Germany's late penalty in the 1990 World Cup final?",
    choices: ["Lothar Matthaus", "Jurgen Klinsmann", "Andreas Brehme", "Rudi Voller"],
    correctChoice: 2,
    explanation: "Andreas Brehme scored the late penalty as West Germany beat Argentina 1-0 in the 1990 final."
  },
  "wc-1994-final": {
    prompt: "Which team did Brazil defeat on penalties in the 1994 World Cup final?",
    choices: ["Italy", "Netherlands", "Sweden", "Germany"],
    correctChoice: 0,
    explanation: "Brazil beat Italy on penalties after a 0-0 draw at the Rose Bowl in the 1994 World Cup final."
  },
  "wc-1994-golden-ball": {
    prompt: "Who won the Golden Ball as the best player of the 1994 World Cup?",
    choices: ["Romario", "Roberto Baggio", "Hristo Stoichkov", "Dunga"],
    correctChoice: 0,
    explanation: "Romario won the Golden Ball as the best player of the 1994 World Cup."
  },
  "wc-1998-final": {
    prompt: "Who scored twice for France in the 1998 World Cup final against Brazil?",
    choices: ["Youri Djorkaeff", "Zinedine Zidane", "Emmanuel Petit", "Christophe Dugarry"],
    correctChoice: 1,
    explanation: "Zinedine Zidane scored twice as France beat Brazil 3-0 in the 1998 World Cup final."
  },
  "wc-2002-final": {
    prompt: "Who scored both Brazil goals in the 2002 World Cup final against Germany?",
    choices: ["Rivaldo", "Ronaldinho", "Ronaldo", "Roberto Carlos"],
    correctChoice: 2,
    explanation: "Ronaldo scored both goals as Brazil beat Germany 2-0 in Yokohama in the 2002 final."
  },
  "wc-2006-final": {
    prompt: "Which team did Italy beat on penalties in the 2006 World Cup final?",
    choices: ["France", "Germany", "Portugal", "Brazil"],
    correctChoice: 0,
    explanation: "Italy beat France on penalties after a 1-1 draw in Berlin in the 2006 World Cup final."
  },
  "wc-2006-zidane": {
    prompt: "Which France player was sent off in extra time of the 2006 World Cup final?",
    choices: ["Patrick Vieira", "Zinedine Zidane", "Claude Makelele", "Thierry Henry"],
    correctChoice: 1,
    explanation: "Zinedine Zidane was sent off in extra time of the 2006 World Cup final against Italy."
  },
  "wc-2010-final": {
    prompt: "At which stadium was the 2010 World Cup final between Spain and the Netherlands played?",
    choices: ["Soccer City", "Moses Mabhida Stadium", "Ellis Park", "Cape Town Stadium"],
    correctChoice: 0,
    explanation: "Spain beat the Netherlands 1-0 after extra time at Soccer City in Johannesburg in the 2010 final."
  },
  "wc-2010-iniesta": {
    prompt: "Who scored Spain's winning goal in the 2010 World Cup final?",
    choices: ["Xavi", "David Villa", "Andres Iniesta", "Cesc Fabregas"],
    correctChoice: 2,
    explanation: "Andres Iniesta scored the winning goal for Spain in the 2010 World Cup final."
  },
  "wc-2014-germany-brazil": {
    prompt: "What was the score when Germany beat Brazil in the 2014 World Cup semi-final?",
    choices: ["3-0", "4-1", "5-2", "7-1"],
    correctChoice: 3,
    explanation: "Germany beat Brazil 7-1 in the 2014 World Cup semi-final in Belo Horizonte."
  },
  "wc-2014-final": {
    prompt: "Who scored the winner for Germany in the 2014 World Cup final?",
    choices: ["Thomas Muller", "Mario Gotze", "Miroslav Klose", "Toni Kroos"],
    correctChoice: 1,
    explanation: "Mario Gotze scored as Germany beat Argentina 1-0 after extra time in the 2014 final."
  },
  "wc-2018-final": {
    prompt: "Which team did France beat 4-2 in the 2018 World Cup final in Moscow?",
    choices: ["Belgium", "Croatia", "England", "Argentina"],
    correctChoice: 1,
    explanation: "France beat Croatia 4-2 in Moscow in the 2018 World Cup final."
  },
  "wc-2022-final": {
    prompt: "Which team did Argentina beat on penalties in the 2022 World Cup final?",
    choices: ["Croatia", "Netherlands", "Brazil", "France"],
    correctChoice: 3,
    explanation: "Argentina beat France on penalties after a 3-3 draw in Lusail in the 2022 World Cup final."
  },
  "wc-2022-mbappe": {
    prompt: "Who scored a hat-trick for France in the 2022 World Cup final?",
    choices: ["Antoine Griezmann", "Kylian Mbappe", "Olivier Giroud", "Kingsley Coman"],
    correctChoice: 1,
    explanation: "Kylian Mbappe scored a hat-trick for France in the 2022 World Cup final."
  }
};

export function worldCupQuestionSetForDate(date: string): GeneratedSet {
  return {
    questions: factsForDate(date, 5).map((fact) => {
      const question = worldCupQuestionBank[fact.id];

      if (!question) {
        throw new Error(`No verified World Cup question exists for fact ${fact.id}`);
      }

      return question;
    })
  };
}
