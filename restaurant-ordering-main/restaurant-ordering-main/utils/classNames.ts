import { type ClassNameValue, twJoin } from 'tailwind-merge';

type ValidClassInput = ClassNameValue | false | null | undefined;

function toValidClassValue(value: ValidClassInput): ClassNameValue {
  if (typeof value === 'string' || Array.isArray(value)) {
    return value;
  }
  return '';
}

export const cx = (...inputs: ValidClassInput[]): string => {
  return twJoin(inputs.map(toValidClassValue));
};
