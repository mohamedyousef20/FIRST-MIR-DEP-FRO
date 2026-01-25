export interface Location {
  lat: number;
  lng: number;
}

export interface PickupPoint {
  _id?: string;
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  operatingHours: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
}
