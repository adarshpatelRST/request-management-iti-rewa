import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  RotateCcw,
  ArrowRight,
  UserCheck,
  Wrench,
  Zap,
  Cpu,
  ShoppingCart,
  Package,
  Settings,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Languages,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getDefaultRouteForRole } from '../utils/storeLogic';
import { PwaActionControls } from '../components/ui/PwaActionControls';

interface QuickRoleCard {
  userId: string;
  roleTitleEn: string;
  roleTitleHi: string;
  userName: string;
  departmentEn: string;
  departmentHi: string;
  scenarioHintEn: string;
  scenarioHintHi: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_LOGIN_CARDS: QuickRoleCard[] = [
  // Training Superintendents (All 4 Supervisory Wings)
  {
    userId: 'u-ts-1',
    roleTitleEn: 'TS 1 - E&M Wing',
    roleTitleHi: 'टी.एस. 1 - विद्युत एवं यांत्रिकी',
    userName: 'R.K. Tiwari',
    departmentEn: 'Electrical & Mechanical Wing',
    departmentHi: 'विद्युत एवं यांत्रिकी शाखा',
    scenarioHintEn: 'Supervises Rajesh & Suresh • REQ-1006 pending verification',
    scenarioHintHi: 'राजेश एवं सुरेश के पर्यवेक्षक • REQ-1006 सत्यापन प्रतीक्षारत',
    badgeColor: 'bg-teal-50 text-[#0f766e] border-teal-200',
    icon: UserCheck,
  },
  {
    userId: 'u-ts-2',
    roleTitleEn: 'TS 2 - Electronics',
    roleTitleHi: 'टी.एस. 2 - इलेक्ट्रॉनिक्स',
    userName: 'Meena Nair',
    departmentEn: 'Electronics Wing',
    departmentHi: 'इलेक्ट्रॉनिक्स शाखा',
    scenarioHintEn: 'Supervises Anita Joshi • REQ-1008 Partial delivery archive',
    scenarioHintHi: 'अनीता जोशी के पर्यवेक्षक • REQ-1008 आंशिक प्रदाय अभिलेख',
    badgeColor: 'bg-teal-50 text-[#0f766e] border-teal-200',
    icon: UserCheck,
  },
  {
    userId: 'u-ts-3',
    roleTitleEn: 'TS 3 - Auto & Welding',
    roleTitleHi: 'टी.एस. 3 - ऑटो एवं वेल्डिंग',
    userName: 'Sunil Saxena',
    departmentEn: 'Automobile & Welding Wing',
    departmentHi: 'ऑटोमोबाइल एवं वेल्डिंग शाखा',
    scenarioHintEn: 'Supervises Dinesh (Welder) • REQ-1011 pending verification',
    scenarioHintHi: 'दिनेश (वेल्डर) के पर्यवेक्षक • REQ-1011 सत्यापन प्रतीक्षारत',
    badgeColor: 'bg-teal-50 text-[#0f766e] border-teal-200',
    icon: UserCheck,
  },
  {
    userId: 'u-ts-4',
    roleTitleEn: 'TS 4 - IT & COPA',
    roleTitleHi: 'टी.एस. 4 - आईटी एवं कोपा',
    userName: 'Pooja Pandey',
    departmentEn: 'IT & Computer Wing',
    departmentHi: 'आईटी एवं कंप्यूटर शाखा',
    scenarioHintEn: 'Supervises Priya (COPA) • REQ-1013 pending verification',
    scenarioHintHi: 'प्रिया (कोपा) के पर्यवेक्षक • REQ-1013 सत्यापन प्रतीक्षारत',
    badgeColor: 'bg-teal-50 text-[#0f766e] border-teal-200',
    icon: UserCheck,
  },

  // Training Officers
  {
    userId: 'u-to-1',
    roleTitleEn: 'TO - Electrician',
    roleTitleHi: 'टी.ओ. - इलेक्ट्रीशियन',
    userName: 'Rajesh Sharma',
    departmentEn: 'Electrician Trade (Assigned to TS Tiwari)',
    departmentHi: 'इलेक्ट्रीशियन व्यवसाय (पर्यवेक्षक: टी.एस. तिवारी)',
    scenarioHintEn: 'REQ-1001 ready at Store • REQ-1006 at TS • REQ-1003 at Principal',
    scenarioHintHi: 'REQ-1001 भंडार में तैयार • REQ-1006 टी.एस. पटल • REQ-1003 प्राचार्य पटल',
    badgeColor: 'bg-indigo-50 text-[#1e3a8a] border-indigo-200',
    icon: Zap,
  },
  {
    userId: 'u-to-2',
    roleTitleEn: 'TO - Fitter',
    roleTitleHi: 'टी.ओ. - फ़िटर',
    userName: 'Suresh Verma',
    departmentEn: 'Fitter Trade (Assigned to TS Tiwari)',
    departmentHi: 'फ़िटर व्यवसाय (पर्यवेक्षक: टी.एस. तिवारी)',
    scenarioHintEn: 'REQ-1005 Reverted by TS (Ready to edit & resubmit)',
    scenarioHintHi: 'REQ-1005 टी.एस. द्वारा वापस (संशोधन एवं पुनः प्रेषण हेतु तैयार)',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Wrench,
  },
  {
    userId: 'u-to-3',
    roleTitleEn: 'TO - Electronics',
    roleTitleHi: 'टी.ओ. - इलेक्ट्रॉनिक्स',
    userName: 'Anita Joshi',
    departmentEn: 'Electronics Trade (Assigned to TS Nair)',
    departmentHi: 'इलेक्ट्रॉनिक्स व्यवसाय (पर्यवेक्षक: टी.एस. नायर)',
    scenarioHintEn: 'REQ-1008 Partial (2/5) • REQ-1004 Rejected by Principal',
    scenarioHintHi: 'REQ-1008 आंशिक (2/5) • REQ-1004 प्राचार्य द्वारा निरस्त',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Cpu,
  },
  {
    userId: 'u-to-4',
    roleTitleEn: 'TO - Welder',
    roleTitleHi: 'टी.ओ. - वेल्डर',
    userName: 'Dinesh Kushwaha',
    departmentEn: 'Welder Trade (Assigned to TS Saxena)',
    departmentHi: 'वेल्डर व्यवसाय (पर्यवेक्षक: टी.एस. सक्सेना)',
    scenarioHintEn: 'REQ-1011 submitted to TS Sunil Saxena for verification',
    scenarioHintHi: 'REQ-1011 टी.एस. सुनील सक्सेना को सत्यापन हेतु प्रस्तुत',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: Wrench,
  },
  {
    userId: 'u-to-5',
    roleTitleEn: 'TO - COPA',
    roleTitleHi: 'टी.ओ. - कोपा',
    userName: 'Priya Sharma',
    departmentEn: 'COPA Trade (Assigned to TS Pandey)',
    departmentHi: 'कोपा व्यवसाय (पर्यवेक्षक: टी.एस. पांडे)',
    scenarioHintEn: 'REQ-1013 submitted to TS Pooja Pandey for verification',
    scenarioHintHi: 'REQ-1013 टी.एस. पूजा पांडे को सत्यापन हेतु प्रस्तुत',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    icon: Cpu,
  },

  // Institutional Management & Administration
  {
    userId: 'u-princ',
    roleTitleEn: 'Principal',
    roleTitleHi: 'प्राचार्य',
    userName: 'Dr. A.K. Mishra',
    departmentEn: 'Institute Administration',
    departmentHi: 'संस्था प्रशासन',
    scenarioHintEn: 'Sanction indents • Route to Purchase Cell • Analytics Dashboard',
    scenarioHintHi: 'मांग स्वीकृति • क्रय शाखा अग्रेषण • एनालिटिक्स डैशबोर्ड',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: Building2,
  },
  {
    userId: 'u-purch',
    roleTitleEn: 'Purchase Officer',
    roleTitleHi: 'क्रय अधिकारी',
    userName: 'Vikram Singh',
    departmentEn: 'Purchase Cell',
    departmentHi: 'क्रय शाखा',
    scenarioHintEn: 'Batch REQ-1002 & REQ-1007 • Hindi Letter Print • PO-2002 Avak/Javak',
    scenarioHintHi: 'REQ-1002 व 1007 समेकन • हिंदी पत्र प्रिंट • PO-2002 आवक/जावक',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    icon: ShoppingCart,
  },
  {
    userId: 'u-store',
    roleTitleEn: 'Store Manager',
    roleTitleHi: 'भंडारपाल',
    userName: 'Manoj Dubey',
    departmentEn: 'Central Store',
    departmentHi: 'केंद्रीय भंडार',
    scenarioHintEn: 'PO-2001 Challan FIFO Receiving • Direct Store Issue Inventory',
    scenarioHintHi: 'PO-2001 चालान FIFO आवक • भंडार सीधी सामग्री प्रदाय',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: Package,
  },
  {
    userId: 'u-admin',
    roleTitleEn: 'System Admin',
    roleTitleHi: 'सिस्टम प्रशासक',
    userName: 'System Admin',
    departmentEn: 'IT & Governance',
    departmentHi: 'आईटी एवं प्रशासन',
    scenarioHintEn: 'JSON-Diff Audit Logs • Master Catalog • TO-to-TS Hierarchy Mapping',
    scenarioHintHi: 'JSON अंतर ऑडिट लॉग • मास्टर कैटलॉग • पदानुक्रम मैपिंग',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: Settings,
  },
];

export const LoginPage: React.FC = () => {
  const { loginByEmail, loginAsRoleUser, resetDemoData } = useStore();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setEmailError(t('login.emailRequired'));
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError(t('login.emailInvalid'));
      hasError = true;
    } else {
      setEmailError(undefined);
    }

    if (!password) {
      setPasswordError(t('login.passwordRequired'));
      hasError = true;
    } else {
      setPasswordError(undefined);
    }

    if (hasError) return;

    // After above clearance, credentials should match
    const result = loginByEmail(cleanEmail, password);
    if (!result.success || !result.user) {
      setPasswordError(t('login.credentialsMismatch'));
      return;
    }

    toast.success(
      language === 'hi'
        ? `${result.user.name} (${result.user.role}) के रूप में सफलतापूर्वक लॉगिन`
        : `Authenticated as ${result.user.name} (${result.user.role})`
    );
    navigate(getDefaultRouteForRole(result.user.role));
  };

  const handleQuickLogin = (userId: string) => {
    const user = loginAsRoleUser(userId);
    if (user) {
      toast.success(
        language === 'hi'
          ? `${user.name} (${user.department}) के रूप में लॉगिन संपन्न`
          : `Logged in as ${user.name} — ${user.department}`
      );
      navigate(getDefaultRouteForRole(user.role));
    }
  };

  const handleResetSeed = () => {
    resetDemoData();
    toast.success(
      language === 'hi'
        ? 'समस्त स्थानीय डेटा प्रारंभिक 8 पूर्व-निर्धारित संस्थागत परिदृश्यों पर रीसेट हो गया है!'
        : 'All localStorage collections reset to initial 8 pre-seeded institutional scenarios!'
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with Language Toggle */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center shadow-2xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-800">
            {language === 'hi' ? 'शा. आई.टी.आई. रीवा' : 'Govt. ITI Rewa'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <PwaActionControls />
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-[#1e3a8a] bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer shadow-2xs"
            title={language === 'en' ? 'हिन्दी में बदलें (Switch to Hindi)' : 'Switch to English'}
            aria-label="Toggle language between English and Hindi"
          >
            <Languages className="w-3.5 h-3.5 text-[#1e3a8a] shrink-0" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto space-y-8">
        {/* Aligned Institutional Login Card (matching reference design) */}
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 text-[#2563eb] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t('login.title')}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {t('login.officialEmail')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(undefined);
                  }}
                  placeholder="name@itirewa.mp.gov.in"
                  className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${emailError
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20'
                    }`}
                />
              </div>
              {emailError && (
                <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(undefined);
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${passwordError
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20'
                    }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{t('login.signIn')}</span>
            </button>
          </form>

          <div className="pt-5 mt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              {t('login.securityNote')}
            </p>
          </div>
        </div>

        {/* Demo Role Quick-Login Grid */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0f766e]">
                  {t('login.demoWorkbench')}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {t('login.demoTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('login.demoSubtitle')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetSeed}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('login.resetSeed')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {QUICK_LOGIN_CARDS.map((card) => {
              const Icon = card.icon;
              const roleTitle = language === 'hi' ? card.roleTitleHi : card.roleTitleEn;
              const dept = language === 'hi' ? card.departmentHi : card.departmentEn;
              const hint = language === 'hi' ? card.scenarioHintHi : card.scenarioHintEn;
              return (
                <button
                  key={card.userId}
                  type="button"
                  onClick={() => handleQuickLogin(card.userId)}
                  className="group text-left p-4 rounded-xl border border-[#e2e8f0] bg-white hover:border-[#1e3a8a] hover:bg-slate-50/70 transition-all flex flex-col justify-between gap-3 cursor-pointer shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded border ${card.badgeColor}`}
                      >
                        {roleTitle}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#1e3a8a] group-hover:text-white text-slate-600 flex items-center justify-center transition-colors shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-[#1e3a8a] transition-colors">
                        {card.userName}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {dept}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                      {hint}
                    </p>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1e3a8a] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-500">
        {t('footer.text')}
      </footer>
    </div>
  );
};
