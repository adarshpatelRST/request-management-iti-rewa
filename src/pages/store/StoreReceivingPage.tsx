import React, { useState, useMemo } from 'react';
import {
  Truck,
  CheckCircle2,
  X,
  ArrowRight,
  GitCommitHorizontal,
  ClipboardCheck,
  History,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { FormInput } from '../../components/ui/FormFields';
import { VoiceTypeToggle } from '../../components/ui/VoiceTypeToggle';
import { computeFIFOAllocation } from '../../utils/storeLogic';
import { PurchaseOrder } from '../../types';

export const StoreReceivingPage: React.FC = () => {
  const { purchaseOrders, requests, receiveChallanWithFIFO } = useStore();
  const { t, language } = useLanguage();

  const activePos = useMemo(
    () => purchaseOrders.filter((p) => p.status === 'PURCHASE_IN_PROGRESS'),
    [purchaseOrders]
  );

  const completedPos = useMemo(
    () => purchaseOrders.filter((p) => p.status === 'COMPLETED'),
    [purchaseOrders]
  );

  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [challanNumber, setChallanNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [remarks, setRemarks] = useState('');
  const [receivedNowMap, setReceivedNowMap] = useState<Record<string, number>>({});
  const [challanError, setChallanError] = useState('');
  const [itemsError, setItemsError] = useState('');

  const openChallanModal = (po: PurchaseOrder) => {
    setSelectedPo(po);
    setChallanNumber(`CH-40${po.challans.length + 1}`);
    setDeliveryDate(new Date().toISOString().slice(0, 10));
    setRemarks('');
    setChallanError('');
    setItemsError('');

    const defaultMap: Record<string, number> = {};
    for (const cItem of po.consolidatedItems) {
      const balance = Math.max(0, cItem.orderedQty - cItem.receivedQty);
      defaultMap[cItem.itemName] = balance;
    }
    setReceivedNowMap(defaultMap);
  };

  // Live FIFO Allocation Preview inside the modal
  const liveFifoPreview = useMemo(() => {
    if (!selectedPo) return null;
    const incomingList = Object.entries(receivedNowMap)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([itemName, qty]) => ({ itemName, qty: Number(qty) }));

    if (incomingList.length === 0) {
      return { allocations: [], updatedRequests: [] };
    }

    return computeFIFOAllocation(
      requests,
      selectedPo.sourceRequestIds,
      incomingList
    );
  }, [selectedPo, receivedNowMap, requests]);

  const handleConfirmChallan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPo) return;
    let hasErr = false;

    if (!challanNumber.trim()) {
      setChallanError(
        language === 'hi'
          ? 'विक्रेता चालान क्रमांक रिक्त नहीं हो सकता'
          : 'Vendor Challan Number cannot be empty'
      );
      hasErr = true;
    } else {
      setChallanError('');
    }

    // Validate 0 <= qty <= Balance Expected
    for (const cItem of selectedPo.consolidatedItems) {
      const balance = Math.max(0, cItem.orderedQty - cItem.receivedQty);
      const val = Number(receivedNowMap[cItem.itemName] ?? 0);
      if (Number.isNaN(val) || val < 0 || val > balance) {
        setItemsError(
          language === 'hi'
            ? `${cItem.itemName} हेतु अमान्य मात्रा (${val})। यह 0 एवं शेष प्रत्याशित (${balance}) के मध्य होनी चाहिए।`
            : `Invalid quantity (${val}) for ${cItem.itemName}. Must be between 0 and Balance Expected (${balance}).`
        );
        hasErr = true;
        break;
      }
    }

    const incomingItems = Object.entries(receivedNowMap)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([itemName, qty]) => ({ itemName, qty: Number(qty) }));

    if (!hasErr && incomingItems.length === 0) {
      setItemsError(
        language === 'hi'
          ? 'कृपया कम से कम एक मद हेतु 0 से अधिक वास्तविक प्राप्त मात्रा दर्ज करें।'
          : 'Please enter an Actual Received Now quantity greater than 0 for at least one item.'
      );
      hasErr = true;
    }

    if (hasErr) return;
    setChallanError('');
    setItemsError('');

    const result = receiveChallanWithFIFO(
      selectedPo.id,
      challanNumber.trim(),
      incomingItems,
      selectedPo.vendorName,
      remarks.trim() || undefined,
      deliveryDate
    );

    if (!result.success) {
      setItemsError(result.message);
      return;
    }

    toast.success(
      language === 'hi'
        ? `चालान ${challanNumber.trim()} दर्ज एवं FIFO पद्धति से ${result.allocations?.length || 0} मांग पत्र मदों में सफलतापूर्वक आवंटित किया गया!`
        : result.message
    );
    setSelectedPo(null);
  };

  const activePoColumns: DataTableColumn<PurchaseOrder>[] = [
    {
      id: 'id',
      header: language === 'hi' ? 'क्रय आदेश एवं आवक/जावक' : 'PO ID & Avak/Javak',
      accessor: (p) => p.id,
      sortable: true,
      cell: (p) => (
        <div>
          <span className="font-mono font-bold text-[#1e3a8a]">{p.id}</span>
          <p className="text-[11px] font-mono text-slate-500">
            {language === 'hi' ? 'आवक' : 'Avak'}: {p.avakJavakNumber || '—'}
          </p>
        </div>
      ),
    },
    {
      id: 'sourceReqs',
      header: language === 'hi' ? 'मूल मांग पत्र (FIFO क्रम)' : 'Source Requisitions (FIFO Order)',
      accessor: (p) => p.sourceRequestIds.join(', '),
      cell: (p) => {
        const sortedReqs = requests
          .filter((r) => p.sourceRequestIds.includes(r.id))
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        return (
          <div className="space-y-1">
            {sortedReqs.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-1.5 text-xs">
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">
                  #{idx + 1} FIFO
                </span>
                <span className="font-mono font-semibold text-[#1e3a8a]">
                  {r.id}
                </span>
                <span className="text-slate-600">({r.toName})</span>
                <StatusBadge status={r.status} size="sm" />
              </div>
            ))}
          </div>
        );
      },
    },
    {
      id: 'items',
      header: language === 'hi' ? 'आदेशित बनाम प्राप्त शेष' : 'Ordered vs Received Balance',
      accessor: (p) =>
        p.consolidatedItems.reduce((s, i) => s + i.receivedQty, 0),
      cell: (p) => (
        <div className="space-y-1.5">
          {p.consolidatedItems.map((item) => {
            const bal = Math.max(0, item.orderedQty - item.receivedQty);
            return (
              <div key={item.id} className="text-xs flex items-center gap-2">
                <StatusBadge status={item.itemType} size="sm" />
                <span className="font-semibold text-slate-900">
                  {item.itemName}
                </span>
                <span className="font-mono text-slate-600">
                  {language === 'hi' ? 'आदेशित' : 'Ordered'}: <strong>{item.orderedQty}</strong> · {language === 'hi' ? 'प्राप्त' : 'Recd'}:{' '}
                  <strong className="text-emerald-700">{item.receivedQty}</strong> ·
                  {language === 'hi' ? ' शेष' : ' Bal'}: <strong className="text-amber-700">{bal}</strong> {item.unit}
                </span>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      id: 'challans',
      header: language === 'hi' ? 'दर्ज चालान' : 'Challans Logged',
      accessor: (p) => p.challans.length,
      cell: (p) => (
        <div className="text-xs font-mono text-slate-700">
          {p.challans.length === 0
            ? (language === 'hi' ? '0 चालान' : '0 Challans')
            : p.challans.map((c) => c.challanNumber).join(', ')}
        </div>
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
          aria-label={`Log Vendor Challan for ${p.id}`}
          onClick={() => openChallanModal(p)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'विक्रेता चालान दर्ज करें' : 'Log Vendor Challan'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={
          language === 'hi'
            ? 'चरण 8: आवक चालान प्राप्ति एवं FIFO इंजन'
            : 'STEP 8: INWARD CHALLAN RECEIVING & FIFO ENGINE'
        }
        title={
          language === 'hi'
            ? 'आवक चालान प्राप्ति एवं आंशिक प्रदाय प्रबंधन'
            : 'Inward Challan Receiving & Partial Delivery Management'
        }
        subtitle={
          language === 'hi'
            ? 'सक्रिय क्रय आदेशों के विरुद्ध विक्रेता वितरण चालान दर्ज करें। आंशिक प्रदाय सामग्री स्वतः ही सबसे पहले दर्ज मांग पत्रों को आवंटित होती है (FIFO पद्धति)।'
            : 'Record vendor delivery challans against active Purchase Orders. Partial deliveries automatically allocate stock to the earliest-submitted TO requisitions first (FIFO).'
        }
      />

      {/* Section 1: Active POs Awaiting Delivery */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1e3a8a]" />
              <span>
                {language === 'hi'
                  ? `विक्रेता चालान प्रतीक्षारत सक्रिय क्रय आदेश (${activePos.length})`
                  : `Active Purchase Orders Awaiting Vendor Challan (${activePos.length})`}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'सामग्री आवक दर्ज करने एवं तत्काल FIFO वितरण देखने हेतु "विक्रेता चालान दर्ज करें" पर क्लिक करें'
                : 'Click "Log Vendor Challan" to record partial or full material arrival and preview live FIFO distribution'}
            </p>
          </div>
        </div>

        <DataTable
          data={activePos}
          columns={activePoColumns}
          keyExtractor={(p) => p.id}
          emptyTitle={
            language === 'hi'
              ? 'चालान प्रदाय प्रतीक्षारत कोई सक्रिय PO नहीं है'
              : 'No Active POs Awaiting Challan Delivery'
          }
          emptyDescription={
            language === 'hi'
              ? 'सभी प्रेषित क्रय आदेशों की शत-प्रतिशत आपूर्ति पूर्ण हो चुकी है।'
              : 'All dispatched Purchase Orders have been completely fulfilled.'
          }
        />
      </div>

      {/* Section 2: Completed POs & Historical Challan Log */}
      {completedPos.length > 0 && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              <span>
                {language === 'hi'
                  ? `पूर्ण हो चुके क्रय आदेश (${completedPos.length})`
                  : `Completed Purchase Orders (${completedPos.length})`}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? '100% विक्रेता चालान प्राप्त एवं मांगकर्ता प्रशिक्षण अधिकारियों को आवंटित'
                : '100% vendor challans received and allocated to indenting Training Officers'}
            </p>
          </div>

          <div className="space-y-3">
            {completedPos.map((po) => (
              <div
                key={po.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#1e3a8a]">
                      {po.id}
                    </span>
                    <StatusBadge status={po.status} />
                    <span className="text-xs font-mono text-slate-500">
                      {language === 'hi' ? 'आवक/जावक' : 'Avak/Javak'}: {po.avakJavakNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {language === 'hi' ? 'चालान' : 'Challans'}:{' '}
                    <span className="font-mono font-semibold">
                      {po.challans.map((c) => c.challanNumber).join(', ')}
                    </span>{' '}
                    • {language === 'hi' ? 'मूल मांग पत्र' : 'Source Requisitions'}: {po.sourceRequestIds.join(', ')}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? '100% प्राप्त एवं आवंटित' : '100% Received & Allocated'}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Log Vendor Challan with Live FIFO Allocation Preview */}
      {selectedPo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="challan-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <ClipboardCheck className="w-5 h-5 text-teal-400 shrink-0" />
                <div className="min-w-0">
                  <h2 id="challan-modal-title" className="text-sm font-bold truncate">
                    {language === 'hi'
                      ? `विक्रेता चालान प्रविष्टि एवं FIFO आवंटन — ${selectedPo.id}`
                      : `Log Vendor Challan & FIFO Allocation — ${selectedPo.id}`}
                  </h2>
                  <p className="text-[11px] text-slate-300 font-mono truncate hidden sm:block">
                    {language === 'hi' ? 'आवक/जावक' : 'Avak/Javak'}: {selectedPo.avakJavakNumber} • {language === 'hi' ? 'माध्यम' : 'Mode'}:{' '}
                    {selectedPo.procurementMode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <VoiceTypeToggle targetInputId="challan-remarks-input" size="xs" variant="dark" />
                <button
                  type="button"
                  aria-label="Close Challan Modal"
                  onClick={() => setSelectedPo(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleConfirmChallan}
              noValidate
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              {/* Challan Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput
                  id="challan-number-input"
                  label={language === 'hi' ? 'विक्रेता चालान क्रमांक' : 'Vendor Challan Number'}
                  required
                  placeholder={language === 'hi' ? 'उदा. CH-402' : 'e.g., CH-402'}
                  value={challanNumber}
                  onChange={(e) => {
                    setChallanNumber(e.target.value);
                    if (challanError) setChallanError('');
                  }}
                  error={challanError}
                />
                <FormInput
                  id="challan-date-input"
                  label={language === 'hi' ? 'चालान प्रदाय दिनांक' : 'Challan Delivery Date'}
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
                <FormInput
                  id="challan-remarks-input"
                  label={language === 'hi' ? 'प्राप्ति टीप (वैकल्पिक)' : 'Receiving Remarks (Optional)'}
                  placeholder={
                    language === 'hi'
                      ? 'उदा. शेष 3 मल्टीमीटर प्राप्त हुए'
                      : 'e.g., Balance 3 multimeters received'
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {language === 'hi'
                    ? '1. इस चालान में वास्तविक प्राप्त मात्रा दर्ज करें'
                    : '1. Enter Actual Quantities Received in This Challan'}
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-bold">
                          {language === 'hi' ? 'सामग्री का नाम' : 'Item Name'}
                        </th>
                        <th className="px-3 py-2.5 text-right font-bold">
                          {language === 'hi' ? 'आदेशित मात्रा' : 'Ordered Qty'}
                        </th>
                        <th className="px-3 py-2.5 text-right font-bold">
                          {language === 'hi' ? 'पूर्व प्राप्त मात्रा' : 'Already Received'}
                        </th>
                        <th className="px-3 py-2.5 text-right font-bold">
                          {language === 'hi' ? 'प्रत्याशित शेष' : 'Balance Expected'}
                        </th>
                        <th className="px-3 py-2.5 text-right font-bold w-40">
                          {language === 'hi' ? 'इस चालान में प्राप्त' : 'Actual Received Now'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPo.consolidatedItems.map((cItem) => {
                        const balance = Math.max(
                          0,
                          cItem.orderedQty - cItem.receivedQty
                        );
                        const val = receivedNowMap[cItem.itemName] ?? 0;
                        return (
                          <tr key={cItem.id}>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <StatusBadge status={cItem.itemType} size="sm" />
                                <span className="font-semibold text-slate-900">
                                  {cItem.itemName}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono">
                              {cItem.orderedQty} {cItem.unit}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-emerald-700 font-semibold">
                              {cItem.receivedQty} {cItem.unit}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-amber-700 font-bold">
                              {balance} {cItem.unit}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <input
                                type="number"
                                aria-label={`Actual Received Now for ${cItem.itemName}`}
                                min={0}
                                max={balance}
                                disabled={balance === 0}
                                value={val}
                                onChange={(e) => {
                                  const num = Number.parseInt(
                                    e.target.value || '0',
                                    10
                                  );
                                  setReceivedNowMap((prev) => ({
                                    ...prev,
                                    [cItem.itemName]: Number.isNaN(num) ? 0 : num,
                                  }));
                                  if (itemsError) setItemsError('');
                                }}
                                className="w-24 px-2.5 py-1.5 text-right font-mono font-bold text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] disabled:bg-slate-100"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {itemsError && (
                  <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{itemsError}</span>
                  </div>
                )}
              </div>

              {/* Live FIFO Allocation Preview */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] flex items-center gap-1.5">
                    <GitCommitHorizontal className="w-4 h-4" />
                    <span>
                      {language === 'hi'
                        ? '2. तत्काल FIFO आवंटन पूर्वावलोकन (प्राथमिक मांग पत्र सर्वप्रथम)'
                        : '2. Live FIFO Allocation Preview (Oldest Requisition First)'}
                    </span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    {language === 'hi' ? 'दर्ज दिनांक क्रमानुसार' : 'Sorted by createdAt ASC'}
                  </span>
                </div>

                {!liveFifoPreview || liveFifoPreview.allocations.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">
                    {language === 'hi'
                      ? 'मांग पत्रों में स्वचालित FIFO वितरण देखने हेतु ऊपर शून्य से अधिक मात्रा दर्ज करें।'
                      : 'Enter a positive quantity above to preview automatic FIFO distribution across source TO requisitions.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {liveFifoPreview.allocations.map((alloc) => {
                      const updatedReq = liveFifoPreview.updatedRequests.find(
                        (r) => r.id === alloc.requestId
                      );
                      return (
                        <div
                          key={`${alloc.requestId}-${alloc.itemName}`}
                          className="p-3 rounded-lg bg-white border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#1e3a8a]">
                              {alloc.requestId}
                            </span>
                            <span className="font-semibold text-slate-800">
                              ({alloc.toName})
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              +{alloc.allocatedQty} {alloc.itemName} {language === 'hi' ? 'आवंटित' : 'Allocated'}
                            </span>
                          </div>
                          {updatedReq && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-500">
                                {language === 'hi' ? 'अंतिम स्थिति:' : 'Resulting Status:'}
                              </span>
                              <StatusBadge status={updatedReq.status} size="sm" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPo(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'चालान प्राप्ति की पुष्टि करें' : 'Confirm Challan Receipt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
