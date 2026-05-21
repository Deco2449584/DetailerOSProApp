import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { TeslaColor, TeslaModel, Vehicle, VehicleType } from '@/types';

const STORAGE_KEY = '@detaileros/user-vehicles';

export type NewVehicleInput = {
  vin: string;
  model: TeslaModel;
  type: VehicleType;
  color: TeslaColor;
  comments: string;
  imagesUrls: string[];
};

type VehiclesContextValue = {
  vehicles: Vehicle[];
  isLoading: boolean;
  addVehicle: (input: NewVehicleInput) => Promise<Vehicle>;
};

const VehiclesContext = createContext<VehiclesContextValue | undefined>(undefined);

function sortByNewest(list: Vehicle[]): Vehicle[] {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function createVehicleId(vin: string): string {
  return `${vin}-${Date.now()}`;
}

async function loadVehicles(): Promise<Vehicle[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Vehicle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function persistVehicles(vehicles: Vehicle[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  } catch {
    // Native module or storage full: record remains in memory for this session.
  }
}

export function VehiclesProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await loadVehicles();
      if (!cancelled) {
        setVehicles(sortByNewest(stored));
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const addVehicle = useCallback(async (input: NewVehicleInput): Promise<Vehicle> => {
    const vehicle: Vehicle = {
      id: createVehicleId(input.vin),
      vin: input.vin,
      model: input.model,
      type: input.type,
      status: 'pendiente',
      color: input.color,
      comments: input.comments.trim(),
      imagesUrls: input.imagesUrls,
      createdAt: new Date().toISOString(),
    };

    setVehicles((prev) => {
      const next = [vehicle, ...prev];
      void persistVehicles(next);
      return next;
    });

    return vehicle;
  }, []);

  const sortedVehicles = useMemo(() => sortByNewest(vehicles), [vehicles]);

  const value = useMemo(
    () => ({ vehicles: sortedVehicles, isLoading, addVehicle }),
    [sortedVehicles, isLoading, addVehicle],
  );

  return <VehiclesContext.Provider value={value}>{children}</VehiclesContext.Provider>;
}

export function useVehicles(): VehiclesContextValue {
  const context = useContext(VehiclesContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehiclesProvider');
  }
  return context;
}
