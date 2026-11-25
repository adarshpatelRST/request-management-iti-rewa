import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Truck,
  CheckSquare,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { CatalogItem, PurchaseOrder, MaterialRequest } from '../../types';

export const StoreDashboardPage: React.FC = () => {
  const { catalogItems, purchaseOrders, requests } = useStore();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const lowStockItems = catalogItems.filter(
    (c) => c.currentStock <= c.minThreshold
  );
  const activePosAwaitingDelivery = purchaseOrders.filter(
    (p) => p.status === 'PURCHASE_IN_PROGRESS'
  );
  const pendingDirectIssues = requests.filter(
    (r) => r.status === 'APPROVED_FOR_STORE'
  );

  const kpis = [
    {
      label: language === 'hi' ? 'कुल कैटलॉग सामग्री' : 'Total Catalog SKUs',
      value: catalogItems.length,
      sub:
        language === 'hi'
          ? 'मानकीकृत ट्रेड उपभोग्य सामग्री एवं उपकरण'
          : 'Standardized Trade consumables & instruments',
      icon: Package,
      color: 'text-[#1e3a8a]',
      bg: 'bg-indigo-50 border-indigo-200',
      actionLabel: language === 'hi' ? 'स्टॉक पंजी खोलें' : 'Open Stock Ledger',
      onClick: () => navigate('/store/inventory'),
    },
    {
      label: language === 'hi' ? 'कम स्टॉक चेतावनियां' : 'Low Stock Alerts',
      value: lowStockItems.length,
      sub:
        language === 'hi'
          ? 'न्यूनतम सीमा पर अथवा उससे कम सामग्री'
          : 'SKUs at or below minimum threshold',
      icon: AlertTriangle,
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
      actionLabel: language === 'hi' ? 'स्टॉक पुनः भरें' : 'Replenish Stock',
      onClick: () => navigate('/store/inventory'),
    },
    {
      label:
        language === 'hi'
          ? 'प्रदाय प्रतीक्षारत सक्रिय PO'
          : 'Active POs Awaiting Delivery',
      value: activePosAwaitingDelivery.length,
      sub:
        language === 'hi'
          ? 'विक्रेता चालान आवक एवं FIFO आवंटन लंबित'
          : 'Vendor challan inward & FIFO allocation pending',
      icon: Truck,
      color: 'text-[#0f766e]',
      bg: 'bg-teal-50 border-teal-200',
      actionLabel:
        language === 'hi' ? 'विक्रेता चालान दर्ज करें' : 'Log Vendor Challan',
      onClick: () => navigate('/store/receiving'),
    },
    {
      label:
        language === 'hi' ? 'लंबित भंडार प्रदाय' : 'Pending Direct Store Issues',
      value: pendingDirectIssues.length,
      sub:
        language === 'hi'
          ? 'प्राचार्य द्वारा स्वीकृत सीधे स्टॉक आवंटन'
          : 'Principal-sanctioned direct shelf allocations',
      icon: CheckSquare,
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      actionLabel:
        language === 'hi' ? 'टी.ओ. को सामग्री प्रदाय करें' : 'Issue Stock to TO',
      onClick: () => navigate('/store/issues'),
    },
  ];

  const activePoColumns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: 'id',
      header: 'PO ID',
      accessor: (p) => p.id,
      sortable: true,
      cell: (p) => (
        <span className="font-mono font-bold text-[#1e3a8a]">{p.id}</span>
      ),
    },
    {
      id: 'avak',
      header: language === 'hi' ? 'आवक/जावक क्र.' : 'Avak/Javak No.',
      accessor: (p) => p.avakJavakNumber || '',
      cell: (p) => (
        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {p.avakJavakNumber || '—'}
        </span>
      ),
    },
    {
      id: 'fulfillment',
      header: language === 'hi' ? 'प्रदाय प्रगति' : 'Delivery Progress',
      accessor: (p) =>
        p.consolidatedItems.reduce((s, i) => s + i.receivedQty, 0),
      cell: (p) => {
        const ordered = p.consolidatedItems.reduce((s, i) => s + i.orderedQty, 0);
        const received = p.consolidatedItems.reduce((s, i) => s + i.receivedQty, 0);
        const pending = Math.max(0, ordered - received);
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <span>
              {received} / {ordered} {language === 'hi' ? 'प्राप्त' : 'Received'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-700">
              {pending} {language === 'hi' ? 'लंबित' : 'Pending'}
            </span>
          </span>
        );
      },
    },
    {
      id: 'status',
      header: t('col.status'),
      accessor: (p) => p.status,
      cell: (p) => <StatusBadge status={p.status} />,
    },
  ];

  const directIssueColumns: DataTableColumn<MaterialRequest>[] = [
    {
      id: 'id',
      header: t('col.requestId'),
      accessor: (r) => r.id,
      cell: (r) => (
        <span className="font-mono font-bold text-[#1e3a8a]">{r.id}</span>
      ),
    },
    {
      id: 'toName',
      header: language === 'hi' ? 'मांगकर्ता टी.ओ.' : 'Training Officer',
      accessor: (r) => r.toName,
      cell: (r) => (
        <div>
          <p className="font-semibold text-slate-900">{r.toName}</p>
          <p className="text-xs text-slate-500">
            {t(`trade.${r.department}`) !== `trade.${r.department}`
              ? t(`trade.${r.department}`)
              : r.department}
          </p>
        </div>
      ),
    },
    {
      id: 'items',
      header: language === 'hi' ? 'स्वीकृत सामग्री' : 'Sanctioned Material',
      accessor: (r) => r.items.map((i) => i.itemName).join(', '),
      cell: (r) => (
        <div className="space-y-1">
          {r.items.map((i) => (
            <div key={i.id} className="text-xs font-medium text-slate-800">
              {i.itemName} —{' '}
              <span className="font-mono font-bold">
                {i.requestedQty} {i.unit}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'status',
      header: t('col.status'),
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const lowStockColumns: DataTableColumn<CatalogItem>[] = [
    {
      id: 'code',
      header: t('col.itemCode'),
      accessor: (c) => c.code,
      cell: (c) => (
        <span className="font-mono text-xs font-bold text-[#1e3a8a]">
          {c.code}
        </span>
      ),
    },
    {
      id: 'name',
      header: t('col.itemName'),
      accessor: (c) => c.name,
      cell: (c) => <span className="font-semibold text-slate-900">{c.name}</span>,
    },
    {
      id: 'category',
      header: t('col.category'),
      accessor: (c) => c.category,
      cell: (c) => (
        <span className="text-xs text-slate-600">
          {t(`trade.${c.category}`) !== `trade.${c.category}`
            ? t(`trade.${c.category}`)
            : c.category}
        </span>
      ),
    },
    {
      id: 'stock',
      header:
        language === 'hi' ? 'वर्तमान बनाम न्यूनतम सीमा' : 'Current vs Min Threshold',
      accessor: (c) => c.currentStock,
      cell: (c) => (
        <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {c.currentStock} / {c.minThreshold} {c.unit}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={
          language === 'hi'
            ? 'केंद्रीय भंडार कार्यसंचालन'
            : 'CENTRAL STORE OPERATIONS'
        }
        title={
          language === 'hi'
            ? 'केंद्रीय भंडार — सामग्री स्टॉक, चालान आवक एवं प्रदाय'
            : 'Central Store — Inventory, Challan Receiving & Direct Issue'
        }
        subtitle={
          language === 'hi'
            ? 'विक्रेता चालान आवक दर्ज करें (स्वचालित FIFO आवंटन सहित), प्राचार्य द्वारा स्वीकृत सामग्री का सीधा प्रदाय करें एवं ट्रेड स्टॉक की स्थिति प्रबंधित करें।'
            : 'Manage inward vendor challans with automatic FIFO allocation across TO requisitions, execute Principal-sanctioned direct shelf issues, and maintain Trade stock balances.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/store/receiving')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>
                {language === 'hi'
                  ? `आवक चालान प्राप्ति (${activePosAwaitingDelivery.length})`
                  : `Inward Challan Receiving (${activePosAwaitingDelivery.length})`}
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/store/issues')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#0f766e] bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>
                {language === 'hi'
                  ? `सीधा भंडार प्रदाय (${pendingDirectIssues.length})`
                  : `Direct Store Issues (${pendingDirectIssues.length})`}
              </span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary 1: Active POs Awaiting Delivery */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0f766e]" />
                <span>
                  {language === 'hi'
                    ? 'चालान प्रतीक्षारत सक्रिय क्रय आदेश (PO)'
                    : 'Active POs Awaiting Vendor Challan'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'FIFO आवंटन सहित विक्रेता से आंशिक अथवा पूर्ण सामग्री आवक दर्ज करें'
                  : 'Record partial or complete vendor deliveries with FIFO allocation'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/store/receiving')}
              className="text-xs font-semibold text-[#1e3a8a] hover:underline cursor-pointer"
            >
              {language === 'hi' ? 'आवक चालान खोलें →' : 'Open Receiving →'}
            </button>
          </div>
          <DataTable
            data={activePosAwaitingDelivery}
            columns={activePoColumns}
            keyExtractor={(p) => p.id}
            emptyTitle={
              language === 'hi'
                ? 'प्रदाय प्रतीक्षारत कोई सक्रिय क्रय आदेश नहीं है'
                : 'No Active POs Awaiting Delivery'
            }
            emptyDescription={
              language === 'hi'
                ? 'सभी प्रेषित क्रय आदेशों की शत-प्रतिशत सामग्री प्राप्त हो चुकी है।'
                : 'All dispatched Purchase Orders have been 100% received.'
            }
          />
        </div>

        {/* Summary 2: Pending Direct Store Issues */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'hi'
                    ? 'लंबित सीधा भंडार प्रदाय'
                    : 'Pending Direct Store Issues'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'प्राचार्य द्वारा सीधे भंडार से प्रदाय हेतु स्वीकृत मांग पत्र'
                  : 'Requisitions sanctioned by Principal for direct shelf issue'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/store/issues')}
              className="text-xs font-semibold text-[#1e3a8a] hover:underline cursor-pointer"
            >
              {language === 'hi' ? 'सीधा प्रदाय खोलें →' : 'Open Direct Issues →'}
            </button>
          </div>
          <DataTable
            data={pendingDirectIssues}
            columns={directIssueColumns}
            keyExtractor={(r) => r.id}
            emptyTitle={
              language === 'hi'
                ? 'सीधे प्रदाय हेतु कोई मांग पत्र लंबित नहीं है'
                : 'No Pending Direct Store Issues'
            }
            emptyDescription={
              language === 'hi'
                ? 'वर्तमान में कोई भी मांग पत्र सीधे भंडार से आवंटन हेतु प्रतीक्षारत नहीं है।'
                : 'No requisitions are currently awaiting direct shelf issue.'
            }
          />
        </div>
      </div>

      {/* Summary 3: Low Stock Alerts */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>
                {language === 'hi'
                  ? `न्यूनतम स्टॉक चेतावनी (${lowStockItems.length})`
                  : `Low Stock Threshold Alerts (${lowStockItems.length})`}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'न्यूनतम स्टॉक सीमा पर अथवा उससे नीचे की सामग्री जिन्हें पुनः क्रय की आवश्यकता है'
                : 'Trade items at or below minimum shelf threshold requiring replenishment'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/store/inventory')}
            className="text-xs font-semibold text-[#1e3a8a] hover:underline cursor-pointer"
          >
            {language === 'hi' ? 'इन्वेंट्री पंजी प्रबंधित करें →' : 'Manage Inventory Ledger →'}
          </button>
        </div>
        <DataTable
          data={lowStockItems}
          columns={lowStockColumns}
          keyExtractor={(c) => c.id}
          emptyTitle={
            language === 'hi'
              ? 'सभी सामग्री पर्याप्त मात्रा में उपलब्ध हैं'
              : 'All Catalog Items Adequately Stocked'
          }
          emptyDescription={
            language === 'hi'
              ? 'केंद्रीय भंडार में प्रत्येक सामग्री न्यूनतम स्टॉक सीमा से अधिक मात्रा में उपलब्ध है।'
              : 'Every SKU in the Central Store is above its minimum stock threshold.'
          }
        />
      </div>
    </div>
  );
};
