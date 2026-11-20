import { describe, expect, it } from 'vitest';
import { previewProject } from '../scripts/check-preview.mjs';
describe('isolated Firebase preview guard', () => {
  it('rejects missing and production project IDs', () => {
    expect(() => previewProject({})).toThrow(/different valid project/i);
    expect(() => previewProject({ VITE_FIREBASE_PROJECT_ID: 'star-agent-jpf' })).toThrow(/different valid project/i);
    expect(() => previewProject({ VITE_FIREBASE_PROJECT_ID: '--project=prod' })).toThrow();
    expect(previewProject({ VITE_FIREBASE_PROJECT_ID: 'demo-star-electric' })).toBe('demo-star-electric');
  });
});
