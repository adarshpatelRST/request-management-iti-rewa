import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Send,
  ArrowLeft,
  AlertCircle,
  Edit2,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../context/StoreContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { FormInput, FormTextarea } from '../../components/ui/FormFields';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DropSearch, ComboboxItem } from '../../components/ui/DropSearch';
import { ItemType } from '../../types';

interface AddedItem {
  id: string;
  catalogItemId: string | null;
  itemCode?: string;
  itemName: string;
  itemType: ItemType;
  category: string;
  unit: string;
  requestedQty: number;
  specifications: string;
}

export const TORaiseRequestPage: React.FC = () => {
  const {
    currentUser,
    users,
    catalogItems,
    requests,
    createRequest,
    resubmitRevertedRequest,
  } = useStore();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const existingRequest = useMemo(
    () => (editId ? requests.find((r) => r.id === editId) : null),
    [editId, requests]
  );

  const assignedTs = users.find((u) => u.id === currentUser?.assignedTsId);

  // Requisition Form State
  const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'Critical'>('Normal');
  const [purpose, setPurpose] = useState('');
  const [remark, setRemark] = useState('');
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);

  // Item Builder Row State
  const [builderCatalogId, setBuilderCatalogId] = useState('');
  const [builderCustomName, setBuilderCustomName] = useState('');
  const [builderCustomUnit, setBuilderCustomUnit] = useState('Nos');
  const [builderQuantity, setBuilderQuantity] = useState('1');
  const [builderSpecs, setBuilderSpecs] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Validation State
  const [builderItemError, setBuilderItemError] = useState(false);
  const [builderQtyError, setBuilderQtyError] = useState(false);
  const [hasSubmittedErrors, setHasSubmittedErrors] = useState(false);

  // Preview Table Pagination (max 5 items per page)
  const [previewPage, setPreviewPage] = useState(1);
  const PREVIEW_PAGE_SIZE = 5;

  // Pre-fill if editing an existing request
  useEffect(() => {
    if (existingRequest) {
      setPriority(existingRequest.priority);
      setPurpose(existingRequest.purpose);
      const lastToRemark = [...existingRequest.remarksHistory]
        .reverse()
        .find((r) => r.actorRole === 'TO');
      if (lastToRemark) {
        setRemark(lastToRemark.remark);
      }
      setAddedItems(
        existingRequest.items.map((i, idx) => ({
          id: `item-${idx}-${Date.now()}`,
          catalogItemId: i.catalogItemId,
          itemCode: i.itemCode,
          itemName: i.itemName,
          itemType: i.itemType,
          category: i.category,
          unit: i.unit,
          requestedQty: i.requestedQty,
          specifications: i.specifications || '',
        }))
      );
    }
  }, [existingRequest]);

  const catalogComboboxItems: ComboboxItem[] = useMemo(
    () => [
      ...catalogItems
        .filter((cat) => cat.active !== false)
        .map((cat) => ({
          id: cat.id,
          label: `${cat.name} (${cat.unit})`,
          subLabel: `${cat.category} Trade • Current Stock: ${cat.currentStock} ${cat.unit}`,
          badgeText: cat.code,
        })),
      {
        id: 'OTHER',
        label: t('req.otherItemLabel'),
        subLabel: t('req.otherItemSubLabel'),
        badgeText: 'NON-TRADE',
      },
    ],
    [catalogItems, t]
  );

  const selectedCatalogItem = useMemo(
    () => catalogItems.find((c) => c.id === builderCatalogId),
    [catalogItems, builderCatalogId]
  );

  const isOther = builderCatalogId === 'OTHER';

  // Add / Update item in preview table
  const handleAddOrUpdateItem = () => {
    let hasError = false;

    if (!builderCatalogId || (isOther && !builderCustomName.trim())) {
      setBuilderItemError(true);
      hasError = true;
    } else {
      setBuilderItemError(false);
    }

    const qtyNum = Number.parseInt(builderQuantity.trim(), 10);
    if (!/^\d+$/.test(builderQuantity.trim()) || Number.isNaN(qtyNum) || qtyNum < 1) {
      setBuilderQtyError(true);
      hasError = true;
    } else {
      setBuilderQtyError(false);
    }

    if (hasError) return;

    const trimmedSpecs = builderSpecs.trim().slice(0, 60);

    const newItemData: AddedItem = isOther
      ? {
          id: editingItemId || `item-${Date.now()}`,
          catalogItemId: null,
          itemName: builderCustomName.trim().slice(0, 50),
          itemType: 'NON_TRADE',
          category: currentUser?.department || 'General',
          unit: builderCustomUnit.trim() || 'Units',
          requestedQty: qtyNum,
          specifications:
            trimmedSpecs ||
            (language === 'hi'
              ? 'गैर-ट्रेड / तदर्थ कार्यशाला मांग'
              : 'Non-Trade / Ad-hoc Workshop Requirement'),
        }
      : {
          id: editingItemId || `item-${Date.now()}`,
          catalogItemId: selectedCatalogItem!.id,
          itemCode: selectedCatalogItem!.code,
          itemName: selectedCatalogItem!.name,
          itemType: 'TRADE',
          category: selectedCatalogItem!.category,
          unit: selectedCatalogItem!.unit,
          requestedQty: qtyNum,
          specifications: trimmedSpecs || '',
        };

    if (editingItemId) {
      // Check if user changed item to match another existing item in the list
      const duplicateIndex = addedItems.findIndex((item) => {
        if (item.id === editingItemId) return false;
        if (isOther) {
          return (
            item.itemType === 'NON_TRADE' &&
            item.itemName.trim().toLowerCase() === builderCustomName.trim().toLowerCase()
          );
        }
        return (
          item.catalogItemId === selectedCatalogItem!.id ||
          item.itemName.trim().toLowerCase() === selectedCatalogItem!.name.trim().toLowerCase()
        );
      });

      if (duplicateIndex !== -1) {
        // Merge with that existing item and remove the edited duplicate
        const target = addedItems[duplicateIndex];
        const combinedQty = target.requestedQty + qtyNum;
        setAddedItems((prev) =>
          prev
            .filter((item) => item.id !== editingItemId)
            .map((item) =>
              item.id === target.id
                ? {
                    ...item,
                    requestedQty: combinedQty,
                    specifications: trimmedSpecs || target.specifications,
                  }
                : item
            )
        );
        toast.success(
          language === 'hi'
            ? `पूर्व सामग्री "${target.itemName}" के साथ विलय: मात्रा ${combinedQty} ${target.unit} अद्यतन`
            : `Merged with existing "${target.itemName}": updated to ${combinedQty} ${target.unit}`
        );
      } else {
        setAddedItems((prev) =>
          prev.map((item) => (item.id === editingItemId ? newItemData : item))
        );
        toast.success(
          language === 'hi'
            ? `सामग्री अद्यतन की गई: ${newItemData.itemName}`
            : `Updated item: ${newItemData.itemName}`
        );
      }
      setEditingItemId(null);
    } else {
      // Adding a new item: check if item with same name / catalog id already exists
      const existingIndex = addedItems.findIndex((item) => {
        if (isOther) {
          return (
            item.itemType === 'NON_TRADE' &&
            item.itemName.trim().toLowerCase() === builderCustomName.trim().toLowerCase()
          );
        }
        return (
          item.catalogItemId === selectedCatalogItem!.id ||
          item.itemName.trim().toLowerCase() === selectedCatalogItem!.name.trim().toLowerCase()
        );
      });

      if (existingIndex !== -1) {
        const existing = addedItems[existingIndex];
        const combinedQty = existing.requestedQty + qtyNum;
        setAddedItems((prev) =>
          prev.map((item, idx) =>
            idx === existingIndex
              ? {
                  ...item,
                  requestedQty: combinedQty,
                  specifications: trimmedSpecs || item.specifications,
                }
              : item
          )
        );
        toast.success(
          language === 'hi'
            ? `"${existing.itemName}" हेतु मात्रा वृद्धि: ${existing.requestedQty} + ${qtyNum} = ${combinedQty} ${existing.unit}`
            : `Increased quantity for "${existing.itemName}": ${existing.requestedQty} + ${qtyNum} = ${combinedQty} ${existing.unit}`
        );
      } else {
        setAddedItems((prev) => [...prev, newItemData]);
        toast.success(
          language === 'hi'
            ? `सामग्री जोड़ी गई: ${newItemData.itemName}`
            : `Added item: ${newItemData.itemName}`
        );
      }
    }

    // Reset item builder inputs
    setBuilderCatalogId('');
    setBuilderCustomName('');
    setBuilderCustomUnit('Nos');
    setBuilderQuantity('1');
    setBuilderSpecs('');
    setBuilderItemError(false);
    setBuilderQtyError(false);
  };

  const handleEditItem = (item: AddedItem) => {
    setEditingItemId(item.id);
    if (item.catalogItemId) {
      setBuilderCatalogId(item.catalogItemId);
      setBuilderCustomName('');
      setBuilderCustomUnit(item.unit);
    } else {
      setBuilderCatalogId('OTHER');
      setBuilderCustomName(item.itemName);
      setBuilderCustomUnit(item.unit);
    }
    setBuilderQuantity(String(item.requestedQty));
    setBuilderSpecs(item.specifications);
    setBuilderItemError(false);
    setBuilderQtyError(false);

    // Scroll smoothly to item builder
    const builderEl = document.getElementById('item-builder-section');
    if (builderEl) {
      builderEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setAddedItems((prev) => prev.filter((i) => i.id !== itemId));
    if (editingItemId === itemId) {
      setEditingItemId(null);
      setBuilderCatalogId('');
      setBuilderCustomName('');
      setBuilderQuantity('1');
      setBuilderSpecs('');
    }
  };

  const handleCancelItemEdit = () => {
    setEditingItemId(null);
    setBuilderCatalogId('');
    setBuilderCustomName('');
    setBuilderCustomUnit('Nos');
    setBuilderQuantity('1');
    setBuilderSpecs('');
    setBuilderItemError(false);
    setBuilderQtyError(false);
  };

  // Preview Table Pagination Calculations
  const totalPreviewItems = addedItems.length;
  const totalPreviewPages = Math.max(1, Math.ceil(totalPreviewItems / PREVIEW_PAGE_SIZE));
  const previewStart = (previewPage - 1) * PREVIEW_PAGE_SIZE;
  const previewEnd = Math.min(previewStart + PREVIEW_PAGE_SIZE, totalPreviewItems);
  const paginatedAddedItems = addedItems.slice(previewStart, previewEnd);

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasItemError = addedItems.length === 0;
    const hasPurposeError = !purpose || purpose.trim().length < 10;

    if (hasItemError || hasPurposeError) {
      setHasSubmittedErrors(true);
      return;
    }

    setHasSubmittedErrors(false);

    const formattedPayload = {
      priority,
      purpose: purpose.trim(),
      items: addedItems.map((item) => ({
        catalogItemId: item.catalogItemId,
        itemName: item.itemName,
        itemType: item.itemType,
        category: item.category,
        unit: item.unit,
        requestedQty: item.requestedQty,
        specifications: item.specifications,
      })),
      remark: remark.trim() || undefined,
    };

    if (editId && existingRequest) {
      resubmitRevertedRequest(editId, formattedPayload);
      toast.success(
        language === 'hi'
          ? `मांग पत्र ${editId} अद्यतन कर टी.एस. ${existingRequest.tsName} को पुनः प्रस्तुत किया गया!`
          : `Requisition ${editId} updated & resubmitted to TS ${existingRequest.tsName}!`
      );
    } else {
      const created = createRequest(formattedPayload);
      toast.success(
        language === 'hi'
          ? `सामग्री मांग पत्र ${created.id} प्रस्तुत कर टी.एस. ${created.tsName} को प्रेषित किया गया!`
          : `Material Requisition ${created.id} submitted and routed to TS ${created.tsName}!`
      );
    }

    navigate('/to/dashboard');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badgeText={editId ? t('action.editResubmit') : t('req.newMaterialIndent')}
        title={
          editId
            ? t('req.editRequisition', { id: editId })
            : t('req.raiseRequisition')
        }
        subtitle={
          editId
            ? t('req.editSubtitle')
            : t('req.createSubtitle')
        }
        actions={
          <button
            type="button"
            onClick={() => navigate('/to/dashboard')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('req.backToDashboard')}</span>
          </button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Material Line-Item Builder + Preview Table */}
        <div
          id="item-builder-section"
          className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-4 sm:p-5 space-y-4"
        >
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {t('req.addMaterialItems')}
              </h2>
            </div>
          </div>

          {/* Top Entry Row */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#1e3a8a]" />
                <span>{editingItemId ? t('req.editMaterialItem') : t('req.addMaterialItem')}</span>
              </span>
              {editingItemId && (
                <button
                  type="button"
                  onClick={handleCancelItemEdit}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('req.cancelEdit')}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className={isOther ? 'md:col-span-4' : 'md:col-span-5'}>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="builder-catalog-select"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                  >
                    <span>{t('req.selectMaterialItem')}</span>
                    <span className="text-rose-600 font-bold" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <DropSearch
                    placeholder={t('req.chooseItemPlaceholder')}
                    searchPlaceholder={t('req.searchMaterialPlaceholder')}
                    value={builderCatalogId || null}
                    onChange={(val) => {
                      setBuilderCatalogId(val || '');
                      setBuilderItemError(false);
                    }}
                    items={catalogComboboxItems}
                    width="w-full"
                    className={
                      builderItemError && !isOther
                        ? 'border-rose-400 focus:border-rose-600'
                        : ''
                    }
                  />
                </div>
              </div>

              {isOther && (
                <>
                  <div className="md:col-span-3">
                    <FormInput
                      id="builder-custom-name"
                      label={t('req.customName')}
                      required
                      placeholder={language === 'hi' ? 'उदा. परीक्षा सामग्री' : 'e.g. Tea & Biscuits for Exam'}
                      value={builderCustomName}
                      maxLength={50}
                      showCount
                      hideErrorMessage
                      onChange={(e) => {
                        setBuilderCustomName(e.target.value.slice(0, 50));
                        setBuilderItemError(false);
                      }}
                      error={builderItemError ? t('req.errorCustomName') : undefined}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormInput
                      id="builder-custom-unit"
                      label={t('req.customUnit')}
                      required
                      placeholder={language === 'hi' ? 'नग / पैकेट' : 'Packets / Nos'}
                      value={builderCustomUnit}
                      onChange={(e) => setBuilderCustomUnit(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <FormInput
                  id="builder-quantity"
                  label={`${t('req.quantity')} ${selectedCatalogItem ? `(${selectedCatalogItem.unit})` : ''}`}
                  type="number"
                  min={1}
                  step={1}
                  required
                  hideErrorMessage
                  value={builderQuantity}
                  onChange={(e) => {
                    setBuilderQuantity(e.target.value);
                    setBuilderQtyError(false);
                  }}
                  error={builderQtyError ? t('req.errorQuantityMin') : undefined}
                />
              </div>

              {!isOther && (
                <div className="md:col-span-3">
                  <FormInput
                    id="builder-specs"
                    label={t('req.specsOptional')}
                    placeholder={t('req.specsPlaceholder')}
                    value={builderSpecs}
                    maxLength={60}
                    showCount
                    onChange={(e) => setBuilderSpecs(e.target.value.slice(0, 60))}
                  />
                </div>
              )}

              {/* Add / Update Button beside the inputs */}
              <div className={isOther ? 'md:col-span-1' : 'md:col-span-2'}>
                <button
                  type="button"
                  onClick={handleAddOrUpdateItem}
                  className={`w-full h-[38px] px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                    editingItemId
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#0f766e] hover:bg-[#115e59] text-white'
                  }`}
                >
                  {editingItemId ? (
                    <>
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{t('req.updateItem')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('req.addItem')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Dedicated Stable Alert Slot for Form Validation (Inputs stay locked in place) */}
            {(builderItemError || builderQtyError) && (
              <div
                role="alert"
                className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg transition-all"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {builderItemError
                    ? (isOther ? t('req.errorCustomName') : t('req.errorSelectMaterial'))
                    : t('req.errorQuantityMin')}
                </span>
              </div>
            )}
          </div>

          {/* Below: Preview Table of Added Items with Max 5 items pagination */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1e3a8a]" />
                <span>{t('req.previewTitle')}</span>
              </h3>
              {addedItems.length > 0 && (
                <span className="text-xs font-mono text-slate-500">
                  {language === 'hi'
                    ? `प्रदर्शित ${previewStart + 1}-${previewEnd}, कुल ${totalPreviewItems} सामग्री`
                    : `Showing ${previewStart + 1}-${previewEnd} of ${totalPreviewItems} items`}
                </span>
              )}
            </div>

            {addedItems.length === 0 ? (
              <div>
                <div
                  className={`py-8 px-4 rounded-xl border border-dashed text-center ${
                    hasSubmittedErrors && addedItems.length === 0
                      ? 'border-rose-400 bg-rose-50/40 text-rose-700'
                      : 'border-slate-300 bg-slate-50/50 text-slate-500'
                  }`}
                >
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">{t('req.noMaterials')}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t('req.noMaterialsSub')}
                  </p>
                </div>
                {hasSubmittedErrors && addedItems.length === 0 && (
                  <div role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {language === 'hi'
                        ? 'मांग पत्र प्रस्तुत करने से पूर्व कम से कम एक सामग्री मद जोड़ना अनिवार्य है।'
                        : 'At least one material line item must be added before submitting the indent'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-[#e2e8f0] overflow-hidden bg-white">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[850px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-[#e2e8f0]">
                        <th className="py-2.5 px-3 font-bold text-slate-600 uppercase text-[10px] w-12 text-center">
                          #
                        </th>
                        <th className="py-2.5 px-3 font-bold text-slate-600 uppercase text-[10px] min-w-[220px]">
                          {t('req.previewColName')}
                        </th>
                        <th className="py-2.5 px-3 font-bold text-slate-600 uppercase text-[10px] min-w-[140px]">
                          {t('req.previewColTrade')}
                        </th>
                        <th className="py-2.5 px-3 font-bold text-slate-600 uppercase text-[10px] text-right w-28 whitespace-nowrap">
                          {t('req.previewColQty')}
                        </th>
                        <th className="py-2.5 px-3 font-bold text-slate-600 uppercase text-[10px] min-w-[260px]">
                          {t('req.previewColSpecs')}
                        </th>
                        <th className="py-2.5 px-3 font-bold text-slate-600 uppercase text-[10px] text-center w-24">
                          {t('col.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedAddedItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            editingItemId === item.id ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono text-center text-slate-500">
                            {previewStart + idx + 1}
                          </td>
                          <td className="py-2.5 px-3 min-w-[220px]">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <StatusBadge status={item.itemType} size="sm" />
                              <span className="font-semibold text-slate-900 break-words [overflow-wrap:anywhere]">
                                {item.itemName}
                              </span>
                              {item.itemCode && (
                                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                  [{item.itemCode}]
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap min-w-[140px]">
                            {t(`trade.${item.category}`) !== `trade.${item.category}`
                              ? t(`trade.${item.category}`)
                              : item.category}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1e3a8a] whitespace-nowrap">
                            {item.requestedQty} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 min-w-[260px] whitespace-normal break-words">
                            {item.specifications || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                aria-label={`Edit ${item.itemName}`}
                                onClick={() => handleEditItem(item)}
                                className="p-1 rounded text-slate-500 hover:text-[#1e3a8a] hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="Edit item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${item.itemName}`}
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5-Item Pagination Controls */}
                <div className="px-3 py-2.5 bg-slate-50/60 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[11px]">
                    {language === 'hi'
                      ? `पृष्ठ ${previewPage} कुल ${totalPreviewPages}`
                      : `Page ${previewPage} of ${totalPreviewPages}`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={previewPage <= 1}
                      onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center justify-center w-7 h-7 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={previewPage >= totalPreviewPages}
                      onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                      className="inline-flex items-center justify-center w-7 h-7 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Purpose / Practical Justification */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              {t('req.purposeSection')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('req.purposeSectionSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea
              id="req-purpose"
              label={t('req.purposeLabel')}
              required
              rows={3}
              maxLength={250}
              placeholder={t('req.purposePlaceholder')}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value.slice(0, 250))}
              error={
                hasSubmittedErrors && (!purpose || purpose.trim().length < 10)
                  ? language === 'hi'
                    ? 'प्रायोगिक प्रशिक्षण औचित्य / उद्देश्य कम से कम 10 अक्षरों का होना चाहिए'
                    : 'Purpose / Practical justification must be at least 10 characters long'
                  : undefined
              }
            />

            <FormTextarea
              id="req-remark"
              label={t('req.noteLabel')}
              rows={3}
              maxLength={250}
              placeholder={t('req.notePlaceholder')}
              value={remark}
              onChange={(e) => setRemark(e.target.value.slice(0, 250))}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/to/dashboard')}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {t('action.cancel')}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#1e3a8a] hover:bg-[#172554] shadow-2xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {editId ? t('req.resubmit') : t('req.submitToTs')}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
