import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/services/firebaseConfig';
import { uploadVehicleImages } from '@/services/vehicleStorage';
import type { NewVehicleInput, Vehicle, VehicleStatus } from '@/types';

const VEHICLES_COLLECTION = 'vehicles';

export type VehicleDocument = {
  userId: string;
  createdByEmail?: string;
  vin: string;
  model: Vehicle['model'];
  type: Vehicle['type'];
  status: VehicleStatus;
  color: Vehicle['color'];
  comments: string;
  imagesUrls: string[];
  createdAt: Timestamp | string;
};

function toIsoDate(value: VehicleDocument['createdAt']): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return new Date(0).toISOString();
}

function sortByNewest(vehicles: Vehicle[]): Vehicle[] {
  return [...vehicles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function mapDocumentToVehicle(id: string, data: VehicleDocument): Vehicle {
  return {
    id,
    userId: data.userId,
    createdByEmail: data.createdByEmail ?? '',
    vin: data.vin,
    model: data.model,
    type: data.type,
    status: data.status,
    color: data.color,
    comments: data.comments ?? '',
    imagesUrls: data.imagesUrls ?? [],
    createdAt: toIsoDate(data.createdAt),
  };
}

export function subscribeToAllVehicles(
  onData: (vehicles: Vehicle[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  if (!db) {
    onError(new Error('Firestore is not configured.'));
    return () => {};
  }

  return onSnapshot(
    collection(db, VEHICLES_COLLECTION),
    (snapshot) => {
      const vehicles = sortByNewest(
        snapshot.docs.map((document) =>
          mapDocumentToVehicle(document.id, document.data() as VehicleDocument),
        ),
      );
      onData(vehicles);
    },
    (error) => onError(error),
  );
}

export function subscribeToUserVehicles(
  userId: string,
  onData: (vehicles: Vehicle[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  if (!db) {
    onError(new Error('Firestore is not configured.'));
    return () => {};
  }

  // Solo filtramos por userId (sin orderBy en Firestore) para que los registros
  // nuevos aparezcan de inmediato y no haga falta un índice compuesto.
  const vehiclesQuery = query(
    collection(db, VEHICLES_COLLECTION),
    where('userId', '==', userId),
  );

  return onSnapshot(
    vehiclesQuery,
    (snapshot) => {
      const vehicles = sortByNewest(
        snapshot.docs.map((document) =>
          mapDocumentToVehicle(document.id, document.data() as VehicleDocument),
        ),
      );
      onData(vehicles);
    },
    (error) => onError(error),
  );
}

export async function createVehicle(
  userId: string,
  input: NewVehicleInput,
  createdByEmail: string,
): Promise<Vehicle> {
  if (!db) {
    throw new Error('Firestore is not configured.');
  }

  const vehicleRef = doc(collection(db, VEHICLES_COLLECTION));
  const imageUrls =
    input.imagesUrls.length > 0
      ? await uploadVehicleImages(userId, vehicleRef.id, input.imagesUrls)
      : [];

  const createdAt = new Date().toISOString();

  await setDoc(vehicleRef, {
    userId,
    createdByEmail,
    vin: input.vin.trim(),
    model: input.model,
    type: input.type,
    status: 'pendiente',
    color: input.color,
    comments: input.comments.trim(),
    imagesUrls: imageUrls,
    createdAt,
  });

  return {
    id: vehicleRef.id,
    userId,
    createdByEmail,
    vin: input.vin.trim(),
    model: input.model,
    type: input.type,
    status: 'pendiente',
    color: input.color,
    comments: input.comments.trim(),
    imagesUrls: imageUrls,
    createdAt,
  };
}
