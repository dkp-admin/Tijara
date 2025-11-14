function getPreviousHundred(number: number) {
  if (number >= 0) {
    return Math.floor(number / 100) * 100;
  } else {
    return Math.ceil(number / 100) * 100;
  }
}

const amountThresholds = [
  1, 2, 5, 10, 20, 50, 100, 200, 300, 400, 500, 600, 700, 1000,
];

function getNearbyAmountOptionsLess(numberAmount: any) {
  let nearbyAmountOptions = [];

  let threshold = amountThresholds.find(
    (threshold) => threshold > numberAmount
  );

  if (!threshold) {
    threshold = amountThresholds[amountThresholds.length - 1];
  }

  const thresholdIndex = amountThresholds.indexOf(threshold);

  nearbyAmountOptions.push(Number(numberAmount).toFixed(2));

  for (let i = 0; i < 3; i++) {
    const nextThreshold = amountThresholds[thresholdIndex + i];
    if (nextThreshold) {
      nearbyAmountOptions.push(Number(nextThreshold).toFixed(2));
    }
  }

  return nearbyAmountOptions;
}

export default function getNearbyAmountOptions(amount: any) {
  const nearbyAmountOptions: any = [];

  const numberAmount = Number(amount);

  if (numberAmount > 500) {
    const closestHunderd = getPreviousHundred(numberAmount);

    const nextMultiple50 = closestHunderd + 100;
    const nextMultiple100 = closestHunderd + 200;
    const nextMultiple200 = closestHunderd + 500;

    nearbyAmountOptions.push(Number(amount).toFixed(2));
    nearbyAmountOptions.push(nextMultiple50.toFixed(2));
    nearbyAmountOptions.push(nextMultiple100.toFixed(2));
    nearbyAmountOptions.push(nextMultiple200.toFixed(2));

    return nearbyAmountOptions;
  } else {
    return getNearbyAmountOptionsLess(numberAmount);
  }
}
