import React, { useState, useMemo } from 'react';
import {
  FileSearch,
  Code2,
  X,
  ArrowRightLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { ModuleFilterBar } from '../../components/ui/ModuleFilterBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { AuditLogEntry } from '../../types';

export const AdminAuditLogsPage: React.FC = () => {
  const { auditLogs } = useStore();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        log.entityId.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.actionType.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q);

      const matchesStage =
        stageFilter === 'ALL' || log.actionType === stageFilter;

      const matchesEntity =
        entityFilter === 'ALL' || log.entityType === entityFilter;

      return matchesSearch && matchesStage && matchesEntity;
    });
  }, [auditLogs, searchQuery, stageFilter, entityFilter]);

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      id: 'stage',
      header: language === 'hi' ? 'ऑडिट प्रति चरण' : 'Audit Copy Stage Badge',
      accessor: (l) => l.actionType,
      sortable: true,
      width: '180px',
      minWidth: '160px',
      cell: (l) => <StatusBadge status={l.actionType} size="sm" />,
    },
    {
      id: 'summary',
      header: t('col.summary'),
      accessor: (l) => l.summary,
      minWidth: '280px',
      cell: (l) => (
        <p className="text-xs font-medium text-slate-800">
          {l.summary}
        </p>
      ),
    },
    {
      id: 'entityId',
      header: t('col.recordId'),
      accessor: (l) => l.entityId,
      sortable: true,
      width: '130px',
      minWidth: '120px',
      wrapText: false,
      cell: (l) => (
        <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 whitespace-nowrap">
          {l.entityId}
        </span>
      ),
    },
    {
      id: 'actor',
      header: t('col.performedBy'),
      accessor: (l) => l.actorName,
      sortable: true,
      minWidth: '180px',
      wrapText: false,
      cell: (l) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs font-semibold text-slate-900">
            {l.actorName}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 rounded border border-slate-200">
            {l.actorRole}
          </span>
        </div>
      ),
    },
    {
      id: 'timestamp',
      header: t('col.timestamp'),
      accessor: (l) => l.timestamp,
      sortable: true,
      width: '180px',
      minWidth: '160px',
      wrapText: false,
      cell: (l) => (
        <span className="font-mono text-xs text-slate-600 whitespace-nowrap">
          {format(new Date(l.timestamp), 'dd MMM yyyy, HH:mm')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: language === 'hi' ? 'JSON अंतर' : 'JSON Diff',
      accessor: (l) => l.id,
      align: 'right',
      width: '150px',
      minWidth: '140px',
      cell: (l) => (
        <button
          type="button"
          aria-label={`View JSON Diff for ${l.id}`}
          onClick={() => setSelectedLog(l)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1e3a8a] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'JSON अंतर देखें' : 'View JSON Diff'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={language === 'hi' ? 'अपरिवर्तनीय डिजिटल ऑडिट पंजी' : 'IMMUTABLE AUDIT TRAILS & JSON DIFFS'}
        title={language === 'hi' ? 'ऑडिट लॉग एवं JSON स्थिति स्नैपशॉट' : 'Audit Logs & Side-by-Side JSON State Snapshots'}
        subtitle={
          language === 'hi'
            ? 'संस्थागत कार्यप्रणाली के समस्त परिवर्तनों का अपरिवर्तनीय डिजिटल अभिलेख एवं पूर्व/पश्चात डेटा तुलना।'
            : 'Every workflow transition across all 6 institutional roles generates an immutable audit copy capturing the exact OLD DATA vs NEW DATA JSON payload.'
        }
      />

      <ModuleFilterBar
        searchPlaceholder={
          language === 'hi'
            ? 'अभिलेख क्रमांक (REQ-1005, PO-2001), कार्यवाही अथवा नाम खोजें...'
            : 'Search by Record ID (REQ-1005, PO-2001), Action, or User Name...'
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        categoryLabel={language === 'hi' ? 'ऑडिट प्रति चरण' : 'Audit Document Stage'}
        categoryValue={stageFilter}
        onCategoryChange={setStageFilter}
        categoryOptions={[
          {
            value: 'ALL',
            label: language === 'hi' ? 'सभी ऑडिट प्रति चरण' : 'All Audit Document Stages',
          },
          {
            value: 'CREATE_REQUEST_COPY',
            label:
              language === 'hi'
                ? 'मांग पत्र दर्ज (CREATE_REQUEST)'
                : 'CREATE_REQUEST_COPY',
          },
          {
            value: 'TS_VERIFICATION_COPY',
            label:
              language === 'hi'
                ? 'टी.एस. सत्यापन (TS_VERIFICATION)'
                : 'TS_VERIFICATION_COPY',
          },
          {
            value: 'PRINCIPAL_APPROVAL_COPY',
            label:
              language === 'hi'
                ? 'प्राचार्य स्वीकृति (PRINCIPAL_APPROVAL)'
                : 'PRINCIPAL_APPROVAL_COPY',
          },
          {
            value: 'PRINT_FORWARD_LETTER_COPY',
            label:
              language === 'hi'
                ? 'अग्रसारण पत्र प्रिंट (PRINT_LETTER)'
                : 'PRINT_FORWARD_LETTER_COPY',
          },
          {
            value: 'GENERATE_ORDER_AVAK_JAVAK_COPY',
            label:
              language === 'hi'
                ? 'आवक/जावक क्रय आदेश (AVAK_JAVAK_PO)'
                : 'GENERATE_ORDER_AVAK_JAVAK_COPY',
          },
          {
            value: 'STORE_CHALLAN_RECEIPT_COPY',
            label:
              language === 'hi'
                ? 'भंडार चालान आवक (STORE_CHALLAN)'
                : 'STORE_CHALLAN_RECEIPT_COPY',
          },
          {
            value: 'DIRECT_STORE_ISSUE_COPY',
            label:
              language === 'hi'
                ? 'भंडार सामग्री प्रदाय (DIRECT_ISSUE)'
                : 'DIRECT_STORE_ISSUE_COPY',
          },
          {
            value: 'TO_RECEIPT_CONFIRMATION_COPY',
            label:
              language === 'hi'
                ? 'प्रशिक्षण अधिकारी पावती (TO_RECEIPT)'
                : 'TO_RECEIPT_CONFIRMATION_COPY',
          },
          {
            value: 'ADMIN_CONFIG_CHANGE',
            label:
              language === 'hi'
                ? 'सिस्टम विन्यास अद्यतन (ADMIN_CONFIG)'
                : 'ADMIN_CONFIG_CHANGE',
          },
        ]}
        statusLabel={language === 'hi' ? 'प्रविष्टि प्रकार (Entity)' : 'Entity Type'}
        statusValue={entityFilter}
        onStatusChange={setEntityFilter}
        statusOptions={[
          { value: 'ALL', label: language === 'hi' ? 'सभी प्रविष्टियां' : 'All Entities' },
          {
            value: 'REQUEST',
            label: language === 'hi' ? 'मांग पत्र (REQUEST)' : 'Requisitions (REQUEST)',
          },
          {
            value: 'PURCHASE_ORDER',
            label: language === 'hi' ? 'क्रय आदेश (PO)' : 'Purchase Orders (PO)',
          },
          {
            value: 'CATALOG',
            label: language === 'hi' ? 'मास्टर सामग्री सूची (CATALOG)' : 'Master Catalog (CATALOG)',
          },
          {
            value: 'USER_MAPPING',
            label: language === 'hi' ? 'पदानुक्रम मैपिंग (USER_MAPPING)' : 'Hierarchy Mapping (USER_MAPPING)',
          },
        ]}
        onReset={() => {
          setSearchQuery('');
          setStageFilter('ALL');
          setEntityFilter('ALL');
        }}
      />

      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5">
        <DataTable
          data={filteredLogs}
          columns={columns}
          keyExtractor={(l) => l.id}
          emptyTitle={
            language === 'hi'
              ? 'कोई संबंधित ऑडिट लॉग प्राप्त नहीं हुआ'
              : 'No Matching Audit Logs Found'
          }
          emptyDescription={
            language === 'hi'
              ? 'अपरिवर्तनीय ऑडिट रिकॉर्ड देखने हेतु खोज शब्द अथवा चरण फ़िल्टर साफ़ करें।'
              : 'Clear your search query or stage filter to inspect all immutable audit records.'
          }
        />
      </div>

      {/* Side-by-Side JSON Diff Modal (OLD DATA vs NEW DATA) */}
      {selectedLog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="json-diff-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-5 h-5 text-teal-400" />
                <div>
                  <h2 id="json-diff-modal-title" className="text-sm font-bold">
                    {language === 'hi'
                      ? `ऑडिट प्रति स्नैपशॉट — ${selectedLog.entityId}`
                      : `Audit Copy Snapshot Inspector — ${selectedLog.entityId}`}
                  </h2>
                  <p className="text-[11px] text-slate-300 font-mono">
                    {selectedLog.actionType} • By {selectedLog.actorName} (
                    {selectedLog.actorRole}) •{' '}
                    {format(new Date(selectedLog.timestamp), 'dd MMM yyyy, HH:mm:ss')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close JSON Diff Modal"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-[#1e3a8a]" />
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedLog.summary}
                  </span>
                </div>
                <StatusBadge status={selectedLog.actionType} size="sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Panel: OLD DATA — Before State */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 overflow-hidden flex flex-col">
                  <div className="px-4 py-2.5 bg-rose-100/80 border-b border-rose-200 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-900 uppercase tracking-wider">
                      {language === 'hi'
                        ? 'पूर्व डेटा — परिवर्तन से पहले'
                        : 'OLD DATA — Before State'}
                    </span>
                    <span className="text-[11px] font-mono text-rose-700">
                      {selectedLog.oldData === null
                        ? language === 'hi'
                          ? 'शून्य (नवीन रिकॉर्ड)'
                          : 'NULL (New Record)'
                        : language === 'hi'
                        ? 'स्नैपशॉट'
                        : 'Snapshot'}
                    </span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed flex-1">
                    {JSON.stringify(selectedLog.oldData, null, 2)}
                  </pre>
                </div>

                {/* Right Panel: NEW DATA — After State */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 overflow-hidden flex flex-col">
                  <div className="px-4 py-2.5 bg-emerald-100/80 border-b border-emerald-200 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      {language === 'hi'
                        ? 'नवीन डेटा — परिवर्तन के पश्चात'
                        : 'NEW DATA — After State'}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700">
                      {language === 'hi' ? 'संचित स्थिति' : 'Committed State'}
                    </span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed flex-1">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Close Inspector'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
