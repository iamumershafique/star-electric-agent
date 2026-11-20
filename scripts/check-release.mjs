const mode = process.argv[2];
if (mode !== 'hosting' && mode !== 'rules') {
  console.error('Release blocked: specify hosting or rules.');
  process.exitCode = 1;
} else {
  const missing = [];
  if (process.env.PORTAL_DATA_RELEASE_APPROVED !== 'true') missing.push('PORTAL_DATA_RELEASE_APPROVED');
  if (process.env.PORTAL_ROLES_MIGRATED !== 'true') missing.push('PORTAL_ROLES_MIGRATED');
  if (mode === 'rules' && process.env.PORTAL_RULES_RELEASE_APPROVED !== 'true') missing.push('PORTAL_RULES_RELEASE_APPROVED');
  if (missing.length) {
    console.error(`Release blocked: verify the backup, role migration and release checklist before setting ${missing.join(', ')} to true.`);
    process.exitCode = 1;
  } else {
    console.log(`${mode} release approval flags are present; the flags do not independently verify backup or migration.`);
  }
}
