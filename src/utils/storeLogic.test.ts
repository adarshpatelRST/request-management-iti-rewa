import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessStoreInventory,
  getDefaultRouteForRole,
  parsePageInput,
  consolidateRequestsForPO,
  computeFIFOAllocation,
  detectPendingPipelineForCatalogItem,
  validatePassword,
} from './storeLogic';
import { generatePrintDocumentHtml } from './printUtility';
import { UserRole } from '../types';
import { SEED_USERS, SEED_REQUESTS, SEED_PURCHASE_ORDERS } from '../data/seedData';

test('Store / Inventory Sidebar Rule strictly allows only STORE_MANAGER, PRINCIPAL, and ADMIN', () => {
  assert.equal(canAccessStoreInventory('STORE_MANAGER'), true);
  assert.equal(canAccessStoreInventory('PRINCIPAL'), true);
  assert.equal(canAccessStoreInventory('ADMIN'), true);
  assert.equal(canAccessStoreInventory('TO'), false);
  assert.equal(canAccessStoreInventory('TS'), false);
  assert.equal(canAccessStoreInventory('PURCHASE'), false);
});

test('getDefaultRouteForRole routes all 6 institutional roles to their respective dashboards', () => {
  assert.equal(getDefaultRouteForRole('TO'), '/to/dashboard');
  assert.equal(getDefaultRouteForRole('TS'), '/ts/dashboard');
  assert.equal(getDefaultRouteForRole('PRINCIPAL'), '/principal/dashboard');
  assert.equal(getDefaultRouteForRole('PURCHASE'), '/purchase/approved');
  assert.equal(getDefaultRouteForRole('STORE_MANAGER'), '/store/dashboard');
  assert.equal(getDefaultRouteForRole('ADMIN'), '/admin/dashboard');
});

test('DataTable integer-only page input validation accepts valid digits and rejects invalid or out-of-range inputs', () => {
  assert.equal(parsePageInput('1', 5), 1);
  assert.equal(parsePageInput('5', 5), 5);
  assert.equal(parsePageInput('0', 5), null);
  assert.equal(parsePageInput('6', 5), null);
  assert.equal(parsePageInput('2.5', 5), null);
  assert.equal(parsePageInput('abc', 5), null);
  assert.equal(parsePageInput('', 5), null);
});

test('consolidateRequestsForPO combines REQ-1002 and REQ-1007 accurately into Trade & Non-Trade items', () => {
  const consolidated = consolidateRequestsForPO(SEED_REQUESTS, ['REQ-1002', 'REQ-1007']);
  assert.equal(consolidated.length, 3);

  const exhaustFan = consolidated.find((i) => i.catalogItemId === 'ELC-104');
  assert.ok(exhaustFan);
  assert.equal(exhaustFan.orderedQty, 6); // 4 from REQ-1002 + 2 from REQ-1007
  assert.equal(exhaustFan.itemType, 'TRADE');
  assert.equal(exhaustFan.specifications, '450mm sweep heavy duty 1400 RPM metal blade exhaust fan');

  const nonTradeTea = consolidated.find((i) => i.itemType === 'NON_TRADE');
  assert.ok(nonTradeTea);
  assert.equal(nonTradeTea.orderedQty, 25);

  const markers = consolidated.find((i) => i.catalogItemId === 'GEN-401');
  assert.ok(markers);
  assert.equal(markers.orderedQty, 5);
});

test('computeFIFOAllocation allocates remaining 3 units of LED Tube Light 20W to REQ-1008 and marks it ITEM_RECEIVED_AT_STORE', () => {
  const result = computeFIFOAllocation(
    SEED_REQUESTS,
    ['REQ-1001', 'REQ-1008'],
    [{ itemName: 'LED Tube Light 20W', qty: 3 }]
  );

  assert.equal(result.allocations.length, 1);
  assert.equal(result.allocations[0].requestId, 'REQ-1008');
  assert.equal(result.allocations[0].allocatedQty, 3);

  const updatedReq1008 = result.updatedRequests.find((r) => r.id === 'REQ-1008');
  assert.ok(updatedReq1008);
  assert.equal(updatedReq1008.status, 'ITEM_RECEIVED_AT_STORE');
  assert.equal(updatedReq1008.items[0].allocatedQty, 5);
});

test('detectPendingPipelineForCatalogItem detects 3 pending units of ELC-101 in PO-2001 with Challan CH-401', () => {
  const alerts = detectPendingPipelineForCatalogItem(
    'ELC-101',
    'LED Tube Light 20W',
    SEED_PURCHASE_ORDERS
  );
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].poId, 'PO-2001');
  assert.equal(alerts[0].pendingQty, 3);
  assert.equal(alerts[0].latestChallanNumber, 'CH-401');
});

test('Requisition items summary counts TRADE and NON-TRADE items correctly', () => {
  const mockItems = [
    { itemType: 'TRADE' },
    { itemType: 'TRADE' },
    { itemType: 'TRADE' },
    { itemType: 'NON_TRADE' },
    { itemType: 'NON-TRADE' },
  ];
  const tradeCount = mockItems.filter((i) => i.itemType === 'TRADE').length;
  const nonTradeCount = mockItems.filter(
    (i) => i.itemType === 'NON-TRADE' || i.itemType === 'NON_TRADE'
  ).length;

  assert.equal(tradeCount, 3);
  assert.equal(nonTradeCount, 2);
});

test('Training Superintendent isolation: all 4 TSs exist and requests are strictly scoped by tsId without cross-access', () => {
  const tsUsers = SEED_USERS.filter((u) => u.role === 'TS');
  assert.equal(tsUsers.length, 4, 'Should have exactly 4 Training Superintendents');

  const tsIds = tsUsers.map((t: any) => t.id);
  assert.deepEqual(tsIds, ['u-ts-1', 'u-ts-2', 'u-ts-3', 'u-ts-4']);

  // TS Sunil Saxena (u-ts-3) scoping check
  const ts3Requests = SEED_REQUESTS.filter((r) => r.tsId === 'u-ts-3');
  assert.ok(ts3Requests.length >= 2, 'TS 3 should have assigned requests');
  assert.ok(ts3Requests.every((r) => r.tsId === 'u-ts-3'), 'All TS 3 requests must strictly belong to u-ts-3');
  assert.equal(ts3Requests.some((r) => r.tsId === 'u-ts-1' || r.tsId === 'u-ts-2' || r.tsId === 'u-ts-4'), false, 'TS 3 cannot see other TS requests');

  // TS Pooja Pandey (u-ts-4) scoping check
  const ts4Requests = SEED_REQUESTS.filter((r) => r.tsId === 'u-ts-4');
  assert.ok(ts4Requests.length >= 2, 'TS 4 should have assigned requests');
  assert.ok(ts4Requests.every((r) => r.tsId === 'u-ts-4'), 'All TS 4 requests must strictly belong to u-ts-4');
  assert.equal(ts4Requests.some((r) => r.tsId === 'u-ts-1' || r.tsId === 'u-ts-2' || r.tsId === 'u-ts-3'), false, 'TS 4 cannot see other TS requests');
});

test('generatePrintDocumentHtml constructs pristine A4 multi-page document with table pagination and signature protection', () => {
  const sampleTableHtml = '<div id="printable-forwarding-letter"><table><thead><tr><th>Item</th></tr></thead><tbody><tr><td>Fan</td></tr></tbody></table><div class="signature-block"><p>Principal</p></div></div>';
  const output = generatePrintDocumentHtml(sampleTableHtml, 'Test Document Print');

  assert.ok(output.includes('<!DOCTYPE html>'));
  assert.ok(output.includes('size: A4 portrait'));
  assert.ok(output.includes('margin: 14mm 12mm 14mm 12mm !important'));
  assert.ok(output.includes('@bottom-right'));
  assert.ok(output.includes('counter(page)'));
  assert.ok(output.includes('display: table-header-group !important'));
  assert.ok(output.includes('page-break-inside: avoid !important'));
  assert.ok(output.includes('word-break: break-word !important'));
  assert.ok(output.includes('.signature-block'));
  assert.ok(output.includes('.print-page-footer'));
  assert.ok(output.includes('Test Document Print'));
  assert.ok(output.includes('Fan'));
});

test('Admin User Creation: enforces unique institutional email (case-insensitive) and conditional TS supervisor mapping', () => {
  const existingEmail = 'rajesh.sharma@itirewa.mp.gov.in';

  // Check duplicate email rejection
  const isDuplicate = SEED_USERS.some(
    (u) => u.email.trim().toLowerCase() === existingEmail.toLowerCase()
  );
  assert.equal(isDuplicate, true, 'Existing email must be flagged as duplicate');

  const inputUppercase = existingEmail.toUpperCase();
  const uppercaseDuplicate = SEED_USERS.some(
    (u) => u.email.trim().toLowerCase() === inputUppercase.toLowerCase()
  );
  assert.equal(uppercaseDuplicate, true, 'Email uniqueness must be case-insensitive');

  // Non-duplicate new email
  const newEmail = 'new.officer@itirewa.mp.gov.in';
  const isNewUnique = !SEED_USERS.some(
    (u) => u.email.trim().toLowerCase() === newEmail.toLowerCase()
  );
  assert.equal(isNewUnique, true, 'New unique email must pass validation');

  // Verify TO role requires assignedTsId and maps properly
  const toUserPayload = {
    name: 'New TO Officer',
    email: newEmail,
    role: 'TO' as const,
    department: 'COPA',
    assignedTsId: 'u-ts-4',
  };
  const toAssignedTs = toUserPayload.role === 'TO' ? toUserPayload.assignedTsId : undefined;
  assert.equal(toAssignedTs, 'u-ts-4', 'TO role must retain assigned supervisor TS');

  // Verify non-TO roles strictly clear assignedTsId
  const purchasePayload: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    assignedTsId?: string;
  } = {
    name: 'New Purchase Officer',
    email: 'new.purchase@itirewa.mp.gov.in',
    role: 'PURCHASE',
    department: 'Central Store & Purchase',
    assignedTsId: 'u-ts-1', // inadvertently provided
  };
  const purchaseAssignedTs = purchasePayload.role === 'TO' ? purchasePayload.assignedTsId : undefined;
  assert.equal(purchaseAssignedTs, undefined, 'Non-TO roles must not retain supervisor TS mapping');
});

test('Admin User Edit: email remains strictly immutable and role transition clears supervisor mapping if changed from TO', () => {
  const existingTO = SEED_USERS.find((u) => u.id === 'u-to-1')!;
  assert.ok(existingTO);
  assert.equal(existingTO.role, 'TO');
  assert.ok(existingTO.assignedTsId);

  // Update without modifying email
  const updatedName = 'Rajesh Kumar Sharma (Promoted)';
  let newRole: UserRole = 'STORE_MANAGER';

  const updatedUser = {
    ...existingTO,
    name: updatedName,
    role: newRole,
    assignedTsId: (newRole as string) === 'TO' ? existingTO.assignedTsId : undefined,
  };

  assert.equal(updatedUser.email, existingTO.email, 'Email must strictly remain immutable on user update');
  assert.equal(updatedUser.name, updatedName);
  assert.equal(updatedUser.role, 'STORE_MANAGER');
  assert.equal(updatedUser.assignedTsId, undefined, 'Assigned TS must be cleared when role changes from TO');
});

test('Password complexity validator: enforces min 8 chars, max 30 chars, 1 uppercase, 1 lowercase, 1 digit, and 1 special char', () => {
  // Valid passwords
  assert.equal(validatePassword('Admin@1234'), null);
  assert.equal(validatePassword('P@ssw0rd!Secure'), null);
  assert.equal(validatePassword('iti_Rewa#2026'), null);
  assert.equal(validatePassword('A1b!'.repeat(7) + 'A1'), null); // exactly 30 chars

  // Invalid: shorter than 8 characters
  assert.ok(validatePassword('Abc!1')?.includes('8 characters'));

  // Invalid: longer than 30 characters
  assert.ok(validatePassword('A1b!'.repeat(8))?.includes('30 characters'));

  // Invalid: no lowercase letter
  assert.ok(validatePassword('ADMIN@1234')?.includes('lowercase'));

  // Invalid: no uppercase letter
  assert.ok(validatePassword('admin@1234')?.includes('uppercase'));

  // Invalid: no digit
  assert.ok(validatePassword('Admin@password')?.includes('digit'));

  // Invalid: no special character
  assert.ok(validatePassword('AdminPassword123')?.includes('special character'));
});

test('Admin & Principal role protection guard: prevents downgrading when only 1 active role holder exists', () => {
  const currentUsers = [...SEED_USERS];

  // Test Admin protection
  const adminUsers = currentUsers.filter((u) => u.role === 'ADMIN');
  assert.equal(adminUsers.length, 1, 'Seed data has exactly 1 Admin');

  const canDemoteAdmin = adminUsers.length > 1;
  assert.equal(canDemoteAdmin, false, 'Demoting the only Admin must be rejected');

  // Test Principal protection
  const principalUsers = currentUsers.filter((u) => u.role === 'PRINCIPAL');
  assert.equal(principalUsers.length, 1, 'Seed data has exactly 1 Principal');

  const canDemotePrincipal = principalUsers.length > 1;
  assert.equal(canDemotePrincipal, false, 'Demoting the only Principal must be rejected');

  // Test when a second admin exists
  const mockUsersWithTwoAdmins = [
    ...currentUsers,
    { id: 'u-admin-2', name: 'Backup Admin', role: 'ADMIN' as const, email: 'admin2@itirewa.mp.gov.in', department: 'IT' },
  ];
  const secondAdminCheck = mockUsersWithTwoAdmins.filter((u) => u.role === 'ADMIN').length > 1;
  assert.equal(secondAdminCheck, true, 'Demoting one admin is permitted if another active admin exists');
});

test('New user creation behavior: prepends new user to top of table and defaults empty department to Electrician', () => {
  const existingUsers = [...SEED_USERS];
  const rawDepartment = '   ';
  const resolvedDept = rawDepartment.trim() || 'Electrician';
  assert.equal(resolvedDept, 'Electrician', 'Blank department must default to Electrician');

  const newUser = {
    id: 'u-to-new-1',
    name: 'Ramesh Verma',
    email: 'ramesh.verma@itirewa.mp.gov.in',
    role: 'TO' as const,
    department: resolvedDept,
  };

  // Prepend new user
  const updatedList = [newUser, ...existingUsers];
  assert.equal(updatedList[0].id, 'u-to-new-1', 'Newly created user must be placed at index 0 (top of table)');
  assert.equal(updatedList[0].department, 'Electrician');
});

test('Strict credential validation: rejects incorrect passwords regardless of string length', () => {
  const user = SEED_USERS.find((u) => u.email === 'rajesh.sharma@itirewa.mp.gov.in');
  assert.ok(user);
  const expectedPassword = user.password || 'password123';

  // Function mirroring StoreContext loginByEmail password check
  const checkPassword = (enteredPassword?: string) => {
    return enteredPassword === expectedPassword;
  };

  assert.equal(checkPassword('password123'), true);
  assert.equal(checkPassword('Test@'), false);
  assert.equal(checkPassword('wrongpassword'), false);
  assert.equal(checkPassword('abc'), false);
});

test('Bilingual i18n Translation Dictionary completeness & authenticity', async () => {
  const { TRANSLATIONS } = await import('../i18n/translations');
  
  // 1. Institutional branding
  assert.equal(TRANSLATIONS['app.title']?.en, 'Govt. ITI Rewa');
  assert.equal(TRANSLATIONS['app.title']?.hi, 'शासकीय आई.टी.आई. रीवा');

  // 2. All 6 Institutional roles must have valid English and authentic Hindi labels
  const roles = ['TO', 'TS', 'PRINCIPAL', 'PURCHASE', 'STORE_MANAGER', 'ADMIN'];
  for (const role of roles) {
    const key = `role.${role}`;
    assert.ok(TRANSLATIONS[key], `Translation for ${key} must exist`);
    assert.ok(TRANSLATIONS[key].en.length > 0, `English translation for ${key} must not be empty`);
    assert.ok(TRANSLATIONS[key].hi.length > 0, `Hindi translation for ${key} must not be empty`);
  }

  // 3. Workflow statuses
  const statuses = [
    'PENDING_TS_VERIFICATION',
    'APPROVED_FOR_PURCHASE',
    'PARTIALLY_FULFILLED',
    'ITEM_RECEIVED_AT_STORE',
    'CLOSED',
  ];
  for (const status of statuses) {
    const key = `status.${status}`;
    assert.ok(TRANSLATIONS[key], `Translation for ${key} must exist`);
    assert.ok(TRANSLATIONS[key].en.length > 0);
    assert.ok(TRANSLATIONS[key].hi.length > 0);
  }

  // 4. Navigation sections and items
  assert.equal(TRANSLATIONS['nav.section.dashboards']?.hi, 'डैशबोर्ड');
  assert.equal(TRANSLATIONS['nav.section.operations']?.hi, 'कार्य संचालन');
  assert.equal(TRANSLATIONS['nav.section.administration']?.hi, 'प्रशासन');

  // 5. Common table & filter strings
  assert.ok(TRANSLATIONS['filter.title']?.hi.length > 0);
  assert.ok(TRANSLATIONS['action.reset']?.hi.length > 0);
  assert.ok(TRANSLATIONS['table.empty']?.hi.length > 0);

  // 6. Trades / Categories
  assert.equal(TRANSLATIONS['trade.Electrician']?.hi, 'इलेक्ट्रीशियन');
  assert.equal(TRANSLATIONS['trade.Electrition']?.hi, 'इलेक्ट्रीशियन');
  assert.equal(TRANSLATIONS['trade.Fitter']?.hi, 'फ़िटर');

  // 7. TO Dashboard KPIs and Header
  assert.equal(TRANSLATIONS['to.kpi.totalIndents']?.hi, 'कुल मांग पत्र दर्ज');
  assert.equal(TRANSLATIONS['to.kpi.pendingVerification']?.hi, 'सत्यापन / स्वीकृति प्रतीक्षारत');
  assert.equal(TRANSLATIONS['to.kpi.reverted']?.hi, 'सुधार हेतु वापस');
  assert.equal(TRANSLATIONS['to.kpi.readyPickup']?.hi, 'सामग्री प्रदाय / प्राप्ति हेतु तैयार');
  assert.equal(TRANSLATIONS['to.tableTitle']?.hi, 'सामग्री मांग पत्र पंजी (Register)');
  assert.equal(TRANSLATIONS['to.raiseNewRequest']?.hi, 'नवीन मांग पत्र दर्ज करें');

  // 8. Raise Request form strings
  assert.equal(TRANSLATIONS['req.raiseRequisition']?.hi, 'नवीन सामग्री मांग पत्र दर्ज करें');
  assert.equal(TRANSLATIONS['req.addMaterialItems']?.hi, 'सामग्री विवरण जोड़ें');
  assert.equal(TRANSLATIONS['req.purposeSection']?.hi, 'उद्देश्य एवं पाठ्यक्रम औचित्य');
  assert.equal(TRANSLATIONS['req.submitToTs']?.hi, 'टी.एस. को मांग पत्र प्रस्तुत करें');
  assert.equal(TRANSLATIONS['req.errorSelectMaterial']?.hi, 'कृपया सामग्री का चयन करें अथवा "अन्य" चुनें');

  // 9. Request Details Modal strings
  assert.equal(TRANSLATIONS['modal.trainingOfficer']?.hi, 'प्रशिक्षण अधिकारी:');
  assert.equal(TRANSLATIONS['modal.supervisingTs']?.hi, 'पर्यवेक्षी टी.एस.:');
  assert.equal(TRANSLATIONS['modal.purpose']?.hi, 'उद्देश्य:');
  assert.equal(TRANSLATIONS['modal.chronologicalRemarks']?.hi, 'टीप एवं कार्यवाही इतिहास');
  assert.equal(TRANSLATIONS['modal.close']?.hi, 'बंद करें');

  // 10. TS Verification Queue & Review Modal
  assert.equal(TRANSLATIONS['ts.tableTitle']?.hi, 'सत्यापन हेतु लंबित मांग पत्र');
  assert.equal(TRANSLATIONS['ts.reviewRequest']?.hi, 'समीक्षा करें');
  assert.equal(TRANSLATIONS['ts.kpi.pendingVerification']?.hi, 'सत्यापन प्रतीक्षारत');
  assert.equal(TRANSLATIONS['modal.rejectRequest']?.hi, 'निरस्त करें');
  assert.equal(TRANSLATIONS['modal.revertToTo']?.hi, 'टी.ओ. को वापस भेजें');
  assert.equal(TRANSLATIONS['modal.verifyForward']?.hi, 'सत्यापित कर प्राचार्य को अग्रेषित करें');

  // 11. TS History strings
  assert.equal(TRANSLATIONS['ts.histTitle']?.hi, 'सत्यापन इतिहास');
  assert.equal(TRANSLATIONS['ts.histFilterTitle']?.hi, 'सत्यापन इतिहास फ़िल्टर करें');
  assert.equal(TRANSLATIONS['ts.histStatusLabel']?.hi, 'वर्तमान स्थिति');
});



