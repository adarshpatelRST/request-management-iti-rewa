import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Package,
  ShoppingCart,
  FileSearch,
  GitBranch,
  Layers,
  Eye,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DataTable, DataTableColumn } from '../components/ui/DataTable';
import { ModuleFilterBar, FilterField } from '../components/ui/ModuleFilterBar';
import { StatusBadge, RequestItemsSummaryCell } from '../components/ui/StatusBadge';
import { DropSearch, ComboboxItem } from '../components/ui/DropSearch';
import {
  MaterialRequest,
  PurchaseOrder,
  CatalogItem,
  AuditLogEntry,
  User,
} from '../types';

interface RoleRouteViewProps {
  title: string;
  subtitle: string;
  partLabel: 'PART 2 MODULE' | 'PART 3 MODULE';
  viewMode:
    | 'REQUESTS'
    | 'PURCHASE_ORDERS'
    | 'STORE_INVENTORY'
    | 'AUDIT_LOGS'
    | 'HIERARCHY';
  filterByCurrentRole?: boolean;
}

export const RoleRoutePlaceholder: React.FC<RoleRouteViewProps> = ({
  title,
  subtitle,
  partLabel,
  viewMode,
  filterByCurrentRole = false,
}) => {
  const {
    currentUser,
    users,
    requests,
    purchaseOrders,
    catalogItems,
    auditLogs,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [selectedAudit, setSelectedAudit] = useState<AuditLogEntry | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
  };

  const statusItems: ComboboxItem[] = useMemo(() => {
    if (viewMode === 'REQUESTS') {
      return [
        { id: 'PENDING_TS_VERIFICATION', label: 'Pending TS Verification' },
        { id: 'REVERTED_BY_TS', label: 'Reverted by TS' },
        { id: 'PENDING_PRINCIPAL_APPROVAL', label: 'Pending Principal Approval' },
        { id: 'REJECTED_BY_PRINCIPAL', label: 'Rejected by Principal' },
        { id: 'APPROVED_FOR_PURCHASE', label: 'Approved for Purchase' },
        { id: 'PRINTED_AWAITING_AVAK_JAVAK', label: 'Printed • Awaiting Avak/Javak' },
        { id: 'PARTIALLY_FULFILLED', label: 'Partially Fulfilled' },
        { id: 'ITEM_RECEIVED_AT_STORE', label: 'Received at Store (Ready)' },
        { id: 'CLOSED', label: 'Closed & Verified' },
      ];
    }
    if (viewMode === 'AUDIT_LOGS') {
      return [
        { id: 'TO_REQUEST_COPY', label: 'TO Request Copy' },
        { id: 'TS_VERIFICATION_COPY', label: 'TS Verification Copy' },
        { id: 'PRINCIPAL_APPROVAL_COPY', label: 'Principal Approval Copy' },
        { id: 'PRINT_FORWARD_LETTER_COPY', label: 'Print Forward Letter Copy' },
        { id: 'GENERATE_ORDER_AVAK_JAVAK_COPY', label: 'Avak/Javak PO Copy' },
        { id: 'STORE_CHALLAN_RECEIPT_COPY', label: 'Store Challan Receipt Copy' },
      ];
    }
    if (viewMode === 'PURCHASE_ORDERS') {
      return [
        { id: 'PURCHASE_IN_PROGRESS', label: 'Purchase In Progress' },
        { id: 'AWAITING_AVAK_JAVAK', label: 'Awaiting Avak/Javak' },
      ];
    }
    if (viewMode === 'STORE_INVENTORY') {
      return [
        { id: 'LOW_STOCK', label: 'Low Stock Alert Only' },
        { id: 'HEALTHY', label: 'Healthy Stock Only' },
      ];
    }
    return [];
  }, [viewMode]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter !== 'ALL' || departmentFilter !== 'ALL';

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (filterByCurrentRole && currentUser) {
        if (currentUser.role === 'TO' && req.toId !== currentUser.id) return false;
        if (currentUser.role === 'TS' && req.tsId !== currentUser.id) return false;
      }
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (departmentFilter !== 'ALL' && req.department !== departmentFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = req.id.toLowerCase().includes(q);
        const matchTo = req.toName.toLowerCase().includes(q);
        const matchPurpose = req.purpose.toLowerCase().includes(q);
        const matchItem = req.items.some((i) => i.itemName.toLowerCase().includes(q));
        return matchId || matchTo || matchPurpose || matchItem;
      }
      return true;
    });
  }, [requests, filterByCurrentRole, currentUser, statusFilter, departmentFilter, searchQuery]);

  // Filtered POs
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      if (statusFilter !== 'ALL' && po.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          po.id.toLowerCase().includes(q) ||
          po.avakJavakNumber.toLowerCase().includes(q) ||
          po.procurementMode.toLowerCase().includes(q) ||
          po.consolidatedItems.some((i) => i.itemName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [purchaseOrders, statusFilter, searchQuery]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalogItems.filter((item) => {
      if (departmentFilter !== 'ALL' && item.category !== departmentFilter) return false;
      if (statusFilter === 'LOW_STOCK' && item.currentStock > item.minThreshold) return false;
      if (statusFilter === 'HEALTHY' && item.currentStock <= item.minThreshold) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [catalogItems, departmentFilter, statusFilter, searchQuery]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (statusFilter !== 'ALL' && log.actionType !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          log.id.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q) ||
          log.actorName.toLowerCase().includes(q) ||
          log.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, statusFilter, searchQuery]);

  // Hierarchy TO Users
  const toUsers = useMemo(() => {
    return users.filter((u) => u.role === 'TO');
  }, [users]);

  const requestColumns: DataTableColumn<MaterialRequest>[] = [
    {
      key: 'id',
      header: 'Request ID',
      width: '140px',
      wrapText: false,
      render: (row) => (
        <span className="font-mono font-bold text-xs text-[#1e3a8a] whitespace-nowrap">{row.id}</span>
      ),
    },
    {
      key: 'requester',
      header: 'TO & Trade Dept',
      width: '180px',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.toName}</p>
          <p className="text-[11px] text-slate-500">
            {row.department} • TS: {row.tsName}
          </p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Requested Materials',
      width: '180px',
      render: (row) => <RequestItemsSummaryCell items={row.items} />,
    },
    {
      key: 'purpose',
      header: 'Purpose & Latest Remark',
      minWidth: '240px',
      render: (row) => {
        const lastRemark = row.remarksHistory[row.remarksHistory.length - 1];
        return (
          <div className="space-y-1">
            <p className="text-xs text-slate-800 line-clamp-2" title={row.purpose}>{row.purpose}</p>
            {lastRemark && (
              <p className="text-[11px] text-slate-500 italic">
                “{lastRemark.remark}” — {lastRemark.actorName}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Workflow Status',
      width: '190px',
      wrapText: false,
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} />
          {row.linkedPoId && (
            <p className="text-[11px] font-mono text-slate-500">
              Linked: <span className="font-semibold text-slate-700">{row.linkedPoId}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
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
      header: 'Inspect',
      align: 'right',
      width: '100px',
      wrapText: false,
      render: (row) => (
        <button
          type="button"
          aria-label={`Inspect details for ${row.id}`}
          onClick={() => setSelectedRequest(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1e3a8a] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      ),
    },
  ];

  const poColumns: DataTableColumn<PurchaseOrder>[] = [
    {
      key: 'id',
      header: 'PO Number',
      width: '130px',
      wrapText: false,
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#1e3a8a]">{row.id}</span>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            {format(new Date(row.createdAt), 'dd MMM yyyy')}
          </p>
        </div>
      ),
    },
    {
      key: 'avak',
      header: 'Avak/Javak & Mode',
      width: '210px',
      render: (row) => (
        <div>
          <p className="font-mono text-xs font-semibold text-slate-900">
            {row.avakJavakNumber || '— Pending Dispatch Entry —'}
          </p>
          <p className="text-[11px] text-slate-500">
            {row.procurementMode} {row.tenderRef ? `• ${row.tenderRef}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'sourceReqs',
      header: 'Source Requisitions',
      width: '160px',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.sourceRequestIds.map((reqId) => (
            <span
              key={reqId}
              className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200 rounded"
            >
              {reqId}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Consolidated Items (Received / Ordered)',
      minWidth: '250px',
      render: (row) => (
        <div className="space-y-1">
          {row.consolidatedItems.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-xs">
              <StatusBadge status={c.itemType} />
              <span className="font-semibold text-slate-900">{c.itemName}</span>
              <span className="font-mono font-bold text-[#0f766e]">
                {c.receivedQty}/{c.orderedQty} {c.unit}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'challans',
      header: 'Challans Logged',
      width: '160px',
      render: (row) =>
        row.challans.length === 0 ? (
          <span className="text-xs text-slate-400">No challans yet</span>
        ) : (
          <div className="space-y-1">
            {row.challans.map((ch) => (
              <div key={ch.challanNumber} className="text-xs font-mono text-emerald-700 font-semibold">
                {ch.challanNumber} ({format(new Date(ch.receivedDate), 'dd MMM')})
              </div>
            ))}
          </div>
        ),
    },
    {
      key: 'status',
      header: 'Order Status',
      width: '170px',
      wrapText: false,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const catalogColumns: DataTableColumn<CatalogItem>[] = [
    {
      key: 'code',
      header: 'Item Code',
      width: '120px',
      wrapText: false,
      render: (row) => (
        <span className="font-mono font-bold text-xs text-[#1e3a8a]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Material Description',
      minWidth: '240px',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{row.name}</p>
          {row.description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Trade Category',
      width: '140px',
      wrapText: false,
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">{row.category}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Current Store Stock',
      align: 'right',
      width: '150px',
      wrapText: false,
      render: (row) => (
        <span className="font-mono font-bold text-sm text-slate-900">
          {row.currentStock} <span className="text-xs font-normal text-slate-500">{row.unit}</span>
        </span>
      ),
    },
    {
      key: 'threshold',
      header: 'Min Threshold',
      align: 'right',
      width: '130px',
      wrapText: false,
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.minThreshold} {row.unit}
        </span>
      ),
    },
    {
      key: 'health',
      header: 'Stock Health',
      width: '160px',
      wrapText: false,
      render: (row) => {
        const isLow = row.currentStock <= row.minThreshold;
        return isLow ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            Low Stock Alert
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Healthy Stock
          </span>
        );
      },
    },
  ];

  const auditColumns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: 'id',
      header: 'Audit ID & Timestamp',
      width: '165px',
      wrapText: false,
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-xs text-[#1e3a8a]">{row.id}</span>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            {format(new Date(row.timestamp), 'dd MMM yyyy, HH:mm')}
          </p>
        </div>
      ),
    },
    {
      key: 'actionType',
      header: 'Immutable Copy Type',
      width: '190px',
      wrapText: false,
      render: (row) => <StatusBadge status={row.actionType} />,
    },
    {
      key: 'entityId',
      header: 'Entity Ref',
      width: '120px',
      wrapText: false,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800">{row.entityId}</span>
      ),
    },
    {
      key: 'actor',
      header: 'Officer & Role',
      width: '170px',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-900">{row.actorName}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.actorRole}</p>
        </div>
      ),
    },
    {
      key: 'summary',
      header: 'Transaction Summary',
      minWidth: '260px',
      render: (row) => <p className="text-xs text-slate-700">{row.summary}</p>,
    },
    {
      key: 'diff',
      header: 'JSON Diff',
      align: 'right',
      width: '120px',
      wrapText: false,
      render: (row) => (
        <button
          type="button"
          aria-label={`View JSON diff for ${row.id}`}
          onClick={() => setSelectedAudit(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0f766e] bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View JSON</span>
        </button>
      ),
    },
  ];

  const hierarchyColumns: DataTableColumn<User>[] = [
    {
      key: 'toName',
      header: 'Training Officer (TO)',
      width: '200px',
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-slate-900">{row.name}</p>
          <p className="text-[11px] font-mono text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Trade Department',
      width: '160px',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-800">{row.department}</span>
      ),
    },
    {
      key: 'assignedTs',
      header: 'Assigned Training Superintendent (TS)',
      minWidth: '240px',
      render: (row) => {
        const ts = users.find((u) => u.id === row.assignedTsId);
        return ts ? (
          <div>
            <span className="text-xs font-bold text-[#1e3a8a]">{ts.name}</span>
            <p className="text-[11px] text-slate-500">{ts.department}</p>
          </div>
        ) : (
          <span className="text-xs text-rose-600">Unassigned</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Part Indicator Banner */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-[#1e3a8a] border border-indigo-200 rounded">
              {partLabel}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              StoreContext Live State Connected
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pre-Seeded Records
            </p>
            <p className="text-sm font-mono font-bold text-slate-900">
              {requests.length} Reqs • {purchaseOrders.length} POs • {catalogItems.length} Stock
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Requisitions</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {requests.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Across 8 pre-seeded scenarios
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#1e3a8a] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Master Store Items</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {catalogItems.length}
            </p>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">
              {catalogItems.filter((c) => c.currentStock <= c.minThreshold).length} items below min threshold
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#0f766e] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active Purchase Orders</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {purchaseOrders.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              PO-2001 (GeM) &amp; PO-2002 (Avak Pending)
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Immutable Audit Logs</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {auditLogs.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              JSON-diff state snapshots
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <FileSearch className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Reusable ModuleFilterBar */}
      {viewMode !== 'HIERARCHY' && (
        <ModuleFilterBar
          title={`Filter ${title}`}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        >
          <FilterField label="Search Keyword / ID" htmlFor="filter-search">
            <input
              id="filter-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID (REQ-1001, PO-2001), officer, or item..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#1e3a8a]"
            />
          </FilterField>

          <FilterField label="Workflow Status / Type" htmlFor="filter-status">
            <DropSearch
              placeholder="All Statuses"
              searchPlaceholder="Search status..."
              value={statusFilter === 'ALL' ? null : statusFilter}
              onChange={(val) => setStatusFilter(val ?? 'ALL')}
              allOption={{ id: 'ALL', label: 'All Statuses' }}
              items={statusItems}
              width="w-full"
            />
          </FilterField>

          <FilterField label="Trade Department" htmlFor="filter-dept">
            <select
              id="filter-dept"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#1e3a8a]"
            >
              <option value="ALL">All Departments</option>
              <option value="Electrician">Electrician</option>
              <option value="Fitter">Fitter</option>
              <option value="Electronics">Electronics</option>
              <option value="General">General</option>
            </select>
          </FilterField>
        </ModuleFilterBar>
      )}

      {/* Reusable DataTable */}
      {viewMode === 'REQUESTS' && (
        <DataTable
          data={filteredRequests}
          columns={requestColumns}
          keyExtractor={(r) => r.id}
          pageSize={10}
          toolbar={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1e3a8a]" />
                <span className="text-xs font-bold text-slate-800">
                  Material Requisitions Register ({filteredRequests.length})
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Page size: 10 rows
              </span>
            </div>
          }
        />
      )}

      {viewMode === 'PURCHASE_ORDERS' && (
        <DataTable
          data={filteredPOs}
          columns={poColumns}
          keyExtractor={(p) => p.id}
          pageSize={10}
          toolbar={
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#1e3a8a]" />
              <span className="text-xs font-bold text-slate-800">
                Purchase Orders &amp; Avak/Javak Dispatch Register ({filteredPOs.length})
              </span>
            </div>
          }
        />
      )}

      {viewMode === 'STORE_INVENTORY' && (
        <DataTable
          data={filteredCatalog}
          columns={catalogColumns}
          keyExtractor={(c) => c.id}
          pageSize={10}
          toolbar={
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#0f766e]" />
              <span className="text-xs font-bold text-slate-800">
                Central Store Master Stock Inventory ({filteredCatalog.length})
              </span>
            </div>
          }
        />
      )}

      {viewMode === 'AUDIT_LOGS' && (
        <DataTable
          data={filteredAuditLogs}
          columns={auditColumns}
          keyExtractor={(a) => a.id}
          pageSize={10}
          toolbar={
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-[#1e3a8a]" />
              <span className="text-xs font-bold text-slate-800">
                Immutable JSON-Diff Audit Trail ({filteredAuditLogs.length})
              </span>
            </div>
          }
        />
      )}

      {viewMode === 'HIERARCHY' && (
        <DataTable
          data={toUsers}
          columns={hierarchyColumns}
          keyExtractor={(u) => u.id}
          pageSize={10}
          toolbar={
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#1e3a8a]" />
              <span className="text-xs font-bold text-slate-800">
                Training Officer (TO) to Training Superintendent (TS) Supervisory Mapping
              </span>
            </div>
          }
        />
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="req-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span
                  id="req-modal-title"
                  className="font-mono font-bold text-base text-[#1e3a8a]"
                >
                  {selectedRequest.id}
                </span>
                <StatusBadge status={selectedRequest.status} />
              </div>
              <button
                type="button"
                aria-label="Close Requisition Modal"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500">Training Officer:</span>{' '}
                  <strong className="text-slate-900">{selectedRequest.toName}</strong> (
                  {selectedRequest.department})
                </div>
                <div>
                  <span className="text-slate-500">Supervising TS:</span>{' '}
                  <strong className="text-slate-900">{selectedRequest.tsName}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Purpose:</span>{' '}
                  <span className="text-slate-800 font-medium">{selectedRequest.purpose}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Line Items ({selectedRequest.items.length})
                </h4>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-lg">
                  {selectedRequest.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.itemType} />
                          <span className="font-bold text-slate-900">{item.itemName}</span>
                          {item.itemCode && (
                            <span className="font-mono text-slate-500">({item.itemCode})</span>
                          )}
                        </div>
                        {item.specifications && (
                          <p className="text-slate-500">{item.specifications}</p>
                        )}
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <span className="font-bold text-slate-900">
                          {item.requestedQty} {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Remarks &amp; Approval Trail ({selectedRequest.remarksHistory.length})
                </h4>
                <div className="max-h-[190px] overflow-y-auto space-y-2 pr-1">
                  {selectedRequest.remarksHistory.map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/70"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-900">
                          {rem.actorName} ({rem.actorRole}) — {rem.action}
                        </span>
                        <span className="font-mono text-slate-500">
                          {format(new Date(rem.timestamp), 'dd MMM yyyy, HH:mm')}
                        </span>
                      </div>
                      <p className="text-slate-700">{rem.remark}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JSON-Diff Audit Modal */}
      {selectedAudit && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span
                  id="audit-modal-title"
                  className="font-mono font-bold text-base text-[#1e3a8a]"
                >
                  {selectedAudit.id}
                </span>
                <StatusBadge status={selectedAudit.actionType} />
              </div>
              <button
                type="button"
                aria-label="Close JSON Diff Modal"
                onClick={() => setSelectedAudit(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs font-medium text-slate-700">{selectedAudit.summary}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 mb-1.5">
                    Previous State (oldData)
                  </p>
                  <pre className="p-3 rounded-lg bg-slate-900 text-rose-200 font-mono text-xs overflow-x-auto">
                    {JSON.stringify(selectedAudit.oldData, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">
                    Committed State (newData)
                  </p>
                  <pre className="p-3 rounded-lg bg-slate-900 text-emerald-200 font-mono text-xs overflow-x-auto">
                    {JSON.stringify(selectedAudit.newData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
