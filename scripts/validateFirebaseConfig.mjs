import { loadEnv } from 'vite';

// Vite's production environment resolution includes local .env files and shell variables.
const env = loadEnv('production', process.cwd(), 'VITE_');
const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_APP_ID'];
const missing = required.filter(key => !env[key]?.trim());
if (missing.length) {
  console.error(`Firebase deployment blocked: missing ${missing.join(', ')}. Configure the Firebase Web app before deploying.`);
  process.exitCode = 1;
} else {
  console.log('Required Firebase Web configuration is present.');
}
