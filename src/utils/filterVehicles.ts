import type { Vehicle } from '@/types';

export function filterVehiclesBySearch(vehicles: Vehicle[], query: string): Vehicle[] {
  const term = query.trim().toLowerCase();
  if (!term) return vehicles;

  return vehicles.filter(
    (vehicle) =>
      vehicle.vin.toLowerCase().includes(term) ||
      vehicle.model.toLowerCase().includes(term),
  );
}

export function filterVehiclesByDateRange(
  vehicles: Vehicle[],
  fromDate: Date | null,
  toDate: Date | null,
): Vehicle[] {
  if (!fromDate && !toDate) return vehicles;

  return vehicles.filter((vehicle) => {
    const created = new Date(vehicle.createdAt);
    if (Number.isNaN(created.getTime())) return false;
    if (fromDate && created < startOfDay(fromDate)) return false;
    if (toDate && created > endOfDay(toDate)) return false;
    return true;
  });
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function parseDateInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
