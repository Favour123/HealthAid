import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToIncident(id: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('IncidentDetail', { id });
  }
}
