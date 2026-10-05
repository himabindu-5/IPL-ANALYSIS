import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading dataset...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};
