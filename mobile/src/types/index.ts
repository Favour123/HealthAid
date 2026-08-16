export type IncidentCategory =
  | 'ACCIDENT'
  | 'FIGHTING'
  | 'RIOTING'
  | 'FIRE'
  | 'THEFT'
  | 'VANDALISM'
  | 'MEDICAL'
  | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: string;
  reporterId: string;
  reporter: {
    id: string;
    name: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
