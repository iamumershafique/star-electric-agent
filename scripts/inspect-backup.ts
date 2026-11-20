/** Offline, read-only inspection by default. Never initializes Firebase or accesses the network. */
import { open, readFile, realpath, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBackupFromRecords, verifyDeviceBackup } from '../src/lib/backupFormat';
import { inspectLegacyBackup, parseLegacyBackup } from '../src/lib/legacyBackup';

const usage = 'Usage: npm run backup:inspect -- <legacy-v1.json> [--details] [--images-from <device-v2.json>] [--output <new-v2.json> --acknowledge-incomplete]';

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help')) { console.log(usage); return; }
  let input = ''; let donor = ''; let output = ''; let details = false; let acknowledged = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--details') details = true;
    else if (arg === '--acknowledge-incomplete') acknowledged = true;
    else if (arg === '--images-from' || arg === '--output') {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}. ${usage}`);
      if (arg === '--images-from') donor = value; else output = value;
    } else if (!arg.startsWith('--') && !input) input = arg;
    else throw new Error(`Invalid argument. ${usage}`);
  }
  if (!input) throw new Error(usage);
  if (output && !acknowledged) throw new Error('Conversion requires --acknowledge-incomplete: neither missing scans nor cloud data are recovered automatically.');
  if (!output && acknowledged) throw new Error('--acknowledge-incomplete is only needed with --output.');
  const sourceBytes = await readFile(input);
  const sourceSha256 = createHash('sha256').update(sourceBytes).digest('hex');
  const legacy = parseLegacyBackup(sourceBytes.toString('utf8').replace(/^\uFEFF/, ''));
  const report = inspectLegacyBackup(legacy);
  let images: Awaited<ReturnType<typeof verifyDeviceBackup>>['payload']['images'] = [];
  let donorCreatedAt: string | undefined;
  if (donor) {
    const verified = await verifyDeviceBackup(await readFile(donor, 'utf8'));
    images = verified.payload.images;
    donorCreatedAt = verified.payload.createdAt;
  }
  let json: string | undefined;
  let summary: Awaited<ReturnType<typeof createBackupFromRecords>>['summary'] | undefined;
  let conversionError: string | undefined;
  try {
    ({ json, summary } = await createBackupFromRecords(legacy.prs, legacy.dcs, images, {
      source: legacy.metadata, ...(donorCreatedAt ? { scanArchiveCreatedAt: donorCreatedAt } : {})
    }));
  } catch (error) {
    conversionError = error instanceof Error ? error.message : String(error);
  }
  const { danglingLinks, conflictingLinks, duplicatePRNumbers, ...aggregate } = report;
  console.log(JSON.stringify({
    source: 'version 1.0 device export; no original checksum', sourceSha256, ...aggregate,
    danglingLinks: details ? danglingLinks : undefined,
    conflictingLinks: details ? conflictingLinks : undefined,
    duplicatePRNumbers: details ? duplicatePRNumbers : undefined,
    conversionPreview: summary, conversionError,
    notes: [
      'Inspection makes no changes and cannot verify production completeness or remote scan availability.',
      'Number matches are review candidates only, never automatic links.',
      'Version 2 restore remains blocked when local scan references are missing.',
      'A source-device scan archive may be supplied separately; matching keys do not prove scan correctness.'
    ]
  }, null, 2));
  if (conversionError && !output) process.exitCode = 1;
  if (output) {
    if (!json || !summary) throw new Error(`Conversion blocked: ${conversionError || 'invalid source'}`);
    // Refuse to place unencrypted business data anywhere inside the source repository.
    const repo = await realpath(fileURLToPath(new URL('..', import.meta.url)));
    const parent = await realpath(dirname(resolve(output)));
    const relativeParent = relative(repo, parent);
    if (!relativeParent || (relativeParent !== '..' && !relativeParent.startsWith(`..${sep}`) && !isAbsolute(relativeParent))) {
      throw new Error('Output must be outside the repository in a secure folder.');
    }
    // Verify the exact file content before writing; exclusive creation never replaces an existing file.
    await verifyDeviceBackup(json);
    const destination = resolve(output);
    const handle = await open(destination, 'wx', 0o600);
    try { await handle.writeFile(json, 'utf8'); }
    catch (error) { await handle.close(); await unlink(destination); throw error; }
    await handle.close();
    console.log(`Created a new unencrypted, potentially incomplete device archive outside the repository. Original not modified. Missing local scan references: ${summary.missingLocalReferences}.`);
  }
}

main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
