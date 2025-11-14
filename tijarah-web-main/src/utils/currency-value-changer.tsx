export const currencyValue = (money: any) => {
  const newMoney = Number(money);

  if (money < 1000) {
    return `${newMoney.toFixed(2)}`;
  } else if (newMoney >= 1000 && newMoney <= 999999) {
    return `${(newMoney / 1000).toFixed(2) + " K"}`;
  } else if (newMoney > 999999 && newMoney <= 999999999) {
    return `${(newMoney / 1000000).toFixed(2) + " M"}`;
  } else {
    return `${(newMoney / 1000000000).toFixed(2) + " B"}`;
  }
};
