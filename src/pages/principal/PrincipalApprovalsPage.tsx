import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  ShieldCheck,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { StatusBadge, RequestItemsSummaryCell } from '../../components/ui/StatusBadge';
import { FormTextarea } from '../../components/ui/FormFields';
import { VoiceTypeToggle } from '../../components/ui/VoiceTypeToggle';
import { MaterialRequest } from '../../types';

export const PrincipalApprovalsPage: React.FC = () => {
  const {
    requests,
    catalogItems,
    purchaseOrders,
    approveRequestByPrincipal,
    rejectRequestByPrincipal,
  } = useStore();
  const { t, language } = useLanguage();

  const [reviewingRequest, setReviewingRequest] = useState<MaterialRequest | null>(null);
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [routingDestination, setRoutingDestination] = useState<'STORE' | 'PURCHASE'>(
    'STORE'
  );
  const [principalRemark, setPrincipalRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');

  const pendingApprovals = useMemo(
    () =>
      requests
        .filter((r) => r.status === 'PENDING_PRINCIPAL_APPROVAL')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [requests]
  );

  const openApprovalModal = (req: MaterialRequest) => {
    setReviewingRequest(req);
    setDecisionMode('APPROVE');
    setPrincipalRemark('');
    setRemarkError('');
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingRequest) return;

    if (decisionMode === 'REJECT' && !principalRemark.trim()) {
      setRemarkError(
        language === 'hi'
          ? 'मांग पत्र निरस्त करते समय प्राचार्य की टीप दर्ज करना अनिवार्य है।'
          : 'Principal Remarks are required when rejecting a requisition.'
      );
      return;
    }

    if (decisionMode === 'APPROVE') {
      const defaultMsg =
        language === 'hi'
          ? 'क्रय शाखा द्वारा समेकन एवं आधिकारिक पत्र प्रिंट हेतु प्राचार्य द्वारा स्वीकृत।'
          : 'Approved by Principal for Purchase Cell consolidation and official letter printing.';

      approveRequestByPrincipal(
        reviewingRequest.id,
        'PURCHASE',
        principalRemark.trim() || defaultMsg
      );

      toast.success(
        language === 'hi'
          ? `${reviewingRequest.id} स्वीकृत कर क्रय हेतु क्रय शाखा को प्रेषित किया गया!`
          : `${reviewingRequest.id} sanctioned and routed to Purchase Cell for Procurement!`
      );
    } else {
      rejectRequestByPrincipal(reviewingRequest.id, principalRemark.trim());
      toast.error(
        language === 'hi'
          ? `${reviewingRequest.id} प्राचार्य द्वारा निरस्त किया गया।`
          : `${reviewingRequest.id} rejected by Principal.`
      );
    }

    setReviewingRequest(null);
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
            : row.department}
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
      key: 'tsRemarks',
      header: language === 'hi' ? 'टी.एस. सत्यापन टीप' : 'TS Verifier Remarks',
      minWidth: '230px',
      render: (row) => {
        const tsEntry = [...row.remarksHistory]
          .reverse()
          .find((r) => r.actorRole === 'TS');
        return tsEntry ? (
          <div>
            <p className="text-xs text-slate-800">“{tsEntry.remark}”</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              — {tsEntry.actorName} ({language === 'hi' ? 'सत्यापित' : 'Verified'})
            </p>
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            {language === 'hi' ? 'टी.एस. द्वारा सत्यापित' : 'Verified by TS'}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: t('col.status'),
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
      header: language === 'hi' ? 'स्वीकृति कार्यवाही' : 'Sanction Action',
      align: 'right',
      width: '170px',
      wrapText: false,
      render: (row) => (
        <button
          type="button"
          onClick={() => openApprovalModal(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'समीक्षा एवं स्वीकृति' : 'Review & Approve'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={
          language === 'hi'
            ? 'प्राचार्य स्वीकृति एवं अग्रेषण पटल'
            : 'PRINCIPAL SANCTION & ROUTING DESK'
        }
        title={
          language === 'hi'
            ? 'प्राचार्य स्वीकृति कतार'
            : 'Principal Approval Queue'
        }
        subtitle={
          language === 'hi'
            ? 'टी.एस. सत्यापित सामग्री मांग पत्रों की समीक्षा करें तथा संस्थागत क्रय हेतु स्वीकृति प्रदान करें।'
            : 'Review TS-verified material requisitions and approve for institutional procurement.'
        }
      />

      <DataTable
        data={pendingApprovals}
        columns={columns}
        keyExtractor={(r) => r.id}
        pageSize={10}
        emptyMessage={
          language === 'hi'
            ? 'वर्तमान में कोई टी.एस. सत्यापित मांग पत्र प्राचार्य स्वीकृति हेतु लंबित नहीं है।'
            : 'No TS-verified requisitions are currently awaiting Principal approval.'
        }
        toolbar={
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {language === 'hi'
                  ? `प्राचार्य स्वीकृति प्रतीक्षारत टी.एस. सत्यापित मांग पत्र (${pendingApprovals.length})`
                  : `TS-Verified Requisitions Awaiting Principal Sanction (${pendingApprovals.length})`}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === 'hi'
                  ? 'क्रय हेतु स्वीकृति प्रदान करने के लिए "समीक्षा एवं स्वीकृति" पर क्लिक करें'
                  : 'Click "Review & Approve" to sanction requisition for procurement'}
              </p>
            </div>
          </div>
        }
      />

      {/* Principal Approval & Routing Modal */}
      {reviewingRequest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="principal-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xl max-w-3xl w-full my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  id="principal-modal-title"
                  className="font-mono font-bold text-sm sm:text-base text-[#1e3a8a] truncate"
                >
                  {language === 'hi'
                    ? `प्राचार्य स्वीकृति — ${reviewingRequest.id}`
                    : `Principal Approval — ${reviewingRequest.id}`}
                </span>
                <StatusBadge status={reviewingRequest.status} />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <VoiceTypeToggle targetInputId="principal-remarks-input" size="xs" variant="light" />
                <button
                  type="button"
                  aria-label="Close Principal Modal"
                  onClick={() => setReviewingRequest(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleConfirmDecision}
              className="p-5 space-y-4 overflow-y-auto flex-1 text-xs"
            >
              {/* Request Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500">
                    {language === 'hi' ? 'मांगकर्ता टी.ओ.:' : 'Indenting TO:'}
                  </span>{' '}
                  <strong className="text-slate-900">{reviewingRequest.toName}</strong> (
                  {t(`trade.${reviewingRequest.department}`) !== `trade.${reviewingRequest.department}`
                    ? t(`trade.${reviewingRequest.department}`)
                    : reviewingRequest.department}
                  )
                </div>
                <div>
                  <span className="text-slate-500">
                    {language === 'hi' ? 'टी.एस. द्वारा सत्यापित:' : 'Verified By TS:'}
                  </span>{' '}
                  <strong className="text-slate-900">{reviewingRequest.tsName}</strong>
                </div>
                <div className="sm:col-span-2 min-w-0 max-w-full">
                  <span className="text-slate-500">
                    {language === 'hi' ? 'प्रायोगिक औचित्य:' : 'Practical Justification:'}
                  </span>{' '}
                  <span className="text-slate-900 font-medium break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                    {reviewingRequest.purpose}
                  </span>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {language === 'hi' ? 'मांगी गई सामग्री' : 'Requested Material Items'}
                </h3>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-lg">
                  {reviewingRequest.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <StatusBadge status={item.itemType} />
                          <span className="font-bold text-slate-900 text-sm break-words [overflow-wrap:anywhere] [word-break:break-word]">
                            {item.itemName}
                          </span>
                          {item.itemCode && (
                            <span className="font-mono text-slate-500 shrink-0">
                              ({item.itemCode})
                            </span>
                          )}
                        </div>
                        {item.specifications && (
                          <p className="text-slate-500 break-words [overflow-wrap:anywhere] [word-break:break-word]">{item.specifications}</p>
                        )}
                      </div>

                      <div className="px-3 py-1.5 rounded-lg border font-mono text-xs font-bold shrink-0 bg-slate-50 text-slate-800 border-slate-200">
                        {language === 'hi' ? 'मांग:' : 'Requested:'} {item.requestedQty} {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Controls: Radio / Toggle Approve vs Reject */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                    {language === 'hi' ? 'प्राचार्य निर्णय' : 'Principal Decision'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDecisionMode('APPROVE');
                        setRemarkError('');
                      }}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        decisionMode === 'APPROVE'
                          ? 'bg-teal-50 border-[#0f766e] text-slate-900 ring-2 ring-[#0f766e]/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          decisionMode === 'APPROVE' ? 'text-[#0f766e]' : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <p className="font-bold text-xs">
                          {language === 'hi' ? 'मांग पत्र स्वीकृत करें' : 'Approve Request'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {language === 'hi'
                            ? 'संस्थागत क्रय हेतु मांग स्वीकृत करें'
                            : 'Sanction indent for institutional procurement'}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionMode('REJECT')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        decisionMode === 'REJECT'
                          ? 'bg-rose-50 border-rose-600 text-slate-900 ring-2 ring-rose-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <XCircle
                        className={`w-4 h-4 shrink-0 ${
                          decisionMode === 'REJECT' ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <p className="font-bold text-xs">
                          {language === 'hi' ? 'मांग निरस्त करें' : 'Reject / Discard'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {language === 'hi'
                            ? 'कारण सहित मांग पत्र अस्वीकृत करें'
                            : 'Decline requisition with reason'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <FormTextarea
                  id="principal-remarks-input"
                  label={
                    language === 'hi'
                      ? 'प्राचार्य स्वीकृति / निरस्तीकरण टीप'
                      : 'Principal Sanction / Rejection Remarks'
                  }
                  required={decisionMode === 'REJECT'}
                  rows={2}
                  maxLength={250}
                  placeholder={
                    decisionMode === 'APPROVE'
                      ? language === 'hi'
                        ? 'क्रय अधिकारी हेतु वैकल्पिक स्वीकृति टीप...'
                        : 'Optional sanction remarks for Purchase Officer...'
                      : language === 'hi'
                      ? 'सामग्री मांग निरस्त करने का अनिवार्य कारण...'
                      : 'Mandatory reason for rejecting this material indent...'
                  }
                  value={principalRemark}
                  onChange={(e) => {
                    setPrincipalRemark(e.target.value);
                    if (remarkError) setRemarkError('');
                  }}
                  error={remarkError}
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReviewingRequest(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer ${
                    decisionMode === 'APPROVE'
                      ? 'bg-[#1e3a8a] hover:bg-[#172554]'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {decisionMode === 'APPROVE' ? (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>
                        {language === 'hi'
                          ? 'स्वीकृत करें एवं क्रय शाखा को प्रेषित करें'
                          : 'Approve & Send to Purchase'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>
                        {language === 'hi' ? 'निरस्तीकरण की पुष्टि करें' : 'Confirm Rejection'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
