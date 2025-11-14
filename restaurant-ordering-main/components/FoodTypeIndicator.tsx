'use client';

type FoodType = 'veg' | 'non-veg' | 'egg';

interface FoodTypeIndicatorProps {
  type?: string;
}

export function FoodTypeIndicator({ type }: FoodTypeIndicatorProps) {
  const getFoodType = (inputType?: string): FoodType | null => {
    if (!inputType) return null;
    const validTypes: FoodType[] = ['veg', 'non-veg', 'egg'];
    return validTypes.includes(inputType as FoodType) ? (inputType as FoodType) : null;
  };

  const validType = getFoodType(type);
  if (!validType) return null;

  const colors = {
    veg: 'border-green-500',
    'non-veg': 'border-red-500',
    egg: 'border-yellow-500',
  };

  const dotColors = {
    veg: 'bg-green-500',
    'non-veg': 'bg-red-500',
    egg: 'bg-yellow-500',
  };

  return (
    <div
      className={`w-4 h-4 rounded border-2 ${colors[validType]} flex items-center justify-center`}
    >
      <div className={`w-2 h-2 rounded-full ${dotColors[validType]}`} />
    </div>
  );
}
