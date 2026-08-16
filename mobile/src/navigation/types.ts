import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Feed: undefined;
  Add: undefined;
  MyReports: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  IncidentDetail: { id: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};
