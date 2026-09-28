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

## Claude PR/DC database audit

An administrator can configure an Anthropic Claude API key or an AgentRouter token in Portal Settings and run **Claude Full PR/DC Audit** from **AI Assistant → Overview & AI Audit**. AgentRouter takes precedence when configured and uses its OpenAI-compatible chat completions endpoint with the exact vision-capable model ID entered in Settings. AgentRouter supports image scans in this audit; PDF scans are reported but not sent through this endpoint. Record details and scans are sent to AgentRouter and may be forwarded to the selected provider; charges use the AgentRouter account. Direct Anthropic uses Claude Haiku 4.5. The lower-cost model can miss details, so verify findings against original documents. API usage may incur charges. Keys are kept in that browser's local storage; do not use shared devices.

The audit is read-only. It reports document types, printed references, and discrepancies. A DC-to-PR suggestion is offered only when the scan is classified as a delivery challan, Claude reads a PR number explicitly printed on it, that number exactly matches one unambiguous PR in the portal, and model confidence is at least 80%. Review the original scan and explicitly approve each suggestion before it changes the portal. Missing/unavailable scans and uncertain classifications are reported rather than guessed. Do not treat model findings as verified accounting records.
