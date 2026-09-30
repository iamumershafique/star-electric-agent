# Deploy runbook — taking the updated portal live

Everything here is run **from the PC that has the Firebase login** (`firebase login` as an account
with access to project `star-agent-jpf`). The build is already verified on this branch: `npm run build`
succeeds (`tsc -b` + Vite, no type or lint errors).

The `deploy:*` scripts use the `firebase` CLI installed by `npm ci` (pinned to the version in
`devDependencies`) instead of downloading `firebase-tools@latest` mid-release.

## 0. One-time checks

```powershell
# Windows PowerShell, from the repository folder
git fetch origin
git checkout main
git pull                      # after the PR is merged
npm ci
npx firebase-tools login:list    # must show your account
npx firebase-tools use star-agent-jpf
```

## 1. Deploy to a preview channel first (safe, no data or rules touched)

```powershell
npm run deploy:staging
```

This builds the app and publishes it to a temporary Firebase Hosting preview channel, printing a URL
like `https://star-agent-jpf--preview-xxxx.web.app` (expires after 7 days). Open it and sign in — it
runs against the **real** Firestore, so it is the true dress rehearsal.

> Firestore **rules are not deployed** by this command, so nothing about data access changes.

Sanity checks on the preview URL:

- [ ] Sign-in works and the Dashboard shows the usual PR/DC counts.
- [ ] **Delivery log** → open a DC that has a scan: the image still loads (comes from `star_scans`).
- [ ] **Settings → Local Ollama** shows the new **Scan read quality** selector (Fast / Balanced / Accurate).
- [ ] **Scan Demand Requisition** with one old demand sheet → PR number and items come out as before.
- [ ] **Delivery Challan → Scan DC Image(s)** with one old challan → the extracted rows now match the
      requisition wording, and saving the DC increases the PR's fulfilled quantity (open the PR to confirm).
- [ ] Re-save an existing DC number → an inline red error appears and the window **stays open** with your
      draft (previously it closed and the draft was lost).

## 2. Production

```powershell
$env:PORTAL_DATA_RELEASE_APPROVED = 'true'
npm run deploy:firebase
Remove-Item Env:\PORTAL_DATA_RELEASE_APPROVED
```

That command deploys **Firestore rules** and then **Hosting**. The approval flag exists on purpose
(the script refuses to publish without it) — set it only after the preview channel looks right.

On macOS/Linux the same step is:

```bash
PORTAL_DATA_RELEASE_APPROVED=true npm run deploy:firebase
```

## 3. Verify the live site actually updated

Two checks, the second one cannot be faked by a cached page:

1. `npm run build` prints the bundle name (e.g. `dist/assets/index-XXXXXXX.js`). Open
   `https://star-agent-jpf.web.app`, then DevTools → Network → filter `index-` and confirm the browser
   loaded that exact file name. If it is still the old name, hard-refresh (Ctrl+F5) — Firebase Hosting
   already sends `no-cache` for `index.html`.
2. Functional check: **Settings → Local Ollama** now contains a **Scan read quality** dropdown. That
   control exists only in this release.

## 4. Roll back if something is wrong

```powershell
npx firebase-tools hosting:rollback
```

Hosting keeps the previous release, so this restores the old bundle within about a minute. Rules can be
reverted by `git checkout <previous commit> -- firestore.rules` and re-running the rules deploy — the
rules in this branch are unchanged from `main`.

## Notes

- **Ollama does not need re-configuring.** The portal origin (`https://star-agent-jpf.web.app`) is
  unchanged, so the existing `OLLAMA_ORIGINS` setting keeps working.
- **Nothing in this release rewrites existing records.** It changes how scans are read and how DCs are
  saved; already-stored PR/DC data and scans are untouched.
- The new scan-quality setting defaults to **Balanced (1152 px)**. If staff report that fine handwriting
  is missed, switch those PCs to **Accurate (1536 px)** in Settings; if they want more speed, **Fast**.
- Staff should re-select the same photo if Chrome asks for local-network permission again — unrelated to
  this release, but a common support question after any deploy.
