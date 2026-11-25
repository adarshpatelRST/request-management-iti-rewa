import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  actions,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1 min-w-0">
        {badgeText && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-[#1e3a8a] border border-indigo-200 rounded">
              {badgeText}
            </span>
          </div>
        )}
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-600">{subtitle}</p>}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>
      )}
    </div>
  );
};
