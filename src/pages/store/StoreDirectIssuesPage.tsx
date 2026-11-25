import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  X,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { FormTextarea } from '../../components/ui/FormFields';
import { VoiceTypeToggle } from '../../components/ui/VoiceTypeToggle';
import { MaterialRequest } from '../../types';

export const StoreDirectIssuesPage: React.FC = () => {
  const { requests, catalogItems, issueDirectFromStore } = useStore();
  const { t, language } = useLanguage();

  const directIssueQueue = requests.filter(
    (r) => r.status === 'APPROVED_FOR_STORE'
  );

  const [selectedReq, setSelectedReq] = useState<MaterialRequest | null>(null);
  const [issuedQtyMap, setIssuedQtyMap] = useState<Record<string, number>>({});
  const [issueNote, setIssueNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const openIssueModal = (req: MaterialRequest) => {
    setSelectedReq(req);
    setIssueNote(
      language === 'hi'
        ? `मांग पत्र ${req.id} हेतु प्राचार्य की स्वीकृति अनुसार केंद्रीय भंडार से सीधा प्रदाय किया गया।`
        : `Direct issue from Central Store shelf against Principal sanction for ${req.id}.`
    );
    setErrorMsg('');

    const defaults: Record<string, number> = {};
    for (const item of req.items) {
      const needed = Math.max(0, item.requestedQty - (item.receivedQty ?? 0));
      const cat = catalogItems.find((c) => c.id === item.catalogItemId);
      const avail = cat ? cat.currentStock : needed;
      defaults[item.id] = Math.min(needed, avail);
    }
    setIssuedQtyMap(defaults);
  };

  const handleConfirmDirectIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    const result = issueDirectFromStore(
      selectedReq.id,
      issueNote.trim() || undefined,
      issuedQtyMap
    );

    if (!result.success) {
      if (language === 'hi') {
        if (result.message.includes('Insufficient stock')) {
          setErrorMsg(
            result.message
              .replace('Insufficient stock for', 'अपर्याप्त स्टॉक:')
              .replace('(Available:', '(उपलब्ध:')
              .replace(', Attempting to issue:', ', प्रदाय हेतु दर्ज:')
          );
        } else if (result.message.includes('Invalid issue quantity')) {
          setErrorMsg(
            result.message
              .replace('Invalid issue quantity', 'अमान्य प्रदाय मात्रा')
              .replace('Must be between 0 and', 'यह 0 एवं इसके मध्य होनी चाहिए:')
          );
        } else if (result.message.includes('No materials were marked for issuance')) {
          setErrorMsg('प्रदाय हेतु कोई सामग्री चिह्नित नहीं की गई (सभी मात्राएं 0 हैं)।');
        } else {
          setErrorMsg(result.message);
        }
      } else {
        setErrorMsg(result.message);
      }
      return;
    }

    toast.success(
      language === 'hi'
        ? `मांग पत्र ${selectedReq.id} हेतु भंडार सामग्री सफलतापूर्वक प्रदाय की गई!`
        : result.message
    );
    setSelectedReq(null);
  };

  const columns: DataTableColumn<MaterialRequest>[] = [
    {
      id: 'id',
      header: t('col.requestId'),
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
      header:
        language === 'hi'
          ? 'मांगी गई सामग्री बनाम भंडार स्टॉक'
          : 'Requested Material vs Store Stock',
      accessor: (r) => r.items.map((i) => i.itemName).join(', '),
      cell: (r) => (
        <div className="space-y-1.5">
          {r.items.map((item) => {
            const cat = catalogItems.find((c) => c.id === item.catalogItemId);
            const stock = cat?.currentStock ?? 0;
            return (
              <div key={item.id} className="text-xs flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {item.itemName}
                </span>
                <span className="font-mono text-slate-600">
                  {language === 'hi' ? 'मांग:' : 'Req:'}{' '}
                  <strong>{item.requestedQty}</strong> {item.unit}
                </span>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {language === 'hi' ? 'स्टॉक में:' : 'In Stock:'} {stock} {item.unit}
                </span>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      id: 'status',
      header: t('col.status'),
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: 'actions',
      header: t('col.actions'),
      accessor: (r) => r.id,
      align: 'right',
      cell: (r) => (
        <button
          type="button"
          aria-label={`Issue Stock to TO for ${r.id}`}
          onClick={() => openIssueModal(r)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] shadow-2xs transition-colors cursor-pointer"
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'टी.ओ. को सामग्री प्रदाय करें' : 'Issue Stock to TO'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={
          language === 'hi'
            ? 'मार्ग अ: सीधा भंडार आवंटन'
            : 'PATH A: DIRECT STORE ALLOCATION'
        }
        title={
          language === 'hi'
            ? 'सीधा भंडार प्रदाय (प्राचार्य द्वारा स्वीकृत)'
            : 'Direct Store Issues (Principal-Sanctioned)'
        }
        subtitle={
          language === 'hi'
            ? 'प्राचार्य द्वारा सीधे भंडार से पूर्ति हेतु स्वीकृत मांग पत्रों के लिए केंद्रीय भंडार के स्टॉक से सामग्री आवंटित एवं घटाएं।'
            : 'Allocate and deduct Central Store shelf inventory for requisitions approved by the Principal for direct store fulfillment.'
        }
      />

      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5">
        <DataTable
          data={directIssueQueue}
          columns={columns}
          keyExtractor={(r) => r.id}
          emptyTitle={
            language === 'hi'
              ? 'सीधे प्रदाय हेतु कोई मांग पत्र लंबित नहीं है'
              : 'No Pending Direct Store Issues'
          }
          emptyDescription={
            language === 'hi'
              ? 'जब प्राचार्य उपलब्ध स्टॉक वाले किसी मांग पत्र को "सीधे भंडार से प्रदाय हेतु स्वीकृत" करेंगे, तो वह यहां प्रदर्शित होगा।'
              : 'When the Principal approves an in-stock requisition via \'Approve for Direct Store Issue\', it will appear here for shelf deduction and TO notification.'
          }
        />
      </div>

      {/* Modal: Issue Stock to TO */}
      {selectedReq && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="direct-issue-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <CheckSquare className="w-5 h-5 text-teal-400 shrink-0" />
                <div className="min-w-0">
                  <h2 id="direct-issue-modal-title" className="text-sm font-bold truncate">
                    {language === 'hi'
                      ? `टी.ओ. को सामग्री प्रदाय — ${selectedReq.id}`
                      : `Issue Stock to TO — ${selectedReq.id}`}
                  </h2>
                  <p className="text-[11px] text-slate-300 truncate hidden sm:block">
                    {language === 'hi' ? 'प्राप्तकर्ता' : 'Recipient'}: {selectedReq.toName} (
                    {t(`trade.${selectedReq.department}`) !== `trade.${selectedReq.department}`
                      ? t(`trade.${selectedReq.department}`)
                      : selectedReq.department}
                    )
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <VoiceTypeToggle targetInputId="store-issue-note" size="xs" variant="dark" />
                <button
                  type="button"
                  aria-label="Close Direct Issue Modal"
                  onClick={() => setSelectedReq(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleConfirmDirectIssue} noValidate className="p-6 space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold">
                        {language === 'hi' ? 'सामग्री का नाम' : 'Item Name'}
                      </th>
                      <th className="px-3 py-2 text-right font-bold">
                        {language === 'hi' ? 'मांगी गई मात्रा' : 'Requested Qty'}
                      </th>
                      <th className="px-3 py-2 text-right font-bold">
                        {language === 'hi' ? 'वर्तमान भंडार स्टॉक' : 'Current Store Stock'}
                      </th>
                      <th className="px-3 py-2 text-right font-bold w-36">
                        {language === 'hi' ? 'प्रदाय की जाने वाली मात्रा' : 'Issued Qty Now'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReq.items.map((item) => {
                      const cat = catalogItems.find(
                        (c) => c.id === item.catalogItemId
                      );
                      const currentStock = cat?.currentStock ?? 0;
                      const needed = Math.max(
                        0,
                        item.requestedQty - (item.receivedQty ?? 0)
                      );
                      const val = issuedQtyMap[item.id] ?? needed;

                      return (
                        <tr key={item.id}>
                          <td className="px-3 py-2.5 font-semibold text-slate-900">
                            {item.itemName}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">
                            {needed} {item.unit}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">
                            {currentStock} {item.unit}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <input
                              type="number"
                              aria-label={`Issued Qty Now for ${item.itemName}`}
                              min={0}
                              max={Math.min(needed, currentStock)}
                              value={val}
                              onChange={(e) => {
                                const num = Number.parseInt(
                                  e.target.value || '0',
                                  10
                                );
                                setIssuedQtyMap((prev) => ({
                                  ...prev,
                                  [item.id]: Number.isNaN(num) ? 0 : num,
                                }));
                                setErrorMsg('');
                              }}
                              className="w-24 px-2.5 py-1.5 text-right font-mono font-bold text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <FormTextarea
                id="store-issue-note"
                label={language === 'hi' ? 'भंडार प्रदाय टीप' : 'Store Issue Note'}
                rows={2}
                value={issueNote}
                onChange={(e) => setIssueNote(e.target.value)}
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#0f766e] hover:bg-[#115e59] shadow-2xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सीधे भंडार प्रदाय की पुष्टि करें' : 'Confirm Direct Store Issue'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
