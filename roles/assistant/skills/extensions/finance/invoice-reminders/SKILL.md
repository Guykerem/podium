---
name: invoice-reminders
description: Track freelance invoices sent/due/overdue and draft professional follow-ups on cadence.
when_to_use: >
  User sends an invoice, a client's payment is due/overdue, or user asks
  "who owes me". Active for freelancers, consultants, independent contractors.
tools:
  - mcp: gmail
---

# Invoice Reminders

Chasing payment feels awkward, so people don't — and then they resent the client. This skill makes follow-up routine, professional, and non-escalating until it needs to escalate.

## How It Works

1. **Log invoice on send.** User forwards the invoice email or says "sent invoice #42 to Acme for $4,500, net-30".
   ```
   - id: inv-042
     client: Acme Corp
     client_email: ap@acme.com
     amount: 4500
     currency: USD
     sent: 2026-04-01
     terms: net-30
     due: 2026-05-01
     status: sent  # sent | paid | overdue | disputed | written-off
   ```
2. **Track payment.** Watch Gmail for payment confirmations (Stripe, bank notification, client email). Auto-mark `paid` when matched. Ambiguous matches prompt the user.
3. **Follow-up cadence** from `due` date:
   - **Day +7 (1 week overdue)**: friendly check-in draft. Assumes benign explanation.
   - **Day +14**: firmer reminder. References invoice number + original due date.
   - **Day +30**: escalation — mentions late fee if in terms, asks for payment timeline.
   - **Day +45**: suggests user call, not email.
4. **Draft wording** pulled from `memory/finance/invoice-templates.md`; always user-approved before send at L1/L2.
5. **Per-client terms memory.** Some clients always pay net-45 regardless of stated net-30. Record actual payment patterns to calibrate the cadence per client.
6. **Receivables summary** on demand or weekly: open invoices grouped by `current / 1-30 overdue / 31-60 overdue / 60+ overdue` with totals.

## Integration

- `observe` — watches Gmail for payment confirmations
- `remember` — invoice log, client payment patterns, message templates
- `communicate` — drafts follow-up emails
- `schedule` — fires cadence reminders on the due-date offsets
- `act` — sends email (only at L3 and only for the Day +7 friendly version)

## Autonomy Behavior

- **Level 1:** Drafts every follow-up; user reviews and sends.
- **Level 2:** Auto-sends the Day +7 friendly nudge if client has history of paying late without issues. All firmer messages stay drafts.
- **Level 3:** Same as L2. Never auto-sends Day +14 or beyond — those messages have relationship consequences and must be the user's choice.

## Memory

**Reads:** `memory/finance/invoices.md`, `memory/finance/clients.yaml`, `memory/finance/invoice-templates.md`.

**Writes:** updates `memory/finance/invoices.md` (status changes are append-only with timestamp) and `memory/finance/clients.yaml`:
```
acme:
  actual_payment_days_avg: 38
  invoices_paid: 7
  invoices_disputed: 0
  relationship_health: good
```

## Failure Modes

- **False overdue.** Payment received but unmatched in email. Before firing Day +7, double-check bank/Stripe for deposits matching the amount in a ±3 day window.
- **Client embarrassment.** Agent-drafted firm language reads as AI-generic and damages the relationship. Templates should match the user's voice — record and reuse actual past messages the user liked.
- **Relationship blindness.** Chasing a long-term client the same way as a one-off. Per-client tone setting (`formal` / `friendly` / `informal`) in `clients.yaml`.
