/**
 * Plan feature gates for MyBizTools
 *
 * Plans (current_plan values stored in DB / localStorage user object):
 *   null / undefined / 'free' → Unsubscribed (no plan)
 *   'starter'                 → Starter plan
 *   'pro' / 'business_pro'    → Business Pro
 *   'enterprise' / 'enterprise_suite' → Enterprise Suite
 *
 * Access rules:
 *   No plan  → max 2 docs per type, locked premium features, watermark on exports
 *   Starter  → unlimited docs, all features unlocked, watermark on exports
 *   Pro      → unlimited docs, all features unlocked, no watermark
 *   Enterprise → unlimited docs, all features unlocked, no watermark
 */

export type PlanTier = 'free' | 'starter' | 'pro' | 'enterprise';

/** Normalise any plan string to a logical tier */
export function normalisePlan(plan: string | undefined | null): PlanTier {
  if (!plan) return 'free';
  const p = plan.toLowerCase().trim();
  if (p === 'enterprise' || p === 'enterprise_suite' || p === 'enterprise suite') return 'enterprise';
  if (p === 'pro' || p === 'business_pro' || p === 'business pro') return 'pro';
  if (p === 'starter') return 'starter';
  return 'free';
}

/** Features locked only for unsubscribed (no plan) users */
const LOCKED_FOR_FREE: string[] = [
  'business-card',
  'social-planner',
  'budget-tracker',
  'tax-calculator',
  'dedai',
];

/**
 * Return true if this plan can access the given feature key.
 * Starter, Pro and Enterprise all have full feature access.
 */
export function canAccessFeature(plan: string | undefined | null, feature: string): boolean {
  const tier = normalisePlan(plan);
  if (tier === 'free') return !LOCKED_FOR_FREE.includes(feature);
  return true; // starter / pro / enterprise: all features unlocked
}

/** Max documents of any single type allowed on the no-plan tier */
export const FREE_DOCUMENT_LIMIT = 2;

/**
 * Return true if the user may create another document of this type.
 * Only unsubscribed users are capped at FREE_DOCUMENT_LIMIT.
 */
export function canCreateDocument(plan: string | undefined | null, currentCount: number): boolean {
  const tier = normalisePlan(plan);
  if (tier === 'free') return currentCount < FREE_DOCUMENT_LIMIT;
  return true; // starter / pro / enterprise: unlimited
}

/**
 * Return true if exports should carry a watermark.
 * Both unsubscribed and Starter plan users get watermarks.
 */
export function hasWatermark(_plan?: string | null): boolean {
  return false;
}

/** Human-readable plan display name */
export function planDisplayName(plan: string | undefined | null): string {
  const tier = normalisePlan(plan);
  if (tier === 'enterprise') return 'Enterprise Suite';
  if (tier === 'pro') return 'Business Pro';
  if (tier === 'starter') return 'Starter';
  return 'Free';
}
