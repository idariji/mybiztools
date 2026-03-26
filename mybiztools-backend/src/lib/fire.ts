// ============================================================================
// FIRE-AND-FORGET UTILITY
// ============================================================================
// Runs an async operation in the background without blocking the caller.
// Logs errors so nothing silently disappears.
//
// Usage:
//   fire(() => EmailNotificationService.sendWelcomeEmail(email, name), 'welcome-email');
//
// For Phase 2 (1K–50K users) replace this with a proper job queue (BullMQ + Redis).
// ============================================================================

export function fire(task: () => Promise<unknown>, label = 'background-task'): void {
  setImmediate(() => {
    task().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[fire] ${label} failed: ${message}`);
    });
  });
}
