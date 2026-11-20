import { loadEnv } from 'vite';
import { pathToFileURL } from 'node:url';

export function previewProject(env) {
  const project = env.VITE_FIREBASE_PROJECT_ID?.trim();
  if (!project || project === 'star-agent-jpf' || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project)) {
    throw new Error('Preview blocked: VITE_FIREBASE_PROJECT_ID must name a different valid project. Verify separately that it is isolated and non-production.');
  }
  return project;
}

export function resolvedPreviewProject() { return previewProject(loadEnv('production', process.cwd(), 'VITE_')); }
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(`Preview project: ${resolvedPreviewProject()}`); }
  catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
