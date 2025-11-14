import { twJoin } from 'tailwind-merge';
export const cx = (...args: (string | boolean | undefined | null)[]) => {
  return twJoin(
    args.flatMap((arg) => (typeof arg === 'string' ? arg.split(' ') : [])).filter(Boolean),
  );
};
