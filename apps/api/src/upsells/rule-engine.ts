/**
 * Upsell Rule Engine
 *
 * Evaluates a set of UpsellRules against a ReservationContext.
 * - Rules sharing the same logicGroup are AND-ed together.
 * - Distinct logicGroups are OR-ed together.
 * - If there are no rules the offer is always eligible.
 */

export interface ReservationContext {
  dayOfWeek: string; // e.g. "MONDAY", "TUESDAY"
  nightsCount: number;
  roomType: string;
  bookingSource: string;
  rateCode: string;
  leadTimeDays: number;
  adultsCount: number;
  childrenCount: number;
}

export interface EvaluatableRule {
  attribute: string;
  operator: string;
  value: string;
  logicGroup: number;
}

/**
 * Evaluate a single rule against the reservation context.
 */
function evaluateRule(rule: EvaluatableRule, ctx: ReservationContext): boolean {
  const rawCtxValue = (ctx as unknown as Record<string, unknown>)[rule.attribute];

  // Numeric attributes for comparison operators
  const numericAttributes = new Set([
    'nightsCount',
    'leadTimeDays',
    'adultsCount',
    'childrenCount',
  ]);

  const ruleValue = rule.value;

  switch (rule.operator) {
    case 'EQUALS': {
      return String(rawCtxValue).toLowerCase() === ruleValue.toLowerCase();
    }
    case 'NOT_EQUALS': {
      return String(rawCtxValue).toLowerCase() !== ruleValue.toLowerCase();
    }
    case 'GREATER_THAN': {
      if (numericAttributes.has(rule.attribute)) {
        return Number(rawCtxValue) > Number(ruleValue);
      }
      return String(rawCtxValue) > ruleValue;
    }
    case 'LESS_THAN': {
      if (numericAttributes.has(rule.attribute)) {
        return Number(rawCtxValue) < Number(ruleValue);
      }
      return String(rawCtxValue) < ruleValue;
    }
    case 'IN': {
      const options = ruleValue.split(',').map((v) => v.trim().toLowerCase());
      return options.includes(String(rawCtxValue).toLowerCase());
    }
    case 'NOT_IN': {
      const options = ruleValue.split(',').map((v) => v.trim().toLowerCase());
      return !options.includes(String(rawCtxValue).toLowerCase());
    }
    default: {
      return false;
    }
  }
}

/**
 * Evaluate the full rule set for an offer.
 *
 * Returns true when:
 *   - rules array is empty (no restrictions — always show), or
 *   - at least one logicGroup passes (all rules within that group are true).
 */
export function evaluateRules(
  rules: EvaluatableRule[],
  reservationData: ReservationContext,
): boolean {
  if (rules.length === 0) {
    return true;
  }

  // Group rules by logicGroup
  const groups = new Map<number, EvaluatableRule[]>();
  for (const rule of rules) {
    const existing = groups.get(rule.logicGroup) ?? [];
    existing.push(rule);
    groups.set(rule.logicGroup, existing);
  }

  // OR across groups, AND within each group
  for (const groupRules of groups.values()) {
    const groupPasses = groupRules.every((rule) =>
      evaluateRule(rule, reservationData),
    );
    if (groupPasses) {
      return true;
    }
  }

  return false;
}
