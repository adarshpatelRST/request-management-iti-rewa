import {
  UserRole,
  MaterialRequest,
  PurchaseOrder,
  ConsolidatedPOItem,
} from '../types';

/**
 * Store / Inventory Sidebar Rule:
 * MUST ONLY appear in the sidebar for STORE_MANAGER, PRINCIPAL, and ADMIN.
 * Hide completely for TO, TS, and PURCHASE.
 */
export function canAccessStoreInventory(role: UserRole): boolean {
  return role === 'STORE_MANAGER' || role === 'PRINCIPAL' || role === 'ADMIN';
}

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'TO':
      return '/to/dashboard';
    case 'TS':
      return '/ts/dashboard';
    case 'PRINCIPAL':
      return '/principal/dashboard';
    case 'PURCHASE':
      return '/purchase/approved';
    case 'STORE_MANAGER':
      return '/store/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/login';
  }
}

/**
 * Validates and clamps an integer-only page input string.
 * Returns null if the input does not represent a valid integer in [1, totalPages].
 */
export function parsePageInput(rawInput: string, totalPages: number): number | null {
  const trimmed = rawInput.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > Math.max(1, totalPages)) {
    return null;
  }
  return parsed;
}

/**
 * Consolidates multiple APPROVED_FOR_PURCHASE requests into unified line items
 * grouped by (catalogItemId || itemName + itemType + unit).
 */
export function consolidateRequestsForPO(
  requests: MaterialRequest[],
  selectedRequestIds: string[]
): ConsolidatedPOItem[] {
  const selected = requests.filter((r) => selectedRequestIds.includes(r.id));
  const map = new Map<string, ConsolidatedPOItem>();

  for (const req of selected) {
    for (const item of req.items) {
      const key = item.catalogItemId
        ? `CAT:${item.catalogItemId}`
        : `NON:${item.itemName.trim().toLowerCase()}:${item.unit.toLowerCase()}`;

      const existing = map.get(key);
      if (existing) {
        existing.orderedQty += item.requestedQty;
        if (item.specifications && !existing.specifications) {
          existing.specifications = item.specifications;
        }
        existing.sourceBreakdown = [
          ...(existing.sourceBreakdown || []),
          {
            requestId: req.id,
            toName: req.toName,
            department: req.department,
            purpose: req.purpose,
            qty: item.requestedQty,
            specifications: item.specifications,
          },
        ];
      } else {
        map.set(key, {
          id: `cpoi-${map.size + 1}-${Date.now()}`,
          catalogItemId: item.catalogItemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          itemType: item.itemType,
          unit: item.unit,
          orderedQty: item.requestedQty,
          receivedQty: 0,
          specifications: item.specifications,
          sourceBreakdown: [
            {
              requestId: req.id,
              toName: req.toName,
              department: req.department,
              purpose: req.purpose,
              qty: item.requestedQty,
              specifications: item.specifications,
            },
          ],
        });
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Computes FIFO allocation across source requests sorted by createdAt ascending
 * when a vendor Challan is received at Central Store.
 */
export function computeFIFOAllocation(
  requests: MaterialRequest[],
  sourceRequestIds: string[],
  itemsReceived: { itemName: string; qty: number }[]
): {
  updatedRequests: MaterialRequest[];
  allocations: {
    requestId: string;
    toName: string;
    itemName: string;
    allocatedQty: number;
  }[];
  fullyFulfilledRequestIds: string[];
} {
  const clonedRequests: MaterialRequest[] = JSON.parse(JSON.stringify(requests));
  const allocations: {
    requestId: string;
    toName: string;
    itemName: string;
    allocatedQty: number;
  }[] = [];
  const fullyFulfilledRequestIds: string[] = [];

  // Sort source requests by creation date ascending (FIFO)
  const targetRequests = clonedRequests
    .filter((r) => sourceRequestIds.includes(r.id))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  for (const incoming of itemsReceived) {
    let remainingToAllocate = incoming.qty;
    if (remainingToAllocate <= 0) continue;

    for (const req of targetRequests) {
      if (remainingToAllocate <= 0) break;

      for (const reqItem of req.items) {
        if (
          reqItem.itemName.trim().toLowerCase() === incoming.itemName.trim().toLowerCase()
        ) {
          const currentAllocated = reqItem.allocatedQty || 0;
          const needed = Math.max(0, reqItem.requestedQty - currentAllocated);
          if (needed > 0 && remainingToAllocate > 0) {
            const grant = Math.min(needed, remainingToAllocate);
            reqItem.allocatedQty = currentAllocated + grant;
            reqItem.receivedQty = (reqItem.receivedQty || 0) + grant;
            remainingToAllocate -= grant;

            allocations.push({
              requestId: req.id,
              toName: req.toName,
              itemName: reqItem.itemName,
              allocatedQty: grant,
            });
          }
        }
      }
    }
  }

  // Update statuses of target requests based on their item allocations
  for (const req of targetRequests) {
    const allItemsFull = req.items.every(
      (i) => (i.allocatedQty || 0) >= i.requestedQty
    );
    const anyItemAllocated = req.items.some((i) => (i.allocatedQty || 0) > 0);

    if (allItemsFull) {
      if (req.status !== 'CLOSED' && req.status !== 'COMPLETED') {
        req.status = 'ITEM_RECEIVED_AT_STORE';
        fullyFulfilledRequestIds.push(req.id);
      }
    } else if (anyItemAllocated) {
      req.status = 'PARTIALLY_FULFILLED';
    }
  }

  return {
    updatedRequests: clonedRequests,
    allocations,
    fullyFulfilledRequestIds,
  };
}

/**
 * Detects whether an item has pending units in active Purchase Orders or other open requisitions
 * (Used for Pending Pipeline Deviation Alerts in Part 2).
 */
export function detectPendingPipelineForCatalogItem(
  catalogItemId: string | null,
  itemName: string,
  purchaseOrders: PurchaseOrder[]
): {
  poId: string;
  pendingQty: number;
  orderedQty: number;
  receivedQty: number;
  avakJavakNumber: string;
  latestChallanNumber?: string;
}[] {
  const results: {
    poId: string;
    pendingQty: number;
    orderedQty: number;
    receivedQty: number;
    avakJavakNumber: string;
    latestChallanNumber?: string;
  }[] = [];

  for (const po of purchaseOrders) {
    if (po.status === 'COMPLETED') continue;
    for (const cItem of po.consolidatedItems) {
      const matchesCatalog =
        catalogItemId && cItem.catalogItemId === catalogItemId;
      const matchesName =
        cItem.itemName.trim().toLowerCase() === itemName.trim().toLowerCase();

      if (matchesCatalog || matchesName) {
        const pendingQty = Math.max(0, cItem.orderedQty - cItem.receivedQty);
        if (pendingQty > 0) {
          const lastChallan =
            po.challans && po.challans.length > 0
              ? po.challans[po.challans.length - 1].challanNumber
              : undefined;
          results.push({
            poId: po.id,
            pendingQty,
            orderedQty: cItem.orderedQty,
            receivedQty: cItem.receivedQty,
            avakJavakNumber: po.avakJavakNumber || 'Awaiting Avak/Javak',
            latestChallanNumber: lastChallan,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Validates institutional password complexity:
 * Minimum 8 characters, at least 1 lowercase letter, at least 1 uppercase letter,
 * at least 1 digit, and at least 1 special character.
 */
export function validatePassword(pwd: string, lang: 'en' | 'hi' = 'en'): string | null {
  if (pwd.length < 8) {
    return lang === 'hi'
      ? 'पासवर्ड कम से कम 8 अक्षर लंबा होना अनिवार्य है।'
      : 'Password must be at least 8 characters long.';
  }
  if (pwd.length > 30) {
    return lang === 'hi'
      ? 'पासवर्ड 30 अक्षरों से अधिक नहीं हो सकता।'
      : 'Password cannot exceed 30 characters.';
  }
  if (!/[a-z]/.test(pwd)) {
    return lang === 'hi'
      ? 'पासवर्ड में कम से कम 1 छोटा अक्षर (lowercase) होना अनिवार्य है।'
      : 'Password must contain at least 1 lowercase letter.';
  }
  if (!/[A-Z]/.test(pwd)) {
    return lang === 'hi'
      ? 'पासवर्ड में कम से कम 1 बड़ा अक्षर (uppercase) होना अनिवार्य है।'
      : 'Password must contain at least 1 uppercase letter.';
  }
  if (!/\d/.test(pwd)) {
    return lang === 'hi'
      ? 'पासवर्ड में कम से कम 1 अंक होना अनिवार्य है।'
      : 'Password must contain at least 1 digit.';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd)) {
    return lang === 'hi'
      ? 'पासवर्ड में कम से कम 1 विशेष वर्ण (!@#$%^&*) होना अनिवार्य है।'
      : 'Password must contain at least 1 special character (e.g. !@#$%^&*).';
  }
  return null;
}

