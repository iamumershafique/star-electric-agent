/**
 * Normalise siteName on star_prs / star_dcs to the canonical names in src/data/siteMaster.json.
 *
 * Dry run (default, writes nothing, produces a CSV report):
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run sites:merge
 * Apply confirmed merges (review=false entries only):
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run sites:merge -- --apply
 * Roll back an applied run (restores siteNameOriginal):
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run sites:merge -- --rollback
 *
 * The service account key comes from Firebase console > Project settings > Service accounts.
 * Never commit it (service-account*.json is gitignored).
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { mkdirSync, writeFileSync } from 'node:fs';
import master from '../src/data/siteMaster.json' with { type: 'json' };
import { siteKey } from '../src/lib/utils';

type Entry = { name: string; review: boolean; note?: string; aliases: string[] };
const sites = (master as { sites: Entry[] }).sites;

const confirmed = new Map<string, string>();
const proposed = new Map<string, { name: string; note?: string }>();
for (const s of sites) {
  const target = s.review ? proposed : confirmed;
  for (const alias of [s.name, ...s.aliases]) {
    const k = siteKey(alias);
    if (s.review) proposed.set(k, { name: s.name, note: s.note });
    else (target as Map<string, string>).set(k, s.name);
  }
}

const APPLY = process.argv.includes('--apply');
const ROLLBACK = process.argv.includes('--rollback');
const COLLECTIONS = ['star_prs', 'star_dcs'] as const;

initializeApp({ credential: applicationDefault(), projectId: 'star-agent-jpf' });
const db = getFirestore();

const csv = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

async function main() {
  const rows: string[] = ['collection,docId,record,currentSite,action,newSite,note'];
  const writes: { ref: FirebaseFirestore.DocumentReference; data: Record<string, unknown> }[] = [];
  const summary: Record<string, number> = {};

  for (const col of COLLECTIONS) {
    const snap = await db.collection(col).get();
    for (const doc of snap.docs) {
      const d = doc.data();
      const record = d.prNumber && col === 'star_prs' ? d.prNumber : d.dcNumber || doc.id;
      const current = String(d.siteName || '').trim();

      if (ROLLBACK) {
        if (typeof d.siteNameOriginal === 'string') {
          writes.push({ ref: doc.ref, data: { siteName: d.siteNameOriginal, siteNameOriginal: FieldValue.delete() } });
          rows.push([col, doc.id, record, current, 'rollback', d.siteNameOriginal, ''].map(csv).join(','));
        }
        continue;
      }

      const k = siteKey(current);
      const canonical = confirmed.get(k);
      if (canonical && canonical !== current) {
        writes.push({ ref: doc.ref, data: { siteName: canonical, siteNameOriginal: d.siteNameOriginal ?? current } });
        rows.push([col, doc.id, record, current, 'rename', canonical, ''].map(csv).join(','));
        summary[`${current} -> ${canonical}`] = (summary[`${current} -> ${canonical}`] || 0) + 1;
      } else if (!canonical && proposed.has(k)) {
        const p = proposed.get(k)!;
        rows.push([col, doc.id, record, current, 'NEEDS DECISION', p.name, p.note].map(csv).join(','));
        summary[`[review] ${current} -> ${p.name}?`] = (summary[`[review] ${current} -> ${p.name}?`] || 0) + 1;
      }
    }
  }

  mkdirSync('scripts/out', { recursive: true });
  const file = `scripts/out/site-merge-${ROLLBACK ? 'rollback' : APPLY ? 'applied' : 'dry-run'}-${Date.now()}.csv`;
  writeFileSync(file, rows.join('\n'));

  console.table(Object.entries(summary).sort((a, b) => b[1] - a[1]).map(([change, records]) => ({ change, records })));
  console.log(`${writes.length} record(s) ${APPLY || ROLLBACK ? 'to write' : 'would change'}. Report: ${file}`);

  if (!APPLY && !ROLLBACK) {
    console.log('Dry run only. Re-run with --apply to write confirmed merges.');
    return;
  }
  for (let i = 0; i < writes.length; i += 400) {
    const batch = db.batch();
    writes.slice(i, i + 400).forEach(w => batch.update(w.ref, w.data));
    await batch.commit();
    console.log(`Committed ${Math.min(i + 400, writes.length)}/${writes.length}`);
  }
  console.log('Done. Open the portal and refresh; clients pick the new names up from the live snapshot.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
