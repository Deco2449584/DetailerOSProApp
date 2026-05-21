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
import { dummyVehicles } from '@/utils/dummyData';

const STORAGE_KEY = '@detaileros/user-vehicles';

const DUMMY_IDS = new Set(dummyVehicles.map((v) => v.id));

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

function getUserVehicles(list: Vehicle[]): Vehicle[] {
  return list.filter((v) => !DUMMY_IDS.has(v.id));
}

function mergeWithDummy(userVehicles: Vehicle[]): Vehicle[] {
  return sortByNewest([...userVehicles, ...dummyVehicles]);
}

async function loadUserVehicles(): Promise<Vehicle[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Vehicle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function persistUserVehicles(allVehicles: Vehicle[]): Promise<void> {
  try {
    const userOnly = getUserVehicles(allVehicles);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
  } catch {
    // Sin módulo nativo o almacenamiento lleno: el registro sigue en memoria esta sesión.
  }
}

export function VehiclesProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => mergeWithDummy([]));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const userVehicles = await loadUserVehicles();
      if (!cancelled) {
        setVehicles(mergeWithDummy(userVehicles));
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
      void persistUserVehicles(next);
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
    throw new Error('useVehicles debe usarse dentro de un VehiclesProvider');
  }
  return context;
}
