import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bazario.store',
  appName: 'Bazario Store',
  webDir: 'dist',
  // Load the web assets bundled in the APK. This previously pointed at a
  // lovableproject.com preview URL, so the installed app ignored its own build
  // and executed whatever that third-party host served - and when the URL did
  // not resolve, Android handed it to Chrome and the app never rendered.
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#f97316",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
  },
};

export default config;