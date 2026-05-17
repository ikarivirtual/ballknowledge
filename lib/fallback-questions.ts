import type { GeneratedSet } from "@/lib/question-schema";

export const fallbackQuestionSet: GeneratedSet = {
  questions: [
    {
      prompt: "Which player scored both goals for Brazil in the 2002 FIFA World Cup final against Germany?",
      choices: ["Rivaldo", "Ronaldinho", "Ronaldo", "Roberto Carlos"],
      correctChoice: 2,
      explanation: "Ronaldo scored twice in Yokohama as Brazil beat Germany 2-0 in the 2002 World Cup final."
    },
    {
      prompt: "Which country eliminated Italy from the 1966 FIFA World Cup with one of the tournament's biggest upsets?",
      choices: ["North Korea", "Chile", "Bulgaria", "Soviet Union"],
      correctChoice: 0,
      explanation: "North Korea beat Italy 1-0 at Ayresome Park in the 1966 group stage, knocking the Italians out."
    },
    {
      prompt: "Who won the Golden Ball as the best player of the 1994 FIFA World Cup?",
      choices: ["Romario", "Roberto Baggio", "Hristo Stoichkov", "Dunga"],
      correctChoice: 0,
      explanation: "Romario won the 1994 Golden Ball after leading Brazil to the title in the United States."
    },
    {
      prompt: "At which stadium was the 2010 FIFA World Cup final between Spain and the Netherlands played?",
      choices: ["Soccer City", "Moses Mabhida Stadium", "Ellis Park", "Cape Town Stadium"],
      correctChoice: 0,
      explanation: "Spain beat the Netherlands 1-0 after extra time at Soccer City in Johannesburg in the 2010 final."
    },
    {
      prompt: "Which nation hosted and won the first FIFA World Cup in 1930?",
      choices: ["Argentina", "Brazil", "Uruguay", "Italy"],
      correctChoice: 2,
      explanation: "Uruguay hosted the inaugural 1930 World Cup and beat Argentina 4-2 in the final in Montevideo."
    }
  ]
};
