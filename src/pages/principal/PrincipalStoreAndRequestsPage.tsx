import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Eye, X, Lock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { ModuleFilterBar, FilterField } from '../../components/ui/ModuleFilterBar';
import { StatusBadge, RequestItemsSummaryCell } from '../../components/ui/StatusBadge';
import { DropSearch } from '../../components/ui/DropSearch';
import { RequestDetailsModal } from '../../components/ui/RequestDetailsModal';
import { CatalogItem, MaterialRequest } from '../../types';

export const PrincipalStoreViewPage: React.FC = () => {
  const { catalogItems } = useStore();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  const filteredCatalog = useMemo(() => {
    return catalogItems.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (stockFilter === 'LOW' && item.currentStock > item.minThreshold) return false;
      if (stockFilter === 'HEALTHY' && item.currentStock <= item.minThreshold)
        return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [catalogItems, categoryFilter, stockFilter, searchQuery]);

  const columns: DataTableColumn<CatalogItem>[] = [
    {
      key: 'code',
      header: language === 'hi' ? 'कैटलॉग कोड' : 'Catalog Code',
      width: '130px',
      wrapText: false,
      render: (row) => (
        <span className="font-mono font-bold text-xs text-[#1e3a8a]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      header: language === 'hi' ? 'सामग्री का नाम एवं विशिष्टताएं' : 'Material Item & Specifications',
      minWidth: '260px',
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-slate-900">{row.name}</p>
          {row.description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: language === 'hi' ? 'ट्रेड श्रेणी' : 'Trade Category',
      width: '140px',
      wrapText: false,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {t(`trade.${row.category}`) !== `trade.${row.category}`
            ? t(`trade.${row.category}`)
            : row.category}
        </span>
      ),
    },
    {
      key: 'currentStock',
      header: language === 'hi' ? 'उपलब्ध स्टॉक' : 'Available Stock',
      align: 'right',
      width: '150px',
      wrapText: false,
      render: (row) => (
        <span className="font-mono font-bold text-sm text-slate-900">
          {row.currentStock}{' '}
          <span className="text-xs font-normal text-slate-500">{row.unit}</span>
        </span>
      ),
    },
    {
      key: 'minThreshold',
      header: language === 'hi' ? 'न्यूनतम सीमा' : 'Min Threshold',
      align: 'right',
      width: '140px',
      wrapText: false,
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.minThreshold} {row.unit}
        </span>
      ),
    },
    {
      key: 'status',
      header: language === 'hi' ? 'स्टॉक स्थिति' : 'Stock Status',
      width: '160px',
      wrapText: false,
      render: (row) => {
        const isLow = row.currentStock <= row.minThreshold;
        return isLow ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            {language === 'hi' ? 'कम स्टॉक चेतावनी' : 'Low Stock Alert'}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {language === 'hi' ? 'संतोषजनक स्टॉक' : 'Healthy Stock'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={
          language === 'hi'
            ? 'प्राचार्य समीक्षा • केवल-पठनीय भंडार पंजी'
            : 'PRINCIPAL OVERSIGHT • READ-ONLY STORE REGISTER'
        }
        title={
          language === 'hi'
            ? 'केंद्रीय भंडार / मास्टर स्टॉक पंजी (केवल पठनीय)'
            : 'Central Store / Master Inventory (Read-Only)'
        }
        subtitle={
          language === 'hi'
            ? 'समस्त ट्रेड श्रेणियों के वास्तविक भौतिक स्टॉक शेष एवं न्यूनतम पुनः आदेश सीमा की वास्तविक समय समीक्षा।'
            : 'Real-time view of physical stock balances and minimum reorder thresholds across all trade categories.'
        }
        actions={
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200">
            <Lock className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'केवल-पठनीय कार्यकारी दृश्य' : 'Read-Only Executive View'}</span>
          </span>
        }
      />

      <ModuleFilterBar
        title={language === 'hi' ? 'केंद्रीय भंडार इन्वेंटरी फ़िल्टर करें' : 'Filter Central Store Inventory'}
        onReset={() => {
          setSearchQuery('');
          setCategoryFilter('ALL');
          setStockFilter('ALL');
        }}
        hasActiveFilters={
          searchQuery.trim() !== '' ||
          categoryFilter !== 'ALL' ||
          stockFilter !== 'ALL'
        }
      >
        <FilterField
          label={language === 'hi' ? 'सामग्री कोड अथवा नाम खोजें' : 'Search Item Code or Name'}
          htmlFor="princ-store-search"
        >
          <input
            id="princ-store-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'ELC-101, कॉपर वायर, मल्टीमीटर खोजें...'
                : 'Search ELC-101, Copper Wire, Multimeter...'
            }
            className="w-full h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#1e3a8a]"
          />
        </FilterField>

        <FilterField
          label={language === 'hi' ? 'ट्रेड श्रेणी' : 'Trade Category'}
          htmlFor="princ-store-cat"
        >
          <select
            id="princ-store-cat"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#1e3a8a]"
          >
            <option value="ALL">{language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
            <option value="Electrician">{language === 'hi' ? 'इलेक्ट्रीशियन' : 'Electrician'}</option>
            <option value="Fitter">{language === 'hi' ? 'फ़िटर' : 'Fitter'}</option>
            <option value="Electronics">{language === 'hi' ? 'इलेक्ट्रॉनिक्स' : 'Electronics'}</option>
            <option value="General">{language === 'hi' ? 'सामान्य' : 'General'}</option>
          </select>
        </FilterField>

        <FilterField
          label={language === 'hi' ? 'स्टॉक स्थिति' : 'Stock Health'}
          htmlFor="princ-store-health"
        >
          <select
            id="princ-store-health"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#1e3a8a]"
          >
            <option value="ALL">
              {language === 'hi'
                ? `समस्त सामग्री (${catalogItems.length})`
                : `All Items (${catalogItems.length})`}
            </option>
            <option value="LOW">
              {language === 'hi' ? 'केवल कम स्टॉक चेतावनी' : 'Low Stock Alert Only'}
            </option>
            <option value="HEALTHY">
              {language === 'hi' ? 'केवल संतोषजनक स्टॉक' : 'Healthy Stock Only'}
            </option>
          </select>
        </FilterField>
      </ModuleFilterBar>

      <DataTable
        data={filteredCatalog}
        columns={columns}
        keyExtractor={(c) => c.id}
        pageSize={10}
      />
    </div>
  );
};

export const PrincipalAllRequestsPage: React.FC = () => {
  const { requests } = useStore();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (deptFilter !== 'ALL' && req.department !== deptFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          req.id.toLowerCase().includes(q) ||
          req.toName.toLowerCase().includes(q) ||
          req.purpose.toLowerCase().includes(q) ||
          req.items.some((i) => i.itemName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [requests, statusFilter, deptFilter, searchQuery]);

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
      header: language === 'hi' ? 'टी.ओ. एवं विभाग' : 'TO & Department',
      width: '180px',
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-slate-900">{row.toName}</p>
          <p className="text-[11px] text-slate-500">
            {t(`trade.${row.department}`) !== `trade.${row.department}`
              ? t(`trade.${row.department}`)
              : row.department}{' '}
            • TS: {row.tsName}
          </p>
        </div>
      ),
    },
    {
      key: 'items',
      header: t('col.requestedMaterials'),
      width: '180px',
      render: (row) => <RequestItemsSummaryCell items={row.items} />,
    },
    {
      key: 'routing',
      header: language === 'hi' ? 'अग्रेषण एवं क्रय आदेश संदर्भ' : 'Routing & PO Ref',
      width: '160px',
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">
            {row.routingDestination
              ? `${language === 'hi' ? 'अग्रेषित:' : 'Routed:'} ${
                  row.routingDestination === 'PURCHASE'
                    ? language === 'hi'
                      ? 'क्रय शाखा'
                      : 'PURCHASE'
                    : language === 'hi'
                    ? 'भंडार'
                    : 'STORE'
                }`
              : '—'}
          </p>
          {row.linkedPoId && (
            <p className="font-mono text-[11px] text-slate-500">PO: {row.linkedPoId}</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: t('col.currentStatus'),
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
      header: t('col.actions'),
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
          <span>{t('action.view')}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={
          language === 'hi'
            ? 'मास्टर संस्थागत मांग पत्र पंजी'
            : 'MASTER INSTITUTIONAL INDENT REGISTER'
        }
        title={
          language === 'hi'
            ? 'समस्त सामग्री मांग पत्र (संस्था स्तर)'
            : 'All Material Requisitions (Institute-Wide)'
        }
        subtitle={
          language === 'hi'
            ? 'इलेक्ट्रीशियन, फ़िटर, इलेक्ट्रॉनिक्स एवं सामान्य शाखाओं के समस्त मांग पत्रों की विस्तृत एंड-टू-एंड ट्रैकिंग।'
            : 'Complete end-to-end tracker of all requisitions across Electrician, Fitter, Electronics, and General sections.'
        }
      />

      <ModuleFilterBar
        title={language === 'hi' ? 'मास्टर मांग पत्र पंजी फ़िल्टर करें' : 'Filter Master Requisitions Register'}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('ALL');
          setDeptFilter('ALL');
        }}
        hasActiveFilters={
          searchQuery.trim() !== '' || statusFilter !== 'ALL' || deptFilter !== 'ALL'
        }
      >
        <FilterField
          label={language === 'hi' ? 'मांग पत्र क्रमांक / टी.ओ. / सामग्री खोजें' : 'Search Req ID / TO / Item'}
          htmlFor="princ-all-search"
        >
          <input
            id="princ-all-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'REQ-1001, राजेश शर्मा, एग्जॉस्ट फैन खोजें...'
                : 'Search REQ-1001, Rajesh Sharma, Exhaust Fan...'
            }
            className="w-full h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#1e3a8a]"
          />
        </FilterField>

        <FilterField
          label={language === 'hi' ? 'कार्यप्रवाह स्थिति' : 'Workflow Status'}
          htmlFor="princ-all-status"
        >
          <DropSearch
            placeholder={language === 'hi' ? 'सभी स्थितियां' : 'All Statuses'}
            searchPlaceholder={language === 'hi' ? 'कार्यप्रवाह स्थिति खोजें...' : 'Search workflow status...'}
            value={statusFilter === 'ALL' ? null : statusFilter}
            onChange={(val) => setStatusFilter(val ?? 'ALL')}
            allOption={{
              id: 'ALL',
              label: language === 'hi' ? `सभी स्थितियां (${requests.length})` : `All Statuses (${requests.length})`,
            }}
            items={[
              {
                id: 'PENDING_TS_VERIFICATION',
                label: language === 'hi' ? 'टी.एस. सत्यापन प्रतीक्षारत' : 'Pending TS Verification',
                subLabel: language === 'hi' ? 'शाखा अधीक्षक जांच प्रतीक्षारत' : 'Awaiting wing superintendent check',
              },
              {
                id: 'REVERTED_BY_TS',
                label: language === 'hi' ? 'टी.एस. द्वारा सुधार हेतु वापस' : 'Reverted by TS',
                subLabel: language === 'hi' ? 'संशोधन हेतु टी.ओ. को वापस' : 'Returned to TO for modification',
              },
              {
                id: 'PENDING_PRINCIPAL_APPROVAL',
                label: language === 'hi' ? 'प्राचार्य स्वीकृति प्रतीक्षारत' : 'Pending Principal Approval',
                subLabel: language === 'hi' ? 'संस्थागत स्वीकृति प्रतीक्षारत' : 'Awaiting institutional sanction',
              },
              {
                id: 'REJECTED_BY_PRINCIPAL',
                label: language === 'hi' ? 'प्राचार्य द्वारा निरस्त' : 'Rejected by Principal',
                subLabel: language === 'hi' ? 'स्वीकृति अस्वीकृत' : 'Sanction declined',
              },
              {
                id: 'APPROVED_FOR_STORE',
                label: language === 'hi' ? 'भंडार प्रदाय हेतु स्वीकृत' : 'Approved for Store',
                subLabel: language === 'hi' ? 'उपलब्ध स्टॉक से सीधा प्रदाय' : 'Direct issue from available inventory',
              },
              {
                id: 'APPROVED_FOR_PURCHASE',
                label: language === 'hi' ? 'क्रय हेतु स्वीकृत' : 'Approved for Purchase',
                subLabel: language === 'hi' ? 'क्रय शाखा को अग्रेषित' : 'Routed to purchase cell',
              },
              {
                id: 'PRINTED_AWAITING_AVAK_JAVAK',
                label: language === 'hi' ? 'पत्र प्रिंट • आवक/जावक प्रतीक्षारत' : 'Printed • Awaiting Avak/Javak',
                subLabel: language === 'hi' ? 'शासकीय पत्र प्रिंट' : 'Official letter printed',
              },
              {
                id: 'PARTIALLY_FULFILLED',
                label: language === 'hi' ? 'आंशिक सामग्री प्राप्त' : 'Partially Fulfilled',
                subLabel: language === 'hi' ? 'आंशिक सामग्री प्रेषित' : 'Partial items dispatched',
              },
              {
                id: 'ITEM_RECEIVED_AT_STORE',
                label: language === 'hi' ? 'भंडार में प्राप्त' : 'Received at Store',
                subLabel: language === 'hi' ? 'भौतिक प्राप्ति हेतु तैयार' : 'Ready for physical pickup',
              },
              {
                id: 'CLOSED',
                label: language === 'hi' ? 'पूर्णतः संपन्न एवं संचित' : 'Closed',
                subLabel: language === 'hi' ? 'भौतिक प्रदाय संपन्न' : 'Physical issue completed',
              },
            ]}
            width="w-full"
          />
        </FilterField>

        <FilterField
          label={language === 'hi' ? 'विभाग / व्यवसाय' : 'Department / Trade'}
          htmlFor="princ-all-dept"
        >
          <DropSearch
            placeholder={language === 'hi' ? 'सभी विभाग' : 'All Departments'}
            searchPlaceholder={language === 'hi' ? 'विभाग / व्यवसाय खोजें...' : 'Search department / trade...'}
            value={deptFilter === 'ALL' ? null : deptFilter}
            onChange={(val) => setDeptFilter(val ?? 'ALL')}
            allOption={{ id: 'ALL', label: language === 'hi' ? 'सभी विभाग' : 'All Departments' }}
            items={[
              { id: 'Electrician', label: language === 'hi' ? 'इलेक्ट्रीशियन' : 'Electrician' },
              { id: 'Fitter', label: language === 'hi' ? 'फ़िटर' : 'Fitter' },
              { id: 'Electronics', label: language === 'hi' ? 'इलेक्ट्रॉनिक्स' : 'Electronics' },
              { id: 'Welder', label: language === 'hi' ? 'वेल्डर' : 'Welder' },
              { id: 'COPA', label: language === 'hi' ? 'कोपा (COPA)' : 'COPA' },
            ]}
            width="w-full"
          />
        </FilterField>
      </ModuleFilterBar>

      <DataTable
        data={filteredRequests}
        columns={columns}
        keyExtractor={(r) => r.id}
        pageSize={10}
      />

      <RequestDetailsModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};
