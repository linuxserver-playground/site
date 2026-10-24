/** Number and date formatting. Dates render in UTC so builds are deterministic. */

const UNITS: [number, string, string][] = [
  [1e9, 'B', 'billion'],
  [1e6, 'M', 'million'],
  [1e3, 'K', 'thousand'],
];

/**
 * 19_981_826_036 -> "19.9B". Rounds *down*, so "19.9B+" is always a true lower bound,
 * which is what we want for public pull counts.
 */
export function compact(n: number, digits = 1): string {
  for (const [size, suffix] of UNITS) {
    if (n >= size) {
      const f = 10 ** digits;
      const v = Math.floor((n / size) * f) / f;
      return `${v.toFixed(v >= 100 ? 0 : digits).replace(/\.0+$/, '')}${suffix}`;
    }
  }
  return String(n);
}

/** "19.9 billion", for screen readers and prose. */
export function compactLong(n: number, digits = 1): string {
  for (const [size, , word] of UNITS) {
    if (n >= size) {
      const f = 10 ** digits;
      return `${(Math.floor((n / size) * f) / f).toString()} ${word}`;
    }
  }
  return String(n);
}

export const grouped = (n: number) => n.toLocaleString('en-GB');

/** 87898777 -> "83.8 MB" (binary units written the way container tools print them). */
export function bytes(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return '–';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = n;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${u === 0 ? v : v.toFixed(v >= 100 ? 0 : digits)} ${units[u]}`;
}

/** "+1.2 MB" / "-340 KB" / "±0" */
export function bytesDelta(n: number | null | undefined): string {
  if (n === null || n === undefined) return '–';
  if (n === 0) return '±0';
  return `${n > 0 ? '+' : '−'}${bytes(Math.abs(n))}`;
}

/** "42585b63" */
export const shortSha = (sha: string, n = 8) => sha.slice(0, n);
/** "sha256:5210…2d35" */
export const shortDigest = (d: string | null | undefined) => (d ? `${d.slice(0, 15)}…${d.slice(-4)}` : '–');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "28 Apr 2022" */
export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "28 April 2022" */
export function formatDateLong(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getUTCDate()} ${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export const isoDate = (d: Date | string) => (typeof d === 'string' ? new Date(d) : d).toISOString().slice(0, 10);

/** "3 days ago", relative to `now` (the data snapshot time, not the visitor's clock). */
export function relative(d: Date | string, now: Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const s = Math.max(0, (now.getTime() - date.getTime()) / 1000);
  const steps: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Infinity, 'year'],
  ];
  let v = s;
  for (const [size, unit] of steps) {
    if (v < size) {
      const n = Math.max(1, Math.floor(v));
      return unit === 'second' ? 'just now' : `${n} ${unit}${n === 1 ? '' : 's'} ago`;
    }
    v /= size;
  }
  return '';
}

/** ISO 8601 week, e.g. { year: 2026, week: 43 }. Drives the weekly spotlight rotation. */
export function isoWeek(d: Date): { year: number; week: number } {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return { year: t.getUTCFullYear(), week: Math.ceil(((t.getTime() - yearStart.getTime()) / 864e5 + 1) / 7) };
}

export const plural = (n: number, one: string, many = `${one}s`) => `${grouped(n)} ${n === 1 ? one : many}`;
