import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { MaterialRequest } from '../../types';
import { StatusBadge } from './StatusBadge';
import { useLanguage } from '../../i18n/LanguageContext';

export interface RequestDetailsModalProps {
  request: MaterialRequest | null;
  onClose: () => void;
  footerActions?: React.ReactNode;
}

function localizeRemarkAction(action: string, language: 'en' | 'hi'): string {
  if (language !== 'hi') return action;
  const actionMap: Record<string, string> = {
    SUBMITTED_REQUISITION: 'मांग पत्र प्रस्तुत किया',
    REVERTED_BY_TS: 'टी.एस. द्वारा सुधार हेतु वापस',
    VERIFIED_BY_TS: 'टी.एस. द्वारा सत्यापित',
    REJECTED_BY_TS: 'टी.एस. द्वारा निरस्त',
    REJECTED_BY_PRINCIPAL: 'प्राचार्य द्वारा निरस्त',
    APPROVED_FOR_PURCHASE: 'क्रय हेतु स्वीकृत',
    APPROVED_FOR_STORE: 'भंडार प्रदाय हेतु स्वीकृत',
    CHALLAN_FIFO_ALLOCATED: 'चालान सामग्री आवंटित',
    CHALLAN_FIFO_PARTIAL: 'चालान आंशिक सामग्री आवंटित',
    PRINTED_FORWARDING_LETTER: 'अग्रसारण पत्र प्रिंट किया गया',
    ISSUED_FROM_STORE: 'भंडार से सामग्री प्रदाय',
    CONFIRMED_RECEIPT_AND_CLOSED: 'पावती सत्यापित एवं पूर्ण',
  };
  return actionMap[action] || action;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  onClose,
  footerActions,
}) => {
  const { t, language } = useLanguage();

  if (!request) return null;

  const localizedTrade =
    t(`trade.${request.department}`) !== `trade.${request.department}`
      ? t(`trade.${request.department}`)
      : request.department;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-modal-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              id="request-modal-title"
              className="text-base font-bold font-mono text-[#1e3a8a]"
            >
              {request.id}
            </span>
            <StatusBadge status={request.status} />
          </div>
          <button
            type="button"
            aria-label="Close Request Details"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Metadata Routing Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 min-w-0 max-w-full overflow-hidden">
            <div>
              <span className="text-slate-500 font-medium">{t('modal.trainingOfficer')}</span>{' '}
              <strong className="text-slate-900">{request.toName}</strong>{' '}
              <span className="text-slate-600">({localizedTrade})</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">{t('modal.supervisingTs')}</span>{' '}
              <strong className="text-slate-900">{request.tsName}</strong>
            </div>
            <div className="sm:col-span-2 pt-1 border-t border-slate-200/60 min-w-0">
              <span className="text-slate-500 font-medium">{t('modal.purpose')}</span>{' '}
              <p className="text-slate-800 font-medium break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap mt-0.5">
                {request.purpose}
              </p>
            </div>
          </div>

          {/* Line Items List (Complete parity across all roles) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold uppercase tracking-wider text-slate-600">
                {t('modal.requestedItems', { count: String(request.items.length) })}
              </h3>
            </div>
            <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
              {request.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 flex items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0 flex-1 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <StatusBadge status={item.itemType} size="sm" />
                      <span className="font-bold text-slate-900 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        {item.itemName}
                      </span>
                    </div>
                    {item.specifications && (
                      <p className="text-slate-500 text-[11px] leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        {item.specifications}
                      </p>
                    )}
                  </div>
                  <div className="text-right font-mono shrink-0 whitespace-nowrap">
                    <span className="font-bold text-slate-900 text-xs">
                      {item.requestedQty} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Remarks History */}
          <div>
            <h3 className="font-bold uppercase tracking-wider text-slate-600 mb-2">
              {t('modal.chronologicalRemarks')}
            </h3>
            <div className="max-h-[190px] overflow-y-auto space-y-2 pr-1">
              {request.remarksHistory && request.remarksHistory.length > 0 ? (
                request.remarksHistory.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1 min-w-0 max-w-full overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                      <span className="font-bold text-slate-900">
                        {rem.actorName} ({rem.actorRole}) — {localizeRemarkAction(rem.action, language)}
                      </span>
                      <span className="font-mono text-slate-500">
                        {format(new Date(rem.timestamp), 'dd MMM yyyy, HH:mm')}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                      {rem.remark}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">{t('modal.noRemarks')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            {footerActions}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
          >
            {t('modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
