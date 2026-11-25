export type UserRole =
  | 'TO'
  | 'TS'
  | 'PRINCIPAL'
  | 'PURCHASE'
  | 'STORE_MANAGER'
  | 'ADMIN';

export type ItemType = 'TRADE' | 'NON_TRADE';

export type RequestStatus =
  | 'PENDING_TS_VERIFICATION'
  | 'REVERTED_BY_TS'
  | 'REJECTED_BY_TS'
  | 'REJECTED_BY_PRINCIPAL'
  | 'PENDING_PRINCIPAL_APPROVAL'
  | 'APPROVED_FOR_STORE'
  | 'APPROVED_FOR_PURCHASE'
  | 'PRINTED_AWAITING_AVAK_JAVAK'
  | 'PURCHASE_IN_PROGRESS'
  | 'PARTIALLY_FULFILLED'
  | 'ITEM_RECEIVED_AT_STORE'
  | 'CLOSED'
  | 'COMPLETED';

export type PurchaseOrderStatus =
  | 'AWAITING_AVAK_JAVAK'
  | 'PURCHASE_IN_PROGRESS'
  | 'PARTIALLY_RECEIVED'
  | 'COMPLETED';

export type RoutingDestination = 'STORE' | 'PURCHASE' | null;

export type AuditActionType =
  | 'TO_REQUEST_COPY'
  | 'TS_VERIFICATION_COPY'
  | 'PRINCIPAL_APPROVAL_COPY'
  | 'PRINT_FORWARD_LETTER_COPY'
  | 'GENERATE_ORDER_AVAK_JAVAK_COPY'
  | 'STORE_CHALLAN_RECEIPT_COPY'
  | 'DIRECT_STORE_ISSUE_COPY'
  | 'STORE_DIRECT_ISSUE_COPY'
  | 'TO_RECEIPT_CONFIRMATION_COPY'
  | 'ADMIN_CONFIG_CHANGE';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department: string;
  designation?: string;
  assignedTsId?: string;
  phone?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department: string;
  designation?: string;
  assignedTsId?: string;
  phone?: string;
}

export interface UpdateUserPayload {
  name: string;
  password?: string;
  role: UserRole;
  department: string;
  designation?: string;
  assignedTsId?: string;
  phone?: string;
}

export interface CatalogItem {
  id: string;
  code: string;
  name: string;
  category: 'Electrician' | 'Fitter' | 'Electronics' | 'General' | string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  active?: boolean;
  description?: string;
  lastUpdated?: string;
}

export interface RequestItem {
  id: string;
  catalogItemId: string | null;
  itemCode?: string;
  itemName: string;
  itemType: ItemType;
  category: string;
  unit: string;
  requestedQty: number;
  allocatedQty: number;
  receivedQty?: number;
  specifications?: string;
  estimatedUnitCost?: number;
}

export interface RemarkEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  remark: string;
  timestamp: string;
}

export interface MaterialRequest {
  id: string;
  toId: string;
  toName: string;
  department: string;
  tsId: string;
  tsName: string;
  status: RequestStatus;
  priority: 'Normal' | 'Urgent' | 'Critical';
  purpose: string;
  items: RequestItem[];
  remarksHistory: RemarkEntry[];
  routingDestination?: RoutingDestination;
  linkedPoId?: string;
  avakJavakNo?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  approvedAt?: string;
  closedAt?: string;
}

export interface ConsolidatedPOItem {
  id: string;
  catalogItemId: string | null;
  itemCode?: string;
  itemName: string;
  itemType: ItemType;
  category?: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  specifications?: string;
  sourceBreakdown?: {
    requestId: string;
    toName: string;
    department: string;
    purpose?: string;
    qty: number;
    specifications?: string;
  }[];
}

export interface ChallanItemReceived {
  itemName: string;
  catalogItemId?: string | null;
  qty: number;
}

export interface ChallanRecord {
  id?: string;
  challanNumber: string;
  receivedDate: string;
  receivedBy: string;
  vendorName?: string;
  remarks?: string;
  itemsReceived: ChallanItemReceived[];
  fifoAllocations?: {
    requestId: string;
    toName: string;
    itemName: string;
    allocatedQty: number;
  }[];
}

export interface PurchaseOrder {
  id: string;
  status: PurchaseOrderStatus;
  avakJavakNumber: string;
  avakDate?: string;
  procurementMode:
    | 'GeM Portal'
    | 'Direct Purchase'
    | 'Tender'
    | 'Tender / Quotation'
    | 'Rate Contract';
  tenderRef?: string;
  vendorName?: string;
  letterPrintedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  sourceRequestIds: string[];
  consolidatedItems: ConsolidatedPOItem[];
  challans: ChallanRecord[];
  remarks?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actionType: AuditActionType;
  entityType: 'REQUEST' | 'PURCHASE_ORDER' | 'CATALOG' | 'USER_MAPPING';
  entityId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  summary: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  relatedRequestId?: string;
  relatedPoId?: string;
  read: boolean;
  createdAt: string;
  type:
    | 'STORE_READY'
    | 'ACTION_REQUIRED'
    | 'REVERT_ALERT'
    | 'REJECTION_ALERT'
    | 'PO_DISPATCHED'
    | 'INFO';
}

export interface CreateRequestPayload {
  priority: 'Normal' | 'Urgent' | 'Critical';
  purpose: string;
  items: {
    catalogItemId: string | null;
    itemName: string;
    itemType: ItemType;
    category: string;
    unit: string;
    requestedQty: number;
    specifications?: string;
  }[];
  remark?: string;
}

export interface StoreContextType {
  currentUser: User | null;
  users: User[];
  catalogItems: CatalogItem[];
  requests: MaterialRequest[];
  purchaseOrders: PurchaseOrder[];
  auditLogs: AuditLogEntry[];
  notifications: AppNotification[];

  // Auth & Demo Utilities
  loginByEmail: (email: string, password?: string) => { success: boolean; error?: string; user?: User };
  loginAsRoleUser: (userId: string) => User | null;
  logout: () => void;
  resetDemoData: () => void;

  // Notifications
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId?: string) => void;
  dismissNotification: (notificationId: string) => void;
  clearNotifications: (userId?: string) => void;

  // TO Operations
  createRequest: (payload: CreateRequestPayload) => MaterialRequest;
  resubmitRevertedRequest: (requestId: string, payload: CreateRequestPayload) => MaterialRequest | null;
  confirmReceiptAndClose: (requestId: string, remark?: string) => void;

  // TS Operations
  verifyRequestByTs: (requestId: string, remark: string) => void;
  revertRequestByTs: (requestId: string, remark: string) => void;
  rejectRequestByTs: (requestId: string, remark: string) => void;

  // Principal Operations
  approveRequestByPrincipal: (
    requestId: string,
    destination: 'STORE' | 'PURCHASE',
    remark: string
  ) => void;
  rejectRequestByPrincipal: (requestId: string, remark: string) => void;

  // Purchase Operations
  createPrintedPurchaseBatch: (
    requestIds: string[],
    procurementMode?: PurchaseOrder['procurementMode'],
    remarks?: string
  ) => PurchaseOrder;
  recordAvakJavakAndGenerateOrder: (
    poId: string,
    avakJavakNumber: string,
    procurementMode: PurchaseOrder['procurementMode'],
    tenderRef?: string,
    vendorName?: string
  ) => void;

  // Store Manager Operations
  issueDirectFromStore: (
    requestId: string,
    remark?: string,
    issuedQuantities?: Record<string, number>
  ) => { success: boolean; message: string };
  receiveChallanWithFIFO: (
    poId: string,
    challanNumber: string,
    itemsReceived: { itemName: string; qty: number }[],
    vendorName?: string,
    remarks?: string,
    deliveryDate?: string
  ) => { success: boolean; message: string; allocations: ChallanRecord['fifoAllocations'] };

  // Admin & Store Stock Operations
  createUser: (payload: CreateUserPayload) => { success: boolean; error?: string; user?: User };
  updateUser: (userId: string, payload: UpdateUserPayload) => { success: boolean; error?: string; user?: User };
  upsertCatalogItem: (item: Omit<CatalogItem, 'id'> & { id?: string }) => CatalogItem;
  updateToTsMapping: (toUserId: string, newTsUserId: string) => void;
  recordAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}
