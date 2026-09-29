# React + TypeScript + Vite

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

## Secure Firebase access

The portal uses Firebase Authentication with email/password accounts created by an administrator. It does not provide public account registration or demo credentials.

Before making the app available:

1. Configure `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_APP_ID` in a local `.env.local` file using the Firebase Web app settings.
2. In Firebase Console, enable the Email/Password sign-in provider and create accounts only for authorized users.
3. Enable the Cloud Firestore API and create the default Firestore database for the project.
4. Import and verify the intended business records in Firestore. The current database is empty; do not copy unverified sample records.
5. After reviewing the migrated data, deploy the authentication-gated Firestore rules and Hosting. In Windows PowerShell, run `$env:PORTAL_DATA_RELEASE_APPROVED = 'true'` followed by `npm.cmd run deploy:firebase`; on macOS/Linux, run `PORTAL_DATA_RELEASE_APPROVED=true npm run deploy:firebase`.

Do not publish the app until all five steps are complete. The normal deploy command is blocked unless the data-release approval flag is explicitly set. Firestore data is restricted to authenticated users by [firestore.rules](./firestore.rules).

## Local AI with Ollama (OCR and PR/DC audit)

PR, DC and builty scans are read by a vision model running in Ollama on the user's own PC. Gemini is used only as a fallback when Ollama is disabled, unreachable, times out, or cannot read a scan. OpenAI, Anthropic Claude and AgentRouter support has been removed; any keys previously saved for them are deleted from the browser on the next load.

One-time setup on each PC that will scan documents (Windows):

1. Install Ollama from ollama.com.
2. Pull the vision model: `ollama pull qwen2.5vl:3b` (CPU-only PCs). With an NVIDIA GPU of 8 GB or more, `qwen2.5vl:7b` is more accurate.
3. Allow the portal to call Ollama, then quit Ollama from the tray and start it again:
   `setx OLLAMA_ORIGINS "https://star-agent-jpf.web.app,http://localhost:5173"`
4. In the portal, open **Settings → Local Ollama**, tick **Use Ollama**, and click **Save & Test Connection**. If Chrome asks to allow access to devices on the local network, allow it.

Ollama only serves the browser on the same PC. Staff on other PCs fall back to Gemini unless they run Ollama too.

On a CPU-only PC expect roughly 40–90 seconds per scan. PDFs are rendered to images in the browser (first 3 pages) before they are sent to the model.

**Local PR/DC document audit** (AI Assistant → Overview & AI Audit) compares saved records with their attached scans, one scan per request. Choose a scope (unlinked DCs, a date range, or everything); records without a scan are reported without calling the model, and a run can be stopped at any time with the results so far kept. The audit is read-only. A DC-to-PR link is proposed only when the scan is classified as a delivery challan, a PR number is explicitly printed on it, that number exactly matches one PR in the portal, and model confidence is at least 80%. Review the original scan and approve each proposal before it changes the portal. Small local models miss details, so verify findings against the original documents.
