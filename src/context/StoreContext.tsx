import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  User,
  CatalogItem,
  MaterialRequest,
  PurchaseOrder,
  AuditLogEntry,
  AppNotification,
  StoreContextType,
  CreateRequestPayload,
  CreateUserPayload,
  UpdateUserPayload,
  ChallanRecord,
} from '../types';
import {
  SEED_USERS,
  SEED_CATALOG_ITEMS,
  SEED_REQUESTS,
  SEED_PURCHASE_ORDERS,
  SEED_AUDIT_LOGS,
  SEED_NOTIFICATIONS,
} from '../data/seedData';
import {
  consolidateRequestsForPO,
  computeFIFOAllocation,
} from '../utils/storeLogic';

const STORAGE_KEYS = {
  CURRENT_USER: 'iti_rewa_v2_current_user',
  USERS: 'iti_rewa_v2_users',
  CATALOG: 'iti_rewa_v2_catalog_items',
  REQUESTS: 'iti_rewa_v2_requests',
  PURCHASE_ORDERS: 'iti_rewa_v2_purchase_orders',
  AUDIT_LOGS: 'iti_rewa_v2_audit_logs',
  NOTIFICATIONS: 'iti_rewa_v2_notifications',
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const loaded = loadFromStorage<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const existingIds = new Set(loaded.map((u) => u.id));
    const missing = SEED_USERS.filter((su) => !existingIds.has(su.id));
    return missing.length > 0 ? [...loaded, ...missing] : loaded;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null)
  );
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => {
    const loaded = loadFromStorage<CatalogItem[]>(STORAGE_KEYS.CATALOG, SEED_CATALOG_ITEMS);
    const existingIds = new Set(loaded.map((c) => c.id));
    const missing = SEED_CATALOG_ITEMS.filter((sc) => !existingIds.has(sc.id));
    return missing.length > 0 ? [...loaded, ...missing] : loaded;
  });
  const [requests, setRequests] = useState<MaterialRequest[]>(() => {
    const loaded = loadFromStorage<MaterialRequest[]>(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    const existingIds = new Set(loaded.map((r) => r.id));
    const missing = SEED_REQUESTS.filter((sr) => !existingIds.has(sr.id));
    return missing.length > 0 ? [...loaded, ...missing] : loaded;
  });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    loadFromStorage<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, SEED_PURCHASE_ORDERS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    loadFromStorage<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const loaded = loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const existingIds = new Set(loaded.map((n) => n.id));
    const missing = SEED_NOTIFICATIONS.filter((sn) => !existingIds.has(sn.id));
    return missing.length > 0 ? [...loaded, ...missing] : loaded;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {
      // ignore storage quota errors
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        window.localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Keep currentUser in sync with the latest entry in users array (e.g. if supervisor/role updated)
  useEffect(() => {
    if (currentUser) {
      const freshUser = users.find((u) => u.id === currentUser.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(freshUser);
      }
    }
  }, [users, currentUser]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalogItems));
    } catch {
      // ignore
    }
  }, [catalogItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch {
      // ignore
    }
  }, [requests]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
    } catch {
      // ignore
    }
  }, [purchaseOrders]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Immutable JSON-diff Audit Logger
  const recordAuditLog = useCallback(
    (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
      const newLog: AuditLogEntry = {
        ...entry,
        id: `AUD-${9000 + auditLogs.length + 1}`,
        timestamp: new Date().toISOString(),
        oldData: entry.oldData ? JSON.parse(JSON.stringify(entry.oldData)) : null,
        newData: entry.newData ? JSON.parse(JSON.stringify(entry.newData)) : null,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [auditLogs.length]
  );

  const pushNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
      const newNotif: AppNotification = {
        ...notif,
        id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  // Auth & Demo Utilities
  const loginByEmail = useCallback(
    (email: string, password?: string) => {
      const normalized = email.trim().toLowerCase();
      const found = users.find((u) => u.email.toLowerCase() === normalized);
      if (!found) {
        return {
          success: false,
          error: 'Credentials mismatch',
        };
      }
      const expectedPassword = found.password || 'password123';
      if (password !== expectedPassword) {
        return {
          success: false,
          error: 'Credentials mismatch',
        };
      }
      setCurrentUser(found);
      return { success: true, user: found };
    },
    [users]
  );

  const loginAsRoleUser = useCallback(
    (userId: string) => {
      const found = users.find((u) => u.id === userId) || null;
      if (found) {
        setCurrentUser(found);
      }
      return found;
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const resetDemoData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
    setUsers(SEED_USERS);
    setCatalogItems(SEED_CATALOG_ITEMS);
    setRequests(SEED_REQUESTS);
    setPurchaseOrders(SEED_PURCHASE_ORDERS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setNotifications(SEED_NOTIFICATIONS);
    setCurrentUser(null);
  }, []);

  // Notification Actions
  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(
    (userId?: string) => {
      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return;
      setNotifications((prev) =>
        prev.map((n) => (n.userId === targetUserId ? { ...n, read: true } : n))
      );
    },
    [currentUser?.id]
  );

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearNotifications = useCallback(
    (userId?: string) => {
      const targetUserId = userId || currentUser?.id;
      if (!targetUserId) return;
      setNotifications((prev) => prev.filter((n) => n.userId !== targetUserId));
    },
    [currentUser?.id]
  );

  // TO Operations
  const createRequest = useCallback(
    (payload: CreateRequestPayload): MaterialRequest => {
      const actor = currentUser || users[0];
      const assignedTs =
        users.find((u) => u.id === actor.assignedTsId) ||
        users.find((u) => u.role === 'TS')!;
      const maxNum = requests.reduce((acc, r) => {
        const m = r.id.match(/REQ-(\d+)/);
        return m ? Math.max(acc, Number.parseInt(m[1], 10)) : acc;
      }, 1009);
      const newId = `REQ-${maxNum + 1}`;
      const now = new Date().toISOString();

      const newReq: MaterialRequest = {
        id: newId,
        toId: actor.id,
        toName: actor.name,
        department: actor.department,
        tsId: assignedTs.id,
        tsName: assignedTs.name,
        status: 'PENDING_TS_VERIFICATION',
        priority: payload.priority,
        purpose: payload.purpose,
        items: payload.items.map((item, idx) => ({
          id: `ri-${newId}-${idx + 1}`,
          catalogItemId: item.catalogItemId,
          itemCode: item.catalogItemId || undefined,
          itemName: item.itemName,
          itemType: item.itemType,
          category: item.category,
          unit: item.unit,
          requestedQty: item.requestedQty,
          allocatedQty: 0,
          specifications: item.specifications,
        })),
        remarksHistory: [
          {
            id: `rem-${newId}-1`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: 'SUBMITTED_REQUISITION',
            remark: payload.remark || `Submitted material requisition for ${payload.purpose}`,
            timestamp: now,
          },
        ],
        routingDestination: null,
        createdAt: now,
        updatedAt: now,
      };

      setRequests((prev) => [newReq, ...prev]);

      recordAuditLog({
        actionType: 'TO_REQUEST_COPY',
        entityType: 'REQUEST',
        entityId: newId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `TO ${actor.name} (${actor.department}) submitted new requisition ${newId} to TS ${assignedTs.name}`,
        oldData: null,
        newData: {
          requestId: newId,
          status: newReq.status,
          purpose: newReq.purpose,
          assignedTsName: assignedTs.name,
          items: newReq.items.map((i) => ({
            name: i.itemName,
            qty: i.requestedQty,
            unit: i.unit,
            type: i.itemType,
          })),
        },
      });

      pushNotification({
        userId: assignedTs.id,
        title: `New Requisition Pending Verification — ${newId}`,
        message: `TO ${actor.name} (${actor.department}) submitted ${newId} with ${newReq.items.length} item(s) for your verification.`,
        relatedRequestId: newId,
        type: 'ACTION_REQUIRED',
      });

      return newReq;
    },
    [currentUser, users, requests, recordAuditLog, pushNotification]
  );

  const resubmitRevertedRequest = useCallback(
    (requestId: string, payload: CreateRequestPayload): MaterialRequest | null => {
      const actor = currentUser || users[0];
      const existing = requests.find((r) => r.id === requestId);
      if (!existing) return null;

      const now = new Date().toISOString();
      const updatedReq: MaterialRequest = {
        ...existing,
        status: 'PENDING_TS_VERIFICATION',
        priority: payload.priority,
        purpose: payload.purpose,
        items: payload.items.map((item, idx) => ({
          id: `ri-${requestId}-resub-${idx + 1}`,
          catalogItemId: item.catalogItemId,
          itemCode: item.catalogItemId || undefined,
          itemName: item.itemName,
          itemType: item.itemType,
          category: item.category,
          unit: item.unit,
          requestedQty: item.requestedQty,
          allocatedQty: 0,
          specifications: item.specifications,
        })),
        remarksHistory: [
          ...existing.remarksHistory,
          {
            id: `rem-${requestId}-${existing.remarksHistory.length + 1}`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: 'RESUBMITTED_BY_TO',
            remark: payload.remark || 'Updated specifications & purpose as requested by TS.',
            timestamp: now,
          },
        ],
        updatedAt: now,
      };

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));

      recordAuditLog({
        actionType: 'TO_REQUEST_COPY',
        entityType: 'REQUEST',
        entityId: requestId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `TO ${actor.name} updated & resubmitted reverted requisition ${requestId}`,
        oldData: {
          status: existing.status,
          purpose: existing.purpose,
          items: existing.items,
        },
        newData: {
          status: updatedReq.status,
          purpose: updatedReq.purpose,
          items: updatedReq.items,
        },
      });

      pushNotification({
        userId: existing.tsId,
        title: `Reverted Requisition Resubmitted — ${requestId}`,
        message: `TO ${actor.name} has updated and resubmitted ${requestId} for TS verification.`,
        relatedRequestId: requestId,
        type: 'ACTION_REQUIRED',
      });

      return updatedReq;
    },
    [currentUser, users, requests, recordAuditLog, pushNotification]
  );

  const confirmReceiptAndClose = useCallback(
    (requestId: string, remark?: string) => {
      const actor = currentUser || users[0];
      const existing = requests.find((r) => r.id === requestId);
      if (!existing) return;

      const now = new Date().toISOString();
      const finalRemark =
        remark?.trim() ||
        'Confirmed physical receipt of materials from Central Store and recorded in Trade Consumable Register.';

      const updatedReq: MaterialRequest = {
        ...existing,
        status: 'CLOSED',
        closedAt: now,
        updatedAt: now,
        items: existing.items.map((item) => ({
          ...item,
          allocatedQty: item.requestedQty,
          receivedQty: item.requestedQty,
        })),
        remarksHistory: [
          ...existing.remarksHistory,
          {
            id: `rem-${requestId}-${existing.remarksHistory.length + 1}`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: 'CONFIRMED_RECEIPT_AND_CLOSED',
            remark: finalRemark,
            timestamp: now,
          },
        ],
      };

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));

      recordAuditLog({
        actionType: 'TO_REQUEST_COPY',
        entityType: 'REQUEST',
        entityId: requestId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `TO ${actor.name} confirmed material receipt and closed requisition ${requestId}`,
        oldData: {
          status: existing.status,
          closedAt: null,
          items: existing.items.map((i) => ({
            name: i.itemName,
            allocatedQty: i.allocatedQty,
            requestedQty: i.requestedQty,
          })),
        },
        newData: {
          status: 'CLOSED',
          closedAt: now,
          remark: finalRemark,
          items: updatedReq.items.map((i) => ({
            name: i.itemName,
            allocatedQty: i.allocatedQty,
            requestedQty: i.requestedQty,
            itemStatus: 'CLOSED',
          })),
        },
      });
    },
    [currentUser, users, requests, recordAuditLog]
  );

  // TS Operations
  const verifyRequestByTs = useCallback(
    (requestId: string, remark: string) => {
      const actor = currentUser || users.find((u) => u.role === 'TS')!;
      const existing = requests.find((r) => r.id === requestId);
      if (!existing) return;

      // Strict TS isolation: ensure only the assigned TS can verify
      if (actor.role === 'TS' && existing.tsId !== actor.id) {
        toast.error(`Unauthorized: Requisition ${requestId} is assigned to TS ${existing.tsName}, not you.`);
        return;
      }

      const now = new Date().toISOString();
      const updatedReq: MaterialRequest = {
        ...existing,
        status: 'PENDING_PRINCIPAL_APPROVAL',
        verifiedAt: now,
        updatedAt: now,
        remarksHistory: [
          ...existing.remarksHistory,
          {
            id: `rem-${requestId}-${existing.remarksHistory.length + 1}`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: 'VERIFIED_BY_TS',
            remark: remark.trim() || 'Verified technical requirement and forwarded to Principal.',
            timestamp: now,
          },
        ],
      };

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));

      recordAuditLog({
        actionType: 'TS_VERIFICATION_COPY',
        entityType: 'REQUEST',
        entityId: requestId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `TS ${actor.name} verified ${requestId} and forwarded to Principal`,
        oldData: { status: existing.status, verifiedAt: existing.verifiedAt || null },
        newData: {
          status: 'PENDING_PRINCIPAL_APPROVAL',
          verifiedAt: now,
          tsRemark: remark.trim(),
        },
      });

      const principal = users.find((u) => u.role === 'PRINCIPAL');
      if (principal) {
        pushNotification({
          userId: principal.id,
          title: `Requisition Verified by TS — ${requestId}`,
          message: `TS ${actor.name} verified ${requestId} (${existing.department}). Ready for Principal routing decision.`,
          relatedRequestId: requestId,
          type: 'ACTION_REQUIRED',
        });
      }
    },
    [currentUser, users, requests, recordAuditLog, pushNotification]
  );

  const revertRequestByTs = useCallback(
    (requestId: string, remark: string) => {
      const actor = currentUser || users.find((u) => u.role === 'TS')!;
      const existing = requests.find((r) => r.id === requestId);
      if (!existing) return;

      // Strict TS isolation: ensure only the assigned TS can revert
      if (actor.role === 'TS' && existing.tsId !== actor.id) {
        toast.error(`Unauthorized: Requisition ${requestId} is assigned to TS ${existing.tsName}, not you.`);
        return;
      }

      const now = new Date().toISOString();
      const updatedReq: MaterialRequest = {
        ...existing,
        status: 'REVERTED_BY_TS',
        updatedAt: now,
        remarksHistory: [
          ...existing.remarksHistory,
          {
            id: `rem-${requestId}-${existing.remarksHistory.length + 1}`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: 'REVERTED_BY_TS',
            remark: remark.trim(),
            timestamp: now,
          },
        ],
      };

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));

      recordAuditLog({
        actionType: 'TS_VERIFICATION_COPY',
        entityType: 'REQUEST',
        entityId: requestId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `TS ${actor.name} reverted ${requestId} back to TO ${existing.toName}`,
        oldData: { status: existing.status },
        newData: { status: 'REVERTED_BY_TS', revertReason: remark.trim() },
      });

      pushNotification({
        userId: existing.toId,
        title: `Requisition Reverted by TS — ${requestId}`,
        message: `TS ${actor.name} reverted ${requestId}: ${remark.trim()}`,
        relatedRequestId: requestId,
        type: 'REVERT_ALERT',
      });
    },
    [currentUser, users, requests, recordAuditLog, pushNotification]
  );

  const rejectRequestByTs = useCallback(
    (requestId: string, remark: string) => {
      const actor = currentUser || users.find((u) => u.role === 'TS')!;
      const existing = requests.find((r) => r.id === requestId);
      if (!existing) return;

      // Strict TS isolation: ensure only the assigned TS can reject
      if (actor.role === 'TS' && existing.tsId !== actor.id) {
        toast.error(`Unauthorized: Requisition ${requestId} is assigned to TS ${existing.tsName}, not you.`);
        return;
      }

      const now = new Date().toISOString();
      const updatedReq: MaterialRequest = {
        ...existing,
        status: 'REJECTED_BY_TS',
        updatedAt: now,
        remarksHistory: [
          ...existing.remarksHistory,
          {
            id: `rem-${requestId}-${existing.remarksHistory.length + 1}`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: 'REJECTED_BY_TS',
            remark: remark.trim(),
            timestamp: now,
          },
        ],
      };

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));

      recordAuditLog({
        actionType: 'TS_VERIFICATION_COPY',
        entityType: 'REQUEST',
        entityId: requestId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `TS ${actor.name} rejected requisition ${requestId}`,
        oldData: { status: existing.status },
        newData: { status: 'REJECTED_BY_TS', rejectionReason: remark.trim() },
      });

      pushNotification({
        userId: existing.toId,
        title: `Requisition Rejected by TS — ${requestId}`,
        message: `TS ${actor.name} rejected ${requestId}: ${remark.trim()}`,
        relatedRequestId: requestId,
        type: 'REJECTION_ALERT',
      });
    },
    [currentUser, users, requests, recordAuditLog, pushNotification]
  );

  // Principal Operations
  const approveRequestByPrincipal = useCallback(
    (requestId: string, destination: 'STORE' | 'PURCHASE', remark: string) => {
      const actor = currentUser || users.find((u) => u.role === 'PRINCIPAL')!;
      const existing = requests.find((r) => r.id === requestId);
      if (!existing) return;

      const now = new Date().toISOString();
      const newStatus =
        destination === 'STORE' ? 'APPROVED_FOR_STORE' : 'APPROVED_FOR_PURCHASE';

      const updatedReq: MaterialRequest = {
        ...existing,
        status: newStatus,
        routingDestination: destination,
        approvedAt: now,
        updatedAt: now,
        remarksHistory: [
          ...existing.remarksHistory,
          {
            id: `rem-${requestId}-${existing.remarksHistory.length + 1}`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: newStatus,
            remark:
              remark.trim() ||
              (destination === 'STORE'
                ? 'Approved by Principal for Direct Store Issue.'
                : 'Approved by Principal and routed to Purchase Cell.'),
            timestamp: now,
          },
        ],
      };

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));

      recordAuditLog({
        actionType: 'PRINCIPAL_APPROVAL_COPY',
        entityType: 'REQUEST',
        entityId: requestId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `Principal ${actor.name} approved ${requestId} and routed to ${destination}`,
        oldData: {
          status: existing.status,
          routingDestination: existing.routingDestination,
        },
        newData: {
          status: newStatus,
          routingDestination: destination,
          principalRemark: remark.trim(),
        },
      });

      const targetRole = destination === 'STORE' ? 'STORE_MANAGER' : 'PURCHASE';
      const targetUser = users.find((u) => u.role === targetRole);
      if (targetUser) {
        pushNotification({
          userId: targetUser.id,
          title:
            destination === 'STORE'
              ? `Direct Store Issue Sanctioned — ${requestId}`
              : `New Requisition Routed to Purchase — ${requestId}`,
          message: `Principal ${actor.name} approved ${requestId} (${existing.department}) for ${
            destination === 'STORE' ? 'Central Store Direct Issue' : 'Purchase Consolidation'
          }.`,
          relatedRequestId: requestId,
          type: 'ACTION_REQUIRED',
        });
      }
    },
    [currentUser, users, requests, recordAuditLog, pushNotification]
  );

  const rejectRequestByPrincipal = useCallback(
    (requestId: string, remark: string) => {
      const actor = currentUser || users.find((u) => u.role === 'PRINCIPAL')!;
      const existing = requests.find((r) => r.id === requestId);
      if (!existing) return;

      const now = new Date().toISOString();
      const updatedReq: MaterialRequest = {
        ...existing,
        status: 'REJECTED_BY_PRINCIPAL',
        updatedAt: now,
        remarksHistory: [
          ...existing.remarksHistory,
          {
            id: `rem-${requestId}-${existing.remarksHistory.length + 1}`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: 'REJECTED_BY_PRINCIPAL',
            remark: remark.trim(),
            timestamp: now,
          },
        ],
      };

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));

      recordAuditLog({
        actionType: 'PRINCIPAL_APPROVAL_COPY',
        entityType: 'REQUEST',
        entityId: requestId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `Principal ${actor.name} rejected requisition ${requestId}`,
        oldData: { status: existing.status },
        newData: { status: 'REJECTED_BY_PRINCIPAL', rejectionReason: remark.trim() },
      });

      pushNotification({
        userId: existing.toId,
        title: `Requisition Rejected by Principal — ${requestId}`,
        message: `Principal ${actor.name} rejected ${requestId}: ${remark.trim()}`,
        relatedRequestId: requestId,
        type: 'REJECTION_ALERT',
      });
    },
    [currentUser, users, requests, recordAuditLog, pushNotification]
  );

  // Purchase Operations
  const createPrintedPurchaseBatch = useCallback(
    (
      requestIds: string[],
      procurementMode: PurchaseOrder['procurementMode'] = 'GeM Portal',
      remarks?: string
    ): PurchaseOrder => {
      const actor = currentUser || users.find((u) => u.role === 'PURCHASE')!;
      const maxPoNum = purchaseOrders.reduce((acc, po) => {
        const m = po.id.match(/PO-(\d+)/);
        return m ? Math.max(acc, Number.parseInt(m[1], 10)) : acc;
      }, 2002);
      const newPoId = `PO-${maxPoNum + 1}`;
      const now = new Date().toISOString();

      const consolidatedItems = consolidateRequestsForPO(requests, requestIds);

      const newPo: PurchaseOrder = {
        id: newPoId,
        status: 'AWAITING_AVAK_JAVAK',
        avakJavakNumber: '',
        procurementMode,
        letterPrintedAt: now,
        createdAt: now,
        updatedAt: now,
        createdBy: actor.name,
        sourceRequestIds: requestIds,
        consolidatedItems,
        challans: [],
        remarks:
          remarks?.trim() ||
          'Official Hindi/English forwarding letter printed; awaiting dispatch section Avak/Javak number.',
      };

      setPurchaseOrders((prev) => [newPo, ...prev]);

      // Update source requests to PRINTED_AWAITING_AVAK_JAVAK
      setRequests((prev) =>
        prev.map((r) =>
          requestIds.includes(r.id)
            ? {
                ...r,
                status: 'PRINTED_AWAITING_AVAK_JAVAK',
                linkedPoId: newPoId,
                updatedAt: now,
                remarksHistory: [
                  ...r.remarksHistory,
                  {
                    id: `rem-${r.id}-${r.remarksHistory.length + 1}`,
                    actorId: actor.id,
                    actorName: actor.name,
                    actorRole: actor.role,
                    action: 'PRINTED_FORWARDING_LETTER',
                    remark: `Batched into ${newPoId} and printed official forwarding letter for offline Avak/Javak registration.`,
                    timestamp: now,
                  },
                ],
              }
            : r
        )
      );

      recordAuditLog({
        actionType: 'PRINT_FORWARD_LETTER_COPY',
        entityType: 'PURCHASE_ORDER',
        entityId: newPoId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `Purchase Officer ${actor.name} consolidated [${requestIds.join(', ')}] into ${newPoId} and printed forwarding letter`,
        oldData: {
          sourceRequestIds: requestIds,
          previousStatus: 'APPROVED_FOR_PURCHASE',
        },
        newData: {
          poId: newPoId,
          status: 'AWAITING_AVAK_JAVAK',
          procurementMode,
          consolidatedItems: consolidatedItems.map((i) => ({
            name: i.itemName,
            qty: i.orderedQty,
            type: i.itemType,
          })),
        },
      });

      return newPo;
    },
    [currentUser, users, purchaseOrders, requests, recordAuditLog]
  );

  const recordAvakJavakAndGenerateOrder = useCallback(
    (
      poId: string,
      avakJavakNumber: string,
      procurementMode: PurchaseOrder['procurementMode'],
      tenderRef?: string,
      vendorName?: string
    ) => {
      const actor = currentUser || users.find((u) => u.role === 'PURCHASE')!;
      const existingPo = purchaseOrders.find((p) => p.id === poId);
      if (!existingPo) return;

      const now = new Date().toISOString();
      const updatedPo: PurchaseOrder = {
        ...existingPo,
        status: 'PURCHASE_IN_PROGRESS',
        avakJavakNumber: avakJavakNumber.trim(),
        avakDate: now.slice(0, 10),
        procurementMode,
        tenderRef: tenderRef?.trim() || existingPo.tenderRef,
        vendorName: vendorName?.trim() || existingPo.vendorName,
        updatedAt: now,
      };

      setPurchaseOrders((prev) => prev.map((p) => (p.id === poId ? updatedPo : p)));

      setRequests((prev) =>
        prev.map((r) =>
          existingPo.sourceRequestIds.includes(r.id)
            ? {
                ...r,
                status: 'PURCHASE_IN_PROGRESS',
                avakJavakNo: avakJavakNumber.trim(),
                updatedAt: now,
                remarksHistory: [
                  ...r.remarksHistory,
                  {
                    id: `rem-${r.id}-${r.remarksHistory.length + 1}`,
                    actorId: actor.id,
                    actorName: actor.name,
                    actorRole: actor.role,
                    action: 'ORDER_GENERATED_WITH_AVAK_JAVAK',
                    remark: `Purchase Order ${poId} dispatched with Avak/Javak No. ${avakJavakNumber.trim()} via ${procurementMode}.`,
                    timestamp: now,
                  },
                ],
              }
            : r
        )
      );

      const storeMgr = users.find((u) => u.role === 'STORE_MANAGER');
      if (storeMgr) {
        pushNotification({
          userId: storeMgr.id,
          title: `Purchase Order Dispatched — ${poId}`,
          message: `PO ${poId} (Avak/Javak: ${avakJavakNumber.trim()}, Mode: ${procurementMode}) is now in progress and awaiting vendor challan delivery at Central Store.`,
          relatedPoId: poId,
          type: 'PO_DISPATCHED',
        });
      }

      recordAuditLog({
        actionType: 'GENERATE_ORDER_AVAK_JAVAK_COPY',
        entityType: 'PURCHASE_ORDER',
        entityId: poId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `Purchase Officer ${actor.name} entered Avak/Javak No. ${avakJavakNumber.trim()} and generated order ${poId}`,
        oldData: {
          status: existingPo.status,
          avakJavakNumber: existingPo.avakJavakNumber,
        },
        newData: {
          status: 'PURCHASE_IN_PROGRESS',
          avakJavakNumber: avakJavakNumber.trim(),
          procurementMode,
          tenderRef: tenderRef?.trim(),
        },
      });
    },
    [currentUser, users, purchaseOrders, recordAuditLog, pushNotification]
  );

  // Store Manager Operations
  const issueDirectFromStore = useCallback(
    (
      requestId: string,
      remark?: string,
      issuedQuantities?: Record<string, number>
    ) => {
      const actor = currentUser || users.find((u) => u.role === 'STORE_MANAGER')!;
      const req = requests.find((r) => r.id === requestId);
      if (!req) return { success: false, message: 'Requisition not found.' };

      const qtyMap: Record<string, number> = {};
      let totalIssuedNow = 0;

      for (const item of req.items) {
        const remainingNeeded = Math.max(
          0,
          item.requestedQty - (item.receivedQty ?? 0)
        );
        const qtyToIssue =
          issuedQuantities && issuedQuantities[item.id] !== undefined
            ? Number(issuedQuantities[item.id])
            : remainingNeeded;

        if (qtyToIssue < 0 || qtyToIssue > remainingNeeded) {
          return {
            success: false,
            message: `Invalid issue quantity (${qtyToIssue}) for ${item.itemName}. Must be between 0 and ${remainingNeeded}.`,
          };
        }

        if (item.catalogItemId && qtyToIssue > 0) {
          const cat = catalogItems.find((c) => c.id === item.catalogItemId);
          if (!cat || cat.currentStock < qtyToIssue) {
            return {
              success: false,
              message: `Insufficient stock for ${item.itemName} (Available: ${
                cat?.currentStock ?? 0
              }, Attempting to issue: ${qtyToIssue}).`,
            };
          }
        }

        qtyMap[item.id] = qtyToIssue;
        totalIssuedNow += qtyToIssue;
      }

      if (totalIssuedNow <= 0) {
        return {
          success: false,
          message: 'Please enter a positive issue quantity for at least one item.',
        };
      }

      const now = new Date().toISOString();
      const oldStockSnapshot: Record<string, number> = {};
      const newStockSnapshot: Record<string, number> = {};

      // Deduct catalog stock
      setCatalogItems((prev) =>
        prev.map((cat) => {
          const reqItem = req.items.find((i) => i.catalogItemId === cat.id);
          if (!reqItem) return cat;
          const deductQty = qtyMap[reqItem.id] ?? 0;
          if (deductQty <= 0) return cat;
          oldStockSnapshot[cat.id] = cat.currentStock;
          const updatedStock = Math.max(0, cat.currentStock - deductQty);
          newStockSnapshot[cat.id] = updatedStock;
          return {
            ...cat,
            currentStock: updatedStock,
            lastUpdated: now,
          };
        })
      );

      const updatedItems = req.items.map((i) => {
        const addQty = qtyMap[i.id] ?? 0;
        return {
          ...i,
          allocatedQty: (i.allocatedQty ?? 0) + addQty,
          receivedQty: (i.receivedQty ?? 0) + addQty,
        };
      });

      const allFulfilled = updatedItems.every(
        (i) => (i.receivedQty ?? 0) >= i.requestedQty
      );
      const nextStatus = allFulfilled ? 'ITEM_RECEIVED_AT_STORE' : 'PARTIALLY_FULFILLED';

      const updatedReq: MaterialRequest = {
        ...req,
        status: nextStatus,
        updatedAt: now,
        items: updatedItems,
        remarksHistory: [
          ...req.remarksHistory,
          {
            id: `rem-${req.id}-${req.remarksHistory.length + 1}`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
            action: 'DIRECT_STORE_ISSUE_READY',
            remark:
              remark?.trim() ||
              `Materials allocated directly from Central Store inventory (${totalIssuedNow} unit(s)). Ready for pickup by TO ${req.toName}.`,
            timestamp: now,
          },
        ],
      };

      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedReq : r)));

      recordAuditLog({
        actionType: 'DIRECT_STORE_ISSUE_COPY',
        entityType: 'REQUEST',
        entityId: requestId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `Store Manager ${actor.name} issued materials from Central Store stock for ${requestId}`,
        oldData: { status: req.status, stockBefore: oldStockSnapshot },
        newData: {
          status: nextStatus,
          issuedQuantities: qtyMap,
          stockAfter: newStockSnapshot,
        },
      });

      const itemsSummary = updatedItems
        .map((i) => `${qtyMap[i.id] || i.receivedQty} ${i.unit} ${i.itemName}`)
        .join(', ');

      pushNotification({
        userId: req.toId,
        title: `Direct Store Issue Ready — ${requestId}`,
        message: `Your order (${itemsSummary}) for ${requestId} has been issued from Central Store stock. Kindly collect your order from store.`,
        relatedRequestId: requestId,
        type: 'STORE_READY',
      });

      return {
        success: true,
        message: `Direct Store Issue processed for ${requestId}. Notification sent to ${req.toName}.`,
      };
    },
    [currentUser, users, requests, catalogItems, recordAuditLog, pushNotification]
  );

  const receiveChallanWithFIFO = useCallback(
    (
      poId: string,
      challanNumber: string,
      itemsReceived: { itemName: string; qty: number }[],
      vendorName?: string,
      remarks?: string,
      deliveryDate?: string
    ) => {
      const actor = currentUser || users.find((u) => u.role === 'STORE_MANAGER')!;
      const po = purchaseOrders.find((p) => p.id === poId);
      if (!po) {
        return {
          success: false,
          message: 'Purchase Order not found.',
          allocations: [],
        };
      }

      const validItems = itemsReceived.filter((i) => i.qty > 0);
      if (validItems.length === 0) {
        return {
          success: false,
          message: 'Please enter a positive received quantity for at least one item.',
          allocations: [],
        };
      }

      const now = new Date().toISOString();
      const recordedDate = deliveryDate
        ? new Date(deliveryDate).toISOString()
        : now;

      const fifoResult = computeFIFOAllocation(
        requests,
        po.sourceRequestIds,
        validItems
      );

      // Update PO consolidated items receivedQty and status
      const updatedConsolidated = po.consolidatedItems.map((cItem) => {
        const inc = validItems.find(
          (v) => v.itemName.trim().toLowerCase() === cItem.itemName.trim().toLowerCase()
        );
        if (!inc) return cItem;
        return {
          ...cItem,
          receivedQty: cItem.receivedQty + inc.qty,
        };
      });

      const allPoItemsComplete = updatedConsolidated.every(
        (c) => c.receivedQty >= c.orderedQty
      );

      const newChallan: ChallanRecord = {
        id: `ch-${Date.now()}`,
        challanNumber: challanNumber.trim(),
        receivedDate: recordedDate,
        receivedBy: actor.name,
        vendorName: vendorName?.trim() || po.vendorName,
        remarks: remarks?.trim() || `Challan ${challanNumber.trim()} received and FIFO allocated.`,
        itemsReceived: validItems,
        fifoAllocations: fifoResult.allocations,
      };

      const updatedPo: PurchaseOrder = {
        ...po,
        status: allPoItemsComplete ? 'COMPLETED' : 'PURCHASE_IN_PROGRESS',
        consolidatedItems: updatedConsolidated,
        challans: [...po.challans, newChallan],
        updatedAt: now,
      };

      setPurchaseOrders((prev) => prev.map((p) => (p.id === poId ? updatedPo : p)));

      // Add remarks to updated requests & notify TOs
      const finalRequests = fifoResult.updatedRequests.map((r) => {
        const reqAllocs = fifoResult.allocations.filter((a) => a.requestId === r.id);
        if (reqAllocs.length === 0) return r;

        const allocText = reqAllocs
          .map((a) => `${a.allocatedQty} ${a.itemName}`)
          .join(', ');

        return {
          ...r,
          updatedAt: now,
          remarksHistory: [
            ...r.remarksHistory,
            {
              id: `rem-${r.id}-${r.remarksHistory.length + 1}`,
              actorId: actor.id,
              actorName: actor.name,
              actorRole: actor.role,
              action:
                r.status === 'ITEM_RECEIVED_AT_STORE'
                  ? 'CHALLAN_FIFO_ALLOCATED'
                  : 'CHALLAN_FIFO_PARTIAL',
              remark: `FIFO allocated (${allocText}) from ${poId} via Challan ${challanNumber.trim()}. Status: ${r.status}.`,
              timestamp: now,
            },
          ],
        };
      });

      setRequests(finalRequests);

      // Increment catalogItem.currentStock by Actual Received Now for TRADE items
      // (NON_TRADE ad-hoc items are not in catalogItems so they are automatically excluded)
      setCatalogItems((prev) =>
        prev.map((cat) => {
          const inc = validItems.find(
            (v) => v.itemName.trim().toLowerCase() === cat.name.trim().toLowerCase()
          );
          if (!inc) return cat;
          return {
            ...cat,
            currentStock: cat.currentStock + inc.qty,
            lastUpdated: now,
          };
        })
      );

      // Notify TOs whose requests got allocated
      const notifiedRequestIds = new Set<string>();
      for (const alloc of fifoResult.allocations) {
        if (notifiedRequestIds.has(alloc.requestId)) continue;
        notifiedRequestIds.add(alloc.requestId);

        const targetReq = finalRequests.find((r) => r.id === alloc.requestId);
        if (targetReq) {
          pushNotification({
            userId: targetReq.toId,
            title:
              targetReq.status === 'ITEM_RECEIVED_AT_STORE'
                ? `Material Ready for Pickup — ${targetReq.id}`
                : `Partial Challan Allocation — ${targetReq.id}`,
            message: `Your order for ${targetReq.id} has been received at Store (Challan ${challanNumber.trim()}). Kindly collect your order from store.`,
            relatedRequestId: targetReq.id,
            relatedPoId: poId,
            type:
              targetReq.status === 'ITEM_RECEIVED_AT_STORE' ? 'STORE_READY' : 'INFO',
          });
        }
      }

      recordAuditLog({
        actionType: 'STORE_CHALLAN_RECEIPT_COPY',
        entityType: 'PURCHASE_ORDER',
        entityId: poId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `Store Manager ${actor.name} recorded Challan ${challanNumber.trim()} for ${poId} with FIFO allocation`,
        oldData: {
          poId,
          status: po.status,
          previousChallansCount: po.challans.length,
        },
        newData: {
          poId,
          status: updatedPo.status,
          challanNumber: challanNumber.trim(),
          deliveryDate: recordedDate.slice(0, 10),
          itemsReceived: validItems,
          fifoAllocations: fifoResult.allocations,
        },
      });

      return {
        success: true,
        message: `Challan ${challanNumber.trim()} logged and FIFO allocated across ${
          fifoResult.allocations.length
        } requisition line(s).`,
        allocations: fifoResult.allocations,
      };
    },
    [currentUser, users, purchaseOrders, requests, recordAuditLog, pushNotification]
  );

  // Admin Operations
  const upsertCatalogItem = useCallback(
    (item: Omit<CatalogItem, 'id'> & { id?: string }): CatalogItem => {
      const actor = currentUser || users.find((u) => u.role === 'ADMIN')!;
      const now = new Date().toISOString();
      const targetId = item.id || `cat-${Date.now()}`;
      const existing = catalogItems.find((c) => c.id === targetId);

      const savedItem: CatalogItem = {
        ...item,
        id: targetId,
        code: item.code.trim().toUpperCase(),
        lastUpdated: now,
      };

      setCatalogItems((prev) => {
        const exists = prev.some((c) => c.id === targetId);
        return exists
          ? prev.map((c) => (c.id === targetId ? savedItem : c))
          : [savedItem, ...prev];
      });

      recordAuditLog({
        actionType: 'ADMIN_CONFIG_CHANGE',
        entityType: 'CATALOG',
        entityId: targetId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `${existing ? 'Updated' : 'Created'} Master Catalog Item ${targetId} (${savedItem.name})`,
        oldData: existing ? { ...existing } : null,
        newData: { ...savedItem },
      });

      return savedItem;
    },
    [currentUser, users, catalogItems, recordAuditLog]
  );

  const createUser = useCallback(
    (payload: CreateUserPayload) => {
      const actor = currentUser || users.find((u) => u.role === 'ADMIN') || {
        id: 'u-admin',
        name: 'System Admin',
        role: 'ADMIN' as const,
      };

      const normalizedEmail = payload.email.trim().toLowerCase();
      const emailExists = users.some(
        (u) => u.email.trim().toLowerCase() === normalizedEmail
      );

      if (emailExists) {
        return {
          success: false,
          error: `A user with email "${payload.email.trim()}" already exists. Email must be unique.`,
        };
      }

      const newId = `u-${payload.role.toLowerCase()}-${Date.now().toString(36)}`;
      const assignedTsId =
        payload.role === 'TO' ? payload.assignedTsId : undefined;
      const department = (payload.department || '').trim() || 'Electrician';

      const newUser: User = {
        id: newId,
        name: payload.name.trim(),
        email: normalizedEmail,
        password: payload.password?.trim() || 'password123',
        role: payload.role,
        department,
        designation: payload.designation?.trim() || undefined,
        assignedTsId,
        phone: payload.phone?.trim() || undefined,
      };

      // Prepend so newly created user appears at the top of the table
      setUsers((prev) => [newUser, ...prev]);

      recordAuditLog({
        actionType: 'ADMIN_CONFIG_CHANGE',
        entityType: 'USER_MAPPING',
        entityId: newId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: (actor.role as any) || 'ADMIN',
        summary: `Admin ${actor.name} created user ${newUser.name} (${newUser.role} - ${newUser.department})`,
        oldData: null,
        newData: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          assignedTsId: newUser.assignedTsId || null,
        },
      });

      return { success: true, user: newUser };
    },
    [currentUser, users, recordAuditLog]
  );

  const updateUser = useCallback(
    (userId: string, payload: UpdateUserPayload) => {
      const actor = currentUser || users.find((u) => u.role === 'ADMIN') || {
        id: 'u-admin',
        name: 'System Admin',
        role: 'ADMIN' as const,
      };

      const existingUser = users.find((u) => u.id === userId);
      if (!existingUser) {
        return { success: false, error: `User #${userId} not found.` };
      }

      // Role protection: Ensure at least 1 Admin and at least 1 Principal exist
      if (existingUser.role === 'ADMIN' && payload.role !== 'ADMIN') {
        const adminCount = users.filter((u) => u.role === 'ADMIN').length;
        if (adminCount <= 1) {
          return {
            success: false,
            error: 'Cannot change role: There must be at least 1 active System Administrator (ADMIN) in the system.',
          };
        }
      }

      if (existingUser.role === 'PRINCIPAL' && payload.role !== 'PRINCIPAL') {
        const principalCount = users.filter((u) => u.role === 'PRINCIPAL').length;
        if (principalCount <= 1) {
          return {
            success: false,
            error: 'Cannot change role: There must be at least 1 active Principal in the system.',
          };
        }
      }

      const assignedTsId =
        payload.role === 'TO' ? payload.assignedTsId : undefined;
      const department =
        (payload.department || '').trim() || existingUser.department || 'Electrician';

      const updatedUser: User = {
        ...existingUser,
        name: payload.name.trim(),
        // Email remains existingUser.email (strictly immutable)
        password: payload.password?.trim() || existingUser.password,
        role: payload.role,
        department,
        designation: payload.designation?.trim() || undefined,
        assignedTsId,
        phone: payload.phone?.trim() || undefined,
      };

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? updatedUser : u))
      );

      if (currentUser?.id === userId) {
        setCurrentUser(updatedUser);
      }

      recordAuditLog({
        actionType: 'ADMIN_CONFIG_CHANGE',
        entityType: 'USER_MAPPING',
        entityId: userId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: (actor.role as any) || 'ADMIN',
        summary: `Admin ${actor.name} updated profile for ${updatedUser.name} (${updatedUser.role})`,
        oldData: {
          name: existingUser.name,
          role: existingUser.role,
          department: existingUser.department,
          assignedTsId: existingUser.assignedTsId || null,
        },
        newData: {
          name: updatedUser.name,
          role: updatedUser.role,
          department: updatedUser.department,
          assignedTsId: updatedUser.assignedTsId || null,
        },
      });

      return { success: true, user: updatedUser };
    },
    [currentUser, users, recordAuditLog]
  );

  const updateToTsMapping = useCallback(
    (toUserId: string, newTsUserId: string) => {
      const actor = currentUser || users.find((u) => u.role === 'ADMIN')!;
      const toUser = users.find((u) => u.id === toUserId);
      const newTsUser = users.find((u) => u.id === newTsUserId);
      if (!toUser || !newTsUser) return;

      const oldTsId = toUser.assignedTsId;
      const oldTsUser = users.find((u) => u.id === oldTsId);

      setUsers((prev) =>
        prev.map((u) => (u.id === toUserId ? { ...u, assignedTsId: newTsUserId } : u))
      );

      if (currentUser?.id === toUserId) {
        setCurrentUser((prev) => (prev ? { ...prev, assignedTsId: newTsUserId } : null));
      }

      recordAuditLog({
        actionType: 'ADMIN_CONFIG_CHANGE',
        entityType: 'USER_MAPPING',
        entityId: toUserId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        summary: `Updated TO-to-TS supervisory hierarchy for ${toUser.name} (${toUser.department}): ${
          oldTsUser?.name || 'None'
        } -> ${newTsUser.name}`,
        oldData: {
          toId: toUserId,
          toName: toUser.name,
          assignedTsId: oldTsId,
          assignedTsName: oldTsUser?.name || null,
        },
        newData: {
          toId: toUserId,
          toName: toUser.name,
          assignedTsId: newTsUserId,
          assignedTsName: newTsUser.name,
        },
      });
    },
    [currentUser, users, recordAuditLog]
  );

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        catalogItems,
        requests,
        purchaseOrders,
        auditLogs,
        notifications,
        loginByEmail,
        loginAsRoleUser,
        logout,
        resetDemoData,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        clearNotifications,
        createRequest,
        resubmitRevertedRequest,
        confirmReceiptAndClose,
        verifyRequestByTs,
        revertRequestByTs,
        rejectRequestByTs,
        approveRequestByPrincipal,
        rejectRequestByPrincipal,
        createPrintedPurchaseBatch,
        recordAvakJavakAndGenerateOrder,
        issueDirectFromStore,
        receiveChallanWithFIFO,
        upsertCatalogItem,
        createUser,
        updateUser,
        updateToTsMapping,
        recordAuditLog,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
