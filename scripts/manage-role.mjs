import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { pathToFileURL } from 'node:url';

const validRoles = new Set(['viewer', 'editor', 'admin']);
export function parseRoleArguments(args) {
  const values = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (key === '--apply') {
      if (values.apply) throw new Error('Duplicate --apply.');
      values.apply = true;
    } else if (['--project', '--uid', '--role', '--confirm-project', '--confirm-uid'].includes(key)) {
      const name = key.slice(2);
      if (values[name] !== undefined || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing or duplicate ${key}.`);
      values[name] = args[++i];
    } else throw new Error(`Unknown argument: ${key}`);
  }
  if (!values.project || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(values.project)) throw new Error('Provide an explicit valid --project.');
  if (!values.uid || values.uid.length > 128 || [...values.uid].some(character => character.codePointAt(0) <= 32)) throw new Error('Provide an explicit Firebase user --uid (1–128 characters).');
  if (!validRoles.has(values.role)) throw new Error('--role must be viewer, editor or admin.');
  if (values.apply && (values['confirm-project'] !== values.project || values['confirm-uid'] !== values.uid)) {
    throw new Error('For --apply, --confirm-project and --confirm-uid must exactly match the selected project and UID.');
  }
  return values;
}

/** One explicitly selected user; dry-run is the default. Existing unrelated claims are retained. */
export async function manageRole(auth, options) {
  if (!validRoles.has(options.role) || !options.project || !options.uid) throw new Error('Explicit project, UID and a valid role are required.');
  if (options.apply && (options['confirm-project'] !== options.project || options['confirm-uid'] !== options.uid)) throw new Error('Project and UID confirmations do not match.');
  const user = await auth.getUser(options.uid);
  const existing = user.customClaims || {};
  const next = { ...existing, portalRole: options.role };
  if (options.apply) await auth.setCustomUserClaims(user.uid, next);
  return { uid: user.uid, before: existing.portalRole ?? null, after: options.role, applied: Boolean(options.apply), otherClaimNames: Object.keys(existing).filter(key => key !== 'portalRole') };
}

async function main() {
  const options = parseRoleArguments(process.argv.slice(2));
  const app = initializeApp({ credential: applicationDefault(), projectId: options.project });
  const result = await manageRole(getAuth(app), options);
  console.log(JSON.stringify({ project: options.project, ...result }, null, 2));
  console.log(result.applied ? 'Role set. The user must refresh their ID token or sign in again.' : 'Dry run only; no role was changed.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
}
