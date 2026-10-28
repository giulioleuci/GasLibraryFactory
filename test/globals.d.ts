export {};

declare global {
  var mockLoggerService: () => import('./harnessTypes.js').HarnessLogger;
  var resetGasMocks: () => void;
  var __offlineTestEnv: boolean;
  var __bundleLoaded: boolean;
  var __bundleError: string | null;
  var __bundleSource: string | null;
}
