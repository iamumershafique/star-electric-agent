# Sync integration review — working copy only

## Status

**Production not integrated.** Normal production saves still use the pre-existing legacy paths, not the synthetic outbox or transactional prototype. Quick Dispatch now has a separate explicitly switched synthetic demo path: see [demo-linked-delivery.md](demo-linked-delivery.md). This is not a completed production sync repair and must not be deployed as such. The demo backend is hardcoded to the demo project and loopback emulator and is not a production transport. No production data has been used for this review.

## Form-to-handler trace

| Normal action | Entry point | Current handler / writes |
| --- | --- | --- |
| Create one PR | `PRReviewModal.handleSaveCurrentPR` | `addNewPR` → `savePR` locally → `savePRToCloud` → Firestore `setDoc` merge |
| Create PR batch | `PRReviewModal.handleSaveAllPRs` | `addMultiplePRs` → local batch → one independent cloud PR write per record |
| Edit PR | `PREditModal.handleSave`; item status in `PRDetailModal` | `updateExistingPR` → `savePR` locally → independent cloud PR write |
| Create DC / dispatch | `DCUploadModal` and `QuickDispatchModal` | `recordDeliveryChallan` → `saveDCAndFulfillPR` locally → independent DC and (when quantities change) PR cloud writes |
| Create DC batch | `DCUploadModal` | `recordMultipleDeliveryChallans` → local batch → independent DC and PR cloud writes |
| Edit DC | `DCEditModal`; scan preview | `updateDC` → `updateDCInStorage` → independent cloud DC write; linked quantity edits are currently rejected |
| Duplicate handling | `DuplicateWarningModal` | Can call `addNewPR` for a merge |

Additional direct or indirect legacy writers are not protected by revision checks. In `AppContext` these include `deletePR`, `deleteDC`, `mergeDuplicatePRs`, `mergeDuplicateDCs`, `mergeAllDuplicateDCs`, `deduplicatePRItems`, `markAllDCsDelivered`, `autoLinkDeliveredPRsAndDCs`, `linkDCToManualPR`, `markDCNoPRRequired`, `markAllMissingPRsNoRequired` and `attachPRImageToDC` (independent cloud writes or deletes); `linkDCToPR`, `autoLinkAllDCs`, `attachBuiltyToDC`, `attachMultipleBuiltys`, `performMasterReset` and `resetData` also mutate local state outside an outbox. `DriveSyncModal` calls the legacy DC writer. `firestoreService` exports `syncDriveVerifiedDCFieldsToCloud` and `syncDriveVerifiedPRFulfillmentToCloud`, which perform direct partial writes although no current call site was found. Snapshot cache updates and image hydration also write/read local state separately. Existing rules accept editor PR/DC merge writes without requiring revision increments.

## Why an immediate connection is unsafe

- The prototype now accepts a single PR, a single unlinked DC, or a linked pair, but normal batch operations may involve many records, and linked DC edits need a safe multi-record policy. It still rejects scan-bearing writes and the optional `undefined` fields emitted by normal forms; explicitly review-queued synthetic drafts do not execute.
- `saveDCAndFulfillPR` separately persists local PR and DC lists before returning; it can leave a partial local update. Calling an asynchronous outbox afterward cannot make local preparation atomic or recover a crash between these writes and enqueue. Existing forms expect synchronous boolean results and close their drafts on success; that contract must be changed before persistence can be acknowledged honestly.
- The current deployed-candidate repository rules deny `demo_sync_receipts` entirely. A separate test-only rules proposal and matching synthetic transport now exist; they are not referenced by `firebase.json` and have not passed official emulator tests. See [proposed-sync-rules-review.md](proposed-sync-rules-review.md). Making only the new client revision-aware would not stop legacy writers under the existing rules.
- Current records have no trustworthy, server-enforced revision. Guessing or adopting a revision without reconciliation can overwrite unknown edits. Old records must pause for review under the eventual protocol.
- Keeping a server scan reference in a snapshot does not establish access to its bytes, preserve both representations when they conflict, or secure copied download links. Uploads, relinking and scan migration remain outside this change.

## Prototype improvements in this working copy

- On synthetic revision conflict, the demo outbox retains the attempted command and the server versions read during the failed transaction. There is no portal UI for reviewing them. These snapshots may contain sensitive fields in a real integration, so access control, retention and display must be designed before integrating.
- A later authoritative snapshot no longer drops a remote scan reference solely because the local field is absent or empty; an existing local scan still takes precedence. This is not a scan reconciliation protocol.
- Rules-test setup now checks the demo project and explicit loopback endpoints, and stops if emulators are unavailable. New official-emulator tests assert current rules deny receipts, including attempted forgery or modification. These rules tests remain unverified until run with the official Firestore and Storage emulators.

## Required before connecting normal handlers

1. Design locally and test official rules enforcing authenticated actor-bound immutable receipts, revision transitions and linked writes against all permitted writers. Verify appropriate viewer/editor/admin rights and deny forgery. Existing rules are incompatible.
2. Refactor delivery planning into a pure function and atomically persist an immutable command and local drafts before closing forms. Handle one-record, linked and batch cases; ensure retries reuse the operation ID. Add user-facing pending/synced/conflict/permission-blocked states and preserve both versions for review.
3. Review and migrate every bypassing legacy writer or block it safely; treat existing unversioned records as review-only. Ensure scans are preserved without overwriting or uploading them, including nested references and unresolved local keys.
4. Run actual form tests on two isolated browser profiles with demo-only loopback emulators, including full offline/restart and acknowledgement-loss scenarios. Test real IndexedDB and browser behavior; the current queue tests use `fake-indexeddb` and do not meet that requirement.
5. Obtain separate approval and a verified recoverable backup before any production reconciliation. Nothing in this review changes live rules, roles or deployment.
