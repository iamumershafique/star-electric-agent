# Drive sync: local review only

## Traced behavior in this checkout

The pre-fix `DriveSyncModal.handleStartSync` did **not** read the selected folder when the optional links box was blank: it substituted the hard-coded `RECENT_DRIVE_SCANS` list. Thus this checkout alone does not establish that the screenshot's folder ID entered that blank-input branch. The prior `parseDriveLinksText`, when given a folder ID or URL, treated every ID as a file; its DC-number parser fell back to the first digits found anywhere in the input, including the ID. It then generated a `.jpg` filename from that number and generated a download URL from the same ID. A leading digit of 1 therefore became `DC-1.jpg`. The service caught download failures and returned them in `errors`, but the modal ignored that result and unconditionally displayed a success banner. No screenshot or deployed bundle was available here to establish precisely how the screenshot's ID reached that parser.

## Current local behavior

Manual sync and opt-in in-tab polling both call the same Drive input resolver. A selected folder is listed via the Drive API; URL folder inputs are listed and bare IDs are resolved by metadata first. The resolver follows every page, filters supported JPEG, PNG, WebP and PDF files, and aborts on a failed or malformed listing before downloading anything. File metadata supplies the real name; no number or name is inferred from a URL, ID or list position. If neither metadata nor OCR identifies a DC, the scan requires review rather than being assigned an invented number. Folder/metadata errors and scan errors are generic; they do not expose IDs or links in the banner/activity log.

Polling is browser-tab-only and must be explicitly enabled and saved in each tab session. A previously saved flag does not silently start it. It stops when the tab closes, and it is disabled in the synthetic delivery demo. The separate `npm run drive:watch` entry point runs `scripts/driveSyncDaemon.cjs`; it now uses the same resolver in `src/lib/driveScanResolver.mjs`. It is independent of the browser polling timer.

Discovery and downloads require Drive API v3 access configured via `VITE_GOOGLE_DRIVE_API_KEY`, limited to data accessible to that key. This repository has no Drive OAuth flow for private folders. An unset key fails closed. Actual Drive API access, CORS, permissions and PDF previews were not verified against live Drive. Restrict any browser key appropriately; do not put credentials or real links into tests. These changes do not make the legacy OCR-to-DC writer revision-safe or production-ready.

## Synthetic verification

`tests/drive-sync-modal.test.tsx` uses the actual React modal and sync service with mocked Drive HTTP responses, OCR, and cloud/state writers. It covers selected folder with blank links, pagination, direct metadata, bare-ID type resolution, empty/listing failure, failed download, partial failure, preserved scan reference, review for unidentified DC, and opt-in polling. It does not contact Drive, AI, or Firestore. Quick Dispatch's existing mocked-client regression remains separate.

## Watcher dry-run and safety

Set `DRIVE_FOLDER_ID` to the intended folder ID or folder URL, or set `DRIVE_INPUT` to file/folder URLs or IDs (newline or comma separated). `DRIVE_INPUT` takes precedence; bare IDs are resolved by metadata. Configure `GOOGLE_DRIVE_API_KEY` (or `VITE_GOOGLE_DRIVE_API_KEY`) for the Drive API. Values must be supplied privately in the environment, not pasted into logs or tests. There is no default real folder. For one discovery-only cycle run:

```sh
npm run drive:watch -- --dry-run --once
```

Dry-run lists candidate ordinals and supported MIME types and counts only. It does not download media, instantiate AI or Firebase clients, invoke OCR or write records. It is not an offline simulation: with real configuration it would contact Drive metadata/list APIs. Without `--once` it polls repeatedly; a listing error exits nonzero without falling back to download. Logs intentionally omit scan names, IDs, links, and raw provider errors.

The non-dry watcher requires explicit Drive, Gemini and Firebase configuration and editor sign-in. It still writes outside the experimental outbox and is **not revision-safe or approved for production**; this work did not access live Drive or Firestore. `tests/drive-watcher-entry.test.ts` launches the real npm entry for one cycle using a network-denying subprocess preload with synthetic Drive responses, synthetic AI and a fake Firebase writer; no daemon remains running.
