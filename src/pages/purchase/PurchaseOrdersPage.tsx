import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Truck,
  CheckCircle2,
  X,
  Eye,
  Stamp,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { FormInput, FormSelect } from '../../components/ui/FormFields';
import { VoiceTypeToggle } from '../../components/ui/VoiceTypeToggle';
import { PurchaseOrder } from '../../types';

export const PurchaseOrdersPage: React.FC = () => {
  const { purchaseOrders, recordAvakJavakAndGenerateOrder } = useStore();
  const { t, language } = useLanguage();

  const awaitingAvakBatches = purchaseOrders.filter(
    (p) => p.status === 'AWAITING_AVAK_JAVAK'
  );
  const activeAndCompletedPos = purchaseOrders.filter(
    (p) => p.status === 'PURCHASE_IN_PROGRESS' || p.status === 'COMPLETED'
  );

  // Modal state for entering Avak/Javak & generating order
  const [selectedBatchForAvak, setSelectedBatchForAvak] =
    useState<PurchaseOrder | null>(null);
  const [avakJavakNumber, setAvakJavakNumber] = useState('');
  const [procurementMode, setProcurementMode] =
    useState<PurchaseOrder['procurementMode']>('GeM Portal');
  const [tenderRef, setTenderRef] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [avakError, setAvakError] = useState('');

  // Modal state for inspecting an active/completed PO
  const [inspectPo, setInspectPo] = useState<PurchaseOrder | null>(null);
  const [inspectPage, setInspectPage] = useState(1);

  const openAvakModal = (po: PurchaseOrder) => {
    setSelectedBatchForAvak(po);
    setAvakJavakNumber(`ITI/REWA/PUR/2026/${114 + purchaseOrders.length}`);
    setProcurementMode('GeM Portal');
    setTenderRef('');
    setVendorName('Vindhya Industrial & Lab Supplies, Rewa');
    setAvakError('');
  };

  const handleGenerateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForAvak) return;

    if (!avakJavakNumber.trim()) {
      setAvakError(
        language === 'hi'
          ? 'आवक/जावक प्रेषण क्रमांक अनिवार्य है।'
          : 'Avak/Javak Dispatch Number is required.'
      );
      return;
    }

    recordAvakJavakAndGenerateOrder(
      selectedBatchForAvak.id,
      avakJavakNumber.trim(),
      procurementMode,
      tenderRef.trim() || undefined,
      vendorName.trim() || undefined
    );

    toast.success(
      language === 'hi'
        ? `क्रय आदेश ${selectedBatchForAvak.id} आवक/जावक क्रमांक ${avakJavakNumber.trim()} सहित प्रेषित किया गया!`
        : `Order ${selectedBatchForAvak.id} dispatched with Avak/Javak No. ${avakJavakNumber.trim()}!`
    );
    setSelectedBatchForAvak(null);
  };

  const awaitingColumns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: 'id',
      header: language === 'hi' ? 'बैच / क्रय आदेश क्रमांक' : 'Batch / PO ID',
      accessor: (p) => p.id,
      sortable: true,
      cell: (p) => (
        <div>
          <span className="font-mono font-bold text-[#1e3a8a]">{p.id}</span>
          <p className="text-[11px] font-mono text-slate-500">
            {language === 'hi' ? 'प्रिंट:' : 'Printed:'}{' '}
            {format(new Date(p.createdAt), 'dd MMM yyyy')}
          </p>
        </div>
      ),
    },
    {
      id: 'sourceReqs',
      header: language === 'hi' ? 'संलग्न मांग पत्र' : 'Linked Requisitions',
      accessor: (p) => p.sourceRequestIds.join(', '),
      cell: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.sourceRequestIds.map((reqId) => (
            <span
              key={reqId}
              className="px-2 py-0.5 text-xs font-mono font-semibold bg-indigo-50 text-[#1e3a8a] border border-indigo-200 rounded"
            >
              {reqId}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'items',
      header: language === 'hi' ? 'समेकित सामग्री' : 'Consolidated Items',
      accessor: (p) => p.consolidatedItems.map((i) => i.itemName).join(', '),
      cell: (p) => (
        <div className="space-y-1">
          {p.consolidatedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5 text-xs">
              <StatusBadge status={item.itemType} size="sm" />
              <span className="font-medium text-slate-800">{item.itemName}</span>
              <span className="font-mono text-slate-600">
                ({item.orderedQty} {item.unit})
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'status',
      header: language === 'hi' ? 'बैच स्थिति' : 'Batch Status',
      accessor: (p) => p.status,
      cell: (p) => <StatusBadge status={p.status} />,
    },
    {
      id: 'actions',
      header: language === 'hi' ? 'ऑफलाइन प्रेषण कार्यवाही' : 'Offline Dispatch Action',
      accessor: (p) => p.id,
      align: 'right',
      cell: (p) => (
        <button
          type="button"
          aria-label={`Enter Avak/Javak and Generate Order for ${p.id}`}
          onClick={() => openAvakModal(p)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
        >
          <Stamp className="w-3.5 h-3.5" />
          <span>
            {language === 'hi'
              ? 'आवक/जावक दर्ज करें एवं आदेश बनाएं'
              : 'Enter Avak/Javak & Generate Order'}
          </span>
        </button>
      ),
    },
  ];

  const activePoColumns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: 'id',
      header: t('col.poId'),
      width: '120px',
      accessor: (p) => p.id,
      sortable: true,
      cell: (p) => (
        <span className="font-mono font-bold text-xs text-[#1e3a8a] whitespace-nowrap">{p.id}</span>
      ),
    },
    {
      id: 'avakJavakNumber',
      header: language === 'hi' ? 'आवक/जावक क्र.' : 'Avak/Javak No.',
      width: '180px',
      accessor: (p) => p.avakJavakNumber || '',
      sortable: true,
      cell: (p) => (
        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
          {p.avakJavakNumber || '—'}
        </span>
      ),
    },
    {
      id: 'challans',
      header: language === 'hi' ? 'कुल चालान' : 'Challan Count',
      width: '110px',
      accessor: (p) => p.challans.length,
      sortable: true,
      cell: (p) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {p.challans.length}
        </span>
      ),
    },
    {
      id: 'status',
      header: t('col.status'),
      width: '180px',
      accessor: (p) => p.status,
      cell: (p) => <StatusBadge status={p.status} />,
    },
    {
      id: 'date',
      header: t('col.date'),
      width: '120px',
      accessor: (p) => p.avakDate || p.createdAt,
      sortable: true,
      cell: (p) => (
        <span className="text-xs font-mono text-slate-600 whitespace-nowrap">
          {p.avakDate ? format(new Date(p.avakDate), 'dd MMM yyyy') : format(new Date(p.createdAt), 'dd MMM yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('col.actions'),
      accessor: (p) => p.id,
      align: 'right',
      cell: (p) => (
        <button
          type="button"
          aria-label={`Inspect Purchase Order ${p.id}`}
          onClick={() => {
            setInspectPo(p);
            setInspectPage(1);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
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
            ? 'चरण 7: आवक/जावक प्रविष्टि एवं आदेश पंजी'
            : 'STEP 7: AVAK/JAVAK ENTRY & ORDER REGISTER'
        }
        title={
          language === 'hi'
            ? 'क्रय आदेश एवं ऑफलाइन आवक/जावक प्रेषण'
            : 'Purchase Orders & Offline Avak/Javak Dispatch'
        }
        subtitle={
          language === 'hi'
            ? 'शासकीय क्रय आदेश जारी करने एवं विक्रेता चालान पूर्ति निगरानी हेतु प्रिंट अग्रसारण पत्रों के लिए संस्थागत आवक/जावक पंजी क्रमांक दर्ज करें।'
            : 'Record the institutional inward/outward (Avak/Javak) register number for printed forwarding letters to generate official purchase orders and monitor vendor challan fulfillment.'
        }
      />

      {/* Section 1: Printed Batches Awaiting Avak/Javak (Shown only when pending) */}
      {awaitingAvakBatches.length > 0 && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'hi'
                    ? `प्रेषण प्रतीक्षारत बैच (${awaitingAvakBatches.length})`
                    : `Batches Awaiting Dispatch (${awaitingAvakBatches.length})`}
                </span>
              </h2>
            </div>
          </div>

          <DataTable
            data={awaitingAvakBatches}
            columns={awaitingColumns}
            keyExtractor={(p) => p.id}
          />
        </div>
      )}

      {/* Section 2: Purchase Orders */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0f766e]" />
              <span>{language === 'hi' ? 'क्रय आदेश' : 'Purchase Orders'}</span>
            </h2>
          </div>
        </div>

        <DataTable
          data={activeAndCompletedPos}
          columns={activePoColumns}
          keyExtractor={(p) => p.id}
          emptyTitle={
            language === 'hi'
              ? 'कोई सक्रिय अथवा पूर्ण क्रय आदेश नहीं है'
              : 'No Active or Completed Purchase Orders'
          }
          emptyDescription={
            language === 'hi'
              ? 'सक्रिय क्रय आदेश जनरेट करने हेतु ऊपर प्रिंट किए गए बैच पर आवक/जावक क्रमांक दर्ज करें।'
              : 'Enter an Avak/Javak number on a printed batch above to generate an active Purchase Order.'
          }
        />
      </div>

      {/* Modal: Enter Avak/Javak & Generate Order */}
      {selectedBatchForAvak && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="avak-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Stamp className="w-5 h-5 text-teal-400 shrink-0" />
                <div className="min-w-0">
                  <h2 id="avak-modal-title" className="text-sm font-bold truncate">
                    {language === 'hi'
                      ? `आवक/जावक दर्ज करें एवं आदेश बनाएं — ${selectedBatchForAvak.id}`
                      : `Enter Avak/Javak & Generate Order — ${selectedBatchForAvak.id}`}
                  </h2>
                  <p className="text-[11px] text-slate-300 truncate hidden sm:block">
                    {language === 'hi' ? 'संलग्न मांग पत्र:' : 'Linked Requisitions:'}{' '}
                    {selectedBatchForAvak.sourceRequestIds.join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <VoiceTypeToggle targetInputId="avak-javak-input" size="xs" variant="dark" />
                <button
                  type="button"
                  aria-label="Close Avak/Javak Modal"
                  onClick={() => setSelectedBatchForAvak(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleGenerateOrderSubmit} noValidate className="p-6 space-y-4 overflow-y-auto flex-1">
              <FormInput
                id="avak-javak-input"
                label={language === 'hi' ? 'आवक/जावक प्रेषण क्रमांक' : 'Avak/Javak Dispatch Number'}
                required
                placeholder="e.g., ITI/REWA/PUR/2026/114"
                value={avakJavakNumber}
                onChange={(e) => {
                  setAvakJavakNumber(e.target.value);
                  setAvakError('');
                }}
                error={avakError}
                helperText={
                  language === 'hi'
                    ? 'प्रिंट किए गए पत्र पर अंकित आधिकारिक ऑफलाइन आवक/जावक पंजी मुहर क्रमांक'
                    : 'Official offline dispatch register stamp number recorded on the printed letter'
                }
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForAvak(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'hi'
                      ? 'आवक/जावक पुष्टि करें एवं आदेश जारी करें'
                      : 'Confirm Avak/Javak & Dispatch Order'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspect PO & Line Items */}
      {inspectPo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspect-po-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                <div>
                  <h2 id="inspect-po-title" className="text-sm font-bold">
                    {language === 'hi'
                      ? `क्रय आदेश विवरण — ${inspectPo.id}`
                      : `Purchase Order Dossier — ${inspectPo.id}`}
                  </h2>
                  <p className="text-[11px] text-slate-300 font-mono">
                    {language === 'hi' ? 'आवक/जावक:' : 'Avak/Javak:'}{' '}
                    {inspectPo.avakJavakNumber || (language === 'hi' ? 'प्रतीक्षारत' : 'Pending')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close PO Details Modal"
                onClick={() => setInspectPo(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {language === 'hi'
                      ? `समेकित सामग्री (${inspectPo.consolidatedItems.length})`
                      : `Consolidated Line Items (${inspectPo.consolidatedItems.length})`}
                  </h3>
                  {inspectPo.consolidatedItems.length > 5 && (
                    <span className="text-xs text-slate-500 font-medium">
                      {language === 'hi'
                        ? `पृष्ठ ${inspectPage} कुल ${Math.ceil(inspectPo.consolidatedItems.length / 5)}`
                        : `Page ${inspectPage} of ${Math.ceil(inspectPo.consolidatedItems.length / 5)}`}
                    </span>
                  )}
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <tr>
                        <th className="px-3.5 py-2.5 text-left font-bold">
                          {language === 'hi' ? 'सामग्री का नाम' : 'Item Name'}
                        </th>
                        <th className="px-3.5 py-2.5 text-left font-bold">
                          {language === 'hi' ? 'प्रकार' : 'Type'}
                        </th>
                        <th className="px-3.5 py-2.5 text-right font-bold">
                          {language === 'hi' ? 'आदेशित मात्रा' : 'Ordered Quantity'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inspectPo.consolidatedItems
                        .slice((inspectPage - 1) * 5, inspectPage * 5)
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                              {item.itemName}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <StatusBadge status={item.itemType} size="sm" />
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-800">
                              {item.orderedQty} {item.unit}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {inspectPo.consolidatedItems.length > 5 && (
                  <div className="flex items-center justify-between pt-2.5 px-1 text-xs text-slate-500">
                    <span>
                      {language === 'hi'
                        ? `प्रदर्शित ${(inspectPage - 1) * 5 + 1} - ${Math.min(
                            inspectPage * 5,
                            inspectPo.consolidatedItems.length
                          )} (कुल ${inspectPo.consolidatedItems.length} सामग्री)`
                        : `Showing ${(inspectPage - 1) * 5 + 1} - ${Math.min(
                            inspectPage * 5,
                            inspectPo.consolidatedItems.length
                          )} of ${inspectPo.consolidatedItems.length} items`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Previous items page"
                        disabled={inspectPage <= 1}
                        onClick={() => setInspectPage((p) => Math.max(1, p - 1))}
                        className="p-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-xs px-1">
                        {inspectPage} / {Math.ceil(inspectPo.consolidatedItems.length / 5)}
                      </span>
                      <button
                        type="button"
                        aria-label="Next items page"
                        disabled={inspectPage >= Math.ceil(inspectPo.consolidatedItems.length / 5)}
                        onClick={() =>
                          setInspectPage((p) =>
                            Math.min(Math.ceil(inspectPo.consolidatedItems.length / 5), p + 1)
                          )
                        }
                        className="p-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setInspectPo(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
