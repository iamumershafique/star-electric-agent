# Phase 1: data safety and release checklist

## Before deploying

- Do not treat a browser's local cache or the Settings device backup as a full production backup. It includes visible records and locally stored scan bytes, but it does not collect cloud-only scans or external Drive/URL files. Restore affects only an isolated browser cache, not Firestore or Cloud Storage.
- An administrator should arrange independent backups of the actual Firestore database **and** Cloud Storage scans, plus any Drive files referenced by URL. Confirm the project and bucket before taking any action.
- Restore a copy into an isolated test project and verify record counts, PR/DC links, quantities, and representative PR, DC, and builty scans. Do not restore over production. Record the backup date and results.
- This repository change has not created or verified a production backup. Do not enable a production release on the assumption that it has.
- The chosen policy is viewer read-only, editor create/edit, and administrator delete. Role-aware rules and client safeguards are prepared but **not deployed**. Existing accounts need individually reviewed role assignments before rollout; see [role migration](./role-migration.md). Current live rules have not been inspected or changed as part of this work.
- Existing cloud and browser records are not deleted by the Phase 1 changes. Historical seed records are no longer automatically added to a new browser; any future migration must be reviewed and run explicitly.

## Firebase Web configuration

Copy `.env.example` to `.env.local` and set `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_APP_ID` to the correct Firebase Web app settings. These identify the Firebase project; access control is enforced by Firebase Auth and security rules, not by keeping the Web API key secret. Never put service-account private keys in frontend configuration or commit them.

For GitHub production deployments, configure `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_APP_ID` as repository variables (or secrets), along with the deployment service-account secret and release-approval variable described in the README. The workflow fails before building if the Web values are missing. Local staging and production deployment commands check them too. Production validation checks the configured project ID as well as presence, not whether the API key and app ID belong to that project: verify the Firebase Web settings separately.

By default, an unconfigured app remains at the sign-in screen. For an isolated local development-only session, `VITE_ALLOW_LOCAL_MODE=true` explicitly enables local mode if Firebase is unconfigured. Vite production builds do not enable this mode. Browser storage can remain on a device after sign-out; use separate OS/browser profiles on shared computers.

## Remaining safety work

- A full cloud/Drive scan-inclusive backup and a verified restore of actual production data are still needed. Device backup has only been tested with simulated records and local scans.
- The current Firestore listener merges cloud data with local cache. Deletion-aware synchronization, reliable retry, scan uploads, and atomic multi-record changes remain Phase 2 work. Initial warnings are documented in [the sync safety notes](./phase-2-sync.md); they are not proof that the visible cache is a verified cloud backup.
- The master reset only clears this browser's PR/DC cache. It does not delete Firestore or stored scans; cloud records can reappear.

## Device backup and isolated verification

Settings → **Export Device Backup** exports the currently visible PRs/DCs and all scan entries in this browser's IndexedDB as a version 2 JSON file. Inline scan bytes are moved to the archive's scan section. The report counts locally stored scan files, unresolved local references, and external image references. Missing references mean some local scans are unavailable; external references, cloud-only images and Drive files are not included as file contents. The counts do not prove that all cloud data was downloaded. Store the file securely: it is not encrypted and can contain sensitive business records and scan images.

**Verify / Restore** first verifies the file's SHA-256 checksum and displays counts. The checksum detects accidental corruption, but is not a signature or proof of authenticity. Old version 1 JSON exports require the separate offline inspection and conversion process below; retain the originals and source browser data.

To test a device restore, use a **separate clean browser profile**, close other tabs on that origin, and run an isolated Vite development server with Firebase settings absent and `VITE_ALLOW_LOCAL_MODE=true`. For example, in a separate local checkout with no Firebase environment variables or `.env.local` Firebase values, set that variable and run `npm run dev`. Open the local development URL in the clean profile, choose Settings → Verify / Restore, review the counts, and confirm. Restore refuses a non-empty local PR/DC cache or scan store and never contacts Firebase. It is disabled in production builds and whenever Firebase is configured. Verify representative links, quantities and scans manually. Do not use a production browser profile for this test.

The restore attempts to roll back imported local data if local storage fails; if cleanup itself fails, abandon the test profile. It is not a cross-database transactional restore, and it is not a tool for restoring cloud data. Do not push this test copy to Firebase.

## Inspecting and converting an older backup

The offline inspector accepts version 1.0 JSON exports. It does not connect to Firebase, fetch remote files, modify records, or make PR/DC links. With Node.js installed, from the repository run:

```sh
npm ci
npm run backup:inspect -- "/secure/path/legacy-backup.json"
```

Add `--details` to print DC/PR numbers for unresolved links, conflicting references, and duplicate PR-number groups. The output may contain sensitive business identifiers; do not paste it into public issues. Structural checks and normalized-number comparisons are only prompts for manual review. A matching number alone is not proof that a PR and DC should be linked, and placeholder values such as `NO PR` may be reported as duplicates or conflicts. The original version 1 export has no checksum, so its authenticity and completeness cannot be verified by this tool. The reported source SHA-256 is only a fingerprint for detecting later changes; it cannot prove that the original was complete or correct.

To preview whether missing browser scans could be supplied, optionally add `--images-from "/secure/path/device-v2.json"` using a **verified version 2 device backup from the same original browser origin**. The tool reads only that archive's scan entries; it does not import its PR/DC records. Matching image keys do not establish that scans are correct. A backup from a different browser origin (including a localhost development server) does not contain the original site's IndexedDB automatically. The new export feature is not yet deployed; do not deploy to production merely to obtain this file. Preserve the original device and consult an administrator about safely recovering its IndexedDB scans.

Optional conversion, only after reviewing limitations:

```sh
npm run backup:inspect -- "/secure/path/legacy-backup.json" --output "/secure/path/new-device-backup.json" --acknowledge-incomplete
```

Add `--images-from` to that command if a verified source-device version 2 scan archive is available. The destination must be a **new file outside this repository**; existing files are never overwritten. The conversion keeps legacy metadata and record values, moves embedded image data into the version 2 image archive, and preserves links unchanged. It computes a checksum for the newly created file, not for the original source. The generated archive is unencrypted and may remain incomplete even if all locally referenced images are present: cloud-only and external files are not collected. Filesystem mode `0600` is requested on creation where supported; secure the destination and backups according to local policy.

The isolated device restore refuses a converted file if local image references remain unresolved. Conversion does not repair or reconcile links, restore Firebase, or replace a verified Firestore/Storage/Drive backup. Retain the original legacy export and source browser data.
