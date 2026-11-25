import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  FileText,
  Clock,
  AlertTriangle,
  PackageCheck,
  PlusCircle,
  Eye,
  X,
  Edit3,
  CheckCircle2,
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

export const TODashboardPage: React.FC = () => {
  const { currentUser, users, requests, confirmReceiptAndClose } = useStore();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  // Localized trade name
  const rawTrade = currentUser?.department || 'Electrician';
  const tradeKey = `trade.${rawTrade}`;
  const localizedTrade = t(tradeKey) !== tradeKey ? t(tradeKey) : rawTrade;

  // Supervising TS lookup based on currentUser's assignedTsId
  const supervisingTs = useMemo(() => {
    if (!currentUser?.assignedTsId) return null;
    return users.find((u) => u.id === currentUser.assignedTsId) || null;
  }, [users, currentUser?.assignedTsId]);

  // All TO Requests sorted by newest first
  const myRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests
      .filter((r) => r.toId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, currentUser]);

  // KPI Metrics
  const totalIndents = myRequests.length;
  const pendingVerificationOrApproval = myRequests.filter(
    (r) =>
      r.status === 'PENDING_TS_VERIFICATION' ||
      r.status === 'PENDING_PRINCIPAL_APPROVAL'
  ).length;
  const revertedCount = myRequests.filter((r) => r.status === 'REVERTED_BY_TS').length;
  const readyForPickupCount = myRequests.filter(
    (r) => r.status === 'ITEM_RECEIVED_AT_STORE'
  ).length;

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return myRequests.filter((req) => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = req.id.toLowerCase().includes(q);
        const matchPurpose = req.purpose.toLowerCase().includes(q);
        const matchItem = req.items.some((i) => i.itemName.toLowerCase().includes(q));
        const matchRemark = req.remarksHistory.some((rem) =>
          rem.remark.toLowerCase().includes(q)
        );
        return matchId || matchPurpose || matchItem || matchRemark;
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
      language === 'hi'
        ? `सामग्री की भौतिक प्राप्ति टी.ओ. ${req.toName} द्वारा प्रमाणित की गई एवं ${req.department} ट्रेड स्टॉक पंजी में दर्ज की गई।`
        : `Physical receipt of materials confirmed by TO ${req.toName} and entered into ${req.department} Trade Stock Register.`
    );
    toast.success(
      language === 'hi'
        ? `मांग पत्र ${req.id} भौतिक रूप से प्राप्त एवं पूर्ण चिह्नित किया गया!`
        : `Request ${req.id} marked as physically received and closed!`
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
      minWidth: '220px',
      render: (row) => {
        const lastRemark = row.remarksHistory[row.remarksHistory.length - 1];
        if (!lastRemark) {
          return <span className="text-xs text-slate-400">—</span>;
        }
        const roleKey = `role.${lastRemark.actorRole}`;
        const roleLabel = t(roleKey) !== roleKey ? t(roleKey) : lastRemark.actorRole;
        return (
          <div className="space-y-0.5">
            <p className="text-xs text-slate-800 line-clamp-2">“{lastRemark.remark}”</p>
            <p className="text-[11px] text-slate-500 font-medium">
              — {lastRemark.actorName} ({roleLabel})
            </p>
          </div>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('action.confirmReceipt')}</span>
            </button>
          )}

          <button
            type="button"
            aria-label={`View details for ${row.id}`}
            onClick={() => setSelectedRequest(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1e3a8a] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('action.view')}</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <PageHeader
        title={t('to.welcome', { name: currentUser?.name || 'Training Officer' })}
        subtitle={t('to.deptInfo', {
          trade: localizedTrade,
          tsName: supervisingTs ? `TS ${supervisingTs.name}` : myRequests[0]?.tsName || 'Assigned Wing TS',
        })}
        actions={
          <button
            type="button"
            onClick={() => navigate('/to/raise-request')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('to.raiseNewRequest')}</span>
          </button>
        }
      />

      {/* 2. KPIs Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">{t('to.kpi.totalIndents')}</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {totalIndents}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('to.kpi.tradeRequisitions', { trade: localizedTrade })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#1e3a8a] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {t('to.kpi.pendingVerification')}
            </p>
            <p className="text-2xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
              {pendingVerificationOrApproval}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('to.kpi.withTsOrPrincipal')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {t('to.kpi.reverted')}
            </p>
            <p className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
              {revertedCount}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              {revertedCount > 0 ? t('to.kpi.requiresEdit') : t('to.kpi.zeroReverts')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {t('to.kpi.readyPickup')}
            </p>
            <p className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              {readyForPickupCount}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {readyForPickupCount > 0
                ? t('to.kpi.collectConfirm')
                : t('to.kpi.noHandovers')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filter Section */}
      <ModuleFilterBar
        searchPlaceholder={
          language === 'hi'
            ? 'मांग पत्र क्रमांक, उद्देश्य, सामग्री अथवा टीप खोजें...'
            : 'Search Req ID, practical purpose, material item, or remark...'
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        statusLabel={language === 'hi' ? 'कार्यप्रवाह स्थिति' : 'Workflow Status'}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: 'ALL', label: t('status.ALL', { count: String(myRequests.length) }) },
          { value: 'PENDING_TS_VERIFICATION', label: t('status.PENDING_TS_VERIFICATION') },
          { value: 'REVERTED_BY_TS', label: t('status.REVERTED_ACTION_NEEDED') },
          { value: 'PENDING_PRINCIPAL_APPROVAL', label: t('status.PENDING_PRINCIPAL_APPROVAL') },
          { value: 'APPROVED_FOR_STORE', label: t('status.APPROVED_FOR_STORE') },
          { value: 'APPROVED_FOR_PURCHASE', label: t('status.APPROVED_FOR_PURCHASE') },
          { value: 'PRINTED_AWAITING_AVAK_JAVAK', label: t('status.PRINTED_AWAITING_PO_DISPATCH') },
          { value: 'ITEM_RECEIVED_AT_STORE', label: t('status.MATERIAL_DELIVERED_READY') },
          { value: 'CLOSED', label: t('status.CLOSED_CONFIRMED') },
          { value: 'REJECTED_BY_PRINCIPAL', label: t('status.REJECTED_BY_PRINCIPAL') },
        ]}
        onReset={handleResetFilters}
        hasActiveFilters={searchQuery.trim() !== '' || statusFilter !== 'ALL'}
      />

      {/* 4. Requests Table with Pagination (10 records per page) */}
      <DataTable
        data={filteredRequests}
        columns={columns}
        keyExtractor={(r) => r.id}
        pageSize={10}
        emptyTitle={
          language === 'hi'
            ? 'कोई सामग्री मांग पत्र प्राप्त नहीं हुआ'
            : 'No Material Requisitions Found'
        }
        emptyDescription={
          searchQuery.trim() || statusFilter !== 'ALL'
            ? language === 'hi'
              ? 'आपके फ़िल्टर के अनुसार कोई मांग पत्र प्राप्त नहीं हुआ। कृपया फ़िल्टर रीसेट करें।'
              : 'No requisitions match your search filters. Try clearing or adjusting filters above.'
            : language === 'hi'
            ? 'आपने अभी तक कोई मांग पत्र दर्ज नहीं किया है। ऊपर "+ नवीन मांग पत्र दर्ज करें" पर क्लिक करें।'
            : 'You have not raised any material requisitions yet. Click "+ Raise New Request" above to create one.'
        }
        toolbar={
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t('to.tableTitle')}
            </h2>
          </div>
        }
      />

      {/* View Details Modal */}
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
              {selectedRequest.status === 'ITEM_RECEIVED_AT_STORE' && (
                <button
                  type="button"
                  onClick={() => {
                    const req = selectedRequest;
                    setSelectedRequest(null);
                    handleConfirmReceipt(req);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('action.confirmPhysicalReceipt')}</span>
                </button>
              )}
            </div>
          )
        }
      />
    </div>
  );
};
