export function formatVehicleDate(date: Date | string): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return parsed.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
