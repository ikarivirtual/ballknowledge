export const knownCorrections = [
  "Adelaide United reached the AFC Champions League final in 2008, before Western Sydney Wanderers won it in 2014; never claim Western Sydney was the first A-League club to reach the ACL final.",
  "The 2009 A-League Grand Final was Melbourne Victory 1-0 Adelaide United at Docklands Stadium/Telstra Dome, with Tom Pondeljak scoring the goal."
];

export function correctionsPrompt() {
  return knownCorrections.map((correction) => `- ${correction}`).join("\n");
}
