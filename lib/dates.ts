export const QUIZ_TIME_ZONE = "America/New_York";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
};

function partsInQuizTimeZone(date: Date): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: QUIZ_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hourCycle: "h23"
  });

  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: parts.weekday
  };
}

function utcInstantForQuizTimeZoneDate(year: number, month: number, day: number) {
  let instant = new Date(Date.UTC(year, month - 1, day));

  for (let index = 0; index < 2; index += 1) {
    const actual = partsInQuizTimeZone(instant);
    const desiredTime = Date.UTC(year, month - 1, day);
    const actualTime = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    instant = new Date(instant.getTime() + desiredTime - actualTime);
  }

  return instant;
}

export function isoDateInQuizTimeZone(date = new Date()) {
  const parts = partsInQuizTimeZone(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function startOfWeekInQuizTimeZone(date = new Date()) {
  const parts = partsInQuizTimeZone(date);
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  const daysSinceMonday = dayIndex === 0 ? 6 : dayIndex - 1;
  const localMidday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12));
  localMidday.setUTCDate(localMidday.getUTCDate() - daysSinceMonday);

  return utcInstantForQuizTimeZoneDate(
    localMidday.getUTCFullYear(),
    localMidday.getUTCMonth() + 1,
    localMidday.getUTCDate()
  ).toISOString();
}
