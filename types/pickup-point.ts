export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  operatingHours: string;
  /* Admin UI specific fields */
  stationName?: string;
  phone?: string;
  workingHours?: string;
  location?: { type: string; coordinates: [number, number] };
  /* Legacy fields */
  createdAt?: string;
  updatedAt?: string;
}
