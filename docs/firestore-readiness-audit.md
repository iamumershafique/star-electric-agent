# Firestore readiness audit

## Scope and confidence

Repository review and read-only inspection of the supplied legacy backup were performed in this workspace. The user subsequently reported read-only Cloud Shell output for the live project: the `(default)` Firestore Native database is in `asia-south1`; aggregate queries returned 103 documents in `star_prs` and 762 in `star_dcs`. A successful project bucket-list command returned zero buckets. This does not rule out scans on devices, in Drive, or in a bucket associated with another project. These counts do not verify document contents, completeness, scans, or links.

The user also reported `(default)` database metadata showing point-in-time recovery disabled and a 3,600-second version retention period. The formatted schedule-list and backup-list commands showed no entries; this does not rule out exports, backups in another project, device backups, or formatting/permission limitations. No backup or isolated restore has been verified.

**Live Firestore and Storage rules, user roles, individual cloud records, Storage objects, Drive permissions, and backup configuration have not been inspected.** This workspace has no authorized Firebase CLI account or Application Default Credentials. It also cannot reach Google APIs directly. Repository findings are not evidence about the live service.

The repository defaults to Firebase project `star-agent-jpf`; confirm in the Firebase Console that this is the intended production project before conducting a cloud audit. The current working branch also has uncommitted sync improvements; those changes are not deployed.

## Priority findings

### 1. Public repository contains business data and scan references — urgent confidentiality risk

The GitHub repository is public. Tracked `scratch/` files include purchase/delivery-related data, spreadsheets, and scan-link mappings; for example, `scratch/dcs_501_600.json` has 100 delivery-shaped records and `scratch/dcs_601_686.json` has 86. The source also contains Drive file references. These are repository contents, not proof that any linked Drive file is publicly readable. Three deployment/source ZIP files are also tracked and need separate inspection.

Ask the repository owner to consider making it private immediately, review the repository and Git history for exposed records and credentials, and review Drive sharing and tokenized scan URLs. Making the repository private or removing a file now cannot undo past access or remove existing copies. Preserve a secure copy before any cleanup; plan history cleanup and credential/token rotation with an authorized administrator. Do not post business records or URLs in a public issue. This audit did not independently verify what external parties accessed.

### 2. Data is not reliably cloud-backed

- PR/DC records are first written to browser localStorage; scan bytes use browser IndexedDB. Firestore writes are separate asynchronous operations and may fail or remain unconfirmed.
- Some legacy linking and builty operations modify only local data. A bulk push is deliberately disabled because it could overwrite newer cloud records.
- A delivery can change both a PR and a DC, but those Firestore updates are not an atomic transaction. Simultaneous users can still overwrite one another; the local snapshot comparison does not provide server-side compare-and-swap.
- Delete paths are inconsistent: after a PR is deleted locally, its DC links are cleared before the cloud-sync filter looks for the original link, so those DC changes are not sent by that path. Deleting a DC recalculates a local PR but does not sync the recalculated PR in that path. Avoid these operations until reviewed and corrected.
- The legacy builty matching code can match by substring and pick the first match; review ambiguous results against source documents.
- The new, uncommitted branch code can refresh an unchanged cached record from a later trusted snapshot and rejects stale open-form edits; it does not fix these broader issues or guarantee cross-device consistency.

### 3. Scan security and recovery are not verified

Scans can be stored locally, in Firebase Storage, or referenced through external/Drive links. Upload attempts are not a durable retry queue, local key normalization can collide, and old references may be unavailable. Firebase Storage tokenized download URLs are bearer links: someone who has one may be able to download its object without portal authentication. Drive URLs have separate permissions. Do not revoke links or tokens until a secure backup and migration plan exist.

### 4. Roles and deployment state need a live check

Repository rules require a `portalRole` custom claim: viewer read-only, editor create/edit, admin delete. These are repository files, **not confirmation of the deployed rules**. Existing users with no recognized role can be locked out by the new app/rules. Coordinate a staged account inventory and rollout with an authorized administrator.

The GitHub Actions run for merge commit `4b9f71a` stopped at **Verify production release approval**; the Hosting deployment step was skipped ([run](https://github.com/iamumershafique/star-electric-agent/actions/runs/44739543443)). The job result does not establish which site version was already deployed or whether someone deployed separately. Do not set approval flags merely to bypass the guard. The run is Hosting-only and does not deploy Firestore or Storage rules.

### 5. Backups and source-of-truth inventory are incomplete

Read-only inspection of the supplied version 1 device export found 113 PRs and 747 DCs, 13 dangling PR IDs, 2 conflicting PR-number references, and 8 groups of duplicate normalized PR numbers. The file has no original checksum. It contains 10 embedded image occurrences, 23 IndexedDB-reference occurrences representing 4 unique keys, and 791 external/other image occurrences. The conversion preview still lacks all 4 unique locally referenced scans. This export is not verified against the live cloud and is not a full Firestore/Storage/Drive backup. Do not import, auto-link, or delete anything based solely on this inspection.

Create independent, access-controlled backups of actual Firestore records, Storage objects, and referenced Drive files; test restoration in a separate project/profile. Verify counts, selected PR/DC links, quantities, and representative scans. Retain the original device/browser storage, original export, and cloud data until an administrator has verified recovery.

### 6. Dependency and secret hygiene

`npm audit --omit=dev` reported 12 affected production dependency packages, including 7 rated high and 5 moderate. An advisory's applicability depends on actual runtime usage; a count is not proof of exploitation. Review the dependency paths and upgrades, and test before changing versions; do not blindly apply a suggested major downgrade. The application also stores configured AI-provider keys in browser localStorage; shared profiles and browser access may expose them. `.env.local` was previously tracked and removed in earlier work, but removing a file does not erase repository history. Review any exposed credentials and rotate actual secrets as appropriate. This checkout is shallow, so this audit did not independently verify all historical contents.

## Verification performed

- Prior branch tests: 90 application tests passed, build passed, lint completed with 27 warnings. The previous merged commit's Firebase rules-emulator tests passed in GitHub CI; current uncommitted sync changes have not been tested against live Firebase.
- GitHub quality workflow passed on the merge commit. Hosting workflow failed at its release gate and did not reach deployment.
- Legacy backup inspected read-only; no data was imported, no roles or rules changed, and no deployment performed.

## Copyable request for a Firebase administrator or a CLI-capable assistant

```text
Please perform a READ-ONLY audit of my Firebase project. The repository defaults to project ID star-agent-jpf; first confirm in the Firebase Console whether this is the correct production project. Do not infer that it is correct merely from the code.

Use my already-authorized local Firebase CLI / Google Cloud CLI or Application Default Credentials. Do not ask me to paste or export passwords, API keys, service-account JSON, access/refresh tokens, signed URLs, or credential files. If access is missing, explain the least-privilege read-only access needed and stop; do not create credentials or change IAM without separate approval.

Do not deploy, import, export production data to an unapproved destination, modify/delete records, change permissions, rotate tokens, change user claims, or start a restore. Do not print record content, document IDs, user emails, file names, scan URLs, file contents, credentials, or tokens. Report only sanitized aggregate counts and configuration statuses. Counts or list operations may incur reads/costs; say what you plan to query and obtain approval first.

Please check and report:
1. Confirmed project ID, Firestore database IDs/mode/locations, and Storage bucket names or redacted identifiers. Distinguish the actual app bucket from other buckets.
2. The current deployed Firestore and Storage security rules and their release/version timestamps, compared with the repository rules. Summarize access for unauthenticated users and the viewer/editor/admin portalRole claims. Do not change the rules.
3. Counts of documents in star_prs and star_dcs; report missing collections separately from zero counts. Check whether other relevant collections exist, without listing customer data. Use aggregation counts when supported; explain if a full read is needed.
4. If permitted and approved, report aggregate counts of users with viewer/editor/admin/missing/unknown portalRole claims, without listing identities. Explain that Admin SDK reads bypass Security Rules and cannot by themselves prove client access behavior.
5. Number and total size of relevant Firebase Storage scan objects; counts of missing scan references, tokenized or external/Drive references, and inaccessible references only where a safe, authorized read-only check is feasible. Do not output URLs or download tokens. Explain any checks that could not be performed.
6. Firestore and Storage backup/PITR/versioning settings, latest available backup times and coverage, and whether there is evidence of a restore tested in a separate project. Inspect Drive backup and sharing separately if access is available. Do not create or restore a backup.
7. Current deployed Hosting release timestamp/version if accessible and whether it corresponds to the merged repository revision, without assuming a failed GitHub workflow deployed it.

Report verified facts separately from assumptions, include permission-denied and inaccessible checks, state when the audit was performed, and provide a safe next-step checklist. Share only sanitized results with me.
```
