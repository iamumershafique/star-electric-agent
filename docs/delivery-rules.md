# Delivery entry and search — work in progress

The chosen business rules are: a PR is fulfilled only when every non-cancelled item has reached its requested quantity; partial deliveries remain in progress. Overdeliveries require user confirmation, after which the actual quantity is retained. Scanned product matching requires a unique match on complete name, brand and unit (case and whitespace are normalized). Missing or ambiguous fields stay as DC-only items and do not fulfill a PR. Explicit PR line-item selection in quick dispatch uses the selected item ID.

The new-delivery path checks duplicate DC numbers, including numbers already present in PR logs, contradictory PR references, duplicate item IDs, invalid quantities, and discrepancies between existing PR quantities and fulfillment logs. It validates an entire draft batch before beginning, including projected overdelivery across the batch. It does not repair historical inconsistencies automatically. The user must resolve them after verifying source documents. Saving a PR no longer runs a bulk auto-link of old DCs.

Search includes a DC-item history with unlinked items and separate brand and unit information, as well as the older PR fulfillment-log table. It is limited to records available in the current app, not proof of a complete cloud history or delivery receipt. Date filters omit entries whose dates cannot be compared; PR status filters do not apply to DC-item history.

## Safety limitations

- Linked DC quantity/reference edits are temporarily blocked; metadata edits do not rewrite historical PR logs. Other legacy linking, deletion, import, and batch tools still require review. Do not use them for production reconciliation.
- Batch delivery is prevalidated but not atomic: a local storage failure can leave part of a batch or its PR/DC pair saved. A warning tells the user to inspect the ledger before retrying. Multi-record Firestore writes are also independent, and conflicting edits from another device are not resolved.
- Firestore listeners preserve differing local records and show warnings, but do not resolve conflicts; local caches may not include the full ledger. Concurrent writes can still overwrite one another. Scan uploads and cloud retries are not fully reliable. Read [sync safety](./phase-2-sync.md) and complete [backup and release checks](./phase-1-safety.md) before any production release.
- These changes were tested with synthetic records only. No existing production records have been migrated, relinked, or corrected.
