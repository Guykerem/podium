#!/usr/bin/env tsx
/**
 * Podium scheduler — stub for v0.2.
 *
 * The real executor (loads roles/<role>/schedule.yaml, runs cron loop,
 * dispatches routines through runtime/engine.ts) lands in v0.3. This stub
 * exists so M13's service wiring has a valid ExecStart target today: the
 * launchd plist / systemd unit can reference `npx tsx runtime/scheduler.ts`
 * without the service crash-looping the moment v0.3 lights it up.
 *
 * Invoked by:
 *   - `npx tsx runtime/scheduler.ts` (direct, manual)
 *   - launchd via ~/Library/LaunchAgents/com.podium.agent.plist
 *   - systemd via ~/.config/systemd/user/podium.service
 */
console.log("[scheduler] v0.2 stub — no routines executed yet");
process.exit(0);
