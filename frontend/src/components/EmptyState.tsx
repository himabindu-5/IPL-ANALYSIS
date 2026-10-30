import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search query, or select from one of our popular player chips above.',
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl clean-card">
      <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-slate-400 dark:text-slate-500 mb-4">
        <SearchX className="w-8 h-8 text-[#FB542B]" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-5 brave-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center space-x-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
};
