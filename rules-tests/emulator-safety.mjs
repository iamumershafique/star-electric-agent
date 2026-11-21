import { createConnection, isIP } from 'node:net';

/** Fail closed before connecting: these tests must never target a real Firebase project. */
export function assertDemoEmulatorEnvironment(env) {
  const project = 'demo-star-electric';
  for (const key of ['GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT', 'GCP_PROJECT', 'FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID']) {
    if (env[key] && env[key] !== project) throw new Error('Rules tests require the demo-star-electric project.');
  }
  if (env.FIREBASE_CONFIG) {
    let config;
    try { config = JSON.parse(env.FIREBASE_CONFIG); } catch { throw new Error('Rules tests require a JSON demo Firebase configuration.'); }
    if (config.projectId !== project) throw new Error('Rules tests require the demo-star-electric project.');
  }
  const endpoints = [env.FIRESTORE_EMULATOR_HOST, env.FIREBASE_STORAGE_EMULATOR_HOST];
  if (env.FIREBASE_EMULATOR_HUB) endpoints.push(env.FIREBASE_EMULATOR_HUB);
  return endpoints.map(endpoint => {
    if (!endpoint) throw new Error('Both loopback Firestore and Storage emulators are required.');
    const match = /^(127\.0\.0\.1|\[::1\]):([0-9]{1,5})$/.exec(endpoint);
    if (!match || +match[2] < 1 || +match[2] > 65535) {
      throw new Error('Emulator endpoints must use a loopback IP and a valid port.');
    }
    const host = match[1] === '[::1]' ? '::1' : match[1];
    if (!isIP(host)) throw new Error('Emulator endpoints must be IP addresses.');
    return { host, port: Number(match[2]) };
  });
}

export async function requireListeningEmulators(endpoints) {
  await Promise.all(endpoints.map(({ host, port }) => new Promise((resolve, reject) => {
    const socket = createConnection({ host, port });
    socket.setTimeout(2000);
    socket.once('connect', () => { socket.destroy(); resolve(); });
    socket.once('timeout', () => { socket.destroy(); reject(new Error('A required loopback emulator is unavailable.')); });
    socket.once('error', () => { socket.destroy(); reject(new Error('A required loopback emulator is unavailable.')); });
  })));
}
