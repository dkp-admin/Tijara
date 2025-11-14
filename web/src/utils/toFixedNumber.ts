export const toFixedNumber = (value: any) => {
  const num = Number(value);
  return isFinite(num) ? num.toFixed(2) : "0.0";
};
