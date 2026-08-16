import Constants from 'expo-constants';

const API_PORT = 3000;

/**
 * Expo Go / dev client expose the Metro host as `hostUri` (e.g. "192.168.1.23:8081").
 * Reusing that IP means the app reaches a locally-running backend on the same LAN
 * without any manual configuration during development.
 */
function resolveDevHost(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ?? (Constants as any)?.expoGoConfig?.debuggerHost;
  const host = hostUri?.split(':')?.[0];
  return host && host.length > 0 ? host : 'localhost';
}

/**
 * Standalone builds (APK/IPA) have no Metro dev server to infer a host from, so they
 * need a fixed backend URL baked in at build time via EXPO_PUBLIC_* env vars (set in
 * eas.json's build profile). When those are unset (local Expo Go development), fall
 * back to auto-detecting the dev machine on the LAN.
 */
const productionApiUrl = process.env.EXPO_PUBLIC_API_URL;
const productionSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;

export const API_BASE_URL = productionApiUrl ?? `http://${resolveDevHost()}:${API_PORT}/api`;
export const SOCKET_URL = productionSocketUrl ?? `http://${resolveDevHost()}:${API_PORT}`;
