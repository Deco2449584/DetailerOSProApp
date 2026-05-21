export type VehicleType = 'nuevo' | 'usado' | 'redetailing';

export type VehicleStatus = 'pendiente' | 'en_proceso' | 'completado' | 'entregado';

export interface Vehicle {
  id: string;
  vin: string;
  model: string;
  type: VehicleType;
  status: VehicleStatus;
  color: string;
  comments: string;
  imagesUrls: string[];
  createdAt: Date | string;
}
