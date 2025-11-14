import React from 'react';

export function BillingDetailsSkeletonSection() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
      </div>
      <hr className="my-2 border-gray-200 dark:border-gray-700" />
      <div className="flex justify-between items-center mt-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
      </div>
    </div>
  );
}
