/**
 * Plan feature gates for MyBizTools
 *
 * Tiers (current_plan values stored in localStorage user object):
 *   'free' / 'starter'  → Free / Starter plan
 *   'pro'               → Business Pro
 *   'enterprise'        → Enterprise Suite
 */

export type PlanTier = 'free' | 'starter' | 'pro' | 'enterprise';

/** Normalise any plan string to the three logical tiers */
export function normalisePlan(plan: string | undefined | null): PlanTier {
  if (!plan) return 'free';
  const p = plan.toLowerCase();
  if (p === 'enterprise') return 'enterprise';
  if (p === 'pro' || p === 'business_pro' || p === 'business pro') return 'pro';
  return 'free'; // 'free', 'starter', or anything else → free
}

/** Features that are locked on the free/starter plan */
const LOCKED_FOR_FREE: string[] = [
  'business-card',
  'social-planner',
  'budget-tracker',
  'tax-calculator',
  'dedai',
];

/**
 * Return true if this plan can access the given feature key.
 * feature keys match the path segment used in routing.
 */
export function canAccessFeature(plan: string | undefined | null, feature: string): boolean {
  const tier = normalisePlan(plan);
  if (tier === 'pro' || tier === 'enterprise') return true;
  return !LOCKED_FOR_FREE.includes(feature);
}

/** Max documents of any single type allowed on the free plan (0 = unlimited) */
export const FREE_DOCUMENT_LIMIT = 2;

/**
 * Return true if the user may create another document of this type.
 * @param plan        current_plan string from user object
 * @param currentCount number of existing saved documents
 */
export function canCreateDocument(plan: string | undefined | null, currentCount: number): boolean {
  const tier = normalisePlan(plan);
  if (tier === 'pro' || tier === 'enterprise') return true;
  return currentCount < FREE_DOCUMENT_LIMIT;
}

/** Return true if plan-generated documents should show a watermark */
export function hasWatermark(plan: string | undefined | null): boolean {
  const tier = normalisePlan(plan);
  return tier === 'free';
}

/** Human-readable plan display name */
export function planDisplayName(plan: string | undefined | null): string {
  const tier = normalisePlan(plan);
  if (tier === 'enterprise') return 'Enterprise Suite';
  if (tier === 'pro') return 'Business Pro';
  return 'Starter (Free)';
}
