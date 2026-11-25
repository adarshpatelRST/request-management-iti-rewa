import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Clock,
  CheckCircle2,
  RotateCcw,
  XCircle,
  ClipboardCheck,
  X,
  ArrowRight,
  AlertCircle,
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

export const TSVerificationQueuePage: React.FC<{ isDashboardView?: boolean }> = ({
  isDashboardView = false,
}) => {
  const {
    currentUser,
    users,
    requests,
    verifyRequestByTs,
    revertRequestByTs,
    rejectRequestByTs,
  } = useStore();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [reviewingRequest, setReviewingRequest] = useState<MaterialRequest | null>(null);
  const [tsRemark, setTsRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');

  // Supervised TOs for this TS
  const supervisedTos = useMemo(() => {
    if (!currentUser) return [];
    return users.filter((u) => u.role === 'TO' && u.assignedTsId === currentUser.id);
  }, [users, currentUser]);

  // All requests scoped strictly to currentUser.id
  const myTsRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests
      .filter((r) => r.tsId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, currentUser]);

  const pendingQueue = useMemo(
    () => myTsRequests.filter((r) => r.status === 'PENDING_TS_VERIFICATION'),
    [myTsRequests]
  );

  const verifiedAndForwardedCount = useMemo(
    () =>
      myTsRequests.filter(
        (r) =>
          r.status !== 'PENDING_TS_VERIFICATION' &&
          r.status !== 'REVERTED_BY_TS' &&
          r.status !== 'REJECTED_BY_TS'
      ).length,
    [myTsRequests]
  );

  const revertedCount = useMemo(
    () => myTsRequests.filter((r) => r.status === 'REVERTED_BY_TS').length,
    [myTsRequests]
  );

  const openReviewModal = (req: MaterialRequest) => {
    setReviewingRequest(req);
    setTsRemark('');
    setRemarkError('');
  };

  const handleVerifyAction = () => {
    if (!reviewingRequest) return;
    verifyRequestByTs(
      reviewingRequest.id,
      tsRemark.trim() ||
        'Verified technical specifications and syllabus alignment. Recommended for Principal sanction.'
    );
    toast.success(
      language === 'hi'
        ? `${reviewingRequest.id} सत्यापित कर प्राचार्य डॉ. ए.के. मिश्रा को अग्रेषित किया गया!`
        : `${reviewingRequest.id} verified and forwarded to Principal Dr. A.K. Mishra!`
    );
    setReviewingRequest(null);
  };

  const handleRevertAction = () => {
    if (!reviewingRequest) return;
    if (!tsRemark.trim()) {
      setRemarkError(t('modal.tsRemarksRequiredRevert'));
      return;
    }
    revertRequestByTs(reviewingRequest.id, tsRemark.trim());
    toast.warning(
      language === 'hi'
        ? `${reviewingRequest.id} सुधार हेतु टी.ओ. ${reviewingRequest.toName} को वापस भेजा गया।`
        : `${reviewingRequest.id} reverted back to TO ${reviewingRequest.toName} for revision.`
    );
    setReviewingRequest(null);
  };

  const handleRejectAction = () => {
    if (!reviewingRequest) return;
    if (!tsRemark.trim()) {
      setRemarkError(t('modal.tsRemarksRequiredReject'));
      return;
    }
    rejectRequestByTs(reviewingRequest.id, tsRemark.trim());
    toast.error(
      language === 'hi'
        ? `${reviewingRequest.id} प्रशिक्षण अधीक्षक द्वारा निरस्त किया गया।`
        : `${reviewingRequest.id} rejected by Training Superintendent.`
    );
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
      header: t('col.departmentTrade'),
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
      key: 'purpose',
      header: t('col.purposeJustification'),
      minWidth: '240px',
      render: (row) => (
        <p className="text-xs text-slate-700 line-clamp-2 break-words [overflow-wrap:anywhere]" title={row.purpose}>
          {row.purpose}
        </p>
      ),
    },
    {
      key: 'status',
      header: t('col.status'),
      width: '180px',
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
      header: t('col.verificationAction'),
      align: 'right',
      width: '160px',
      wrapText: false,
      render: (row) => (
        <button
          type="button"
          onClick={() => openReviewModal(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>{t('ts.reviewRequest')}</span>
        </button>
      ),
    },
  ];

  const localizedDept = currentUser?.department
    ? t(`trade.${currentUser.department}`) !== `trade.${currentUser.department}`
      ? t(`trade.${currentUser.department}`)
      : currentUser.department
    : '';

  const supervisingToList = supervisedTos.length > 0
    ? supervisedTos
        .map(
          (to) =>
            `${to.name} (${
              t(`trade.${to.department}`) !== `trade.${to.department}`
                ? t(`trade.${to.department}`)
                : to.department
            })`
        )
        .join(', ')
    : t('ts.assignedWing');

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={t('ts.badge', { wing: localizedDept.toUpperCase() })}
        title={
          isDashboardView
            ? t('ts.dashboardTitle', { name: currentUser?.name || '' })
            : t('ts.queueTitle')
        }
        subtitle={t('ts.supervisingTos', { list: supervisingToList })}
        actions={
          <button
            type="button"
            onClick={() => navigate('/ts/history')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <span>{t('ts.viewHistory')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />

      {/* 3 TS KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {t('ts.kpi.pendingVerification')}
            </p>
            <p className="text-2xl font-bold font-mono text-[#1e3a8a] mt-1 tabular-nums">
              {pendingQueue.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('ts.kpi.pendingVerificationSub')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#1e3a8a] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {t('ts.kpi.verifiedForwarded')}
            </p>
            <p className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              {verifiedAndForwardedCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('ts.kpi.verifiedForwardedSub')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {t('ts.kpi.revertedToTo')}
            </p>
            <p className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
              {revertedCount}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              {t('ts.kpi.revertedToToSub')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pending Verification Queue DataTable */}
      <DataTable
        data={pendingQueue}
        columns={columns}
        keyExtractor={(r) => r.id}
        pageSize={10}
        emptyMessage={t('ts.emptyQueue')}
        toolbar={
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {t('ts.tableTitle')}
              </h2>
            </div>
          </div>
        }
      />

      {/* Verification Review Modal */}
      {reviewingRequest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ts-review-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xl max-w-2xl w-full my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  id="ts-review-modal-title"
                  className="font-mono font-bold text-sm sm:text-base text-[#1e3a8a] truncate"
                >
                  {t('modal.tsReviewTitle', { id: reviewingRequest.id })}
                </span>
                <StatusBadge status={reviewingRequest.status} />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <VoiceTypeToggle targetInputId="ts-verification-remarks" size="xs" variant="light" />
                <button
                  type="button"
                  aria-label="Close Review Modal"
                  onClick={() => setReviewingRequest(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* TO & Purpose Details */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 min-w-0 max-w-full overflow-hidden">
                <div>
                  <span className="text-slate-500">{t('modal.trainingOfficer')}</span>{' '}
                  <strong className="text-slate-900">{reviewingRequest.toName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">{t('modal.deptTrade')}</span>{' '}
                  <strong className="text-slate-900">
                    {t(`trade.${reviewingRequest.department}`) !== `trade.${reviewingRequest.department}`
                      ? t(`trade.${reviewingRequest.department}`)
                      : reviewingRequest.department}
                  </strong>
                </div>
                <div className="col-span-2 min-w-0">
                  <span className="text-slate-500">{t('modal.purpose')}</span>
                  <p className="text-slate-900 font-medium mt-0.5 break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                    {reviewingRequest.purpose}
                  </p>
                </div>
              </div>

              {/* Requested Line Items */}
              <div>
                <h3 className="font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('modal.requestedItems', { count: String(reviewingRequest.items.length) })}
                </h3>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-lg">
                  {reviewingRequest.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <StatusBadge status={item.itemType} />
                          <span className="font-bold text-slate-900 break-words [overflow-wrap:anywhere] [word-break:break-word]">{item.itemName}</span>
                          {item.itemCode && (
                            <span className="font-mono text-slate-500 shrink-0">
                              ({item.itemCode})
                            </span>
                          )}
                        </div>
                        {item.specifications && (
                          <p className="text-slate-500 text-[11px] break-words [overflow-wrap:anywhere] [word-break:break-word]">{item.specifications}</p>
                        )}
                      </div>
                      <div className="text-right font-mono font-bold text-sm text-[#0f766e] shrink-0">
                        {item.requestedQty} {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TS Remarks Textarea */}
              <div>
                <FormTextarea
                  id="ts-verification-remarks"
                  label={t('modal.tsRemarksLabel')}
                  rows={3}
                  maxLength={250}
                  placeholder={t('modal.tsRemarksPlaceholder')}
                  value={tsRemark}
                  onChange={(e) => {
                    setTsRemark(e.target.value);
                    if (remarkError) setRemarkError('');
                  }}
                  error={remarkError}
                />
              </div>

              {/* 3 Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleRejectAction}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer text-center"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{t('modal.rejectRequest')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRevertAction}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-lg text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer text-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('modal.revertToTo')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleVerifyAction}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-lg text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] shadow-2xs transition-colors cursor-pointer text-center"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('modal.verifyForward')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
