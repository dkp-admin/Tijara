export function isSameModifiers(mod: any, mod2: any) {
  // Check if the lengths of both arrays are the same
  if (mod?.length !== mod2?.length) {
    return false;
  }

  // Create a Set of optionIds from mod2
  const mod2OptionIds = new Set(
    mod2?.map((modifier: any) => modifier?.optionId)
  );

  const isSame = mod?.every((modifier: any) =>
    mod2OptionIds?.has(modifier?.optionId)
  );

  // Check if every element in mod exists in mod2 by optionId
  return isSame;
}
