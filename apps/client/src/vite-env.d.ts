/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_DATABASE_URL: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_ADSENSE_CLIENT: string;
  readonly VITE_ADSENSE_SLOT_PLAY: string;
  readonly VITE_ADSENSE_SLOT_RESULT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
