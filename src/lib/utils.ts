export function formatUptime(seconds: number | string | null | undefined): string {
  if (seconds === null || seconds === undefined || seconds === '-' || (typeof seconds === 'string' && isNaN(Number(seconds)))) {
    return '-';
  }
  const s = Number(seconds);
  if (s < 0) return '-';

  const days = Math.floor(s / (3600 * 24));
  const hours = Math.floor((s % (3600 * 24)) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const remainingSeconds = s % 60;

  let result = [];
  if (days > 0) result.push(`${days}d`); // days
  if (hours > 0) result.push(`${hours}h`); // hours
  if (minutes > 0) result.push(`${minutes}m`); // minutes
  if (remainingSeconds > 0 || result.length === 0) result.push(`${remainingSeconds}s`); // seconds, always show if no other unit

  return result.join(' ');
}