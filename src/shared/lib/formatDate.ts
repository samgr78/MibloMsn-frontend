const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
const ABSOLUTE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
});

const UNITS = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
] as const satisfies ReadonlyArray<{ unit: Intl.RelativeTimeFormatUnit; ms: number }>;

/** "il y a 3 heures", for the compact feed display. */
export function formatRelativeDate(date: Date, now: Date = new Date()): string {
  const elapsed = date.getTime() - now.getTime();

  for (const { unit, ms } of UNITS) {
    if (Math.abs(elapsed) >= ms) {
      return RELATIVE_FORMATTER.format(Math.round(elapsed / ms), unit);
    }
  }

  return "à l'instant";
}

/** "12 mars 2026 à 14:03", for the title attribute and the detail page. */
export function formatAbsoluteDate(date: Date): string {
  return ABSOLUTE_FORMATTER.format(date);
}
