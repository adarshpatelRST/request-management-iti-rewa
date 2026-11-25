import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  PlusCircle,
  Eye,
  Edit3,
  CheckCircle2,
  X,
  Layers,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { ModuleFilterBar } from '../../components/ui/ModuleFilterBar';
import { StatusBadge, RequestItemsSummaryCell } from '../../components/ui/StatusBadge';
import { RequestDetailsModal } from '../../components/ui/RequestDetailsModal';
import { MaterialRequest } from '../../types';

export const TOMyRequestsPage: React.FC = () => {
  const { currentUser, requests, confirmReceiptAndClose } = useStore();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  const myRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests
      .filter((r) => r.toId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, currentUser]);

  const filteredRequests = useMemo(() => {
    return myRequests.filter((req) => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = req.id.toLowerCase().includes(q);
        const matchPurpose = req.purpose.toLowerCase().includes(q);
        const matchItem = req.items.some((i) => i.itemName.toLowerCase().includes(q));
        return matchId || matchPurpose || matchItem;
      }
      return true;
    });
  }, [myRequests, statusFilter, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  const handleConfirmReceipt = (req: MaterialRequest) => {
    confirmReceiptAndClose(
      req.id,
      `Physical receipt of materials confirmed by TO ${req.toName} and entered into ${req.department} Trade Stock Register.`
    );
    toast.success(
      language === 'hi'
        ? 'सामग्री प्राप्ति पुष्टि दर्ज एवं मांग पत्र संचित किया गया'
        : 'Request marked as received and closed'
    );
  };

  const columns: DataTableColumn<MaterialRequest>[] = [
    {
      key: 'id',
      header: t('col.requestId'),
      width: '140px',
      wrapText: false,
      render: (row) => (
        <span className="font-mono font-bold text-xs text-[#1e3a8a] whitespace-nowrap">{row.id}</span>
      ),
    },
    {
      key: 'items',
      header: t('col.requestedMaterials'),
      width: '180px',
      render: (row) => <RequestItemsSummaryCell items={row.items} />,
    },
    {
      key: 'purpose',
      header: t('col.purposeJustification'),
      minWidth: '240px',
      render: (row) => (
        <p className="text-xs text-slate-700 line-clamp-2" title={row.purpose}>
          {row.purpose}
        </p>
      ),
    },
    {
      key: 'status',
      header: t('col.currentStatus'),
      width: '185px',
      wrapText: false,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'latestRemark',
      header: t('col.latestRemark'),
      minWidth: '230px',
      render: (row) => {
        const last = row.remarksHistory[row.remarksHistory.length - 1];
        return last ? (
          <div className="space-y-0.5">
            <p className="text-xs text-slate-800">“{last.remark}”</p>
            <p className="text-[11px] text-slate-500 font-medium">
              — {last.actorName} ({last.actorRole})
            </p>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        );
      },
    },
    {
      key: 'date',
      header: t('col.date'),
      width: '110px',
      wrapText: false,
      render: (row) => (
        <span className="text-xs font-mono text-slate-600 whitespace-nowrap">
          {format(new Date(row.createdAt), 'dd MMM yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('col.actions'),
      align: 'right',
      width: '240px',
      wrapText: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === 'REVERTED_BY_TS' && (
            <button
              type="button"
              onClick={() => navigate(`/to/raise-request?edit=${row.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('action.editResubmit')}</span>
            </button>
          )}

          {row.status === 'ITEM_RECEIVED_AT_STORE' && (
            <button
              type="button"
              onClick={() => handleConfirmReceipt(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('action.confirmPhysicalReceipt')}</span>
            </button>
          )}

          <button
            type="button"
            aria-label={`View details for ${row.id}`}
            onClick={() => setSelectedRequest(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1e3a8a] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('col.details')}</span>
          </button>
        </div>
      ),
    },
  ];

  const localizedDept = currentUser?.department
    ? t(`trade.${currentUser.department}`) !== `trade.${currentUser.department}`
      ? t(`trade.${currentUser.department}`)
      : currentUser.department
    : '';

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={`${language === 'hi' ? 'सामग्री मांग पत्र' : 'MY MATERIAL REQUISITIONS'} • ${localizedDept.toUpperCase()}`}
        title={language === 'hi' ? 'मेरे सामग्री मांग पत्र एवं प्राप्ति पुष्टि' : 'My Material Indents & Receipt Confirmation'}
        subtitle={
          language === 'hi'
            ? 'सत्यापन स्थिति देखें, टी.एस. द्वारा सुधार हेतु वापस मांग पत्रों को संशोधित करें तथा प्राप्त सामग्री की पुष्टि करें।'
            : 'Track verification status, revise TS-reverted indents, and confirm receipt of delivered materials.'
        }
        actions={
          <button
            type="button"
            onClick={() => navigate('/to/raise-request')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('to.raiseNewRequest')}</span>
          </button>
        }
      />

      <ModuleFilterBar
        searchPlaceholder={t('search.placeholder')}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        statusLabel={t('filter.status')}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: 'ALL', label: t('status.ALL', { count: String(myRequests.length) }) },
          { value: 'PENDING_TS_VERIFICATION', label: t('status.PENDING_TS_VERIFICATION') },
          { value: 'REVERTED_BY_TS', label: t('status.REVERTED_ACTION_NEEDED') },
          { value: 'REJECTED_BY_TS', label: t('status.REJECTED_BY_TS') },
          { value: 'PENDING_PRINCIPAL_APPROVAL', label: t('status.PENDING_PRINCIPAL_APPROVAL') },
          { value: 'REJECTED_BY_PRINCIPAL', label: t('status.REJECTED_BY_PRINCIPAL') },
          { value: 'APPROVED_FOR_STORE', label: t('status.APPROVED_FOR_STORE') },
          { value: 'APPROVED_FOR_PURCHASE', label: t('status.APPROVED_FOR_PURCHASE') },
          { value: 'PRINTED_AWAITING_AVAK_JAVAK', label: t('status.PRINTED_AWAITING_AVAK_JAVAK') },
          { value: 'PURCHASE_IN_PROGRESS', label: t('status.PURCHASE_IN_PROGRESS') },
          { value: 'PARTIALLY_FULFILLED', label: t('status.PARTIALLY_FULFILLED') },
          { value: 'ITEM_RECEIVED_AT_STORE', label: t('status.MATERIAL_DELIVERED_READY') },
          { value: 'CLOSED', label: t('status.CLOSED_CONFIRMED') },
        ]}
        hasActiveFilters={searchQuery !== '' || statusFilter !== 'ALL'}
        onReset={handleResetFilters}
      />

      <DataTable
        data={filteredRequests}
        columns={columns}
        keyExtractor={(r) => r.id}
        pageSize={10}
        emptyMessage={t('table.empty')}
      />

      {/* View Details Modal with Progress & Remarks History */}
      <RequestDetailsModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        footerActions={
          selectedRequest && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedRequest.status === 'REVERTED_BY_TS' && (
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedRequest.id;
                    setSelectedRequest(null);
                    navigate(`/to/raise-request?edit=${id}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('action.editResubmit')}</span>
                </button>
              )}
            </div>
          )
        }
      />
    </div>
  );
};
