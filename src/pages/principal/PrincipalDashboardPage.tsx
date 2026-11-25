import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  ShoppingCart,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface PrincipalDashboardPageProps {
  isAdminView?: boolean;
  topSlot?: React.ReactNode;
}

export const PrincipalDashboardPage: React.FC<PrincipalDashboardPageProps> = ({
  isAdminView = false,
  topSlot,
}) => {
  const { requests, purchaseOrders } = useStore();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // 1. KPI Computations
  const totalIndents = requests.length;
  const pendingApprovalCount = requests.filter(
    (r) => r.status === 'PENDING_PRINCIPAL_APPROVAL'
  ).length;

  const activePipelinePOs = purchaseOrders.filter(
    (p) => p.status === 'PURCHASE_IN_PROGRESS'
  );
  const pendingPipelineUnits = activePipelinePOs.reduce(
    (acc, po) =>
      acc +
      po.consolidatedItems.reduce(
        (sum, item) => sum + Math.max(0, item.orderedQty - item.receivedQty),
        0
      ),
    0
  );

  const completedOrStoreReadyCount = requests.filter(
    (r) =>
      r.status === 'CLOSED' ||
      r.status === 'COMPLETED' ||
      r.status === 'ITEM_RECEIVED_AT_STORE'
  ).length;
  const fulfillmentRate =
    totalIndents > 0 ? Math.round((completedOrStoreReadyCount / totalIndents) * 100) : 0;

  // 2. Chart 1: 6-Month Institutional Indent & Closure Trend
  const monthlyTrendData = useMemo(() => {
    const monthNames: Record<string, string> = {
      'Jun 2026': 'जून 2026',
      'Jul 2026': 'जुलाई 2026',
      'Aug 2026': 'अगस्त 2026',
      'Sep 2026': 'सितंबर 2026',
      'Oct 2026': 'अक्टूबर 2026',
      'Nov 2026': 'नवंबर 2026',
    };
    const raw = [
      { month: 'Jun 2026', indentsRaised: 7, closedFulfilled: 6 },
      { month: 'Jul 2026', indentsRaised: 9, closedFulfilled: 8 },
      { month: 'Aug 2026', indentsRaised: 11, closedFulfilled: 9 },
      { month: 'Sep 2026', indentsRaised: 8, closedFulfilled: 7 },
      { month: 'Oct 2026', indentsRaised: 12, closedFulfilled: 10 },
      {
        month: 'Nov 2026',
        indentsRaised: totalIndents,
        closedFulfilled: completedOrStoreReadyCount,
      },
    ];
    return raw.map((m) => ({
      ...m,
      displayMonth: language === 'hi' ? monthNames[m.month] || m.month : m.month,
    }));
  }, [totalIndents, completedOrStoreReadyCount, language]);

  // 3. Chart 2: Department / Trade-Wise Demand (Electrician, Fitter, Electronics, General)
  const departmentDemandData = useMemo(() => {
    const trades = ['Electrician', 'Fitter', 'Electronics', 'General'];
    return trades.map((dept) => {
      let fulfilled = 0;
      let pending = 0;

      requests.forEach((req) => {
        req.items.forEach((item) => {
          const itemDept =
            item.category === 'Hospitality / Exam Cell' ? 'General' : item.category;
          const matchesDept =
            itemDept === dept || (dept === 'General' && !trades.slice(0, 3).includes(itemDept));
          if (matchesDept) {
            const alloc = item.allocatedQty || 0;
            const rem = Math.max(0, item.requestedQty - alloc);
            fulfilled += alloc;
            pending += rem;
          }
        });
      });

      const label =
        language === 'hi'
          ? dept === 'Electrician'
            ? 'इलेक्ट्रीशियन'
            : dept === 'Fitter'
            ? 'फ़िटर'
            : dept === 'Electronics'
            ? 'इलेक्ट्रॉनिक्स'
            : 'सामान्य'
          : dept;

      return {
        department: label,
        Fulfilled: fulfilled,
        Pending: pending,
      };
    });
  }, [requests, language]);

  // 4. Chart 3: Procurement Routing & Classification Split
  const routingSplitData = useMemo(() => {
    const sentToPurchase = requests.filter(
      (r) => r.routingDestination === 'PURCHASE'
    ).length;
    const sentToStore = requests.filter((r) => r.routingDestination === 'STORE').length;
    const rejected = requests.filter(
      (r) => r.status === 'REJECTED_BY_PRINCIPAL' || r.status === 'REJECTED_BY_TS'
    ).length;

    return [
      {
        name: language === 'hi' ? 'क्रय शाखा को प्रेषित' : 'Sent to Purchase',
        value: sentToPurchase,
        color: '#1e3a8a',
      },
      {
        name: language === 'hi' ? 'भंडार को प्रेषित' : 'Sent to Store',
        value: sentToStore,
        color: '#0f766e',
      },
      {
        name: language === 'hi' ? 'निरस्त' : 'Rejected',
        value: rejected,
        color: '#dc2626',
      },
    ];
  }, [requests, language]);

  const { tradeItemCount, nonTradeItemCount } = useMemo(() => {
    let trade = 0;
    let nonTrade = 0;
    requests.forEach((r) =>
      r.items.forEach((i) => {
        if (i.itemType === 'TRADE') trade += 1;
        else nonTrade += 1;
      })
    );
    return { tradeItemCount: trade, nonTradeItemCount: nonTrade };
  }, [requests]);

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={
          isAdminView
            ? (language === 'hi'
                ? 'सिस्टम प्रशासक • संस्थागत प्रशासन एवं विश्लेषण'
                : 'SYSTEM ADMIN • INSTITUTIONAL GOVERNANCE & ANALYTICS')
            : (language === 'hi'
                ? 'कार्यकारी प्रशासन एवं विश्लेषण • प्राचार्य पटल'
                : 'EXECUTIVE GOVERNANCE & ANALYTICS • PRINCIPAL DESK')
        }
        title={
          isAdminView
            ? (language === 'hi'
                ? 'सिस्टम प्रशासक — संस्थागत प्रशासन एवं विश्लेषण'
                : 'System Admin — Governance & Executive Analytics')
            : (language === 'hi'
                ? 'प्राचार्य संस्थागत विश्लेषण डैशबोर्ड'
                : 'Principal Institutional Analytics Dashboard')
        }
        subtitle={
          language === 'hi'
            ? 'सामग्री मांग पत्र, अनुमोदन प्रक्रिया एवं क्रय आदेश पूर्ति की वास्तविक समय समीक्षा।'
            : 'Real-time oversight of trade material indents, approval pipeline, and procurement order fulfillment.'
        }
        actions={
          isAdminView ? (
            <button
              type="button"
              onClick={() => navigate('/admin/audit-logs')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
            >
              <span>{language === 'hi' ? 'JSON ऑडिट लॉग देखें' : 'Inspect JSON Audit Logs'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/principal/approvals')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
            >
              <span>
                {language === 'hi'
                  ? `स्वीकृति कतार देखें (${pendingApprovalCount})`
                  : `Review Approval Queue (${pendingApprovalCount})`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )
        }
      />

      {/* 4 Institutional KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'hi' ? 'कुल सामग्री मांग पत्र' : 'Total Material Indents'}
            </p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {totalIndents}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'hi' ? 'समस्त ट्रेड एवं गैर-ट्रेड मांग पत्र' : 'All Trade & Non-Trade Requisitions'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#1e3a8a] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'hi' ? 'प्राचार्य स्वीकृति प्रतीक्षारत' : 'Pending Principal Approval'}
            </p>
            <p className="text-2xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
              {pendingApprovalCount}
            </p>
            <p className="text-[11px] text-blue-700 font-medium mt-0.5">
              {language === 'hi' ? 'टी.एस. सत्यापित • अग्रेषण प्रतीक्षारत' : 'Verified by TS • Awaiting Routing'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'hi' ? 'सक्रिय क्रय प्रक्रिया' : 'Active Purchase Pipeline'}
            </p>
            <p className="text-2xl font-bold font-mono text-orange-700 mt-1 tabular-nums">
              {activePipelinePOs.length} {language === 'hi' ? 'सक्रिय क्रय आदेश' : 'Active PO'}
            </p>
            <p className="text-[11px] text-orange-700 font-medium mt-0.5">
              {pendingPipelineUnits} {language === 'hi' ? 'सामग्री प्रदाय प्रतीक्षारत' : 'pending units awaiting delivery'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {language === 'hi' ? 'मांग पूर्ति पूर्णता दर' : 'Fulfillment Completion Rate'}
            </p>
            <p className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              {fulfillmentRate}%
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'hi'
                ? `${totalIndents} में से ${completedOrStoreReadyCount} मांग पत्र पूर्ण`
                : `${completedOrStoreReadyCount} of ${totalIndents} indents fulfilled/ready`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {topSlot}

      {/* 3 Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Monthly Material Indent & Closure Trend (AreaChart) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">
              {language === 'hi' ? 'मासिक सामग्री मांग एवं निराकरण ट्रेंड' : 'Monthly Material Indent & Closure Trend'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'विगत 6 माह में दर्ज मांग पत्र बनाम पूर्ण/संचित मांग पत्रों का तुलनात्मक विवरण'
                : '6-month institutional trend of requisitions raised vs. fulfilled & closed'}
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrendData}
                margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIndents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="displayMonth" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="indentsRaised"
                  name={language === 'hi' ? 'दर्ज मांग पत्र' : 'Indents Raised'}
                  stroke="#1e3a8a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIndents)"
                />
                <Area
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="closedFulfilled"
                  name={language === 'hi' ? 'पूर्ण एवं संचित' : 'Fulfilled & Closed'}
                  stroke="#0f766e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClosed)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Procurement Routing & Classification Split (Donut PieChart) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">
              {language === 'hi'
                ? 'क्रय अग्रेषण एवं मद वर्गीकरण विभाजन'
                : 'Procurement Routing & Classification Split'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'प्राचार्य स्वीकृति वितरण' : 'Distribution of Principal Sanctions'}
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={routingSplitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {routingSplitData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Pills for Trade vs Non-Trade Item Counts */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <span className="text-xs font-semibold text-slate-600 shrink-0">
              {language === 'hi' ? 'मद वर्गीकरण विभाजन:' : 'Line-Item Classification Split:'}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusBadge status="TRADE" />
                <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                  {tradeItemCount} {language === 'hi' ? 'मद' : 'items'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusBadge status="NON_TRADE" />
                <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                  {nonTradeItemCount} {language === 'hi' ? 'मद' : 'items'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Department / Trade-Wise Demand (BarChart) */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === 'hi'
                  ? 'विभाग / व्यवसाय-वार सामग्री मांग (पूर्ण बनाम लंबित इकाइयां)'
                  : 'Department / Trade-Wise Material Demand (Fulfilled vs. Pending Units)'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'इलेक्ट्रीशियन, फ़िटर, इलेक्ट्रॉनिक्स एवं सामान्य शाखाओं में प्राप्त बनाम लंबित सामग्री का तुलनात्मक विवरण'
                  : 'Comparison of allocated/received units vs. pending pipeline units across Electrician, Fitter, Electronics & General sections'}
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentDemandData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#334155' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  isAnimationActive={false}
                  dataKey="Fulfilled"
                  name={language === 'hi' ? 'पूर्ण इकाइयां' : 'Fulfilled Units'}
                  fill="#0f766e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="Pending"
                  name={language === 'hi' ? 'लंबित इकाइयां' : 'Pending Units'}
                  fill="#1e3a8a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
