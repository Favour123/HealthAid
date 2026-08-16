import { apiClient } from './client';
import { Incident, IncidentCategory } from '../types';

export function fetchIncidents(category?: IncidentCategory | null) {
  return apiClient
    .get<Incident[]>('/incidents', { params: category ? { category } : undefined })
    .then((res) => res.data);
}

export function fetchMyIncidents() {
  return apiClient.get<Incident[]>('/incidents/mine').then((res) => res.data);
}

export function fetchIncident(id: string) {
  return apiClient.get<Incident>(`/incidents/${id}`).then((res) => res.data);
}

export interface NewIncidentInput {
  title: string;
  description: string;
  category: IncidentCategory;
  latitude: number;
  longitude: number;
  address?: string;
  imageUri?: string | null;
}

export function createIncident(input: NewIncidentInput) {
  const form = new FormData();
  form.append('title', input.title);
  form.append('description', input.description);
  form.append('category', input.category);
  form.append('latitude', String(input.latitude));
  form.append('longitude', String(input.longitude));
  if (input.address) {
    form.append('address', input.address);
  }
  if (input.imageUri) {
    const filename = input.imageUri.split('/').pop() ?? `incident-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    form.append('image', {
      uri: input.imageUri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);
  }

  return apiClient
    .post<Incident>('/incidents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}

export function deleteIncident(id: string) {
  return apiClient.delete(`/incidents/${id}`).then((res) => res.data);
}

export function fetchCategories() {
  return apiClient.get<IncidentCategory[]>('/incidents/categories').then((res) => res.data);
}
