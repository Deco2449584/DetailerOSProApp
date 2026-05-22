import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/services/firebaseConfig';
import {
  createVehicle,
  subscribeToAllVehicles,
  subscribeToUserVehicles,
} from '@/services/vehicleRepository';
import type { NewVehicleInput, Vehicle } from '@/types';

export type { NewVehicleInput };

type VehiclesContextValue = {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  addVehicle: (input: NewVehicleInput) => Promise<Vehicle>;
};

const VehiclesContext = createContext<VehiclesContextValue | undefined>(undefined);

export function VehiclesProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setVehicles([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      setVehicles([]);
      setError('Firebase is not configured.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const onData = (nextVehicles: Vehicle[]) => {
      setVehicles(nextVehicles);
      setIsLoading(false);
      setError(null);
    };

    const onError = (subscriptionError: Error) => {
      setError(subscriptionError.message);
      setIsLoading(false);
    };

    const unsubscribe = isAdmin
      ? subscribeToAllVehicles(onData, onError)
      : subscribeToUserVehicles(user.uid, onData, onError);

    return unsubscribe;
  }, [user?.uid, isAdmin]);

  const addVehicle = useCallback(
    async (input: NewVehicleInput): Promise<Vehicle> => {
      if (!user) {
        throw new Error('You must be signed in to save a record.');
      }

      const vehicle = await createVehicle(user.uid, input, user.email ?? '');

      setVehicles((prev) => {
        const withoutDuplicate = prev.filter((item) => item.id !== vehicle.id);
        return [vehicle, ...withoutDuplicate].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      });

      return vehicle;
    },
    [user],
  );

  const value = useMemo(
    () => ({ vehicles, isLoading, error, addVehicle }),
    [vehicles, isLoading, error, addVehicle],
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
