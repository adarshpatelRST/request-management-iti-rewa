import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { DropSearch } from './DropSearch';
import { useLanguage } from '../../i18n/LanguageContext';

interface FilterOption {
  value: string;
  label: string;
}

export interface ModuleFilterBarProps {
  title?: string;
  onReset: () => void;
  hasActiveFilters?: boolean;
  children?: React.ReactNode;
  rightSlot?: React.ReactNode;
  // Declarative filter props
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  categoryLabel?: string;
  categoryValue?: string;
  onCategoryChange?: (val: string) => void;
  categoryOptions?: FilterOption[];
  statusLabel?: string;
  statusValue?: string;
  onStatusChange?: (val: string) => void;
  statusOptions?: FilterOption[];
}

export const ModuleFilterBar: React.FC<ModuleFilterBarProps> = ({
  title = 'Filter & Search Records',
  onReset,
  hasActiveFilters = true,
  children,
  rightSlot,
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  categoryLabel = 'Category / Trade',
  categoryValue,
  onCategoryChange,
  categoryOptions,
  statusLabel = 'Status',
  statusValue,
  onStatusChange,
  statusOptions,
}) => {
  const { t, language } = useLanguage();

  const displayTitle = title === 'Filter & Search Records' ? t('filter.title') : title;
  const displaySearchPlaceholder =
    searchPlaceholder === 'Search records...' ? t('filter.searchPlaceholder') : searchPlaceholder;
  const displayCategoryLabel =
    categoryLabel === 'Category / Trade' ? t('filter.category') : categoryLabel;
  const displayStatusLabel =
    statusLabel === 'Status' || statusLabel === 'Workflow Status'
      ? t('filter.status')
      : statusLabel;
  const displayReset = t('action.reset');

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-4 mb-5">
      <div className="flex items-center justify-between gap-4 mb-3.5">
        <div className="flex items-center gap-2 text-[#0f766e]">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#0f766e]" />
          </div>
          <h2 className="text-xs font-bold tracking-wide text-slate-800 uppercase">
            {displayTitle}
          </h2>
        </div>
        {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children ? (
          children
        ) : (
          <>
            {onSearchChange !== undefined && (
              <FilterField label={t('filter.searchKeyword')} htmlFor="module-filter-search">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="module-filter-search"
                    type="text"
                    placeholder={displaySearchPlaceholder}
                    value={searchValue ?? ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 h-10 rounded-lg text-xs text-slate-900 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  />
                </div>
              </FilterField>
            )}

            {onCategoryChange && categoryOptions && (
              <FilterField label={displayCategoryLabel} htmlFor="module-filter-category">
                {categoryOptions.length > 5 ? (
                  <DropSearch
                    value={categoryValue === 'ALL' ? null : categoryValue ?? null}
                    onChange={(val) => onCategoryChange(val ?? 'ALL')}
                    allOption={{
                      id: 'ALL',
                      label:
                        categoryOptions.find((o) => o.value === 'ALL')?.label ??
                        t('filter.allCategories'),
                    }}
                    items={categoryOptions
                      .filter((o) => o.value !== 'ALL')
                      .map((o) => ({
                        id: o.value,
                        label: o.label,
                      }))}
                    placeholder={displayCategoryLabel}
                    searchPlaceholder={
                      language === 'hi'
                        ? `${displayCategoryLabel} खोजें...`
                        : `Search ${displayCategoryLabel.toLowerCase()}...`
                    }
                    width="w-full"
                  />
                ) : (
                  <select
                    id="module-filter-category"
                    value={categoryValue ?? 'ALL'}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 h-10 rounded-lg text-xs text-slate-900 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </FilterField>
            )}

            {onStatusChange && statusOptions && (
              <FilterField label={displayStatusLabel} htmlFor="module-filter-status">
                <DropSearch
                  value={statusValue === 'ALL' ? null : statusValue ?? null}
                  onChange={(val) => onStatusChange(val ?? 'ALL')}
                  allOption={{
                    id: 'ALL',
                    label:
                      statusOptions.find((o) => o.value === 'ALL')?.label ??
                      t('filter.allStatuses'),
                  }}
                  items={statusOptions
                    .filter((o) => o.value !== 'ALL')
                    .map((o) => ({
                      id: o.value,
                      label: o.label,
                    }))}
                  placeholder={displayStatusLabel}
                  searchPlaceholder={
                    language === 'hi'
                      ? `${displayStatusLabel} खोजें...`
                      : `Search ${displayStatusLabel.toLowerCase()}...`
                  }
                  width="w-full"
                />
              </FilterField>
            )}
          </>
        )}
      </div>

      <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-end">
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{displayReset}</span>
        </button>
      </div>
    </div>
  );
};

export const FilterField: React.FC<{
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, children }) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-bold uppercase text-slate-600 tracking-wider"
    >
      {label}
    </label>
    {children}
  </div>
);
