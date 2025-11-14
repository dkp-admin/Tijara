import React from 'react';

export function ProductGridSkeletonSection() {
  return (
    <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse bg-gray-100 dark:bg-[#232323] rounded-2xl p-4 h-64 flex flex-col"
        >
          <div className="bg-gray-300 dark:bg-gray-700 rounded-xl mb-4 h-32 w-full" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mt-auto" />
        </div>
      ))}
    </div>
  );
}
