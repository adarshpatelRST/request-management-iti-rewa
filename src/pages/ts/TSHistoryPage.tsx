import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { ModuleFilterBar, FilterField } from '../../components/ui/ModuleFilterBar';
import { StatusBadge, RequestItemsSummaryCell } from '../../components/ui/StatusBadge';
import { DropSearch } from '../../components/ui/DropSearch';
import { RequestDetailsModal } from '../../components/ui/RequestDetailsModal';
import { MaterialRequest } from '../../types';

export const TSHistoryPage: React.FC = () => {
  const { currentUser, requests } = useStore();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  const actedRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests
      .filter(
        (r) => r.tsId === currentUser.id && r.status !== 'PENDING_TS_VERIFICATION'
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [requests, currentUser]);

  const filteredHistory = useMemo(() => {
    return actedRequests.filter((req) => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = req.id.toLowerCase().includes(q);
        const matchTo = req.toName.toLowerCase().includes(q);
        const matchItem = req.items.some((i) => i.itemName.toLowerCase().includes(q));
        return matchId || matchTo || matchItem;
      }
      return true;
    });
  }, [actedRequests, statusFilter, searchQuery]);

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
      key: 'to',
      header: t('col.trainingOfficer'),
      width: '150px',
      render: (row) => (
        <span className="text-xs font-bold text-slate-900">{row.toName}</span>
      ),
    },
    {
      key: 'department',
      header: t('col.department'),
      width: '150px',
      render: (row) => (
        <span className="text-xs text-slate-600">
          {t(`trade.${row.department}`) !== `trade.${row.department}`
            ? t(`trade.${row.department}`)
            : row.department}{' '}
          {language === 'hi' ? 'व्यवसाय' : 'Trade'}
        </span>
      ),
    },
    {
      key: 'items',
      header: t('col.requestedMaterials'),
      width: '180px',
      render: (row) => <RequestItemsSummaryCell items={row.items} />,
    },
    {
      key: 'tsRemark',
      header: t('ts.colActionRemark'),
      minWidth: '240px',
      render: (row) => {
        const tsEntry = [...row.remarksHistory]
          .reverse()
          .find((r) => r.actorRole === 'TS');
        return tsEntry ? (
          <div>
            <p className="text-xs text-slate-800">“{tsEntry.remark}”</p>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              {format(new Date(tsEntry.timestamp), 'dd MMM yyyy, HH:mm')}
            </p>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        );
      },
    },
    {
      key: 'status',
      header: t('ts.histStatusLabel'),
      width: '190px',
      wrapText: false,
      render: (row) => <StatusBadge status={row.status} />,
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
      header: t('col.details'),
      align: 'right',
      width: '110px',
      wrapText: false,
      render: (row) => (
        <button
          type="button"
          aria-label={`View details for ${row.id}`}
          onClick={() => setSelectedRequest(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1e3a8a] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('col.details')}</span>
        </button>
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
        badgeText={t('ts.histBadge', { wing: localizedDept.toUpperCase() })}
        title={t('ts.histTitle')}
        subtitle={t('ts.histSubtitle', { name: currentUser?.name || '' })}
      />

      <ModuleFilterBar
        title={t('ts.histFilterTitle')}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('ALL');
        }}
        hasActiveFilters={searchQuery.trim() !== '' || statusFilter !== 'ALL'}
      >
        <FilterField label={t('ts.histSearchLabel')} htmlFor="ts-hist-search">
          <input
            id="ts-hist-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ts.histSearchPlaceholder')}
            className="w-full h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#1e3a8a]"
          />
        </FilterField>

        <FilterField label={t('ts.histStatusLabel')} htmlFor="ts-hist-status">
          <DropSearch
            placeholder={t('ts.histAllActed', { count: String(actedRequests.length) })}
            searchPlaceholder={t('search.placeholder')}
            value={statusFilter === 'ALL' ? null : statusFilter}
            onChange={(val) => setStatusFilter(val ?? 'ALL')}
            allOption={{ id: 'ALL', label: t('ts.histAllActed', { count: String(actedRequests.length) }) }}
            items={[
              { id: 'PENDING_PRINCIPAL_APPROVAL', label: t('ts.histPendingPrincipal'), subLabel: t('ts.histPendingPrincipalSub') },
              { id: 'REVERTED_BY_TS', label: t('ts.histRevertedByTs'), subLabel: t('ts.histRevertedByTsSub') },
              { id: 'REJECTED_BY_TS', label: t('ts.histRejectedByTs'), subLabel: t('ts.histRejectedByTsSub') },
              { id: 'REJECTED_BY_PRINCIPAL', label: t('ts.histRejectedByPrincipal'), subLabel: t('ts.histRejectedByPrincipalSub') },
              { id: 'APPROVED_FOR_STORE', label: t('ts.histApprovedStore'), subLabel: t('ts.histApprovedStoreSub') },
              { id: 'APPROVED_FOR_PURCHASE', label: t('ts.histApprovedPurchase'), subLabel: t('ts.histApprovedPurchaseSub') },
              { id: 'ITEM_RECEIVED_AT_STORE', label: t('ts.histReceivedStore'), subLabel: t('ts.histReceivedStoreSub') },
              { id: 'CLOSED', label: t('ts.histClosed'), subLabel: t('ts.histClosedSub') },
            ]}
            width="w-full"
          />
        </FilterField>
      </ModuleFilterBar>

      <DataTable
        data={filteredHistory}
        columns={columns}
        keyExtractor={(r) => r.id}
        pageSize={10}
        emptyMessage={t('ts.emptyHistory')}
      />

      <RequestDetailsModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};
