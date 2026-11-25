import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit3,
  CheckCircle2,
  X,
  BookOpen,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { ModuleFilterBar } from '../../components/ui/ModuleFilterBar';
import { DataTable, DataTableColumn } from '../../components/ui/DataTable';
import { FormInput } from '../../components/ui/FormFields';
import { DropSearch } from '../../components/ui/DropSearch';
import { VoiceTypeToggle } from '../../components/ui/VoiceTypeToggle';
import { CatalogItem } from '../../types';

export const AdminCatalogPage: React.FC = () => {
  const { catalogItems, upsertCatalogItem } = useStore();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add / Edit Trade Item Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CatalogItem['category']>('Electrician');
  const [unit, setUnit] = useState('Nos');
  const [initialStock, setInitialStock] = useState('15');
  const [minThreshold, setMinThreshold] = useState('5');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [formErrors, setFormErrors] = useState<{
    code?: string;
    name?: string;
    unit?: string;
    description?: string;
    stock?: string;
    minThreshold?: string;
  }>({});

  const filteredCatalog = useMemo(() => {
    return catalogItems.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === 'ALL' || item.category === categoryFilter;

      const isItemActive = item.active !== false;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && isItemActive) ||
        (statusFilter === 'INACTIVE' && !isItemActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [catalogItems, searchQuery, categoryFilter, statusFilter]);

  const openModal = (item?: CatalogItem) => {
    if (item) {
      setEditingItem(item);
      setCode(item.code);
      setName(item.name);
      setCategory(item.category);
      setUnit(item.unit);
      setInitialStock(String(item.currentStock));
      setMinThreshold(String(item.minThreshold));
      setDescription(item.description || '');
      setActive(item.active !== false);
    } else {
      setEditingItem(null);
      setCode(`CAT-00${catalogItems.length + 1}`);
      setName('');
      setCategory('Electrician');
      setUnit('Nos');
      setInitialStock('20');
      setMinThreshold('5');
      setDescription('');
      setActive(true);
    }
    setFormErrors({});
    setModalOpen(true);
  };


  const handleSaveCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    const trimmedUnit = unit.trim();
    const trimmedDesc = description.trim();

    if (!trimmedCode) {
      errors.code =
        language === 'hi' ? 'सामग्री कोड रिक्त नहीं हो सकता' : 'Item Code cannot be empty';
    } else {
      if (!editingItem) {
        // Creating: must not match any existing item code
        const isDuplicate = catalogItems.some(
          (c) => c.code.trim().toUpperCase() === trimmedCode
        );
        if (isDuplicate) {
          errors.code =
            language === 'hi'
              ? `सामग्री कोड '${trimmedCode}' पहले से मौजूद है। कृपया कोई अन्य कोड चुनें।`
              : `Item Code '${trimmedCode}' already exists. Please choose a unique code.`;
        }
      } else {
        // Editing: must not match another item's code
        const isDuplicateOther = catalogItems.some(
          (c) => c.id !== editingItem.id && c.code.trim().toUpperCase() === trimmedCode
        );
        if (isDuplicateOther) {
          errors.code =
            language === 'hi'
              ? `सामग्री कोड '${trimmedCode}' किसी अन्य सामग्री द्वारा उपयोग में है।`
              : `Item Code '${trimmedCode}' is already in use by another item.`;
        }
      }
    }

    if (!trimmedName) {
      errors.name =
        language === 'hi' ? 'सामग्री का नाम रिक्त नहीं हो सकता' : 'Item Name cannot be empty';
    } else if (trimmedName.length > 50) {
      errors.name =
        language === 'hi'
          ? 'सामग्री का नाम 50 अक्षरों से अधिक नहीं हो सकता'
          : 'Item Name cannot exceed 50 characters';
    }

    if (!trimmedUnit) {
      errors.unit =
        language === 'hi' ? 'माप इकाई रिक्त नहीं हो सकती' : 'Unit cannot be empty';
    }

    if (trimmedDesc.length > 60) {
      errors.description =
        language === 'hi'
          ? 'तकनीकी विशिष्टताएं 60 अक्षरों से अधिक नहीं हो सकतीं'
          : 'Technical specifications cannot exceed 60 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const saved = upsertCatalogItem({
      id: editingItem?.id,
      code: trimmedCode,
      name: trimmedName,
      category,
      unit: trimmedUnit || 'Nos',
      currentStock: editingItem?.currentStock ?? 0,
      minThreshold: editingItem?.minThreshold ?? 0,
      description: trimmedDesc || undefined,
      active,
      lastUpdated: new Date().toISOString(),
    });

    toast.success(
      language === 'hi'
        ? `मास्टर ट्रेड कैटलॉग ${editingItem ? 'अद्यतन किया गया' : 'सफलतापूर्वक जोड़ा गया'}: ${saved.code} — ${saved.name}`
        : `Master Trade Catalog ${editingItem ? 'updated' : 'created'}: ${saved.code} — ${saved.name}`
    );
    setModalOpen(false);
  };

  const columns: DataTableColumn<CatalogItem>[] = [
    {
      id: 'code',
      header: t('col.itemCode'),
      accessor: (c) => c.code,
      sortable: true,
      width: '130px',
      minWidth: '120px',
      wrapText: false,
      cell: (c) => (
        <span className="font-mono font-bold text-[#1e3a8a] whitespace-nowrap">{c.code}</span>
      ),
    },
    {
      id: 'name',
      header: t('col.itemName'),
      accessor: (c) => c.name,
      sortable: true,
      minWidth: '220px',
      wrapText: false,
      cell: (c) => (
        <span className="font-semibold text-slate-900 whitespace-nowrap">{c.name}</span>
      ),
    },
    {
      id: 'description',
      header: t('col.specs'),
      accessor: (c) => c.description || '',
      sortable: true,
      minWidth: '260px',
      wrapText: false,
      cell: (c) => (
        <span className="text-xs text-slate-600 whitespace-nowrap">
          {c.description || '—'}
        </span>
      ),
    },
    {
      id: 'category',
      header: t('col.category'),
      accessor: (c) => c.category,
      sortable: true,
      width: '140px',
      minWidth: '130px',
      wrapText: false,
      cell: (c) => (
        <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200 whitespace-nowrap">
          {t(`trade.${c.category}`) !== `trade.${c.category}` ? t(`trade.${c.category}`) : c.category}
        </span>
      ),
    },
    {
      id: 'unit',
      header: t('col.unit'),
      accessor: (c) => c.unit,
      width: '80px',
      minWidth: '70px',
      cell: (c) => <span className="font-mono text-xs">{c.unit}</span>,
    },
    {
      id: 'active',
      header: language === 'hi' ? 'सूची स्थिति' : 'Catalog Status',
      accessor: (c) => (c.active !== false ? 1 : 0),
      width: '120px',
      minWidth: '110px',
      cell: (c) => {
        const isItemActive = c.active !== false;
        return isItemActive ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            {language === 'hi' ? 'सक्रिय' : 'Active'}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-300 whitespace-nowrap">
            {language === 'hi' ? 'निष्क्रिय' : 'Inactive'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: t('col.actions'),
      accessor: (c) => c.id,
      align: 'right',
      width: '70px',
      minWidth: '70px',
      cell: (c) => (
        <button
          type="button"
          title={`Edit Trade Item ${c.name}`}
          aria-label={`Edit Trade Item ${c.name}`}
          onClick={() => openModal(c)}
          className="p-2 rounded-lg text-slate-600 hover:text-[#1e3a8a] bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={language === 'hi' ? 'मास्टर सामग्री सूची' : 'MASTER PRODUCT CATALOG'}
        title={language === 'hi' ? 'ट्रेड सामग्री सूची प्रबंधन' : 'Master Trade Catalog Management'}
        subtitle={
          language === 'hi'
            ? 'मानकीकृत ट्रेड सामग्री एवं माप इकाइयां जोड़ें या संपादित करें। परिवर्तन तुरंत प्रशिक्षण अधिकारी मांग पत्र सूची में दिखेंगे।'
            : 'Add or edit standardized Trade catalog items and units of measure. Changes immediately sync to Training Officer requisition dropdowns.'
        }
        actions={
          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नवीन सामग्री जोड़ें' : 'Add Catalog Item'}</span>
          </button>
        }
      />

      <ModuleFilterBar
        searchPlaceholder={t('search.placeholder')}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        categoryLabel={language === 'hi' ? 'श्रेणी / व्यवसाय' : 'Category / Trade'}
        categoryValue={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categoryOptions={[
          { value: 'ALL', label: language === 'hi' ? 'सभी व्यवसाय / श्रेणियां' : 'All Trades / Categories' },
          { value: 'Electrician', label: language === 'hi' ? 'इलेक्ट्रीशियन' : 'Electrician' },
          { value: 'Fitter', label: language === 'hi' ? 'फ़िटर' : 'Fitter' },
          { value: 'Welder', label: language === 'hi' ? 'वेल्डर' : 'Welder' },
          { value: 'COPA', label: language === 'hi' ? 'कोपा (COPA)' : 'COPA' },
          { value: 'Mechanical', label: language === 'hi' ? 'मैकेनिकल' : 'Mechanical' },
          { value: 'General', label: language === 'hi' ? 'सामान्य' : 'General' },
        ]}
        statusLabel={language === 'hi' ? 'सूची स्थिति' : 'Catalog Status'}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: 'ALL', label: language === 'hi' ? 'सभी स्थितियां' : 'All Statuses' },
          { value: 'ACTIVE', label: language === 'hi' ? 'केवल सक्रिय' : 'Active Only' },
          { value: 'INACTIVE', label: language === 'hi' ? 'केवल निष्क्रिय' : 'Inactive Only' },
        ]}
        onReset={() => {
          setSearchQuery('');
          setCategoryFilter('ALL');
          setStatusFilter('ALL');
        }}
      />

      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5">
        <DataTable
          data={filteredCatalog}
          columns={columns}
          keyExtractor={(c) => c.id}
          emptyTitle="No Matching Trade Catalog Items"
          emptyDescription="Adjust your search query or add a new Trade catalog item above."
        />
      </div>

      {/* Modal: Add / Edit Trade Item */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden">
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <BookOpen className="w-5 h-5 text-teal-400 shrink-0" />
                <h2 id="catalog-modal-title" className="text-sm font-bold truncate">
                  {editingItem
                    ? (language === 'hi'
                        ? `ट्रेड सामग्री संपादित करें — ${editingItem.code}`
                        : `Edit Trade Catalog Item — ${editingItem.code}`)
                    : (language === 'hi'
                        ? 'नवीन ट्रेड सामग्री जोड़ें'
                        : 'Add New Trade Catalog Item')}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <VoiceTypeToggle size="xs" variant="dark" />
                <button
                  type="button"
                  aria-label="Close Catalog Modal"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSaveCatalogItem}
              noValidate
              className="p-6 space-y-4 overflow-y-auto flex-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  id="catalog-code-input"
                  label={language === 'hi' ? 'सामग्री कोड' : 'Item Code'}
                  required
                  placeholder={language === 'hi' ? 'उदा. CAT-009' : 'e.g., CAT-009'}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  error={formErrors.code}
                />
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="catalog-category-select"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                  >
                    <span>{language === 'hi' ? 'श्रेणी / व्यवसाय' : 'Category / Trade'}</span>
                    <span className="text-rose-600 font-bold" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <DropSearch
                    placeholder={language === 'hi' ? 'ट्रेड श्रेणी चुनें' : 'Select Trade Category'}
                    searchPlaceholder={language === 'hi' ? 'ट्रेड श्रेणी खोजें...' : 'Search trade category...'}
                    value={category}
                    onChange={(val) =>
                      setCategory((val || 'General') as CatalogItem['category'])
                    }
                    items={[
                      { id: 'Electrician', label: language === 'hi' ? 'इलेक्ट्रीशियन' : 'Electrician', subLabel: language === 'hi' ? 'विद्युत एवं यांत्रिकी शाखा' : 'E&M Wing trades' },
                      { id: 'Fitter', label: language === 'hi' ? 'फ़िटर' : 'Fitter', subLabel: language === 'hi' ? 'मैकेनिकल शाखा' : 'Mechanical Wing trades' },
                      { id: 'Welder', label: language === 'hi' ? 'वेल्डर' : 'Welder', subLabel: language === 'hi' ? 'फैब्रिकेशन एवं वेल्डिंग' : 'Fabrication Wing trades' },
                      { id: 'COPA', label: language === 'hi' ? 'कोपा (COPA)' : 'COPA', subLabel: language === 'hi' ? 'कंप्यूटर ऑपरेटर एवं प्रोग्रामिंग' : 'Computer Operator and Programming' },
                      { id: 'Mechanical', label: language === 'hi' ? 'मैकेनिकल' : 'Mechanical', subLabel: language === 'hi' ? 'सामान्य यांत्रिक ट्रेड' : 'General mechanical trades' },
                      { id: 'General', label: language === 'hi' ? 'सामान्य' : 'General', subLabel: language === 'hi' ? 'संस्थागत सामान्य सामग्री' : 'Institutional general supplies' },
                    ]}
                    width="w-full"
                  />
                </div>
              </div>

              <FormInput
                id="catalog-name-input"
                label={language === 'hi' ? 'सामग्री का नाम' : 'Item Name'}
                required
                maxLength={50}
                placeholder={language === 'hi' ? 'उदा. सोल्डरिंग आयरन स्टेशन 60W तापमान नियंत्रित' : 'e.g., Soldering Iron Station 60W Temperature Controlled'}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
                error={formErrors.name}
              />

              <FormInput
                id="catalog-unit-input"
                label={language === 'hi' ? 'माप इकाई' : 'Unit of Measure'}
                required
                placeholder={language === 'hi' ? 'उदा. नग / पैकेट / कॉइल / रोल / किग्रा' : 'Nos / Packets / Coils / Rolls / Kg'}
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  if (formErrors.unit) setFormErrors((prev) => ({ ...prev, unit: undefined }));
                }}
                error={formErrors.unit}
              />

              <FormInput
                id="catalog-desc-input"
                label={language === 'hi' ? 'तकनीकी विशिष्टताएं / विवरण (वैकल्पिक)' : 'Technical Specifications / Description (Optional)'}
                maxLength={60}
                placeholder={language === 'hi' ? 'उदा. ISI मार्का कार्यशाला ग्रेड उपकरण' : 'e.g., ISI Marked workshop grade instrument'}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: undefined }));
                }}
                error={formErrors.description}
              />

              {/* Active Toggle Switch */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{language === 'hi' ? 'सूची स्थिति' : 'Catalog Status'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {language === 'hi'
                      ? `वर्तमान: ${active ? 'सक्रिय' : 'निष्क्रिय'}`
                      : `Current: ${active ? 'Active' : 'Inactive'}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {active ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-slate-400" />
                      <span>{language === 'hi' ? 'निष्क्रिय' : 'Inactive'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सामग्री सहेजें' : 'Save Trade Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
