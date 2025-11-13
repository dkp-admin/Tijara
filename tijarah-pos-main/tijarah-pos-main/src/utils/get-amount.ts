export const getAmount = (amount: string) => {
  return parseFloat(amount.replace(/[^0-9.-]+/g, ""));
};
