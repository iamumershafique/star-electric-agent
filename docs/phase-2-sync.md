# Phase 2: sync safety (in progress)

## What the warning banner means

- An individual PR/DC write is **pending** until Firestore acknowledges it. While offline, the promise can stay pending; keep the tab open and verify the record on another authorized device after reconnection.
- **Failed** means that operation was rejected. It is not retried by the warning system. Confirm the actual record and contact the administrator before acknowledging the warning.
- After a reload, previously pending operations become **unconfirmed**, not successful. Warnings use session storage, may not survive closing the tab, and are not a durable retry queue. If session storage fails, the banner says warnings cannot be persisted.
- A stopped live subscription is reported until the listener receives a server-backed snapshot again. A cached snapshot does not clear the warning. Reloading or signing in again may reconnect it; verify the actual data afterwards.
- If local ledger storage fails, the existing local cache and pending image keys are preserved, and a warning is shown for that page lifetime. Do not close the tab or clear browser data until the data has been preserved. The warning itself may not survive reload.
- A browser offline indication is advisory; being online does not prove Firebase is reachable or that records are synchronized.

The bulk **Push All Data** operation is disabled because it could overwrite newer cloud records with stale local copies and previously reported success despite failures. Do not work around this guard by calling older deployments or scripts.

## Not yet fixed

These warnings cover attempted PR/DC cloud saves, deletes and listener errors. They do **not** prove that all records or scans are synced. Some existing link and builty paths modify only local records; image upload errors and cross-device scan storage need separate handling. Snapshot merging is not deletion-aware; cross-device conflicts, atomic PR/DC updates, and reliable offline retries remain unfinished. Acknowledging a warning does not save, retry, or reconcile anything. Don't deploy as production-ready until these issues and the Phase 1 backup/restore checklist are addressed.

Tests currently use simulated Firebase services and storage failures, not a live Firebase project. No production data was accessed as part of this work.
