import * as validator from "validator";
import { ValidationError } from "../framework";
import { ValidationErrorDto, ValidationErrorItem } from "../types";

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
    const dto: ValidationErrorDto = {};

    failedRules.forEach(r => {
      if (!dto[r.key]) {
        dto[r.key] = [];
      }
      dto[r.key].push({
        code: r.rule.code,
        message: r.rule.message,
      });
    });

    throw new ValidationError(dto);
  }
}
