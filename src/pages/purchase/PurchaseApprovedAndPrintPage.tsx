import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  CheckCircle2,
  FileText,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge, RequestItemsSummaryCell } from '../../components/ui/StatusBadge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { consolidateRequestsForPO } from '../../utils/storeLogic';
import { printElementById } from '../../utils/printUtility';
import { MaterialRequest } from '../../types';

export const PurchaseApprovedAndPrintPage: React.FC = () => {
  const { requests, users, createPrintedPurchaseBatch } = useStore();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const purchaseOfficerName =
    users.find((u) => u.role === 'PURCHASE')?.name || 'Vikram Singh';
  const principalName =
    users.find((u) => u.role === 'PRINCIPAL')?.name || 'Dr. A.K. Mishra';

  const [isPrinting, setIsPrinting] = useState(false);

  const approvedRequests = useMemo(
    () => requests.filter((r) => r.status === 'APPROVED_FOR_PURCHASE'),
    [requests]
  );

  // All rows selected by default as required by Prompt 3
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    requests
      .filter((r) => r.status === 'APPROVED_FOR_PURCHASE')
      .map((r) => r.id)
  );

  const [printModalOpen, setPrintModalOpen] = useState(false);

  const handlePrintLetter = async () => {
    setIsPrinting(true);
    try {
      await printElementById('printable-forwarding-letter', '');
    } catch (err) {
      console.error('Print failure, falling back to window.print', err);
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    setSelectedIds(approvedRequests.map((r) => r.id));
  }, [approvedRequests]);

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === approvedRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(approvedRequests.map((r) => r.id));
    }
  };

  const consolidatedItems = useMemo(
    () => consolidateRequestsForPO(requests, selectedIds),
    [requests, selectedIds]
  );

  const tradeConsolidated = useMemo(
    () => consolidatedItems.filter((i) => i.itemType === 'TRADE'),
    [consolidatedItems]
  );

  const nonTradeConsolidated = useMemo(
    () => consolidatedItems.filter((i) => i.itemType === 'NON_TRADE'),
    [consolidatedItems]
  );

  const handleConfirmPrintedAndMove = () => {
    if (selectedIds.length === 0) {
      toast.error(
        language === 'hi'
          ? 'कृपया कम से कम एक स्वीकृत मांग पत्र का चयन करें।'
          : 'Please select at least one approved requisition.'
      );
      return;
    }

    const createdPo = createPrintedPurchaseBatch(selectedIds);
    setPrintModalOpen(false);
    toast.success(
      language === 'hi'
        ? `अग्रसारण पत्र प्रिंट किया गया! बैच ${createdPo.id} 'प्रिंट (आवक/जावक प्रतीक्षारत)' स्थिति में निर्मित हुआ।`
        : `Forwarding Letter printed! Batch ${createdPo.id} created in 'Printed (Awaiting Avak/Javak)' state.`
    );
    navigate('/purchase/orders');
  };

  const columns: DataTableColumn<MaterialRequest>[] = [
    {
      id: 'select',
      header: (
        <button
          type="button"
          aria-label="Select All Approved Requisitions"
          onClick={toggleSelectAll}
          className="inline-flex items-center justify-center text-[#1e3a8a] cursor-pointer"
        >
          {approvedRequests.length > 0 &&
          selectedIds.length === approvedRequests.length ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
        </button>
      ),
      accessor: (r) => r.id,
      cell: (r) => {
        const isChecked = selectedIds.includes(r.id);
        return (
          <input
            type="checkbox"
            aria-label={`Select requisition ${r.id}`}
            checked={isChecked}
            onChange={() => toggleSelectOne(r.id)}
            className="w-4 h-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a] cursor-pointer"
          />
        );
      },
    },
    {
      id: 'id',
      header: 'Requisition ID',
      accessor: (r) => r.id,
      sortable: true,
      cell: (r) => (
        <div>
          <span className="font-mono font-bold text-[#1e3a8a]">{r.id}</span>
          <p className="text-[11px] font-mono text-slate-500">
            {format(new Date(r.createdAt), 'dd MMM yyyy')}
          </p>
        </div>
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
      header: language === 'hi' ? 'स्वीकृत सामग्री एवं प्रगति' : 'Approved Materials & Progress',
      width: '180px',
      cell: (r) => <RequestItemsSummaryCell items={r.items} />,
    },
    {
      id: 'purpose',
      header: t('col.purposeJustification'),
      accessor: (r) => r.purpose,
      cell: (r) => (
        <p className="text-xs text-slate-600 max-w-xs line-clamp-2">{r.purpose}</p>
      ),
    },
    {
      id: 'status',
      header: language === 'hi' ? 'स्वीकृति स्थिति' : 'Approval Status',
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          badgeText={
            language === 'hi'
              ? 'समेकन एवं अग्रसारण पत्र'
              : 'CONSOLIDATION & FORWARDING LETTER'
          }
          title={
            language === 'hi'
              ? 'स्वीकृत मांग पत्र एवं प्रिंट'
              : 'Approved Requests & Print'
          }
          subtitle={
            language === 'hi'
              ? 'शासकीय अग्रसारण पत्र जनरेट करने एवं पूर्वावलोकन हेतु स्वीकृत मांग पत्रों का चयन करें।'
              : 'Select approved requisitions to generate and preview the official forwarding letter.'
          }
          actions={
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => setPrintModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] disabled:opacity-50 disabled:pointer-events-none shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>
                {language === 'hi'
                  ? `हिंदी/अंग्रेजी पत्र पूर्वावलोकन ${selectedIds.length > 0 ? `(${selectedIds.length} चयनित)` : ''}`
                  : `Preview Hindi/English Letter ${selectedIds.length > 0 ? `(${selectedIds.length} Selected)` : ''}`}
              </span>
            </button>
          }
        />

        {/* Approved Requests DataTable */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5">
          <DataTable
            data={approvedRequests}
            columns={columns}
            keyExtractor={(r) => r.id}
            emptyTitle={
              language === 'hi'
                ? 'समेकन हेतु कोई मांग पत्र प्रतीक्षारत नहीं है'
                : 'No Requisitions Currently Awaiting Consolidation'
            }
            emptyDescription={
              language === 'hi'
                ? 'प्राचार्य द्वारा स्वीकृत सभी मांग पत्र प्रिंट बैचों में समेकित किए जा चुके हैं। आवक/जावक क्रमांक दर्ज करने हेतु क्रय आदेश स्क्रीन देखें।'
                : 'All Principal-sanctioned purchase indents have been consolidated into printed batches. Check the Purchase Orders screen to record Avak/Javak numbers.'
            }
          />
        </div>
      </div>

      {/* Hybrid Hindi/English Official Print Letter Modal (@media print ready) */}
      {printModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hindi-print-letter-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            {/* Modal Top Bar (Hidden when printing) */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-teal-400" />
                <div>
                  <h2 id="hindi-print-letter-title" className="text-sm font-bold">
                    {language === 'hi'
                      ? 'शासकीय समेकित अग्रसारण पत्र पूर्वावलोकन (A4 प्रिंट हेतु तैयार)'
                      : 'Official Consolidated Forwarding Letter Preview (A4 Print Ready)'}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close Print Preview Modal"
                onClick={() => setPrintModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable A4 Document Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100">
              <div
                id="printable-forwarding-letter"
                className="bg-white mx-auto max-w-[210mm] border border-slate-300 shadow-sm p-8 sm:p-10 text-slate-950 space-y-6"
              >
                {/* Official Hindi Institutional Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1 hindi-header avoid-break">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                    मध्यप्रदेश शासन, कौशल विकास संचालनालय
                  </p>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-950">
                    कार्यालय प्राचार्य, शासकीय औद्योगिक प्रशिक्षण संस्था (ITI), रीवा (म.प्र.)
                  </h1>
                  <p className="text-xs text-slate-700">
                    रीवा-सतना मार्ग, रीवा (म.प्र.) - 486001 | संस्था कोड: ITI-RW-04
                  </p>
                </div>

                {/* Dispatch Number (Blank for offline Avak/Javak stamp) & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-semibold border-b border-slate-200 pb-3 avoid-break">
                  <div>
                    <span>क्रमांक / क्रय / 2026 / ................</span>
                    <span className="ml-2 text-[11px] font-normal text-slate-500">
                      (आवक/जावक सील हेतु रिक्त)
                    </span>
                  </div>
                  <div>
                    <span>दिनांक: {format(new Date(), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                {/* Recipient & Subject in Hindi */}
                <div className="space-y-3 text-xs sm:text-sm leading-relaxed avoid-break">
                  <div>
                    <p className="font-bold">प्रति,</p>
                    <p className="pl-4 font-semibold">
                      प्राचार्य महोदय / क्रय समिति,
                    </p>
                    <p className="pl-4">शासकीय आई.टी.आई. रीवा (म.प्र.)</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <p className="font-bold">
                      विषय: प्रशिक्षण अधिकारियों (TO) से प्राप्त एवं प्रशिक्षण अधीक्षक (TS)
                      व प्राचार्य द्वारा अनुमोदित सामग्री की समेकित क्रय स्वीकृति एवं आदेश
                      जारी करने बाबत्।
                    </p>
                  </div>

                  <p>
                    <strong>महोदय,</strong>
                    <br />
                    उपरोक्त विषयान्तर्गत संस्था के विभिन्न व्यवसायों (Trades) से प्राप्त
                    अनुमोदित मांग पत्रों (Requisitions:{' '}
                    <span className="font-mono font-bold">
                      {selectedIds.join(', ')}
                    </span>
                    ) का समेकित विवरण निम्नानुसार है:
                  </p>
                </div>

                {/* Table 1: Consolidated Trade Items */}
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                    {language === 'hi'
                      ? '1. ट्रेड सामग्री (अनुमोदित कैटलॉग सामग्री)'
                      : '1. Trade Order Items (Approved Catalog Material)'}
                  </h3>
                  {tradeConsolidated.length === 0 ? (
                    <p className="text-xs italic text-slate-500 border border-slate-200 p-3 rounded">
                      {language === 'hi'
                        ? 'चयनित मांग पत्रों में कोई मानक ट्रेड सामग्री नहीं है।'
                        : 'No standard Trade catalog items in selected requisitions.'}
                    </p>
                  ) : (
                    <div className="overflow-x-auto sm:overflow-x-visible">
                      <table className="w-full table-fixed border-collapse border border-slate-800 text-xs box-border">
                        <colgroup>
                          <col style={{ width: '8%' }} />
                          <col style={{ width: '44%' }} />
                          <col style={{ width: '18%' }} />
                          <col style={{ width: '30%' }} />
                        </colgroup>
                        <thead>
                          <tr className="bg-slate-100 text-slate-900">
                            <th className="border border-slate-800 px-2.5 py-2 text-center font-bold">
                              {language === 'hi' ? 'क्र.सं.' : 'S.No.'}
                            </th>
                            <th className="border border-slate-800 px-2.5 py-2 text-left font-bold">
                              {language === 'hi' ? 'सामग्री का नाम' : 'Item Name'}
                            </th>
                            <th className="border border-slate-800 px-2.5 py-2 text-right font-bold">
                              {language === 'hi' ? 'मात्रा (इकाई)' : 'Quantity (Unit)'}
                            </th>
                            <th className="border border-slate-800 px-2.5 py-2 text-left font-bold">
                              {language === 'hi' ? 'तकनीकी विशिष्टताएं' : 'Technical Specifications'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tradeConsolidated.map((item, idx) => (
                            <tr key={item.id} className="align-top avoid-break">
                              <td className="border border-slate-800 px-2.5 py-2 text-center font-mono">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-800 px-2.5 py-2 font-semibold text-slate-900 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                                {item.itemName}
                              </td>
                              <td className="border border-slate-800 px-2.5 py-2 text-right font-mono font-extrabold text-slate-950 whitespace-nowrap">
                                {item.orderedQty} {item.unit}
                              </td>
                              <td className="border border-slate-800 px-2.5 py-2 text-slate-700 text-[11px] break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                                {item.specifications ||
                                  (language === 'hi'
                                    ? 'मानक ट्रेड पाठ्यक्रम विशिष्टता'
                                    : 'Standard Trade Syllabus Specification')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Table 2: Non-Trade / Ad-hoc Items */}
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
                    {language === 'hi'
                      ? '2. गैर-ट्रेड सामग्री (विशेष / तदर्थ आवश्यकता)'
                      : '2. Non-Trade Order Items (Special / Ad-hoc Requirement)'}
                  </h3>
                  {nonTradeConsolidated.length === 0 ? (
                    <p className="text-xs italic text-slate-500 border border-slate-200 p-3 rounded">
                      {language === 'hi'
                        ? 'चयनित मांग पत्रों में कोई गैर-ट्रेड सामग्री नहीं है।'
                        : 'No Non-Trade / ad-hoc items in selected requisitions.'}
                    </p>
                  ) : (
                    <div className="overflow-x-auto sm:overflow-x-visible">
                      <table className="w-full table-fixed border-collapse border border-slate-800 text-xs box-border">
                        <colgroup>
                          <col style={{ width: '8%' }} />
                          <col style={{ width: '44%' }} />
                          <col style={{ width: '18%' }} />
                          <col style={{ width: '30%' }} />
                        </colgroup>
                        <thead>
                          <tr className="bg-slate-100 text-slate-900">
                            <th className="border border-slate-800 px-2.5 py-2 text-center font-bold">
                              {language === 'hi' ? 'क्र.सं.' : 'S.No.'}
                            </th>
                            <th className="border border-slate-800 px-2.5 py-2 text-left font-bold">
                              {language === 'hi' ? 'सामग्री का नाम' : 'Item Name'}
                            </th>
                            <th className="border border-slate-800 px-2.5 py-2 text-right font-bold">
                              {language === 'hi' ? 'मात्रा (इकाई)' : 'Quantity (Unit)'}
                            </th>
                            <th className="border border-slate-800 px-2.5 py-2 text-left font-bold">
                              {language === 'hi' ? 'तकनीकी विशिष्टताएं' : 'Technical Specifications'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {nonTradeConsolidated.map((item, idx) => (
                            <tr key={item.id} className="align-top avoid-break">
                              <td className="border border-slate-800 px-2.5 py-2 text-center font-mono">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-800 px-2.5 py-2 font-semibold text-slate-900 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                                {item.itemName}
                              </td>
                              <td className="border border-slate-800 px-2.5 py-2 text-right font-mono font-extrabold text-slate-950 whitespace-nowrap">
                                {item.orderedQty} {item.unit}
                              </td>
                              <td className="border border-slate-800 px-2.5 py-2 text-slate-700 text-[11px] break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                                {item.specifications ||
                                  (language === 'hi'
                                    ? 'गैर-ट्रेड / तदर्थ कार्यशाला आवश्यकता'
                                    : 'Non-Trade / Ad-hoc Workshop Requirement')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Hindi Closing & Official Signature Block */}
                <div className="pt-4 space-y-6 text-xs sm:text-sm signature-block avoid-break">
                  <p className="leading-relaxed">
                    उपरोक्त समेकित सामग्री के क्रय हेतु आगामी कार्यवाही एवं आवक/जावक क्रमांक
                    दर्ज कर क्रय आदेश जारी करने हेतु सादर प्रस्तुत।
                  </p>

                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300">
                    <div className="text-center space-y-1">
                      <div className="h-12"></div>
                      <p className="font-bold text-slate-950 text-xs sm:text-sm">
                        ({purchaseOfficerName})
                      </p>
                      <p className="font-semibold text-slate-800 text-xs">
                        प्रभारी क्रय शाखा (Purchase Officer)
                      </p>
                      <p className="text-[11px] text-slate-600">
                        शासकीय औद्योगिक प्रशिक्षण संस्था (ITI), रीवा (म.प्र.)
                      </p>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="h-12"></div>
                      <p className="font-bold text-slate-950 text-xs sm:text-sm">
                        ({principalName})
                      </p>
                      <p className="font-semibold text-slate-800 text-xs">
                        प्राचार्य (Principal)
                      </p>
                      <p className="text-[11px] text-slate-600">
                        शासकीय औद्योगिक प्रशिक्षण संस्था (ITI), रीवा (म.प्र.)
                      </p>
                    </div>
                  </div>

                  {/* Page Footer / Number (Shown in on-screen modal preview, suppressed during print in favor of @bottom-right counter) */}
                  <div className="flex items-center justify-end pt-4 border-t border-slate-200 text-[11px] font-mono text-slate-500 no-print">
                    <span className="print-page-footer">पृष्ठ / Page 1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions (Hidden during print) */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isPrinting}
                  onClick={handlePrintLetter}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#1e3a8a] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {isPrinting
                      ? language === 'hi'
                        ? 'प्रिंट तैयार हो रहा है...'
                        : 'Preparing Multi-Page Print...'
                      : language === 'hi'
                      ? 'शासकीय पत्र प्रिंट करें (A4 Multi-Page Ready)'
                      : 'Print Official Letter (A4 Multi-Page Ready)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPrintedAndMove}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'hi'
                      ? 'प्रिंट पुष्टि करें एवं आदेश जनरेट करें'
                      : 'Confirm Printed & Move to Order Generation'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
