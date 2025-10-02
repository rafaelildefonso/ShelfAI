export function isNearDate(date: Date | string, days: number): boolean {
  const target = new Date(date);
  const now = new Date();

  const diff = target.getTime() - now.getTime();
  const diffInDays = diff / (1000 * 60 * 60 * 24);

  return diffInDays >= 0 && diffInDays <= days;
}

export function daysUntil(date: Date | string): number {
  const target = new Date(date);
  const now = new Date();

  const diff = target.getTime() - now.getTime();
  return Math.trunc(diff / (1000 * 60 * 60 * 24));
}
