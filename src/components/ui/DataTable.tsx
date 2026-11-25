import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { parsePageInput } from '../../utils/storeLogic';
import { useLanguage } from '../../i18n/LanguageContext';

export interface DataTableColumn<T> {
  key?: string;
  id?: string;
  header: React.ReactNode;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  wrapText?: boolean;
  sortable?: boolean;
  accessor?: (row: T) => unknown;
  render?: (row: T, index: number) => React.ReactNode;
  cell?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T, index: number) => string;
  pageSize?: number;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 10,
  emptyMessage = 'No matching institutional records found.',
  emptyTitle,
  emptyDescription,
  toolbar,
  onRowClick,
}: DataTableProps<T>) {
  const { language, t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setPageInput(String(totalPages));
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = data.slice(startIndex, endIndex);

  const commitPageInput = () => {
    const parsed = parsePageInput(pageInput, totalPages);
    if (parsed !== null) {
      setCurrentPage(parsed);
      setPageInput(String(parsed));
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Accept only digits in the input box
    if (/^\d*$/.test(val)) {
      setPageInput(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitPageInput();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs overflow-hidden">
      {toolbar && (
        <div className="px-4 py-3 border-b border-[#e2e8f0] bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-slate-50/90">
              {columns.map((col, colIdx) => {
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';
                const colKey = col.key || col.id || `col-${colIdx}`;
                return (
                  <th
                    key={colKey}
                    style={{ width: col.width, minWidth: col.minWidth }}
                    className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 ${alignClass}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 text-sm">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      {emptyTitle || (emptyMessage === 'No matching institutional records found.' ? t('table.empty') : emptyMessage)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {emptyDescription ||
                        (language === 'hi'
                          ? 'सक्रिय फ़िल्टर या खोज मानदंड बदलकर पुनः प्रयास करें।'
                          : 'Try adjusting your active filter criteria or resetting the search bar.')}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={keyExtractor(row, startIndex + idx)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors hover:bg-slate-50/80 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIdx) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';
                    const wrapClass =
                      col.wrapText === false
                        ? 'whitespace-nowrap'
                        : 'whitespace-normal break-words max-w-xs';
                    const colKey = col.key || col.id || `col-${colIdx}`;
                    const cellFn = col.render || col.cell;

                    return (
                      <td
                        key={colKey}
                        style={{ width: col.width, minWidth: col.minWidth }}
                        className={`px-4 py-3.5 align-top text-slate-800 ${alignClass} ${wrapClass}`}
                      >
                        {cellFn
                          ? cellFn(row, startIndex + idx)
                          : col.accessor
                          ? String(col.accessor(row) ?? '')
                          : null}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Exact Pagination Bar */}
      <div className="px-4 py-3 border-t border-[#e2e8f0] bg-slate-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="font-medium tabular-nums">
          {language === 'hi' ? (
            <>
              प्रदर्शित{' '}
              <span className="font-semibold text-slate-900 font-mono">
                {totalItems === 0 ? 0 : startIndex + 1}
              </span>
              {' - '}
              <span className="font-semibold text-slate-900 font-mono">{endIndex}</span>, कुल{' '}
              <span className="font-semibold text-slate-900 font-mono">{totalItems}</span>{' '}
              रिकॉर्ड
            </>
          ) : (
            <>
              Showing{' '}
              <span className="font-semibold text-slate-900 font-mono">
                {totalItems === 0 ? 0 : startIndex + 1}
              </span>
              -
              <span className="font-semibold text-slate-900 font-mono">{endIndex}</span> of{' '}
              <span className="font-semibold text-slate-900 font-mono">{totalItems}</span>{' '}
              results
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={language === 'hi' ? 'पिछला पृष्ठ' : 'Previous Page'}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              inputMode="numeric"
              aria-label={language === 'hi' ? 'पृष्ठ संख्या' : 'Page number'}
              value={pageInput}
              onChange={handleInputChange}
              onBlur={commitPageInput}
              onKeyDown={handleKeyDown}
              className="w-12 h-8 text-center font-mono text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
            <span className="text-slate-600 font-medium tabular-nums">
              {language === 'hi' ? 'कुल' : 'of'}{' '}
              <span className="font-mono font-semibold text-slate-900">{totalPages}</span>
            </span>
          </div>

          <button
            type="button"
            aria-label={language === 'hi' ? 'अगला पृष्ठ' : 'Next Page'}
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
