import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { IncidentCategory } from '../types';

interface CategoryMeta {
  label: string;
  color: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}

export const CATEGORY_META: Record<IncidentCategory, CategoryMeta> = {
  ACCIDENT: { label: 'Accident', color: '#F59E0B', icon: 'car-sport' },
  FIGHTING: { label: 'Fighting', color: '#DC2626', icon: 'hand-left' },
  RIOTING: { label: 'Rioting', color: '#7C3AED', icon: 'people' },
  FIRE: { label: 'Fire', color: '#EA580C', icon: 'flame' },
  THEFT: { label: 'Theft', color: '#0891B2', icon: 'bag-remove' },
  VANDALISM: { label: 'Vandalism', color: '#DB2777', icon: 'hammer' },
  MEDICAL: { label: 'Medical', color: '#16A34A', icon: 'medkit' },
  OTHER: { label: 'Other', color: '#6B7280', icon: 'alert-circle' },
};

export const ALL_CATEGORIES: IncidentCategory[] = [
  'ACCIDENT',
  'FIGHTING',
  'RIOTING',
  'FIRE',
  'THEFT',
  'VANDALISM',
  'MEDICAL',
  'OTHER',
];
