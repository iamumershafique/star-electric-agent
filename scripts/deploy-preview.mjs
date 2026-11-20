import { spawnSync } from 'node:child_process';
import { resolvedPreviewProject } from './check-preview.mjs';
try {
  const project = resolvedPreviewProject();
  const result = spawnSync('firebase', ['hosting:channel:deploy', 'preview', '--expires', '7d', '--project', project, '--non-interactive'], { stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
