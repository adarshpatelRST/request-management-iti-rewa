import React, { useState, useMemo } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { format } from 'date-fns';
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

interface StoreInventoryLedgerPageProps {
  readOnly?: boolean;
}

export const StoreInventoryLedgerPage: React.FC<
  StoreInventoryLedgerPageProps
> = ({ readOnly = false }) => {
  const { catalogItems, upsertCatalogItem } = useStore();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Modal state for + Add / Adjust Stock
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<CatalogItem['category']>('Electrician');
  const [unit, setUnit] = useState('Nos');
  const [currentStock, setCurrentStock] = useState('10');
  const [minThreshold, setMinThreshold] = useState('5');
  const [formErrors, setFormErrors] = useState<{
    code?: string;
    name?: string;
    unit?: string;
    stock?: string;
    minThreshold?: string;
  }>({});

  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCat =
        categoryFilter === 'ALL' || item.category === categoryFilter;

      const isLow = item.currentStock <= item.minThreshold;
      const matchesStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'LOW_STOCK' && isLow) ||
        (stockFilter === 'HEALTHY' && !isLow);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [catalogItems, searchQuery, categoryFilter, stockFilter]);

  const openAdjustModal = (item?: CatalogItem) => {
    if (item) {
      setEditingItem(item);
      setItemCode(item.code);
      setItemName(item.name);
      setCategory(item.category);
      setUnit(item.unit);
      setCurrentStock(String(item.currentStock));
      setMinThreshold(String(item.minThreshold));
    } else {
      setEditingItem(null);
      setItemCode(`CAT-00${catalogItems.length + 1}`);
      setItemName('');
      setCategory('Electrician');
      setUnit('Nos');
      setCurrentStock('20');
      setMinThreshold('5');
    }
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (!itemCode.trim()) {
      errors.code = language === 'hi' ? 'सामग्री कोड आवश्यक है' : 'Item Code is required';
    }
    if (!itemName.trim()) {
      errors.name = language === 'hi' ? 'सामग्री का नाम आवश्यक है' : 'Item Name is required';
    }
    if (!unit.trim()) {
      errors.unit = language === 'hi' ? 'माप इकाई आवश्यक है' : 'Unit is required';
    }

    const stockNum = Number.parseInt(currentStock, 10);
    const minNum = Number.parseInt(minThreshold, 10);
    if (Number.isNaN(stockNum) || stockNum < 0) {
      errors.stock = language === 'hi' ? 'स्टॉक अऋणात्मक संख्या होनी चाहिए' : 'Stock must be a non-negative number';
    }
    if (Number.isNaN(minNum) || minNum < 0) {
      errors.minThreshold = language === 'hi' ? 'न्यूनतम सीमा अऋणात्मक संख्या होनी चाहिए' : 'Minimum threshold must be a non-negative number';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const saved = upsertCatalogItem({
      id: editingItem?.id || itemCode.trim().toUpperCase(),
      code: itemCode.trim().toUpperCase(),
      name: itemName.trim(),
      category,
      unit: unit.trim() || 'Nos',
      currentStock: stockNum,
      minThreshold: minNum,
      lastUpdated: new Date().toISOString(),
      active: editingItem?.active ?? true,
    });

    toast.success(
      language === 'hi'
        ? `${saved.name} हेतु भंडार स्टॉक अद्यतित (स्टॉक: ${saved.currentStock} ${saved.unit})।`
        : `Store Stock Ledger updated for ${saved.name} (Stock: ${saved.currentStock} ${saved.unit}).`
    );
    setModalOpen(false);
  };

  const columns: DataTableColumn<CatalogItem>[] = [
    {
      id: 'code',
      header: t('col.itemCode'),
      accessor: (c) => c.code,
      sortable: true,
      cell: (c) => (
        <span className="font-mono font-bold text-[#1e3a8a]">{c.code}</span>
      ),
    },
    {
      id: 'name',
      header: t('col.itemName'),
      accessor: (c) => c.name,
      sortable: true,
      cell: (c) => (
        <div>
          <p className="font-semibold text-slate-900">{c.name}</p>
          {c.description && (
            <p className="text-[11px] text-slate-500">{c.description}</p>
          )}
        </div>
      ),
    },
    {
      id: 'category',
      header: t('col.category'),
      accessor: (c) => c.category,
      sortable: true,
      cell: (c) => (
        <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
          {t(`trade.${c.category}`) !== `trade.${c.category}`
            ? t(`trade.${c.category}`)
            : c.category}
        </span>
      ),
    },
    {
      id: 'currentStock',
      header: language === 'hi' ? 'वर्तमान स्टॉक' : 'Current Stock',
      accessor: (c) => c.currentStock,
      sortable: true,
      align: 'right',
      cell: (c) => {
        const isLow = c.currentStock <= c.minThreshold;
        return (
          <span
            className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${
              isLow
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {c.currentStock} {c.unit}
          </span>
        );
      },
    },
    {
      id: 'minThreshold',
      header: language === 'hi' ? 'न्यूनतम सीमा' : 'Min Threshold',
      accessor: (c) => c.minThreshold,
      sortable: true,
      align: 'right',
      cell: (c) => (
        <span className="font-mono text-xs text-slate-600">
          {c.minThreshold} {c.unit}
        </span>
      ),
    },
    {
      id: 'health',
      header: language === 'hi' ? 'स्टॉक स्थिति' : 'Stock Health',
      accessor: (c) => (c.currentStock <= c.minThreshold ? 0 : 1),
      cell: (c) => {
        const isLow = c.currentStock <= c.minThreshold;
        return isLow ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'कम स्टॉक चेतावनी' : 'Low Stock Alert'}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पर्याप्त स्टॉक' : 'Adequate'}</span>
          </span>
        );
      },
    },
    {
      id: 'lastUpdated',
      header: language === 'hi' ? 'अंतिम अद्यतन' : 'Last Updated',
      accessor: (c) => c.lastUpdated || '',
      sortable: true,
      cell: (c) => (
        <span className="font-mono text-xs text-slate-500">
          {c.lastUpdated ? format(new Date(c.lastUpdated), 'dd MMM yyyy') : '—'}
        </span>
      ),
    },
    ...(!readOnly
      ? [
          {
            id: 'actions',
            header: t('col.actions'),
            accessor: (c: CatalogItem) => c.id,
            align: 'right' as const,
            cell: (c: CatalogItem) => (
              <button
                type="button"
                aria-label={`Adjust stock for ${c.name}`}
                onClick={() => openAdjustModal(c)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1e3a8a] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'समायोजित करें' : 'Adjust Stock'}</span>
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={
          readOnly
            ? (language === 'hi'
                ? 'केंद्रीय भंडार स्टॉक पंजी (केवल पठन हेतु)'
                : 'CENTRAL STORE STOCK LEDGER (READ-ONLY)')
            : (language === 'hi'
                ? 'केंद्रीय भंडार स्टॉक पंजी'
                : 'CENTRAL STORE LEDGER')
        }
        title={
          language === 'hi'
            ? 'भंडार / इन्वेंट्री स्टॉक पंजी'
            : 'Store / Inventory Stock Ledger'
        }
        subtitle={
          language === 'hi'
            ? 'वास्तविक समय ट्रेड सामग्री शेष, न्यूनतम सीमा चेतावनियां एवं भौतिक स्टॉक मिलान।'
            : 'Real-time Trade catalog balances, minimum threshold alerts, and physical stock reconciliation.'
        }
        actions={
          !readOnly ? (
            <button
              type="button"
              onClick={() => openAdjustModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? 'स्टॉक जोड़ें / समायोजित करें' : 'Add / Adjust Stock'}</span>
            </button>
          ) : undefined
        }
      />

      <ModuleFilterBar
        searchPlaceholder={
          language === 'hi'
            ? 'सामग्री कोड, नाम अथवा व्यवसाय श्रेणी खोजें...'
            : 'Search SKU code, item name, or trade category...'
        }
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
        statusLabel={language === 'hi' ? 'स्टॉक स्तर' : 'Stock Level'}
        statusValue={stockFilter}
        onStatusChange={setStockFilter}
        statusOptions={[
          { value: 'ALL', label: language === 'hi' ? 'सभी स्टॉक स्तर' : 'All Stock Levels' },
          { value: 'LOW_STOCK', label: language === 'hi' ? 'केवल कम स्टॉक चेतावनियां' : 'Low Stock Alerts Only' },
          { value: 'HEALTHY', label: language === 'hi' ? 'केवल पर्याप्त स्टॉक' : 'Adequate Stock Only' },
        ]}
        onReset={() => {
          setSearchQuery('');
          setCategoryFilter('ALL');
          setStockFilter('ALL');
        }}
      />

      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-5">
        <DataTable
          data={filteredItems}
          columns={columns}
          keyExtractor={(c) => c.id}
          emptyTitle={
            language === 'hi'
              ? 'कोई मेल खाती कैटलॉग सामग्री नहीं मिली'
              : 'No Matching Catalog SKUs'
          }
          emptyDescription={
            language === 'hi'
              ? 'कृपया अपनी खोज अथवा श्रेणी/स्टॉक फ़िल्टर में परिवर्तन करें।'
              : 'Adjust your search query or category/stock filters above.'
          }
        />
      </div>

      {/* Modal: + Add / Adjust Stock */}
      {modalOpen && !readOnly && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="adjust-stock-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <SlidersHorizontal className="w-5 h-5 text-teal-400 shrink-0" />
                <h2 id="adjust-stock-modal-title" className="text-sm font-bold truncate">
                  {editingItem
                    ? (language === 'hi'
                        ? `स्टॉक समायोजित करें — ${editingItem.code}`
                        : `Adjust Store Stock — ${editingItem.code}`)
                    : (language === 'hi'
                        ? 'नवीन कैटलॉग सामग्री स्टॉक जोड़ें'
                        : 'Add New Catalog Stock Item')}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <VoiceTypeToggle size="xs" variant="dark" />
                <button
                  type="button"
                  aria-label="Close Stock Modal"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveStock} noValidate className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  id="stock-item-code"
                  label={language === 'hi' ? 'सामग्री कोड (SKU)' : 'Item Code (SKU)'}
                  required
                  disabled={Boolean(editingItem)}
                  value={itemCode}
                  onChange={(e) => {
                    setItemCode(e.target.value);
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  error={formErrors.code}
                />
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="stock-item-category"
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
                id="stock-item-name"
                label={language === 'hi' ? 'सामग्री का नाम' : 'Item Name'}
                required
                placeholder={language === 'hi' ? 'उदा. डिजिटल क्लैंप मीटर 400A' : 'e.g., Digital Clamp Meter 400A'}
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
                error={formErrors.name}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput
                  id="stock-item-unit"
                  label={language === 'hi' ? 'माप इकाई' : 'Unit'}
                  required
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value);
                    if (formErrors.unit) setFormErrors((prev) => ({ ...prev, unit: undefined }));
                  }}
                  error={formErrors.unit}
                />
                <FormInput
                  id="stock-item-current"
                  label={language === 'hi' ? 'वर्तमान स्टॉक' : 'Current Stock'}
                  type="number"
                  min={0}
                  required
                  value={currentStock}
                  onChange={(e) => {
                    setCurrentStock(e.target.value);
                    if (formErrors.stock) setFormErrors((prev) => ({ ...prev, stock: undefined }));
                  }}
                  error={formErrors.stock}
                />
                <FormInput
                  id="stock-item-min"
                  label={language === 'hi' ? 'न्यूनतम सीमा' : 'Min Threshold'}
                  type="number"
                  min={0}
                  required
                  value={minThreshold}
                  onChange={(e) => {
                    setMinThreshold(e.target.value);
                    if (formErrors.minThreshold) setFormErrors((prev) => ({ ...prev, minThreshold: undefined }));
                  }}
                  error={formErrors.minThreshold}
                />
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
                  <span>{language === 'hi' ? 'स्टॉक पंजी सहेजें' : 'Save Stock Ledger'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
