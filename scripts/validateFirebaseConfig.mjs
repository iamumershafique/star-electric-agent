import { loadEnv } from 'vite';

// Vite's production environment resolution includes local .env files and shell variables.
const env = loadEnv('production', process.cwd(), 'VITE_');
const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_APP_ID'];
const missing = required.filter(key => !env[key]?.trim());
const expectedProject = process.argv[2] === '--project' ? process.argv[3] : undefined;
const actualProject = env.VITE_FIREBASE_PROJECT_ID?.trim() || 'star-agent-jpf';
if (missing.length) {
  console.error(`Firebase deployment blocked: missing ${missing.join(', ')}. Configure the Firebase Web app before deploying.`);
  process.exitCode = 1;
} else if (expectedProject && actualProject !== expectedProject) {
  console.error(`Firebase deployment blocked: configured project ${actualProject} does not match ${expectedProject}.`);
  process.exitCode = 1;
} else if (process.argv.length > 2 && (!expectedProject || process.argv.length !== 4)) {
  console.error('Usage: validateFirebaseConfig.mjs [--project PROJECT_ID]');
  process.exitCode = 1;
} else {
  console.log(`Required Firebase Web configuration is present for project ${actualProject}.`);
}
