// ============================================================================
// IN-PROCESS SCHEDULER
// ============================================================================
// Lightweight periodic cleanup jobs using setInterval.
// No external dependencies — works on Render free tier.
//
// Phase 2 (50K+ users): migrate to a dedicated Render Background Worker
// with BullMQ + Redis for durability and distributed execution.
// ============================================================================

import prisma from './prisma.js';

// Run every 30 minutes
const INTERVAL_MS = 30 * 60 * 1000;

async function cleanExpiredOtps(): Promise<void> {
  const now = new Date();
  const result = await prisma.user.updateMany({
    where: { otpExpires: { lt: now }, otpCode: { not: null } },
    data: { otpCode: null, otpExpires: null, otpPurpose: null },
  });
  if (result.count > 0) {
    console.log(`[Scheduler] Cleared ${result.count} expired OTP(s)`);
  }
}

async function cleanExpiredVerificationTokens(): Promise<void> {
  const now = new Date();
  const result = await prisma.user.updateMany({
    where: { verificationExpires: { lt: now }, verificationToken: { not: null } },
    data: { verificationToken: null, verificationExpires: null },
  });
  if (result.count > 0) {
    console.log(`[Scheduler] Cleared ${result.count} expired verification token(s)`);
  }
}

async function runJobs(): Promise<void> {
  await Promise.allSettled([
    cleanExpiredOtps(),
    cleanExpiredVerificationTokens(),
  ]);
}

export function startScheduler(): void {
  // Run once at startup (e.g. after a cold deploy), then every 30 min
  runJobs().catch((err) => console.error('[Scheduler] Startup run failed:', err));
  setInterval(() => {
    runJobs().catch((err) => console.error('[Scheduler] Interval run failed:', err));
  }, INTERVAL_MS);

  console.log('[Scheduler] Started — cleanup jobs run every 30 minutes');
}
