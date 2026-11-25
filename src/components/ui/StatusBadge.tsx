import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  RequestStatus,
  PurchaseOrderStatus,
  ItemType,
  AuditActionType,
} from '../../types';

interface StatusBadgeProps {
  status: RequestStatus | PurchaseOrderStatus | ItemType | AuditActionType | string;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  // Workflow Statuses
  PENDING_TS_VERIFICATION: {
    label: 'Pending TS Verification',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  REVERTED_BY_TS: {
    label: 'Reverted by TS',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  REJECTED_BY_TS: {
    label: 'Rejected by TS',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
  },
  REJECTED_BY_PRINCIPAL: {
    label: 'Rejected by Principal',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
  },
  PENDING_PRINCIPAL_APPROVAL: {
    label: 'Pending Principal Approval',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  APPROVED_FOR_STORE: {
    label: 'Approved for Store Issue',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
  },
  APPROVED_FOR_PURCHASE: {
    label: 'Approved for Purchase',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
  },
  PRINTED_AWAITING_AVAK_JAVAK: {
    label: 'Printed • Awaiting Avak/Javak',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  AWAITING_AVAK_JAVAK: {
    label: 'Awaiting Avak/Javak',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  PURCHASE_IN_PROGRESS: {
    label: 'Purchase In Progress',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  PARTIALLY_FULFILLED: {
    label: 'Partially Fulfilled',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  PARTIALLY_RECEIVED: {
    label: 'Partially Received',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  ITEM_RECEIVED_AT_STORE: {
    label: 'Material Delivered (Ready)',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  CLOSED: {
    label: 'Closed & Verified',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },

  // Item Types
  TRADE: {
    label: 'TRADE',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  NON_TRADE: {
    label: 'NON-TRADE',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },

  // Audit Action Copy Types
  TO_REQUEST_COPY: {
    label: 'TO Request Copy',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  TS_VERIFICATION_COPY: {
    label: 'TS Verification Copy',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  PRINCIPAL_APPROVAL_COPY: {
    label: 'Principal Sanction Copy',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
  },
  PRINT_FORWARD_LETTER_COPY: {
    label: 'Forwarding Letter Copy',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  GENERATE_ORDER_AVAK_JAVAK_COPY: {
    label: 'Avak/Javak PO Copy',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  STORE_CHALLAN_RECEIPT_COPY: {
    label: 'Store Challan Copy',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  DIRECT_STORE_ISSUE_COPY: {
    label: 'Direct Store Issue Copy',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
  },
  STORE_DIRECT_ISSUE_COPY: {
    label: 'Direct Store Issue Copy',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
  },
  TO_RECEIPT_CONFIRMATION_COPY: {
    label: 'TO Receipt Closure Copy',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
  },
  ADMIN_CONFIG_CHANGE: {
    label: 'Admin Governance Copy',
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  className = '',
}) => {
  const { language, t } = useLanguage();
  const cfg = STATUS_CONFIG[status] || {
    label: status.replace(/_/g, ' '),
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  const statusKey = `status.${status}`;
  const auditKey = `audit.${status}`;
  const itemTypeKey = `itemType.${status}`;
  const displayLabel =
    language === 'hi'
      ? t(statusKey) !== statusKey
        ? t(statusKey)
        : t(auditKey) !== auditKey
        ? t(auditKey)
        : t(itemTypeKey) !== itemTypeKey
        ? t(itemTypeKey)
        : cfg.label
      : cfg.label;

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-xs font-semibold'
      : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-md border whitespace-nowrap shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} ${className}`}
    >
      {displayLabel}
    </span>
  );
};

export interface RequestItemsSummaryCellProps {
  items?: Array<{ itemType: string }>;
}

export const RequestItemsSummaryCell: React.FC<RequestItemsSummaryCellProps> = ({
  items = [],
}) => {
  const tradeCount = items.filter((i) => i.itemType === 'TRADE').length;
  const nonTradeCount = items.filter(
    (i) => i.itemType === 'NON-TRADE' || i.itemType === 'NON_TRADE'
  ).length;

  if (tradeCount === 0 && nonTradeCount === 0) {
    return <span className="text-slate-400 font-mono text-xs">0 Items</span>;
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      {tradeCount > 0 && (
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-[#1e3a8a] border border-indigo-200">
            TRADE
          </span>
          <span className="text-slate-400">-</span>
          <span className="font-mono font-bold text-slate-900">{tradeCount}</span>
        </span>
      )}
      {nonTradeCount > 0 && (
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
            NON-TRADE
          </span>
          <span className="text-slate-400">-</span>
          <span className="font-mono font-bold text-slate-900">{nonTradeCount}</span>
        </span>
      )}
    </div>
  );
};
