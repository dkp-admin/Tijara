/**
 * Utility function to transform cart item modifiers to billing format
 * This function extracts the modifier transformation logic for reusability and testing
 */

export interface BillingModifier {
  modifierRef: string;
  modifier: string;
  optionId: string;
  optionName: string;
}

export interface CartModifier {
  _id?: string;
  name?: string;
  modifierRef?: string;
  values?: Array<{
    _id?: string;
    name?: string;
  }>;
}

/**
 * Transforms selectedModifiers from cart format to billing format
 * @param selectedModifiers - Record of modifierId -> valueId[] mappings (supports multiple selections per modifier)
 * @param modifiersArr - Array of modifier definitions from the product
 * @returns Array of BillingModifier objects
 */
export function transformModifiersForBilling(
  selectedModifiers: Record<string, string | string[]> | undefined,
  modifiersArr: unknown[] | undefined,
): BillingModifier[] {
  if (!selectedModifiers || !modifiersArr || modifiersArr.length === 0) {
    return [];
  }

  const result: BillingModifier[] = [];

  Object.entries(selectedModifiers).forEach(([modifierId, valueIds]) => {
    const modifier = (modifiersArr as CartModifier[]).find((m) => m._id === modifierId);

    // Handle both old format (string) and new format (string[])
    const valueIdArray = Array.isArray(valueIds) ? valueIds : [valueIds];

    valueIdArray.forEach((valueId) => {
      const value = modifier?.values?.find((v) => v._id === valueId);

      result.push({
        modifierRef: modifier?.modifierRef || modifierId,
        modifier: modifier?.name || '',
        optionId: value?._id || valueId,
        optionName: value?.name || '',
      });
    });
  });

  return result;
}

/**
 * Example usage and test data
 */
export const exampleCartModifiers = [
  {
    _id: '669521070d9da31d1ec7a74f',
    modifierRef: '669521070d9da31d1ec7a74f',
    name: 'Shawarma Small Big',
    values: [
      { _id: '669521070d9da31d1ec7a755', name: 'Extra Fries' },
      { _id: '669521070d9da31d1ec7a754', name: 'No Pickle' },
      { _id: '669521070d9da31d1ec7a756', name: 'Extra Pickle' },
      { _id: '684949751854d26cfb14d63c', name: 'شواية إضافية' },
      { _id: '66952bbb0d9da31d1ec7ce50', name: 'Cheese' },
    ],
  },
];

export const exampleSelectedModifiers = {
  '669521070d9da31d1ec7a74f': '669521070d9da31d1ec7a755', // Extra Fries
};

export const expectedBillingFormat = [
  {
    modifierRef: '669521070d9da31d1ec7a74f',
    modifier: 'Shawarma Small Big',
    optionId: '669521070d9da31d1ec7a755',
    optionName: 'Extra Fries',
  },
];

/**
 * Test function to verify the transformation works correctly
 */
export function testModifierTransformation(): boolean {
  const result = transformModifiersForBilling(exampleSelectedModifiers, exampleCartModifiers);

  console.log('Input selectedModifiers:', exampleSelectedModifiers);
  console.log('Input modifiersArr:', exampleCartModifiers);
  console.log('Output result:', result);
  console.log('Expected format:', expectedBillingFormat);

  // Basic validation
  if (result.length !== expectedBillingFormat.length) {
    console.error('Length mismatch');
    return false;
  }

  const firstResult = result[0];
  const firstExpected = expectedBillingFormat[0];

  if (
    firstResult.modifierRef === firstExpected.modifierRef &&
    firstResult.modifier === firstExpected.modifier &&
    firstResult.optionId === firstExpected.optionId &&
    firstResult.optionName === firstExpected.optionName
  ) {
    console.log('✅ Transformation test passed!');
    return true;
  } else {
    console.error('❌ Transformation test failed!');
    return false;
  }
}
