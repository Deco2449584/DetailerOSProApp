export type VehicleType = 'nuevo' | 'usado' | 'redetailing';

export type VehicleStatus = 'pendiente' | 'en_proceso' | 'completado' | 'entregado';

export type TeslaColor =
  | 'Pearl White Multi-Coat'
  | 'Solid Black'
  | 'Deep Blue Metallic'
  | 'Stealth Grey'
  | 'Ultra Red'
  | 'Quicksilver'
  | 'Otro';

export type TeslaModel = 'Model 3' | 'Model Y' | 'Model S' | 'Model X' | 'Cybertruck';

export const TESLA_MODELS: TeslaModel[] = [
  'Model 3',
  'Model Y',
  'Model S',
  'Model X',
  'Cybertruck',
];

export const TESLA_COLORS: TeslaColor[] = [
  'Pearl White Multi-Coat',
  'Solid Black',
  'Deep Blue Metallic',
  'Stealth Grey',
  'Ultra Red',
  'Quicksilver',
  'Otro',
];

export interface Vehicle {
  id: string;
  userId: string;
  createdByEmail: string;
  vin: string;
  model: TeslaModel;
  type: VehicleType;
  status: VehicleStatus;
  color: TeslaColor;
  comments: string;
  imagesUrls: string[];
  createdAt: Date | string;
}

export type NewVehicleInput = {
  vin: string;
  model: TeslaModel;
  type: VehicleType;
  color: TeslaColor;
  comments: string;
  imagesUrls: string[];
};
