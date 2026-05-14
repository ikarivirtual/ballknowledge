import type { GeneratedSet } from "@/lib/question-schema";

export const fallbackQuestionSet: GeneratedSet = {
  questions: [
    {
      prompt: "Who scored Turkey's golden goal against Senegal in the 2002 World Cup quarter-final?",
      choices: ["Hakan Sukur", "Ilhan Mansiz", "Hasan Sas", "Nihat Kahveci"],
      correctChoice: 1,
      explanation: "Ilhan Mansiz scored in extra time to send Turkey into the 2002 World Cup semi-finals."
    },
    {
      prompt: "Which player scored the extra-time winner for Italy against Germany in the 2006 World Cup semi-final?",
      choices: ["Alessandro Del Piero", "Fabio Grosso", "Andrea Pirlo", "Francesco Totti"],
      correctChoice: 1,
      explanation: "Fabio Grosso scored Italy's first extra-time goal before Del Piero added another in Dortmund."
    },
    {
      prompt: "Which country eliminated Italy from the 2010 World Cup with a 3-2 group-stage win?",
      choices: ["Paraguay", "Slovakia", "New Zealand", "Slovenia"],
      correctChoice: 1,
      explanation: "Slovakia beat Italy 3-2 in Johannesburg, knocking the defending champions out in the group stage."
    },
    {
      prompt: "Who scored the only goal when Germany beat France in the 2014 World Cup quarter-final?",
      choices: ["Mats Hummels", "Thomas Muller", "Miroslav Klose", "Sami Khedira"],
      correctChoice: 0,
      explanation: "Mats Hummels headed Germany's winner against France at the Maracana in the 2014 quarter-final."
    },
    {
      prompt: "Which team knocked Spain out of the 2018 World Cup on penalties in the round of 16?",
      choices: ["Croatia", "Russia", "Denmark", "Switzerland"],
      correctChoice: 1,
      explanation: "Russia eliminated Spain on penalties in Moscow after a 1-1 draw in the 2018 round of 16."
    }
  ]
};
