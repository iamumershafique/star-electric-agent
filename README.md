# React + TypeScript + Vite

**Live portal:** [Open Star Electric Portal](https://star-agent-jpf.web.app)

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Data safety before release

Phase 1 safety work is in progress. The browser device backup is **not a complete disaster-recovery backup**: cloud-only and external scans are not included, and restoring it does not restore Firestore. Do not deploy until Firestore, Storage, and referenced Drive scans have been backed up and a restore verified in an isolated project. See [the Phase 1 safety checklist](./docs/phase-1-safety.md) for limitations and steps.

The application now requires confirmed Firebase authentication by default. Explicit local-only mode is available only in Vite development builds, as described in the safety checklist. Historical seed DCs are no longer automatically inserted or reconciled into the ledger.

## Secure Firebase access

The portal uses Firebase Authentication with email/password accounts created by an administrator. It does not provide public account registration or demo credentials.

Before making the app available:

1. Configure `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_APP_ID` in a local `.env.local` file using the Firebase Web app settings.
2. In Firebase Console, enable the Email/Password sign-in provider and create accounts only for authorized users.
3. Enable the Cloud Firestore API and create the default Firestore database for the project.
4. Inspect the actual Firestore dataset read-only and verify the intended business records and backups before any migration. Do not copy unverified sample records.
5. After reviewing the migrated data, deploy the authentication-gated Firestore rules and Hosting. In Windows PowerShell, run `$env:PORTAL_DATA_RELEASE_APPROVED = 'true'` followed by `npm.cmd run deploy:firebase`; on macOS/Linux, run `PORTAL_DATA_RELEASE_APPROVED=true npm run deploy:firebase`.

Do not publish the app until all five steps are complete. The normal deploy command is blocked unless the data-release approval flag is explicitly set. Firestore data is restricted to authenticated users by [firestore.rules](./firestore.rules).

## Automatic Firebase Hosting deployment

The [Hosting workflow](./.github/workflows/firebase-hosting.yml) runs when a commit reaches `main` or is manually dispatched on `main`. It checks approval, installs the locked dependencies, runs tests and lint, validates the Firebase web configuration, builds, and checks that the triggering commit is still the latest `main` commit before deploying **Hosting only** to `star-agent-jpf`. It does not upload business records, scans, Firestore rules, or Storage rules. A commit arriving during deployment can still allow an older build to deploy briefly; the later queued run will replace it if its checks pass.

The workflow intentionally does not deploy this working branch. Production data safety and restore validation remain incomplete, so deployment is blocked until an administrator completes the [safety checklist](./docs/phase-1-safety.md) and explicitly enables the release gate. Set up GitHub Actions as follows:

1. Add a `FIREBASE_SERVICE_ACCOUNT` repository secret with a service-account JSON key for `star-agent-jpf` authorized for Firebase Hosting deployment. Never commit this key or a business-data backup.
2. Add the correct `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_APP_ID` as Actions repository variables (or secrets). Firebase Web configuration is embedded in the public client; it is not a service-account key.
3. After a recoverable backup and release review, set the Actions repository variable `PORTAL_DATA_RELEASE_APPROVED` to `true`. Leave it unset while the safety work remains unfinished.
4. Review and merge changes into `main` when ready. Check the Actions run and live Hosting version; a branch push alone does not deploy. A workflow run cannot operate until the required secrets, variables, and permissions are configured.

An app deployment is **not** a data backup or migration. PR/DC cloud operations have known limitations; see [sync safety](./docs/phase-2-sync.md). Firestore and Storage security rules need separate review and an explicitly authorized deployment. Feature branches named `arena/*` do not automatically open pull requests.

## Claude PR/DC database audit

An administrator can configure an Anthropic Claude API key or an AgentRouter token in Portal Settings and run **Claude Full PR/DC Audit** from **AI Assistant → Overview & AI Audit**. AgentRouter takes precedence when configured and uses its OpenAI-compatible chat completions endpoint with the exact vision-capable model ID entered in Settings. AgentRouter supports image scans in this audit; PDF scans are reported but not sent through this endpoint. Record details and scans are sent to AgentRouter and may be forwarded to the selected provider; charges use the AgentRouter account. Direct Anthropic uses Claude Haiku 4.5. The lower-cost model can miss details, so verify findings against original documents. API usage may incur charges. Keys are kept in that browser's local storage; do not use shared devices.

The audit is read-only. It reports document types, printed references, and discrepancies. A DC-to-PR suggestion is offered only when the scan is classified as a delivery challan, Claude reads a PR number explicitly printed on it, that number exactly matches one unambiguous PR in the portal, and model confidence is at least 80%. Review the original scan and explicitly approve each suggestion before it changes the portal. Missing/unavailable scans and uncertain classifications are reported rather than guessed. Do not treat model findings as verified accounting records.
Do not test unreleased code against the real ledger until the safety checklist is complete. Use an isolated Firebase project and synthetic records for testing.

## Local AI with Ollama (OCR and PR/DC audit)

PR, DC and builty scans are read by a vision model running in Ollama on the user's own PC. Gemini is used only as a fallback when Ollama is disabled, unreachable, times out, or cannot read a scan. OpenAI, Anthropic Claude and AgentRouter support has been removed; any keys previously saved for them are deleted from the browser on the next load.

One-time setup on each PC that will scan documents (Windows):

1. Install Ollama from ollama.com.
2. Pull the vision model: `ollama pull qwen2.5vl:3b` (CPU-only PCs). With an NVIDIA GPU of 8 GB or more, `qwen2.5vl:7b` is more accurate.
3. Allow the portal to call Ollama, then quit Ollama from the tray and start it again:
   `setx OLLAMA_ORIGINS "https://star-agent-jpf.web.app,http://localhost:5173"`
4. In the portal, open **Settings → Local Ollama**, tick **Use Ollama**, and click **Save & Test Connection**. If Chrome asks to allow access to devices on the local network, allow it.

Ollama only serves the browser on the same PC. Staff on other PCs fall back to Gemini unless they run Ollama too.

### Scan speed (`Settings → Local Ollama → Scan read quality`)

Scan time is dominated by how much image the model has to look at and by how much prompt text is
sent with it, so both are configurable:

| Setting | Image side | When to use |
| --- | --- | --- |
| Fast | 896 px | Clean printed challans on a slow CPU (~2× faster than the old setting). |
| Balanced (default) | 1152 px | Recommended; ~26% fewer vision patches than the old fixed 1344 px with the same readability for the Star Electric forms. |
| Accurate | 1536 px | Faint or heavily handwritten scans, after a failed read. |

Other speed work: the local model is warmed up when an upload window opens (so the first scan does
not pay the 10-60 s model load), the PR register sent to the challan reader is a compact
`PR number | site` list instead of every line item (≈4 500 fewer prompt tokens per challan), and
multi-file Gemini batches now run up to 3 documents in parallel with the working model remembered for
the session. See [docs/portal-bug-and-scan-performance-report.md](./docs/portal-bug-and-scan-performance-report.md)
for the full bug list and measurements.

On a CPU-only PC expect roughly 40–90 seconds per scan. PDFs are rendered to images in the browser (first 3 pages) before they are sent to the model.

**Local PR/DC document audit** (AI Assistant → Overview & AI Audit) compares saved records with their attached scans, one scan per request. Choose a scope (unlinked DCs, a date range, or everything); records without a scan are reported without calling the model, and a run can be stopped at any time with the results so far kept. The audit is read-only. A DC-to-PR link is proposed only when the scan is classified as a delivery challan, a PR number is explicitly printed on it, that number exactly matches one PR in the portal, and model confidence is at least 80%. Review the original scan and approve each proposal before it changes the portal. Small local models miss details, so verify findings against the original documents.
