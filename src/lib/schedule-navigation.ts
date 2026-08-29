type DatedScheduleDay = { isoDate: string };
type Point = { x: number; y: number };

export function dateKeyInTimeZone(
  date: Date,
  timeZone = "Europe/Madrid",
) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getInitialScheduleDayIndex(
  schedule: DatedScheduleDay[],
  now = new Date(),
) {
  if (schedule.length === 0) return 0;
  const today = dateKeyInTimeZone(now);
  const exactIndex = schedule.findIndex((day) => day.isoDate === today);
  if (exactIndex >= 0) return exactIndex;

  for (let index = schedule.length - 1; index >= 0; index -= 1) {
    if (schedule[index].isoDate < today) return index;
  }
  return 0;
}

export function getSwipeDirection(start: Point, end: Point): -1 | 0 | 1 {
  const horizontalDistance = start.x - end.x;
  const verticalDistance = start.y - end.y;
  if (
    Math.abs(horizontalDistance) < 50 ||
    Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
  ) {
    return 0;
  }
  return horizontalDistance > 0 ? 1 : -1;
}
