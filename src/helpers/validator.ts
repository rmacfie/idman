import * as validator from "validator";

export function required(message: string): Rule {
  return {
    code: "required",
    message: message,
    check: async (value: any) => {
      return !!value;
    },
  };
}

export function isOneOf<T>(allowedValues: T[], message: string): Rule {
  return {
    code: "isOneOf",
    message: message,
    check: async (value: any) => {
      return validator.isIn("" + value, allowedValues.map(v => "" + v));
    },
  };
}

export function isEmail(message: string): Rule {
  return {
    code: "isEmail",
    message: message,
    check: async (value: any) => {
      return validator.isEmail("" + value);
    },
  };
}

export function isLength(min: number, max: number, message: string): Rule {
  return {
    code: "isLength",
    message: message,
    check: async (value: any) => {
      return validator.isLength("" + value, { min: min, max: max });
    },
  };
}

export function custom(code: string, message: string, check: (value?: any) => Promise<boolean>): Rule {
  return {
    code: code,
    message: message,
    check: check,
  };
}

export class ValidationError extends Error {
  violations: ViolationCollection;

  constructor(violations: ViolationCollection);
  constructor(key: string, code: string, message: string);
  constructor(a1: any, a2?: any, a3?: any) {
    super("Validation failed");
    if (typeof a1 === "object" && a2 === undefined && a3 === undefined) {
      this.violations = a1;
    } else if (typeof a1 === "string" && typeof a2 === "string" && typeof a3 === "string") {
      this.violations = {};
      this.violations[a1] = [ { code: a2, message: a3 } ];
    }
  }
}

export interface Violation {
  code: string;
  message: string;
}

export interface ViolationCollection {
  [key: string]: Violation[];
}

export interface Rule {
  check: (value: any) => Promise<boolean>;
  code: string;
  message: string;
}

export interface RuleCollection {
  [key: string]: Rule[];
}

export async function validate(target: Object, ruleCollection: RuleCollection): Promise<void> {
  if (target === undefined || target === null) {
    target = {};
  } else if (!(target instanceof Object)) {
    throw new Error("Target must be an object");
  }

  const keys = Object.keys(ruleCollection).filter(k => ruleCollection.hasOwnProperty(k));
  const rules: { key: string; rule: Rule }[] = [];
  const failedRules: { key: string; rule: Rule }[] = [];

  keys.forEach(k => {
    ruleCollection[k].forEach(r => {
      rules.push({ key: k, rule: r });
    });
  });

  await Promise.all(rules.map(async r => {
    const valid = await r.rule.check(target[r.key]);
    if (!valid) {
      failedRules.push(r);
    }
  }));

  if (failedRules.length > 0) {
    const violations: ViolationCollection = {};

    failedRules.forEach(r => {
      if (!violations[r.key]) {
        violations[r.key] = [];
      }
      violations[r.key].push({
        code: r.rule.code,
        message: r.rule.message,
      });
    });

    throw new ValidationError(violations);
  }
}
