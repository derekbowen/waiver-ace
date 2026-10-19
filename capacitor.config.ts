import type { CapacitorConfig } from '@capacitor/cli';

// Bundled mode: the app ships the built files from `dist` inside the native
// package. No remote server URL — website publishes never change the app.
const config: CapacitorConfig = {
  appId: 'com.rentalwaivers.app',
  appName: 'Rental Waivers',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
