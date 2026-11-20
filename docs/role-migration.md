# Portal roles and safe rollout

## Chosen policy

| Firebase custom claim `portalRole` | Read PR/DCs and scans | Create / edit PR/DCs and scans | Delete records / scans |
| --- | --- | --- | --- |
| `viewer` | Yes | No | No |
| `editor` | Yes | Yes | No |
| `admin` | Yes | Yes | Yes |
| Missing or unknown | No | No | No |

Firestore and Storage rules enforce this policy; client-side checks are only an additional user-interface safeguard. An authenticated account without a recognized role cannot use the portal. The local development-only mode remains an isolated local administrator. The rules and role-sensitive app in this branch are **not deployed**.

## Do not lock out existing users

1. Make independent Firestore, Storage, and referenced Drive backups and verify a restore in a separate project. The device backup is not sufficient.
2. Run `npm ci`, `npm test`, and `npm run test:rules` on a machine with Java 21 and the Firebase emulators available. The rules tests use only the `demo-star-electric` emulators and synthetic records. Check that every role, missing role, and anonymous access behaves as expected.
3. Prepare an isolated Firebase project and three synthetic accounts. Set `VITE_FIREBASE_PROJECT_ID`, API key, app ID, auth domain, storage bucket and messaging sender ID from that project's web configuration in a separate development environment. Check the actual project ID and bucket in the Firebase Console; validation checks configuration presence and an expected ID, not credential correctness. `npm run deploy:staging` refuses the production project and targets the configured isolated project only. Never use production records in this test.
4. Assign roles to synthetic accounts and exercise read/create/edit/delete and scans. Before any real rollout, an authorized administrator must inventory real accounts and explicitly assign their intended role. At least one administrator must be verified. Do not guess roles, paste user lists into public Git, or remove other custom claims. The tool below is a guarded helper, not an automated migration.
5. Review both rule files and the rollout and rollback plan. User role changes are only reflected when ID tokens refresh or users sign in again. Previously issued tokens can retain old claims until they expire; coordinate revocation and account changes with the administrator. Browser caches may also retain records after sign-out.
6. Only after all required accounts are assigned and tested, and after the rules emulator passes, set `PORTAL_DATA_RELEASE_APPROVED=true`, `PORTAL_ROLES_MIGRATED=true`, and (for rules only) `PORTAL_RULES_RELEASE_APPROVED=true` in a trusted local environment. `npm run deploy:rules` deploys Firestore and Storage rules to `star-agent-jpf` and requires all three flags. This is a separate, consequential production action; do not run it until explicitly approved. Before release, retain the current deployed rules and a documented rollback procedure.
7. After rules and account access are verified, Hosting can be released separately. The GitHub Hosting workflow requires Actions repository variables `PORTAL_DATA_RELEASE_APPROVED=true` and `PORTAL_ROLES_MIGRATED=true`, the deployment secret and Web config documented in the README. Its flags indicate human approval; they are not evidence that backups or migration actually succeeded.

Rules deployment and Hosting deployment are not atomic. Plan a maintenance window and coordinate old clients; old app versions may still expose controls even if the new rules reject them. The administrator should verify viewer/editor/admin and scan behavior using designated test accounts after release and keep rollback access available.

## Assigning a single role (administrator only)

Use Application Default Credentials for an administrator-controlled account with Firebase Auth management permission. Keep credential files outside the repository; never put service-account keys, user passwords or tokens in chat or Git. Verify the Firebase project and the user UID before running anything.

```sh
# Read-only preview for one user; no claims are changed.
npm run roles:manage -- --project PROJECT_ID --uid USER_UID --role viewer

# Explicitly approved change for the same project and user.
npm run roles:manage -- --project PROJECT_ID --uid USER_UID --role editor \
  --apply --confirm-project PROJECT_ID --confirm-uid USER_UID
```

Allowed roles are `viewer`, `editor`, and `admin`. The script fetches the user and retains existing unrelated custom claims. Firebase custom claims are written as a whole map: another administrator changing claims simultaneously could still race this operation. Coordinate assignments and check the resulting claims. The tool does not make backups, assign bulk users, revoke sessions, deploy rules, or provision accounts. Dry-run and tests have not been run against production.
