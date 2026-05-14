import type { GeneratedSet } from "@/lib/question-schema";

export const fallbackQuestionSet: GeneratedSet = {
  questions: [
    {
      prompt: "Who finished as the Premier League's top scorer in the 2000-01 season?",
      choices: ["Thierry Henry", "Jimmy Floyd Hasselbaink", "Michael Owen", "Teddy Sheringham"],
      correctChoice: 1,
      explanation: "Jimmy Floyd Hasselbaink scored 23 league goals for Chelsea in the 2000-01 Premier League season."
    },
    {
      prompt: "Which club did Yakubu join when he first moved permanently to the Premier League in 2003?",
      choices: ["Portsmouth", "Middlesbrough", "Everton", "Blackburn Rovers"],
      correctChoice: 0,
      explanation: "Yakubu joined Portsmouth permanently in 2003 after impressing during their promotion push."
    },
    {
      prompt: "In 2005-06, which newly promoted side finished 10th under Alan Pardew?",
      choices: ["Wigan Athletic", "West Ham United", "Sunderland", "Reading"],
      correctChoice: 1,
      explanation: "West Ham finished 10th in 2005-06 and also reached the FA Cup final under Alan Pardew."
    },
    {
      prompt: "Which goalkeeper scored for Everton against Bolton Wanderers in the 2003-04 Premier League season?",
      choices: ["Nigel Martyn", "Richard Wright", "Tim Howard", "Paul Gerrard"],
      correctChoice: 1,
      explanation: "Richard Wright scored a wind-assisted goal for Everton against Bolton in December 2003."
    },
    {
      prompt: "Which team beat Manchester United 4-1 at the Riverside Stadium in October 2005?",
      choices: ["Middlesbrough", "Bolton Wanderers", "Blackburn Rovers", "Charlton Athletic"],
      correctChoice: 0,
      explanation: "Middlesbrough beat Manchester United 4-1 at the Riverside in the 2005-06 Premier League season."
    }
  ]
};
