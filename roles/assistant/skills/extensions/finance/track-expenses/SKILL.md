---
name: track-expenses
description: Log expenses from receipts, email, and statements — categorize, flag anomalies, summarize monthly.
when_to_use: >
  User forwards a receipt, pastes an expense line, or imports a statement.
  Also on a daily/weekly cadence to sweep email for transaction confirmations.
tools:
  - mcp: gmail
---

# Track Expenses

Expense tracking that actually happens because it requires zero willpower. The agent ingests from whatever channel the user already uses and keeps a clean ledger.

## How It Works

1. **Ingest.** Accept input as:
   - email forward (receipt, statement confirmation)
   - pasted text / image of receipt
   - CSV/OFX from a bank export
   - conversational ("I spent 40 on dinner last night")
2. **Extract** a normalized record:
   ```
   - id: exp-2026-04-17-001
     date: 2026-04-17
     amount: 42.80
     currency: USD
     merchant: Cafe Gratitude
     category: dining
     payment_method: visa-4421
     source: email  # or photo, manual, import
     note: dinner with Sam
   ```
3. **Categorize** using the user's category list from `memory/finance/categories.yaml`. If unknown, ask once and remember the mapping for that merchant.
4. **Detect anomalies** on each new entry:
   - merchant never seen before AND amount > 2× category median → flag
   - duplicate within 48h same merchant+amount → flag as possible double-charge
   - category already over monthly budget → link to `budget-alerts`
5. **Monthly summary** on the 1st of each month:
   - total by category (vs prior month delta)
   - top 5 merchants by spend
   - anomalies that weren't reviewed
6. **Store** to `memory/finance/ledger/YYYY-MM.md` (append-only).

## Integration

- `observe` — watches Gmail for transaction confirmations (bank emails, receipts)
- `remember` — category mappings, merchant history, monthly totals
- `communicate` — monthly summary + anomaly prompts
- `act` — none (never charges or moves money)
- Composes with `budget-alerts` and `invoice-reminders`

## Autonomy Behavior

- **Level 1:** Proposes extraction + category; user confirms before ledger write.
- **Level 2:** Auto-logs known merchants with confident category; asks only on ambiguity or anomaly.
- **Level 3:** Auto-logs everything, surfaces weekly review with anything flagged. Never silently edits a past entry — corrections create new `amended` entries.

## Memory

**Reads:** `memory/finance/categories.yaml`, `memory/finance/merchants.yaml`, `memory/finance/ledger/`.

**Writes:** appends to `memory/finance/ledger/YYYY-MM.md`. Merchant mappings in `memory/finance/merchants.yaml`:
```
cafe-gratitude:
  category: dining
  typical_amount_range: [15, 60]
  first_seen: 2025-03-12
```

## Failure Modes

- **Silent miscategorization.** "Amazon" gets auto-tagged `shopping` but it's actually groceries. Require explicit confirmation the first 3 times a merchant appears.
- **Currency drift.** Trip expense in EUR logged as USD. Always resolve currency from the source signal (email header, card country) and flag if ambiguous.
- **Privacy leak.** Surfacing "dinner with Sam — $280" in a shared output. Expense notes are user-only; summaries aggregate, never itemize personal context.
