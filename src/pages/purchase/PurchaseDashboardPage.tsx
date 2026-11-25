import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  FileCheck2,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShoppingCart,
  FileSpreadsheet,
} from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { MaterialRequest, PurchaseOrder } from '../../types';

export const PurchaseDashboardPage: React.FC = () => {
  const { requests, purchaseOrders } = useStore();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const approvedForPurchase = requests.filter(
    (r) => r.status === 'APPROVED_FOR_PURCHASE'
  );
  const awaitingAvakPos = purchaseOrders.filter(
    (p) => p.status === 'AWAITING_AVAK_JAVAK'
  );
  const inProgressPos = purchaseOrders.filter(
    (p) => p.status === 'PURCHASE_IN_PROGRESS'
  );
  const completedPos = purchaseOrders.filter((p) => p.status === 'COMPLETED');

  const kpis = [
    {
      label: t('purchase.kpi.awaitingConsolidation'),
      value: approvedForPurchase.length,
      sub: t('purchase.kpi.awaitingConsolidationSub'),
      icon: Printer,
      color: 'text-[#1e3a8a]',
      bg: 'bg-indigo-50 border-indigo-200',
      actionLabel: t('purchase.kpi.consolidateAndPrint'),
      onClick: () => navigate('/purchase/approved'),
    },
    {
      label: t('purchase.kpi.printedAwaitingAvak'),
      value: awaitingAvakPos.length,
      sub: t('purchase.kpi.printedAwaitingAvakSub'),
      icon: FileSpreadsheet,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      actionLabel: t('purchase.kpi.recordAvakJavak'),
      onClick: () => navigate('/purchase/orders'),
    },
    {
      label: t('purchase.kpi.purchaseInProgress'),
      value: inProgressPos.length,
      sub: t('purchase.kpi.purchaseInProgressSub'),
      icon: Truck,
      color: 'text-[#0f766e]',
      bg: 'bg-teal-50 border-teal-200',
      actionLabel: t('purchase.kpi.trackOrders'),
      onClick: () => navigate('/purchase/orders'),
    },
    {
      label: t('purchase.kpi.completedOrders'),
      value: completedPos.length,
      sub: t('purchase.kpi.completedOrdersSub'),
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      actionLabel: t('purchase.kpi.viewPoRegister'),
      onClick: () => navigate('/purchase/orders'),
    },
  ];

  const pendingReqColumns: DataTableColumn<MaterialRequest>[] = [
    {
      id: 'id',
      header: t('col.requestId'),
      accessor: (r) => r.id,
      sortable: true,
      cell: (r) => (
        <span className="font-mono font-bold text-[#1e3a8a]">{r.id}</span>
      ),
    },
    {
      id: 'toName',
      header: language === 'hi' ? 'मांगकर्ता टी.ओ. एवं व्यवसाय' : 'Requesting TO & Trade',
      accessor: (r) => r.toName,
      sortable: true,
      cell: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.toName}</p>
          <p className="text-[11px] text-slate-500">
            {t(`trade.${r.department}`) !== `trade.${r.department}`
              ? t(`trade.${r.department}`)
              : r.department}
          </p>
        </div>
      ),
    },
    {
      id: 'items',
      header: language === 'hi' ? 'स्वीकृत सामग्री मद' : 'Approved Material Lines',
      accessor: (r) => r.items.map((i) => i.itemName).join(', '),
      cell: (r) => (
        <div className="space-y-1">
          {r.items.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5 text-xs">
              <StatusBadge status={item.itemType} size="sm" />
              <span className="font-medium text-slate-800">{item.itemName}</span>
              <span className="font-mono text-slate-500">
                ({item.requestedQty} {item.unit})
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'updatedAt',
      header: language === 'hi' ? 'स्वीकृति दिनांक' : 'Sanctioned Date',
      accessor: (r) => r.updatedAt,
      sortable: true,
      cell: (r) => (
        <span className="font-mono text-xs text-slate-600">
          {format(new Date(r.updatedAt), 'dd MMM yyyy')}
        </span>
      ),
    },
    {
      id: 'status',
      header: t('col.status'),
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const poColumns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: 'id',
      header: t('col.poId'),
      accessor: (p) => p.id,
      sortable: true,
      cell: (p) => (
        <span className="font-mono font-bold text-[#1e3a8a]">{p.id}</span>
      ),
    },
    {
      id: 'avakJavak',
      header: language === 'hi' ? 'आवक/जावक क्र.' : 'Avak/Javak No.',
      accessor: (p) => p.avakJavakNumber || '',
      cell: (p) =>
        p.avakJavakNumber ? (
          <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {p.avakJavakNumber}
          </span>
        ) : (
          <span className="text-xs italic text-amber-700 font-medium">
            {language === 'hi' ? 'प्रेषण मुहर प्रतीक्षारत' : 'Pending Dispatch Stamp'}
          </span>
        ),
    },
    {
      id: 'mode',
      header: language === 'hi' ? 'क्रय माध्यम' : 'Procurement Mode',
      accessor: (p) => p.procurementMode,
      cell: (p) => (
        <div>
          <span className="text-xs font-semibold text-slate-800">
            {p.procurementMode}
          </span>
          {p.tenderRef && (
            <p className="text-[11px] font-mono text-slate-500">{p.tenderRef}</p>
          )}
        </div>
      ),
    },
    {
      id: 'fulfillment',
      header: language === 'hi' ? 'सामग्री प्राप्ति स्थिति' : 'Items Fulfillment',
      accessor: (p) =>
        p.consolidatedItems.reduce((sum, i) => sum + i.receivedQty, 0),
      cell: (p) => {
        const totalOrdered = p.consolidatedItems.reduce(
          (s, i) => s + i.orderedQty,
          0
        );
        const totalReceived = p.consolidatedItems.reduce(
          (s, i) => s + i.receivedQty,
          0
        );
        const pending = Math.max(0, totalOrdered - totalReceived);
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <span>
              {totalReceived} / {totalOrdered} {language === 'hi' ? 'प्राप्त' : 'Received'}
            </span>
            <span className="text-slate-400">·</span>
            <span className={pending > 0 ? 'text-amber-700' : 'text-emerald-700'}>
              {pending} {language === 'hi' ? 'प्रतीक्षारत' : 'Pending'}
            </span>
          </span>
        );
      },
    },
    {
      id: 'status',
      header: language === 'hi' ? 'आदेश स्थिति' : 'Order Status',
      accessor: (p) => p.status,
      cell: (p) => <StatusBadge status={p.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={t('purchase.dashBadge')}
        title={t('purchase.dashTitle')}
        subtitle={t('purchase.dashSubtitle')}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/purchase/approved')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('purchase.btnApprovedPrint', { count: String(approvedForPurchase.length) })}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/purchase/orders')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#0f766e] bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t('purchase.btnManagePOs', { count: String(purchaseOrders.length) })}</span>
            </button>
          </div>
        }
      />

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-2xs flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 truncate">{kpi.sub}</span>
                <button
                  type="button"
                  onClick={kpi.onClick}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a8a] hover:underline shrink-0 cursor-pointer"
                >
                  <span>{kpi.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Summary Table 1: Pending Requisitions Awaiting Consolidation & Print */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#1e3a8a]" />
              <span>{t('purchase.table1.title')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {t('purchase.table1.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/purchase/approved')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1e3a8a] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('purchase.table1.openBtn')}</span>
          </button>
        </div>

        <DataTable
          data={approvedForPurchase}
          columns={pendingReqColumns}
          keyExtractor={(r) => r.id}
          emptyTitle={t('purchase.table1.emptyTitle')}
          emptyDescription={t('purchase.table1.emptyDesc')}
        />
      </div>

      {/* Quick Summary Table 2: Active & Printed Purchase Orders */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0f766e]" />
              <span>{t('purchase.table2.title')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {t('purchase.table2.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/purchase/orders')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0f766e] bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>{t('purchase.table2.goToBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <DataTable
          data={purchaseOrders}
          columns={poColumns}
          keyExtractor={(p) => p.id}
          emptyTitle={t('purchase.table2.emptyTitle')}
          emptyDescription={t('purchase.table2.emptyDesc')}
        />
      </div>
    </div>
  );
};
