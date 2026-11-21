import { createServer } from 'node:net';
import { describe, expect, it } from 'vitest';
import { assertDemoEmulatorEnvironment, requireListeningEmulators } from '../rules-tests/emulator-safety.mjs';

const safe = { GCLOUD_PROJECT: 'demo-star-electric', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199' };
describe('rules test isolation guard', () => {
  it('requires both explicit loopback endpoints and rejects remote hubs', () => {
    expect(() => assertDemoEmulatorEnvironment(safe)).not.toThrow();
    expect(() => assertDemoEmulatorEnvironment({ ...safe, FIRESTORE_EMULATOR_HOST: 'example.com:8080' })).toThrow();
    expect(() => assertDemoEmulatorEnvironment({ ...safe, FIREBASE_STORAGE_EMULATOR_HOST: '' })).toThrow();
    expect(() => assertDemoEmulatorEnvironment({ ...safe, FIREBASE_EMULATOR_HUB: 'example.com:4400' })).toThrow();
    expect(() => assertDemoEmulatorEnvironment({ ...safe, FIRESTORE_EMULATOR_HOST: '0.0.0.0:8080' })).toThrow();
    expect(() => assertDemoEmulatorEnvironment({ ...safe, FIRESTORE_EMULATOR_HOST: '127.0.0.1:0' })).toThrow();
  });
  it('rejects conflicting project configuration without connecting', () => {
    expect(() => assertDemoEmulatorEnvironment({ ...safe, GCLOUD_PROJECT: 'production' })).toThrow();
    expect(() => assertDemoEmulatorEnvironment({ ...safe, GOOGLE_CLOUD_PROJECT: 'production' })).toThrow();
    expect(() => assertDemoEmulatorEnvironment({ ...safe, VITE_FIREBASE_PROJECT_ID: 'production' })).toThrow();
    expect(() => assertDemoEmulatorEnvironment({ ...safe, FIREBASE_CONFIG: '{"projectId":"production"}' })).toThrow();
    expect(() => assertDemoEmulatorEnvironment({ ...safe, FIREBASE_CONFIG: 'not-json' })).toThrow();
  });
  it('fails if a required loopback emulator is unavailable', async () => {
    const server = createServer();
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as { port: number }).port;
    await new Promise<void>(resolve => server.close(() => resolve()));
    await expect(requireListeningEmulators([{ host: '127.0.0.1', port }])).rejects.toThrow('unavailable');
  });
});
