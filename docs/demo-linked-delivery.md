# Synthetic Quick Dispatch and PR edit demo — local only

This working-copy experiment connects **Quick Dispatch → `recordDeliveryChallan` → `prepareDCAndFulfillPR` → IndexedDB demo outbox → demo transaction backend**. The existing PR edit form also enqueues a single synthetic PR edit using its form-open revision. It does not connect any production save, batch, other edit, Drive or maintenance path. The demo disables the normal Firebase app and legacy cloud writers. It uses a fixed synthetic PR, never reads the portal's PR/DC localStorage cache, and never uploads scans. Do not use real records or scans.

## Isolation and startup

The switch must be explicit: `VITE_LINKED_DELIVERY_DEMO=true`. A development build, the exact project ID `demo-star-electric`, a browser origin on loopback and a Firestore endpoint of the form `127.0.0.1:PORT` are mandatory. Invalid configuration stops the demo save; it does not fall back to the legacy writer. The dedicated backend always creates its own Firebase app for the fixed demo project and connects to that loopback endpoint. Because the browser must itself access loopback, a remotely hosted preview is not a valid way to use this demo.

For a local-only synthetic experiment with the already-installed third-party emulator (which does **not** enforce Firebase Rules), start it in a separate terminal bound to loopback:

```sh
npx --no-install hidane --host 127.0.0.1 --port 8080 --project_id demo-star-electric --single_project_mode true --single_project_mode_error true
```

In another terminal, set the environment and create the one fixed synthetic PR only if it does not already exist. The seed script refuses an invalid project/endpoint, checks the loopback port, and never overwrites an existing record:

```sh
export VITE_LINKED_DELIVERY_DEMO=true
export VITE_FIREBASE_PROJECT_ID=demo-star-electric
export VITE_DEMO_FIRESTORE_ENDPOINT=127.0.0.1:8080
node scripts/seed-demo-delivery.mjs
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the portal at `http://127.0.0.1:5173`, select `PR-DEMO-1` and use Quick Dispatch. The same synthetic PR can also be edited using the existing PR edit form. Other demo actions are disabled or not integrated. The fixed synthetic PR listener adopts server snapshots for the demo view; an open edit retains its original draft and revision. If the PR changes after opening, its transaction stops for conflict review. Do not reset an emulator or clear browser data to resolve a conflict.

## Behavior and limits

- A form awaits the IndexedDB transaction before closing. Failure keeps its values open. The banner shows **Saved on this device** after enqueue, **Synced** only after the backend acknowledges, and pending/conflict/review/blocked states otherwise.
- The persistent demo outbox is scoped to the emulator port and synthetic fixture variant. It reserves records atomically across tabs, preserves the operation ID, and retries a lost acknowledgement against an immutable operation receipt. The demo view is reconstructed from its queue on reopen; it does not write the normal portal cache. An in-flight lease may take up to 30 seconds to be reclaimed after abrupt closure. Browser storage is not a backup and can be evicted.
- Conflicts retain the attempted edit and the remote record as observed at conflict time in the outbox; expand the banner review to inspect them after reopening. Scan references are withheld in that display. There is no conflict-resolution action or automatic retry for blocked conflicts.
- A PR without a demo revision or with scan fields is retained in review state and not transmitted. To test those synthetic cases separately, set `VITE_DEMO_FIXTURE=legacy` or `VITE_DEMO_FIXTURE=scan`; their queues are distinct. No review-resolution interface is implemented, and a blocked entry intentionally stops the queue. The scan fixture is just an unresolved synthetic reference, not a real scan.
- The demo transaction is unauthenticated and its receipt protocol/rules are experimental. It cannot be used to infer official rules behavior or secure scan access. Existing repository rules do not allow its receipts. The local `rules-tests/proposed-sync.rules` is also unverified and not deployed. **Do not roll out this implementation.**

## Test categories

- `tests/demo-pr-edit-form.test.tsx`: actual PR form/provider with two isolated fake IndexedDB clients and a mocked server, including revision 5 to 6 and durable conflict; not real browser profiles.
- `tests/demo-delivery-form.test.tsx`: actual React form and provider with fake IndexedDB and a mocked transaction transport; not a real browser.
- `tests/demo-sync-emulator.test.ts`: synthetic loopback transaction and lost-acknowledgement tests against `hidane`, which does not implement security rules.
- `tests/demo-outbox.test.ts`: fake-IndexedDB queue, retry and reservation tests.
- Official Firebase authorization/receipt tests remain open: the official emulator download is blocked in this environment. Real-browser two-profile tests remain open: Chromium could not launch due to missing NSS libraries. Neither category is replaced by the passing tests above.
