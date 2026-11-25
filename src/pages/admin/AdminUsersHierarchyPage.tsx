import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Edit3,
  X,
  UserCheck,
  AlertCircle,
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { ModuleFilterBar, FilterField } from '../../components/ui/ModuleFilterBar';
import { DropSearch, ComboboxItem } from '../../components/ui/DropSearch';
import { VoiceTypeToggle } from '../../components/ui/VoiceTypeToggle';
import { User, UserRole, CreateUserPayload, UpdateUserPayload } from '../../types';
import { validatePassword } from '../../utils/storeLogic';

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  TO: 'bg-indigo-50 text-[#1e3a8a] border-indigo-200',
  TS: 'bg-teal-50 text-[#0f766e] border-teal-200',
  PRINCIPAL: 'bg-purple-50 text-purple-800 border-purple-200',
  PURCHASE: 'bg-amber-50 text-amber-800 border-amber-200',
  STORE_MANAGER: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  ADMIN: 'bg-slate-900 text-white border-slate-900',
};

interface UserFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  assignedTsId?: string;
  department?: string;
}

export const AdminUsersHierarchyPage: React.FC = () => {
  const { users, createUser, updateUser } = useStore();
  const { t, language } = useLanguage();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Create Form State
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createRole, setCreateRole] = useState<UserRole>('TO');
  const [createDepartment, setCreateDepartment] = useState('');
  const [createAssignedTsId, setCreateAssignedTsId] = useState<string | null>(null);
  const [createErrors, setCreateErrors] = useState<UserFieldErrors>({});

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRole, setEditRole] = useState<UserRole>('TO');
  const [editDepartment, setEditDepartment] = useState('');
  const [editAssignedTsId, setEditAssignedTsId] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<UserFieldErrors>({});

  // All available Training Superintendents
  const tsUsers = useMemo(() => users.filter((u) => u.role === 'TS'), [users]);

  const roleOptions: ComboboxItem[] = useMemo(
    () => [
      {
        id: 'TO',
        label: language === 'hi' ? 'प्रशिक्षण अधिकारी (TO)' : 'Training Officer (TO)',
        subLabel:
          language === 'hi'
            ? 'प्रायोगिक प्रशिक्षण सामग्री की मांग'
            : 'Indents practical training materials',
      },
      {
        id: 'TS',
        label: language === 'hi' ? 'प्रशिक्षण अधीक्षक (TS)' : 'Training Superintendent (TS)',
        subLabel:
          language === 'hi'
            ? 'तकनीकी पाठ्यक्रम सत्यापन'
            : 'Technical syllabus verification',
      },
      {
        id: 'PRINCIPAL',
        label: language === 'hi' ? 'प्राचार्य (Principal)' : 'Principal',
        subLabel:
          language === 'hi'
            ? 'सर्वोच्च स्वीकृति एवं अग्रेषण प्राधिकारी'
            : 'Apex sanctioning & routing authority',
      },
      {
        id: 'PURCHASE',
        label: language === 'hi' ? 'क्रय अधिकारी (Purchase Officer)' : 'Purchase Officer',
        subLabel:
          language === 'hi'
            ? 'GeM क्रय एवं शासकीय आदेश'
            : 'GeM procurement & official orders',
      },
      {
        id: 'STORE_MANAGER',
        label: language === 'hi' ? 'भंडारपाल (Store Manager)' : 'Store Manager',
        subLabel:
          language === 'hi'
            ? 'भंडार संरक्षण एवं FIFO आवक'
            : 'Inventory custody & FIFO receiving',
      },
      {
        id: 'ADMIN',
        label: language === 'hi' ? 'सिस्टम प्रशासक (System Admin)' : 'System Admin',
        subLabel:
          language === 'hi'
            ? 'प्रशासन, भूमिका नियंत्रण एवं ऑडिट'
            : 'Governance, RBAC & system audit',
      },
    ],
    [language]
  );

  const tsComboboxItems: ComboboxItem[] = useMemo(
    () =>
      tsUsers.map((ts) => ({
        id: ts.id,
        label: `TS ${ts.name}`,
        subLabel: ts.department,
      })),
    [tsUsers]
  );

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Open Create Modal (Guarantees fresh empty state on every open)
  const openCreateModal = () => {
    setCreateName('');
    setCreateEmail('');
    setCreatePassword('');
    setShowCreatePassword(false);
    setCreateRole('TO');
    setCreateDepartment('');
    setCreateAssignedTsId(tsUsers[0]?.id || null);
    setCreateErrors({});
    setCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPassword('');
    setShowEditPassword(false);
    setEditRole(user.role);
    setEditDepartment(user.department);
    setEditAssignedTsId(user.assignedTsId || tsUsers[0]?.id || null);
    setEditErrors({});
  };

  // Submit User Creation
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: UserFieldErrors = {};

    if (!createName.trim()) {
      errors.name =
        language === 'hi' ? 'अधिकारी का नाम रिक्त नहीं हो सकता' : 'Officer name cannot be empty';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!createEmail.trim()) {
      errors.email =
        language === 'hi' ? 'ईमेल दर्ज करना अनिवार्य है' : 'Email cannot be empty';
    } else if (!emailPattern.test(createEmail.trim())) {
      errors.email =
        language === 'hi'
          ? 'कृपया वैध संस्थागत ईमेल पता दर्ज करें'
          : 'Please enter a valid institutional email address';
    }

    const pwdError = validatePassword(createPassword, language);
    if (pwdError) {
      errors.password = pwdError;
    }

    if (createRole === 'TO' && !createAssignedTsId) {
      errors.assignedTsId =
        language === 'hi'
          ? 'कृपया आवंटित प्रशिक्षण अधीक्षक (TS) का चयन करें'
          : 'Please select an assigned Training Superintendent';
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});

    const payload: CreateUserPayload = {
      name: createName.trim(),
      email: createEmail.trim(),
      password: createPassword,
      role: createRole,
      department: createDepartment.trim() || 'Electrician',
      assignedTsId: createRole === 'TO' ? createAssignedTsId || undefined : undefined,
    };

    const result = createUser(payload);
    if (!result.success) {
      const errorMsg =
        result.error === 'An account with this institutional email already exists.'
          ? (language === 'hi'
              ? 'इस संस्थागत ईमेल से खाता पहले से मौजूद है।'
              : result.error)
          : (language === 'hi'
              ? 'उपयोगकर्ता खाता बनाने में विफल।'
              : (result.error || 'Failed to create user account.'));
      setCreateErrors({ email: errorMsg });
      return;
    }

    toast.success(
      language === 'hi'
        ? `उपयोगकर्ता ${result.user?.name} (${result.user?.role}) सफलतापूर्वक बनाया गया!`
        : `User ${result.user?.name} (${result.user?.role}) created successfully!`
    );
    setCreateModalOpen(false);
  };

  // Submit User Update
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const errors: UserFieldErrors = {};

    if (!editName.trim()) {
      errors.name =
        language === 'hi' ? 'अधिकारी का नाम रिक्त नहीं हो सकता' : 'Officer name cannot be empty';
    }

    // Role protection: Ensure at least 1 Admin and at least 1 Principal exist
    if (editingUser.role === 'ADMIN' && editRole !== 'ADMIN') {
      const adminCount = users.filter((u) => u.role === 'ADMIN').length;
      if (adminCount <= 1) {
        errors.role =
          language === 'hi'
            ? 'पद नहीं बदला जा सकता: प्रणाली में कम से कम 1 सक्रिय सिस्टम प्रशासक (ADMIN) होना अनिवार्य है।'
            : 'Cannot change role: There must be at least 1 active System Administrator (ADMIN) in the system.';
      }
    }

    if (editingUser.role === 'PRINCIPAL' && editRole !== 'PRINCIPAL') {
      const principalCount = users.filter((u) => u.role === 'PRINCIPAL').length;
      if (principalCount <= 1) {
        errors.role =
          language === 'hi'
            ? 'पद नहीं बदला जा सकता: प्रणाली में कम से कम 1 सक्रिय प्राचार्य (Principal) होना अनिवार्य है।'
            : 'Cannot change role: There must be at least 1 active Principal in the system.';
      }
    }

    // If new password is provided, validate complexity
    if (editPassword.trim()) {
      const pwdError = validatePassword(editPassword.trim(), language);
      if (pwdError) {
        errors.password = pwdError;
      }
    }

    if (editRole === 'TO' && !editAssignedTsId) {
      errors.assignedTsId =
        language === 'hi'
          ? 'प्रशिक्षण अधिकारी पद हेतु कृपया आवंटित प्रशिक्षण अधीक्षक (TS) का चयन करें'
          : 'Please select an assigned Training Superintendent';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});

    const payload: UpdateUserPayload = {
      name: editName.trim(),
      password: editPassword.trim() || undefined,
      role: editRole,
      department: editDepartment.trim() || editingUser.department || 'Electrician',
      assignedTsId: editRole === 'TO' ? editAssignedTsId || undefined : undefined,
    };

    const result = updateUser(editingUser.id, payload);
    if (!result.success) {
      setEditErrors({
        name:
          language === 'hi'
            ? 'उपयोगकर्ता प्रोफ़ाइल अद्यतन करने में विफल।'
            : (result.error || 'Failed to update user profile.'),
      });
      return;
    }

    toast.success(
      language === 'hi'
        ? `उपयोगकर्ता ${result.user?.name} सफलतापूर्वक अद्यतन किया गया!`
        : `User ${result.user?.name} updated successfully!`
    );
    setEditingUser(null);
  };

  const columns: DataTableColumn<User>[] = [
    {
      id: 'name',
      header: language === 'hi' ? 'अधिकारी का नाम एवं ईमेल' : 'Officer Name & Email',
      accessor: (u) => u.name,
      sortable: true,
      cell: (u) => (
        <div>
          <p className="font-semibold text-slate-900">{u.name}</p>
          <p className="font-mono text-[11px] text-slate-500">{u.email}</p>
          {u.phone && <p className="text-[11px] text-slate-400 mt-0.5">{u.phone}</p>}
        </div>
      ),
    },
    {
      id: 'role',
      header: language === 'hi' ? 'संस्थागत पद' : 'Institutional Role',
      accessor: (u) => u.role,
      sortable: true,
      cell: (u) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${
            ROLE_BADGE_STYLES[u.role]
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      id: 'supervisor',
      header: language === 'hi' ? 'पर्यवेक्षक टी.एस.' : 'Assigned Supervisor (TS Hierarchy)',
      accessor: (u) => u.assignedTsId || '',
      cell: (u) => {
        if (u.role !== 'TO') {
          return (
            <span className="text-xs text-slate-400 italic">
              {u.role === 'TS'
                ? (language === 'hi' ? 'पर्यवेक्षी अधिकारी (प्राचार्य को रिपोर्टिंग)' : 'Supervisory Authority (Reports to Principal)')
                : (language === 'hi' ? 'शाखा अधिकारी' : 'Institutional Wing Officer')}
            </span>
          );
        }

        const supervisor = users.find((t) => t.id === u.assignedTsId);
        if (!supervisor) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3 h-3" />
              <span>{language === 'hi' ? 'आवंटित नहीं' : 'Not Assigned'}</span>
            </span>
          );
        }

        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-[#0f766e] border border-teal-200">
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span>TS: {supervisor.name}</span>
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: t('col.actions'),
      cell: (u) => (
        <button
          type="button"
          onClick={() => openEditModal(u)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#1e3a8a] bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{t('action.edit')}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={language === 'hi' ? 'संगठनात्मक पदानुक्रम एवं भूमिकाएं' : 'ORGANIZATIONAL HIERARCHY & RBAC'}
        title={language === 'hi' ? 'उपयोगकर्ता एवं संस्थागत पदानुक्रम प्रबंधन' : 'Users & Institutional Hierarchy Management'}
        subtitle={
          language === 'hi'
            ? 'शासकीय आई.टी.आई. रीवा पोर्टल हेतु अधिकारी क्रेडेंशियल, भूमिकाएं एवं टी.एस. पर्यवेक्षी मैपिंग प्रबंधित करें।'
            : 'Manage institutional user profiles, credentials, role-based access control, and TO-to-TS supervisory routing mappings.'
        }
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया उपयोगकर्ता जोड़ें' : 'Add New User'}</span>
          </button>
        }
      />

      {/* Replaced Cards with Filter Section */}
      <ModuleFilterBar
        title={language === 'hi' ? 'संस्थागत कार्मिक फ़िल्टर करें' : 'Filter Institutional Personnel'}
        onReset={() => {
          setSearchQuery('');
          setRoleFilter('ALL');
        }}
        hasActiveFilters={searchQuery.trim() !== '' || roleFilter !== 'ALL'}
      >
        <FilterField label={language === 'hi' ? 'नाम / ईमेल / व्यवसाय खोजें' : 'Search Name / Email / Trade'} htmlFor="admin-search-users">
          <input
            id="admin-search-users"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'अधिकारी का नाम, ईमेल दर्ज करें...' : 'Search officer name, email, department...'}
            className="w-full h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#1e3a8a]"
          />
        </FilterField>

        <FilterField label={language === 'hi' ? 'संस्थागत पद' : 'Institutional Role'} htmlFor="admin-filter-role">
          <DropSearch
            placeholder={language === 'hi' ? 'सभी पद' : 'All Roles'}
            searchPlaceholder={language === 'hi' ? 'पद खोजें...' : 'Search institutional role...'}
            value={roleFilter === 'ALL' ? null : roleFilter}
            onChange={(val) => setRoleFilter(val ?? 'ALL')}
            allOption={{ id: 'ALL', label: language === 'hi' ? `सभी पद (${users.length})` : `All Roles (${users.length})` }}
            items={roleOptions}
            width="w-full"
          />
        </FilterField>
      </ModuleFilterBar>

      {/* All Institutional Users DataTable */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1e3a8a]" />
              <span>{language === 'hi' ? 'समस्त संस्थागत कार्मिक' : 'All Institutional Personnel'}</span>
            </h2>
          </div>
        </div>

        <DataTable
          data={filteredUsers}
          columns={columns}
          keyExtractor={(u) => u.id}
          pageSize={10}
          emptyTitle={
            language === 'hi'
              ? 'कोई संस्थागत कार्मिक फ़िल्टर से मेल नहीं खाता'
              : 'No Institutional Users Match Filters'
          }
          emptyDescription={
            language === 'hi'
              ? 'खोज शब्द साफ़ करें अथवा "सभी पद" चुनें।'
              : "Try clearing your search keyword or selecting 'All Roles'."
          }
        />
      </div>

      {/* CREATE USER MODAL */}
      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <UserPlus className="w-5 h-5 text-teal-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate">
                    {language === 'hi'
                      ? 'नया संस्थागत उपयोगकर्ता बनाएं'
                      : 'Create New Institutional User'}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate hidden sm:block">
                    {language === 'hi'
                      ? 'भूमिका आधारित पहुंच नियंत्रण एवं पर्यवेक्षी मैपिंग सहित नया अधिकारी खाता जोड़ें'
                      : 'Add a new officer account with role-based access control and supervisory mapping'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <VoiceTypeToggle size="xs" variant="dark" />
                <button
                  type="button"
                  aria-label="Close Modal"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Officer Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'अधिकारी का पूरा नाम' : 'Officer Full Name'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => {
                      setCreateName(e.target.value);
                      if (createErrors.name) setCreateErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder={language === 'hi' ? 'उदा. रमेश कुमार वर्मा' : 'e.g. Ramesh Kumar Verma'}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-slate-900 focus:outline-none transition-colors ${
                      createErrors.name
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20'
                    }`}
                  />
                </div>
                {createErrors.name && (
                  <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{createErrors.name}</span>
                  </div>
                )}
              </div>

              {/* Institutional Email (Unique) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi'
                    ? 'संस्थागत ईमेल (लॉगिन आईडी)'
                    : 'Institutional Email (Unique Login ID)'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => {
                      setCreateEmail(e.target.value);
                      if (createErrors.email) setCreateErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder={
                      language === 'hi'
                        ? 'उदा. ramesh.verma@itirewa.mp.gov.in'
                        : 'e.g. ramesh.verma@itirewa.mp.gov.in'
                    }
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-slate-900 focus:outline-none transition-colors ${
                      createErrors.email
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20'
                    }`}
                  />
                </div>
                {createErrors.email && (
                  <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{createErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'डिफ़ॉल्ट पासवर्ड' : 'Default Password'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    value={createPassword}
                    maxLength={30}
                    onChange={(e) => {
                      setCreatePassword(e.target.value);
                      if (createErrors.password) setCreateErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder={
                      language === 'hi'
                        ? 'संस्थागत पासवर्ड दर्ज करें...'
                        : 'Enter institutional password...'
                    }
                    className={`w-full pl-9 pr-10 py-2 rounded-lg border text-slate-900 focus:outline-none transition-colors ${
                      createErrors.password
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCreatePassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showCreatePassword ? 'Hide password' : 'Show password'}
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {createErrors.password ? (
                  <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{createErrors.password}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'hi'
                      ? 'न्यूनतम 8, अधिकतम 30 अक्षर, कम से कम 1 बड़ा अक्षर, 1 छोटा अक्षर, 1 अंक तथा 1 विशेष वर्ण।'
                      : 'Min 8 chars, max 30 chars, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.'}
                  </p>
                )}
              </div>

              {/* Role DropSearch */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'संस्थागत पद' : 'Institutional Role'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <DropSearch
                  placeholder={language === 'hi' ? 'पद चुनें' : 'Select Role'}
                  searchPlaceholder={language === 'hi' ? 'पद खोजें...' : 'Search role...'}
                  value={createRole}
                  onChange={(val) => {
                    setCreateRole((val as UserRole) || 'TO');
                    if (createErrors.role) setCreateErrors((prev) => ({ ...prev, role: undefined }));
                  }}
                  items={roleOptions}
                  width="w-full"
                />
                {createErrors.role && (
                  <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{createErrors.role}</span>
                  </div>
                )}
              </div>

              {/* Conditional Assigned TS DropSearch (Strictly if role is TO) */}
              {createRole === 'TO' && (
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <label className="block font-semibold text-[#1e3a8a]">
                    {language === 'hi'
                      ? 'आवंटित पर्यवेक्षक प्रशिक्षण अधीक्षक (TS)'
                      : 'Assigned Supervising Training Superintendent (TS)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <DropSearch
                    placeholder={language === 'hi' ? 'पर्यवेक्षक टी.एस. चुनें' : 'Select Supervising TS'}
                    searchPlaceholder={
                      language === 'hi'
                        ? 'प्रशिक्षण अधीक्षक खोजें...'
                        : 'Search Training Superintendent...'
                    }
                    value={createAssignedTsId}
                    onChange={(val) => {
                      setCreateAssignedTsId(val);
                      if (createErrors.assignedTsId) setCreateErrors((prev) => ({ ...prev, assignedTsId: undefined }));
                    }}
                    items={tsComboboxItems}
                    width="w-full"
                    className={createErrors.assignedTsId ? 'border-rose-400 focus:border-rose-600' : ''}
                  />
                  {createErrors.assignedTsId && (
                    <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{createErrors.assignedTsId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Department / Trade (Optional — Defaults to Electrician) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'विभाग / व्यवसाय' : 'Department / Trade'}{' '}
                  <span className="text-slate-400 font-normal">
                    {language === 'hi'
                      ? '(वैकल्पिक — डिफ़ॉल्ट इलेक्ट्रीशियन)'
                      : '(Optional — Defaults to Electrician)'}
                  </span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={createDepartment}
                    onChange={(e) => setCreateDepartment(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'इलेक्ट्रीशियन (अथवा फ़िटर, वेल्डर आदि दर्ज करें)'
                        : 'Electrician (or specify Fitter, Welder, etc.)'
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'उपयोगकर्ता बनाएं' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Edit3 className="w-5 h-5 text-teal-400 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate">
                    {language === 'hi'
                      ? `उपयोगकर्ता प्रोफाइल संपादित करें — ${editingUser.name}`
                      : `Edit User Profile — ${editingUser.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate hidden sm:block">
                    {language === 'hi'
                      ? 'अधिकारी विवरण, क्रेडेंशियल, पद अथवा पर्यवेक्षी मैपिंग अद्यतन करें'
                      : 'Update officer details, credentials, role, or supervisory routing'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <VoiceTypeToggle size="xs" variant="dark" />
                <button
                  type="button"
                  aria-label="Close Modal"
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'अधिकारी का पूरा नाम' : 'Officer Full Name'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (editErrors.name) setEditErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border text-slate-900 focus:outline-none transition-colors ${
                      editErrors.name
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20'
                    }`}
                  />
                </div>
                {editErrors.name && (
                  <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editErrors.name}</span>
                  </div>
                )}
              </div>

              {/* Institutional Email (Disabled / Read-Only) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi'
                    ? 'संस्थागत ईमेल (लॉगिन आईडी)'
                    : 'Institutional Email (Login ID)'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    readOnly
                    value={editingUser.email}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed select-none font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'hi'
                    ? 'संस्थागत ईमेल विशिष्ट लॉगिन पहचान है एवं इसे बदला नहीं जा सकता।'
                    : 'Institutional email serves as the unique login credential and cannot be modified.'}
                </p>
              </div>

              {/* Password (Optional Change) with Eye Toggle */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi'
                    ? 'पासवर्ड बदलें (वर्तमान रखने हेतु रिक्त छोड़ें)'
                    : 'Change Password (Leave blank to keep existing)'}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    maxLength={30}
                    onChange={(e) => {
                      setEditPassword(e.target.value);
                      if (editErrors.password) setEditErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder={
                      language === 'hi'
                        ? 'नया पासवर्ड दर्ज करें (वैकल्पिक)...'
                        : 'Enter new password (optional)...'
                    }
                    className={`w-full pl-9 pr-10 py-2 rounded-lg border text-slate-900 focus:outline-none transition-colors ${
                      editErrors.password
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20'
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowEditPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showEditPassword ? 'Hide password' : 'Show password'}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {editErrors.password ? (
                  <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editErrors.password}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'hi'
                      ? 'बदलने की स्थिति में: न्यूनतम 8, अधिकतम 30 अक्षर, कम से कम 1 बड़ा अक्षर, 1 छोटा अक्षर, 1 अंक तथा 1 विशेष वर्ण।'
                      : 'If changing: Min 8 chars, max 30 chars, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.'}
                  </p>
                )}
              </div>

              {/* Institutional Role */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'संस्थागत पद' : 'Institutional Role'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <DropSearch
                  placeholder={language === 'hi' ? 'पद चुनें' : 'Select Role'}
                  searchPlaceholder={language === 'hi' ? 'पद खोजें...' : 'Search role...'}
                  value={editRole}
                  onChange={(val) => {
                    setEditRole((val as UserRole) || 'TO');
                    if (editErrors.role) setEditErrors((prev) => ({ ...prev, role: undefined }));
                  }}
                  items={roleOptions}
                  width="w-full"
                />
                {editErrors.role && (
                  <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{editErrors.role}</span>
                  </div>
                )}
              </div>

              {/* Conditional Assigned TS DropSearch (Strictly if role is TO) */}
              {editRole === 'TO' && (
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                  <label className="block font-semibold text-[#1e3a8a]">
                    {language === 'hi'
                      ? 'आवंटित पर्यवेक्षक प्रशिक्षण अधीक्षक (TS)'
                      : 'Assigned Supervising Training Superintendent (TS)'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <DropSearch
                    placeholder={language === 'hi' ? 'पर्यवेक्षक टी.एस. चुनें' : 'Select Supervising TS'}
                    searchPlaceholder={
                      language === 'hi'
                        ? 'प्रशिक्षण अधीक्षक खोजें...'
                        : 'Search Training Superintendent...'
                    }
                    value={editAssignedTsId}
                    onChange={(val) => {
                      setEditAssignedTsId(val);
                      if (editErrors.assignedTsId) setEditErrors((prev) => ({ ...prev, assignedTsId: undefined }));
                    }}
                    items={tsComboboxItems}
                    width="w-full"
                    className={editErrors.assignedTsId ? 'border-rose-400 focus:border-rose-600' : ''}
                  />
                  {editErrors.assignedTsId && (
                    <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{editErrors.assignedTsId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Department / Trade (Optional — Defaults to Electrician) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'विभाग / व्यवसाय' : 'Department / Trade'}{' '}
                  <span className="text-slate-400 font-normal">
                    {language === 'hi'
                      ? '(वैकल्पिक — डिफ़ॉल्ट इलेक्ट्रीशियन)'
                      : '(Optional — Defaults to Electrician)'}
                  </span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'इलेक्ट्रीशियन (अथवा फ़िटर, वेल्डर आदि दर्ज करें)'
                        : 'Electrician (or specify Fitter, Welder, etc.)'
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1e3a8a]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'परिवर्तन सहेजें' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
