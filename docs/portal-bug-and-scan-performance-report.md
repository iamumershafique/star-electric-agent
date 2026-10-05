# Portal bug report & PR/DC scan performance review

Date: 2026-09-30 · Scope: PR / DC / builty scanning, delivery recording, local storage, cloud sync
Files reviewed: `src/lib/{aiOcr,gemini,ollama,storage,imageStorage,dcLayout,utils}.ts`,
`src/context/AppContext.tsx`, `src/components/{PRUploadModal,PRReviewModal,DCUploadModal,BuiltyUploadModal,QuickDispatchModal,SettingsModal,ScanImportPanel,GeminiDiagnosticsView}.tsx`

---

## Part 1 — Bugs found

### FIXED in this branch

#### B1. Fuzzy item matching never matched (broken Levenshtein) — **high**
`src/components/DCUploadModal.tsx:74` (old) — the cost row of the edit-distance routine was never
re-initialised for the first column, so distances were grossly overestimated:

| pair | old distance | correct | old similarity | matched? |
|---|---|---|---|---|
| `limit switch` vs `lint switch` | 9 | 1 | 0.25 | no |
| `EOCR relay Schneider` vs `EOCR - Electronic Overload control Relay Schneider` | 16 | 1 | — | no |
| `pvc insulation tape` vs `pvc insulation tap` | 17 | 1 | 0.06 | no |

Effect: a scanned challan row almost never matched the requisition row (threshold 0.8), so the DC
was saved with `item-scanned-…` ids that `saveDCAndFulfillPR` ignores. **Scanning a DC did not
increase the PR's fulfilled quantity**, PRs stayed `Pending`, and the DC showed the challan text
instead of the requisition's wording. Only byte-identical names matched.

Fixed in `src/lib/itemMatch.ts`: correct rolling-row Levenshtein, word-overlap scoring
("EOCR relay Schneider" now matches the long form at 0.875), plus a unit/dimension guard so
`Cable 4mm` never matches `Cable 6mm` and `MCCB 100A` never matches `MCCB 200A`.
Verified with a table of 12 realistic pairs (see "Verification" below).

#### B2. Wrong scan attached to extracted records — **high**
`PRUploadModal.tsx` / `DCUploadModal.tsx` attached `files[i].base64` by *result* index. One demand
sheet page can hold several PR numbers (the prompts are built for that), so `resultList` is often
longer than the file list: PR #2 and #3 of a page were given `files[1]`, `files[2]` … i.e. another
document's photo, or the first page as a fallback.

Fixed by returning the source page with every extraction (`processDocumentWithGemini`,
`processDocumentWithOllama`, `processDCWithGemini`, `processDCWithOllama` now set
`documentImage`), and the modals prefer it with the old mapping only as a fallback.

#### B3. Validated challans were silently thrown away — **high**
`DCUploadModal.tsx:handleSubmitSingle` called `recordDeliveryChallan(...)`, which `alert()`-ed and
`return`ed on a duplicate DC number. The modal then removed the draft (or closed) regardless — the
user's reviewed work disappeared. The same applied to `QuickDispatchModal`. In the other direction,
`recordMultipleDeliveryChallans` did not check duplicates at all, so "Save All" happily wrote
challans that were already in the ledger.

Fixed: both actions now return `{ success, error }` / `{ savedCount, skipped }`; the DC window keeps
the draft and shows the reason, and batch saves skip (and report) numbers that already exist instead
of duplicating them.

#### B4. Scan quality/size was hard-coded, and the model was never warmed — **performance**
See Part 2.

#### B5. Fabricated fallback records shipped in the bundle — **medium (data integrity risk)**
`src/lib/gemini.ts` exported `createFallbackSingleDC()` and `simulateBuiltyExtraction()`, which
return realistic-looking but invented challans (fake DC numbers, items, freight amounts). They were
unused, but one call site away from writing fiction into the ledger. Removed.

#### B6. Silent file-read failures — **medium**
`PRUploadModal.addFiles()` swallowed `FileReader` errors, so an unreadable photo simply vanished from
the batch (the reviewer then saw fewer documents than they selected and no explanation). Reads are
now parallel and failures are reported in the window.

#### B7. Brand of Terasaki breakers was wrong — **medium**
`src/lib/utils.ts:normalizeBrand()` tested `mcb`/`mccb` before `terasaki`, so
"MCCB 630Amp 36kA … Terasaki Japan model E-630NE" was tagged **Schneider Electric** and counted in
the wrong brand analytics. Brand names are now checked before generic component types.

#### B8. Review screen shipped an invented line item — **medium**
`PRReviewModal` replaced an empty extraction with a hard-coded `95mm 4-Core Armoured Copper Cable,
200 Meters` row, which was then saved as a real demand. The draft is now empty with a warning banner,
and saving is blocked until a description (and a positive quantity) is entered.

#### B9. Duplicate warning was stale across tabs — **low**
The warning was stored in state and only recalculated while typing, so switching between the
extracted PRs showed the previous requisition's status. It is now derived from the draft on screen
(cheap, because the check no longer hits localStorage — see B10).

#### B10. Duplicate check re-parsed the whole database on every keystroke — **medium (slowness)**
`verifyAndCheckDuplicate` → `checkDuplicatePR` → `getPRs()`, which parses all PRs, re-hydrates every
scan from IndexedDB memory and can trigger `saveAllPRs`. Typing a PR number = one full database pass
per character. It now checks the PRs already in React state.

#### B11. Backup import could corrupt storage — **medium**
`importBackupJSON` wrote `JSON.stringify(prs)` straight into `localStorage`. A backup contains base64
scans, which blows the 5 MB quota mid-write and leaves PRs/DCs inconsistent (and skips the
IndexedDB/Firestore path every other writer uses). It now goes through `saveAllPRs`/`saveAllDCs` and
reports failure instead of pretending to succeed.

#### B12. Builty scans ran with no progress feedback — **low**
`processBuiltyWithAI` dropped its progress callback, so scanning 15 builty photos looked frozen.
Progress is now wired through to the window.

#### B13. Cloud login redid the whole local database pass — **medium (slowness)**
The single `useEffect([isAuthenticated])` re-ran `initImageMemory()` (loading every stored scan into
memory), `autoLinkPRsAndDCsInStorage()` and a full `getPRs()`/`getDCs()` re-read on every sign-in and
overwrote in-memory state with the storage snapshot. Split into a one-time init effect and an
auth-only cloud sync/subscription effect.

#### B14. Every ledger save rewrote every scan to IndexedDB — **performance**
`saveAllPRs`/`saveAllDCs` walk all records; `getPRs()`/`getDCs()` re-hydrate `indexeddb:` references
back into full data URLs, so each save re-put **every** stored scan (hundreds of transactions) plus a
Firestore-upload check. `saveImageToMemory` now skips the write when the identical scan (content +
metadata) is already persisted this session, seeded from the images loaded at startup.

### FOUND, NOT FIXED (recommended follow-ups)

| # | Where | Issue | Suggested fix |
|---|---|---|---|
| N1 | `src/lib/storage.ts` (`getPRs`, `getDCs`, `saveAllPRs`, `saveAllDCs`, `autoLinkPRsAndDCsInStorage`) | Every read/write does `JSON.parse`/`JSON.stringify` of the full ledger and several passes over it; `savePR()` alone does `getPRs()` + `saveAllPRs()` + `autoLink…()` (two more full reads). With 686 DCs this is the main remaining jank in saving. | Keep an in-memory store as the source of truth, persist on a debounce, and version-write. |
| N2 | `AppContext` cloud subscriptions | Every Firestore snapshot (initial + each remote edit) runs `saveAllPRs`/`saveAllDCs` over the entire merged list, re-serialising everything and re-walking images. | Merge only changed docs; debounce the persist. |
| N3 | `getDCs()` seed merge | Any stored list shorter than 686 records is merged with the seed ledger and written back, even for a deliberate deletion/trim. | Move the migration behind the existing version flag instead of a length check. |
| N4 | `gemini.ts` classification | A document classified `OTHER`/`UNCLEAR` that happens to contain line items is still accepted as a PR ("flexible" behaviour), so a builty photo uploaded to the PR window can become a junk requisition. | Require `PURCHASE_REQUISITION` or a printed PR number, and show the rejected page to the user. |
| N5 | `DCUploadModal` item matching | With B1 fixed, matches at 0.80–0.85 (e.g. generic descriptions) can still be wrong; the reviewer can override by re-selecting the PR. | Persist the match score in the draft and flag low-confidence matches in the UI. |
| N6 | `exportBackupJSON` | The backup embeds every base64 scan, producing very large JSON files. | Export scan references, and offer scans as a separate archive. |
| N7 | `GeminiDiagnosticsView` | "Each scan takes about a minute" estimate ignores the new scan-quality setting. | Show the estimate for the configured quality. |
| N8 | `createFallbackSingleDC`/`simulateBuiltyExtraction` removal | If any external tooling imported them, it will break (none in this repo). | — |

---

## Part 2 — Why PR/DC scanning was slow, and what changed

### 2.1 The PR register was re-sent with every challan (biggest single win)

`DCUploadModal` built the "PR memory" prompt as *every line item of the first 50 PRs*
(~17 700 characters ≈ 5 000 tokens) and sent it with **each** uploaded challan. On a CPU-only PC
prefill runs at roughly 50-150 tokens/s, i.e. **20-90 seconds of every scan was spent re-reading the
PR register**, and the model never needed it: the list only validates a handwritten number it has
already read.

`buildKnownPRMemory()` (`src/lib/dcLayout.ts`) now sends `PR number | site` lines, de-duplicated and
hard-capped at 3 000 characters. Measured with a 200-PR dataset:

```
old memory: 17669 chars (~5048 tokens)
new memory:  1763 chars (~ 504 tokens)
saving:     ~4545 prompt tokens per challan
```

### 2.2 Gemini batches were serial with an artificial delay

* Files were sent one at a time with a fixed 300 ms sleep → now up to **3 documents in flight**
  (`GEMINI_FILE_CONCURRENCY`), with a shared `RequestGate` that pauses the whole batch for 4 s when
  the API answers 429 (so concurrency cannot turn into a retry storm).
* `generateWithFallback` walked the full `CANDIDATE_MODELS` list from the top for **every document**.
  If the first four models are not enabled for a key, every upload paid four failed round trips
  (a 20-file batch: 80 wasted calls). The model that answered is now remembered per API key.
* Each call now has a 120 s timeout, so one hung request cannot stall the whole batch, and thinking is
  switched off where the model supports it (`thinkingBudget: 0` for 2.5, `thinkingLevel: LOW` for 3.x)
  with an automatic retry if a model rejects the field.
* An invalid API key now fails immediately instead of probing five models.

### 2.3 Local model cold-start was on the critical path

The first scan of a session paid the model load (10-60 s on CPU). The upload windows now warm the
model when they open (`preloadLocalOCRModel` → `POST /api/generate`, 1 token, `keep_alive: 20m`), and
Settings warms it after "Save & Test Connection". If Ollama is off/wrong port, the batch now switches
to Gemini after two consecutive connection failures instead of paying a failed round trip per file.

### 2.4 Images sent were larger than the model needed

* Image side is now a setting — **Fast 896 px / Balanced 1152 px (default) / Accurate 1536 px** —
  instead of a hard-coded 1344 px. Vision patch count scales with the square of the side:
  1344 px ≈ 2 304 patches, 1152 px ≈ 1 694 (−26%), 896 px ≈ 1 024 (−56%).
* PDF pages are rendered at the same setting (they were always rendered at 1344 px, upscaling small
  pages), and images that are already small JPEGs are no longer decoded and re-encoded.
* Context window is now sized from the real payload (`prompt + patches + answer budget`) instead of a
  flat 8 192/12 288 tokens; small jobs run at 4 096, which cuts KV memory and prefill cost.
* Documents are prepared (canvas / PDF render) with 3-way concurrency **before** the model loop and
  cached, so the CPU is not idle while the model works.

### 2.5 The document audit could not reuse anything

`runOllamaDatabaseAudit` now prefetches the next record's scan (IndexedDB/Firestore) while the model
is reading the current one, and reuses the prepared-page cache instead of re-rendering scans.

### 2.6 Other hot paths

* `saveImageToMemory` no longer rewrites unchanged scans on every ledger save (B14).
* `verifyAndCheckDuplicate` no longer re-parses localStorage per keystroke (B10).
* Sign-in no longer reloads every stored scan and re-runs the local reconciliation (B13).

### 2.7 Expected effect (per document, CPU-only Ollama, `qwen2.5vl:3b`)

| Change | Saving |
|---|---|
| Compact PR register | 20-90 s (prompt prefill) |
| Balanced image side (−26% patches) | ~15-25% of vision time |
| Fast image side (−56% patches) | ~40-50% of vision time |
| Model warm-up | 10-60 s on the first scan of a session |
| Gemini: parallel files + remembered model | ~2-3× batch throughput; 4 fewer calls per file when the first models are unavailable |
| No re-render/re-encode of prepared scans | 0.3-1 s per file |

---

## Verification performed

* `npx tsc -b` and `npx oxlint` clean; `npm run build` succeeds.
* `src/lib/itemMatch.ts` — 12 realistic PR/challan pairs, including 3 pairs that must **not** match
  (different cable size, different breaker rating, different switch type): all behave as expected;
  `levenshteinDistance('kitten','sitting') === 3`.
* `src/lib/concurrency.ts` — concurrency cap, result ordering, error propagation, empty input and the
  rate-limit gate were exercised with a small harness.
* `buildKnownPRMemory` — measured against the previous prompt builder (numbers in 2.1).

Not verified end-to-end: browser OCR against real scans and a live Ollama/Gemini endpoint (no model
or credentials in this environment). The upload flows should be tried once with a few challans and
demand sheets before a wide rollout.
