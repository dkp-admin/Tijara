function getPreviousHundred(number: number) {
  if (number >= 0) {
    return Math.floor(number / 100) * 100
  } else {
    return Math.ceil(number / 100) * 100
  }
}

function previousNearestMultipleOf500(number: number) {
  return Math.floor(number / 500) * 500
}

const amountThresholds = [
  1, 2, 5, 10, 20, 50, 100, 200, 300, 400, 500, 600, 700, 1000,
]

function getNearbyAmountOptionsLess(numberAmount: any) {
  let nearbyAmountOptions = []

  let threshold = amountThresholds.find((threshold) => threshold > numberAmount)

  if (!threshold) {
    threshold = amountThresholds[amountThresholds.length - 1]
  }

  const thresholdIndex = amountThresholds.indexOf(threshold)

  nearbyAmountOptions.push(Number(numberAmount).toFixed(2))

  for (let i = 0; i < 3; i++) {
    const nextThreshold = amountThresholds[thresholdIndex + i]
    if (nextThreshold) {
      nearbyAmountOptions.push(Number(nextThreshold).toFixed(2))
    }
  }

  return nearbyAmountOptions
}

export default function getNearbyAmountOptions(amount: any) {
  const nearbyAmountOptions: any = []

  const numberAmount = Number(amount)

  if (numberAmount > 1000 && numberAmount < 1100) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 200
    const nextMultiple200 = closestHunderd + 500

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))
    nearbyAmountOptions.push(nextMultiple200.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount > 1100 && numberAmount < 1200) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 400
    const nextMultiple200 = closestHunderd + 900

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))
    nearbyAmountOptions.push(nextMultiple200.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount > 1200 && numberAmount < 1300) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 300
    const nextMultiple200 = closestHunderd + 800

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))
    nearbyAmountOptions.push(nextMultiple200.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount > 1300 && numberAmount < 1400) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 200
    const nextMultiple200 = closestHunderd + 700

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))
    nearbyAmountOptions.push(nextMultiple200.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount > 1400 && numberAmount < 1500) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 600

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount < 200 && numberAmount > 100) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 400
    const nextMultiple200 = closestHunderd + 900

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))
    nearbyAmountOptions.push(nextMultiple200.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount < 300 && numberAmount > 200) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 200
    const nextMultiple200 = closestHunderd + 300

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))
    nearbyAmountOptions.push(nextMultiple200.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount < 400 && numberAmount > 300) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 200
    const nextMultiple200 = closestHunderd + 700

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))
    nearbyAmountOptions.push(nextMultiple200.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount < 500 && numberAmount > 400) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 600

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount < 500 && numberAmount > 400) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 600
    const nextMultiple200 = closestHunderd + 600

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))
    nearbyAmountOptions.push(nextMultiple200.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount > 600 && numberAmount < 700) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 400

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount > 700 && numberAmount < 800) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 300

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount > 800 && numberAmount < 900) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 200

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount > 900 && numberAmount < 1000) {
    const closestHunderd = getPreviousHundred(numberAmount)

    const nextMultiple50 = closestHunderd + 100
    const nextMultiple100 = closestHunderd + 1100

    nearbyAmountOptions.push(Number(amount).toFixed(2))
    nearbyAmountOptions.push(nextMultiple50.toFixed(2))
    nearbyAmountOptions.push(nextMultiple100.toFixed(2))

    return nearbyAmountOptions
  } else if (numberAmount > 1500) {
    const nearest500Multiple = previousNearestMultipleOf500(numberAmount)
    const nextMultiple500 = nearest500Multiple + 500
    const nextMultiple1000 = nextMultiple500 + 500
    nearbyAmountOptions.push(numberAmount.toFixed(2))

    nearbyAmountOptions.push(nextMultiple500.toFixed(2))
    nearbyAmountOptions.push(nextMultiple1000.toFixed(2))
    return nearbyAmountOptions
  } else {
    return getNearbyAmountOptionsLess(numberAmount)
  }
}
