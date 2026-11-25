import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  LogOut,
  Menu,
  X,
  ClipboardList,
  CheckSquare,
  ShieldCheck,
  ShoppingCart,
  BarChart3,
  BookOpen,
  GitBranch,
  FileSearch,
  PlusCircle,
  Truck,
  Check,
  CheckCircle2,
  Mail,
  Languages,
  Mic,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useVoiceTyping } from '../../context/VoiceTypingContext';
import { VoiceTypeToggle } from '../ui/VoiceTypeToggle';
import { UserRole, AppNotification } from '../../types';

interface NavItem {
  label: string;
  labelKey: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

interface NavSection {
  sectionTitle: 'DASHBOARDS' | 'OPERATIONS' | 'ADMINISTRATION';
  sectionKey: string;
  items: NavItem[];
}

const ROLE_LABELS: Record<UserRole, string> = {
  TO: 'Training Officer',
  TS: 'Training Superintendent',
  PRINCIPAL: 'Principal',
  PURCHASE: 'Purchase Officer',
  STORE_MANAGER: 'Store Manager',
  ADMIN: 'System Admin',
};

function formatShortTime(isoDate: string, language: 'en' | 'hi' = 'en'): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return language === 'hi' ? 'अभी' : 'now';
    if (diffMins < 60) return `${diffMins}${language === 'hi' ? ' मि.' : 'm'}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}${language === 'hi' ? ' घं.' : 'h'}`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}${language === 'hi' ? ' दिन' : 'd'}`;
  } catch {
    return '';
  }
}

function localizeNotificationTitle(title: string, language: 'en' | 'hi'): string {
  if (language !== 'hi') return title;
  const parts = title.split(' — ');
  const main = parts[0].trim();
  const suffix = parts.length > 1 ? ` — ${parts.slice(1).join(' — ')}` : '';

  const titleMap: Record<string, string> = {
    'Requisition Verified by TS': 'टी.एस. द्वारा सत्यापित मांग पत्र',
    'New Requisition Pending Verification': 'सत्यापन प्रतीक्षारत नवीन मांग पत्र',
    'Reverted Requisition Resubmitted': 'संशोधित मांग पत्र पुनः प्रस्तुत',
    'Requisition Reverted by TS': 'टी.एस. द्वारा सुधार हेतु वापस मांग पत्र',
    'Requisition Rejected by TS': 'टी.एस. द्वारा निरस्त मांग पत्र',
    'Requisition Awaiting Principal Sanction': 'प्राचार्य स्वीकृति प्रतीक्षारत मांग पत्र',
    'Direct Store Issue Sanctioned': 'सीधे भंडार प्रदाय स्वीकृत',
    'New Requisition Routed to Purchase': 'क्रय शाखा प्रेषित नवीन मांग पत्र',
    'Requisition Rejected by Principal': 'प्राचार्य द्वारा निरस्त मांग पत्र',
    'Purchase Order Dispatched': 'क्रय आदेश प्रेषित',
    'Direct Store Issue Ready': 'सीधे भंडार सामग्री प्रदाय तैयार',
    'Material Ready for Pickup': 'सामग्री भंडार से प्राप्त करने हेतु तैयार',
    'Partial Delivery Allocated': 'आंशिक सामग्री प्रदाय आवंटित',
    'Partial Challan Allocation': 'आंशिक सामग्री चालान आवंटन',
  };

  return (titleMap[main] || main) + suffix;
}

function localizeActor(actor: string, language: 'en' | 'hi'): string {
  if (language !== 'hi') return actor;
  return actor
    .replace('(E&M Wing)', '(विद्युत एवं यांत्रिकी शाखा)')
    .replace('(Electronics Wing)', '(इलेक्ट्रॉनिक्स शाखा)')
    .replace('(Auto & Welding Wing)', '(ऑटो एवं वेल्डिंग शाखा)')
    .replace('(IT & Computer Wing)', '(आईटी एवं कंप्यूटर शाखा)')
    .replace('(Electrician)', '(इलेक्ट्रीशियन)')
    .replace('(Fitter)', '(फ़िटर)')
    .replace('(Electronics)', '(इलेक्ट्रॉनिक्स)')
    .replace('(Welder)', '(वेल्डर)')
    .replace('(COPA)', '(कोपा)')
    .replace('(Central Store)', '(केंद्रीय भंडार)')
    .replace('(Purchase Cell)', '(क्रय शाखा)')
    .replace('(Principal)', '(प्राचार्य)')
    .replace('Institutional System', 'संस्थागत प्रणाली');
}

function getNotificationMeta(notif: AppNotification, role: UserRole) {
  let actor = 'Institutional System';
  const msg = notif.message || '';
  if (msg.includes('TS R.K. Tiwari')) {
    actor = 'TS R.K. Tiwari (E&M Wing)';
  } else if (msg.includes('Meena Nair')) {
    actor = 'TS Meena Nair (Electronics Wing)';
  } else if (msg.includes('Sunil Saxena')) {
    actor = 'TS Sunil Saxena (Auto & Welding Wing)';
  } else if (msg.includes('Pooja Pandey')) {
    actor = 'TS Pooja Pandey (IT & Computer Wing)';
  } else if (msg.includes('Rajesh Sharma')) {
    actor = 'TO Rajesh Sharma (Electrician)';
  } else if (msg.includes('Suresh Verma')) {
    actor = 'TO Suresh Verma (Fitter)';
  } else if (msg.includes('Anita Joshi')) {
    actor = 'TO Anita Joshi (Electronics)';
  } else if (msg.includes('Dinesh Kushwaha')) {
    actor = 'TO Dinesh Kushwaha (Welder)';
  } else if (msg.includes('Priya Sharma')) {
    actor = 'TO Priya Sharma (COPA)';
  } else if (
    msg.includes('Manoj Dubey') ||
    msg.includes('Central Store') ||
    notif.type === 'STORE_READY'
  ) {
    actor = 'Manoj Dubey (Central Store)';
  } else if (msg.includes('Vikram Singh') || notif.type === 'PO_DISPATCHED') {
    actor = 'Vikram Singh (Purchase Cell)';
  } else if (msg.includes('Dr. A.K. Mishra') || msg.includes('Principal')) {
    actor = 'Dr. A.K. Mishra (Principal)';
  }

  let redirectUrl = '/';
  if (role === 'TO') {
    redirectUrl = '/to/dashboard';
  } else if (role === 'TS') {
    redirectUrl = '/ts/dashboard';
  } else if (role === 'PRINCIPAL') {
    redirectUrl = notif.relatedRequestId ? '/principal/approvals' : '/principal/dashboard';
  } else if (role === 'PURCHASE') {
    redirectUrl = notif.relatedPoId ? '/purchase/orders' : '/purchase/approved';
  } else if (role === 'STORE_MANAGER') {
    redirectUrl = notif.relatedPoId ? '/store/receiving' : '/store/issues';
  } else if (role === 'ADMIN') {
    redirectUrl = '/admin/audit-logs';
  }

  return { actor, redirectUrl };
}

export const AppShell: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isRecording, isSupported, liveTranscript, toggleRecording, stopRecording } =
    useVoiceTyping();
  const {
    currentUser,
    logout,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    clearNotifications,
    requests,
    purchaseOrders,
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotifPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userNotifications = notifications.filter((n) => n.userId === currentUser.id && !n.read);
  const unreadCount = userNotifications.length;

  const navSections: NavSection[] = [
    {
      sectionTitle: 'DASHBOARDS',
      sectionKey: 'nav.section.dashboards',
      items: [
        {
          label: 'Dashboard',
          labelKey: 'nav.to.dashboard',
          to: '/to/dashboard',
          icon: BarChart3,
          roles: ['TO'],
        },
        {
          label: 'Dashboard',
          labelKey: 'nav.ts.dashboard',
          to: '/ts/dashboard',
          icon: BarChart3,
          roles: ['TS'],
        },
        {
          label: 'Analytics Dashboard',
          labelKey: 'nav.principal.dashboard',
          to: '/principal/dashboard',
          icon: BarChart3,
          roles: ['PRINCIPAL'],
        },
        {
          label: 'Dashboard',
          labelKey: 'nav.store.dashboard',
          to: '/store/dashboard',
          icon: BarChart3,
          roles: ['STORE_MANAGER'],
        },
        {
          label: 'Analytics Dashboard',
          labelKey: 'nav.admin.dashboard',
          to: '/admin/dashboard',
          icon: BarChart3,
          roles: ['ADMIN'],
        },
      ],
    },
    {
      sectionTitle: 'OPERATIONS',
      sectionKey: 'nav.section.operations',
      items: [
        {
          label: 'Raise Request',
          labelKey: 'nav.to.raise',
          to: '/to/raise-request',
          icon: PlusCircle,
          roles: ['TO'],
        },
        {
          label: 'Verification History',
          labelKey: 'nav.ts.history',
          to: '/ts/history',
          icon: ClipboardList,
          roles: ['TS'],
        },
        {
          label: 'Approval Queue',
          labelKey: 'nav.principal.approvals',
          to: '/principal/approvals',
          icon: ShieldCheck,
          roles: ['PRINCIPAL'],
        },
        {
          label: 'All Requests',
          labelKey: 'nav.principal.requests',
          to: '/principal/requests',
          icon: ClipboardList,
          roles: ['PRINCIPAL'],
        },
        {
          label: 'Approved Requests & Print',
          labelKey: 'nav.purchase.approved',
          to: '/purchase/approved',
          icon: ShoppingCart,
          roles: ['PURCHASE'],
        },
        {
          label: 'Purchase Orders',
          labelKey: 'nav.purchase.orders',
          to: '/purchase/orders',
          icon: Truck,
          roles: ['PURCHASE'],
        },
        {
          label: 'Inward Receiving',
          labelKey: 'nav.store.receiving',
          to: '/store/receiving',
          icon: Truck,
          roles: ['STORE_MANAGER'],
        },
        {
          label: 'Direct Store Issues',
          labelKey: 'nav.store.issues',
          to: '/store/issues',
          icon: CheckSquare,
          roles: ['STORE_MANAGER'],
        },
      ],
    },
    {
      sectionTitle: 'ADMINISTRATION',
      sectionKey: 'nav.section.administration',
      items: [
        {
          label: 'Master Product Catalog',
          labelKey: 'nav.admin.catalog',
          to: '/admin/catalog',
          icon: BookOpen,
          roles: ['ADMIN'],
        },
        {
          label: 'Users & Hierarchy Mapping',
          labelKey: 'nav.admin.users',
          to: '/admin/users',
          icon: GitBranch,
          roles: ['ADMIN'],
        },
        {
          label: 'Audit Trails',
          labelKey: 'nav.admin.audit',
          to: '/admin/audit-logs',
          icon: FileSearch,
          roles: ['ADMIN'],
        },
      ],
    },
  ];

  const visibleSections = navSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => item.roles.includes(currentUser.role)),
    }))
    .filter((sec) => sec.items.length > 0);

  const initials = currentUser.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const localizedUserDept = currentUser
    ? t(`trade.${currentUser.department}`) !== `trade.${currentUser.department}`
      ? t(`trade.${currentUser.department}`)
      : currentUser.department
    : '';

  const handleLogout = () => {
    logout();
    toast.info('Logged out from Govt. ITI Rewa Portal');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fb] text-[#0f172a] max-w-full overflow-x-hidden">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#e2e8f0] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 no-print">
        {/* Left: Sidebar toggle + Institutional Logo + Title (matching layout reference) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            aria-label="Toggle Navigation Sidebar"
            onClick={() => {
              if (window.innerWidth >= 1024) {
                setIsSidebarCollapsed((prev) => !prev);
              } else {
                setMobileMenuOpen((prev) => !prev);
              }
            }}
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#2563eb] text-white flex items-center justify-center shadow-2xs shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13.5px] sm:text-base md:text-lg tracking-tight text-slate-900 whitespace-nowrap">
                <span className="hidden sm:inline">{t('app.title')}</span>
                <span className="sm:hidden">{language === 'hi' ? 'शा. आई.टी.आई. रीवा' : t('app.title')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        {/* Right: Language Toggle + Notification Bell + User Profile + Logout */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {/* Language Switcher Button (हिन्दी / English) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-[#1e3a8a] bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer"
            title={language === 'en' ? 'हिन्दी में बदलें (Switch to Hindi)' : 'Switch to English'}
            aria-label="Toggle language between English and Hindi"
          >
            <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1e3a8a] shrink-0" />
            <span className="font-semibold hidden sm:inline">{language === 'en' ? 'हिन्दी' : 'English'}</span>
            <span className="font-semibold sm:hidden">{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Master Voice Typing Toggle Button (Common Top Bar Toggle) */}
          <VoiceTypeToggle variant="header" />

          {/* Notification Bell + Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              aria-label={`Notifications (${unreadCount} unread)`}
              onClick={() => setNotifPopoverOpen((o) => !o)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-2xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notifPopoverOpen && (
              <div className="fixed inset-x-3 top-16 max-w-sm mx-auto z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] sm:max-w-none rounded-xl bg-white border border-[#e2e8f0] shadow-xl overflow-hidden">
                <div className="px-4 py-3 bg-white border-b border-[#e2e8f0] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {t('header.notifications')}
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-mono">
                        {unreadCount} {t('header.new')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          clearNotifications(currentUser.id);
                          toast.success(
                            language === 'hi'
                              ? 'सभी सूचनाएं पढ़ी हुई चिह्नित की गईं'
                              : 'All notifications marked as read'
                          );
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{t('header.markAllRead')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Close Notifications"
                      onClick={() => setNotifPopoverOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                  {userNotifications.length === 0 ? (
                    <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200/60">
                        <Mail className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-0.5">
                        {t('header.noNotifications')}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {language === 'hi' ? 'सभी कार्य अद्यतन हैं!' : 'You are all caught up!'}
                      </p>
                    </div>
                  ) : (
                    userNotifications.map((notif) => {
                      const { actor, redirectUrl } = getNotificationMeta(
                        notif,
                        currentUser.role
                      );
                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            dismissNotification(notif.id);
                            setNotifPopoverOpen(false);
                            navigate(redirectUrl);
                          }}
                          className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 text-left group"
                        >
                          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 mb-0.5">
                              <span className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1e3a8a] transition-colors">
                                {localizeNotificationTitle(notif.title, language)}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono text-slate-400">
                                <span>{formatShortTime(notif.createdAt, language)}</span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {language === 'hi' ? 'द्वारा:' : 'By:'} {localizeActor(actor, language)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Avatar, Name, Role Badge, Department (hidden on mobile, shown on bottom of sidebar on mobile) */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 text-[#1e3a8a] font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser.name}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-50 text-[#0f766e] border border-teal-200 rounded whitespace-nowrap">
                  {t(`role.${currentUser.role}`)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {localizedUserDept}
              </p>
            </div>
          </div>

          {/* Clean Logout Button (hidden on mobile, shown on bottom of sidebar on mobile) */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('header.logout')}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area with Left Sidebar */}
      <div className="flex-1 flex relative">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 z-20 lg:hidden no-print"
          />
        )}

        {/* Left Sidebar */}
        <aside
          aria-label="Role Navigation"
          className={`fixed lg:static inset-y-0 left-0 z-20 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          } bg-white border-r border-[#e2e8f0] flex flex-col justify-between transition-all duration-200 ease-out no-print ${
            mobileMenuOpen ? 'translate-x-0 pt-16 lg:pt-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-3 sm:p-4 space-y-5 overflow-y-auto">
            {visibleSections.map((section) => (
              <div key={section.sectionTitle}>
                {!isSidebarCollapsed ? (
                  <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t(section.sectionKey)}
                  </p>
                ) : (
                  <div className="my-2 border-t border-slate-100" />
                )}
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        title={isSidebarCollapsed ? t(item.labelKey) : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `relative flex items-center ${
                            isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between gap-2.5 px-3 py-2.5'
                          } rounded-lg text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-[#2563eb] text-white shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`
                        }
                      >
                        <div className={`flex items-center gap-2.5 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                          <Icon className={`${isSidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />
                          {!isSidebarCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
                        </div>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar Bottom Footer (User info & Logout button) - Mobile drawer only */}
          <div className={`sm:hidden p-3 border-t border-[#e2e8f0] bg-slate-50/80 space-y-2.5 ${isSidebarCollapsed ? 'text-center' : ''}`}>
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-[#1e3a8a] font-bold text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-[#0f766e] font-semibold truncate">
                      {t(`role.${currentUser.role}`)} • {localizedUserDept}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('header.logout')}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                title={t('header.logout')}
                className="w-full flex items-center justify-center p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Page Body & Slim Institutional Footer */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
          <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6">
            <Outlet />
          </main>

          <footer className="bg-white border-t border-[#e2e8f0] px-4 sm:px-6 py-3.5 text-center text-xs text-slate-500 no-print">
            {t('footer.text')}
          </footer>
        </div>
      </div>

      {/* Live Voice Transcription Floating Bar */}
      {isRecording && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] max-w-lg w-[90%] bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-full shadow-2xl flex items-center justify-between gap-3 border border-slate-700 text-xs animate-in slide-in-from-bottom-3 duration-200 no-print">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <p className="truncate text-slate-200 italic font-medium">
              {liveTranscript ||
                (language === 'hi'
                  ? 'सुन रहे हैं... चयनित इनपुट बॉक्स में आवाज़ दर्ज हो रही है'
                  : 'Listening... Dictating into selected input field')}
            </p>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            {language === 'hi' ? 'रोकें (पूर्ण)' : 'Stop'}
          </button>
        </div>
      )}
    </div>
  );
};
