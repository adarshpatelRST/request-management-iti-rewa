export type Language = 'en' | 'hi';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // Institutional Header & Branding
  'app.title': {
    en: 'Govt. ITI Rewa',
    hi: 'शासकीय आई.टी.आई. रीवा',
  },
  'app.subtitle': {
    en: 'Material Requisition & Procurement System',
    hi: 'सामग्री मांग एवं क्रय प्रबंधन प्रणाली',
  },
  'app.department': {
    en: 'Directorate of Skill Development, Madhya Pradesh',
    hi: 'कौशल विकास संचालनालय, मध्य प्रदेश शासन',
  },

  // Roles
  'role.TO': {
    en: 'Training Officer (TO)',
    hi: 'प्रशिक्षण अधिकारी (TO)',
  },
  'role.TS': {
    en: 'Training Superintendent (TS)',
    hi: 'प्रशिक्षण अधीक्षक (TS)',
  },
  'role.PRINCIPAL': {
    en: 'Principal',
    hi: 'प्राचार्य (Principal)',
  },
  'role.PURCHASE': {
    en: 'Purchase Officer',
    hi: 'प्रभारी क्रय शाखा (Purchase Officer)',
  },
  'role.STORE_MANAGER': {
    en: 'Store Manager',
    hi: 'भंडारपाल (Store Manager)',
  },
  'role.ADMIN': {
    en: 'System Admin',
    hi: 'सिस्टम प्रशासक (System Admin)',
  },

  // Navigation Sections
  'nav.section.dashboards': {
    en: 'DASHBOARDS',
    hi: 'डैशबोर्ड',
  },
  'nav.section.operations': {
    en: 'OPERATIONS',
    hi: 'कार्य संचालन',
  },
  'nav.section.administration': {
    en: 'ADMINISTRATION',
    hi: 'प्रशासन',
  },
  'nav.section.requisition': {
    en: 'REQUISITION & INDENTS',
    hi: 'सामग्री मांग पत्र',
  },
  'nav.section.verification': {
    en: 'SUPERVISORY VERIFICATION',
    hi: 'पर्यवेक्षी सत्यापन',
  },
  'nav.section.approvals': {
    en: 'SANCTION & APPROVALS',
    hi: 'स्वीकृति एवं अनुमोदन',
  },
  'nav.section.procurement': {
    en: 'PROCUREMENT & PO',
    hi: 'क्रय एवं आदेश',
  },
  'nav.section.inventory': {
    en: 'INVENTORY & STORE',
    hi: 'भंडार एवं स्टॉक',
  },

  // Navigation Links
  'nav.dashboard': {
    en: 'Analytics Dashboard',
    hi: 'डैशबोर्ड एवं एनालिटिक्स',
  },
  'nav.to.dashboard': {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
  },
  'nav.to.raise': {
    en: 'Raise Request',
    hi: 'मांग पत्र दर्ज करें',
  },
  'nav.to.myRequests': {
    en: 'My Indent History',
    hi: 'मेरे मांग पत्र (इतिहास)',
  },
  'nav.ts.dashboard': {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
  },
  'nav.ts.queue': {
    en: 'Verification Queue',
    hi: 'तकनीकी सत्यापन कतार',
  },
  'nav.ts.history': {
    en: 'Verification History',
    hi: 'सत्यापन इतिहास',
  },
  'nav.principal.dashboard': {
    en: 'Analytics Dashboard',
    hi: 'एनालिटिक्स डैशबोर्ड',
  },
  'nav.principal.approvals': {
    en: 'Approval Queue',
    hi: 'स्वीकृति कतार',
  },
  'nav.principal.requests': {
    en: 'All Requests',
    hi: 'समस्त मांग पत्र',
  },
  'nav.principal.store': {
    en: 'Institute Store & Pipeline',
    hi: 'संस्था भंडार एवं क्रय स्थिति',
  },
  'nav.purchase.approved': {
    en: 'Approved Requests & Print',
    hi: 'स्वीकृत मांग पत्र एवं प्रिंट',
  },
  'nav.purchase.orders': {
    en: 'Purchase Orders',
    hi: 'क्रय आदेश',
  },
  'nav.store.dashboard': {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
  },
  'nav.store.receiving': {
    en: 'Inward Receiving',
    hi: 'सामग्री आवक दर्ज करें',
  },
  'nav.store.issues': {
    en: 'Direct Store Issues',
    hi: 'भंडार सामग्री प्रदाय',
  },
  'nav.store.directIssue': {
    en: 'Direct Store Issue',
    hi: 'भंडार से सामग्री प्रदाय',
  },
  'nav.store.inventory': {
    en: 'Inventory Ledger',
    hi: 'भंडार स्टॉक पंजी (Ledger)',
  },
  'nav.admin.dashboard': {
    en: 'Analytics Dashboard',
    hi: 'एनालिटिक्स डैशबोर्ड',
  },
  'nav.admin.catalog': {
    en: 'Master Product Catalog',
    hi: 'मास्टर सामग्री सूची',
  },
  'nav.admin.users': {
    en: 'Users & Hierarchy Mapping',
    hi: 'उपयोगकर्ता एवं पदानुक्रम',
  },
  'nav.admin.audit': {
    en: 'Audit Trails',
    hi: 'ऑडिट लॉग्स',
  },

  // Top Bar & Notifications
  'header.notifications': {
    en: 'Notifications',
    hi: 'अधिसूचनाएं',
  },
  'header.noNotifications': {
    en: 'No unread notifications',
    hi: 'कोई अपठित अधिसूचना नहीं है',
  },
  'header.markAllRead': {
    en: 'Mark all as read',
    hi: 'सभी को पढ़ा हुआ चिह्नित करें',
  },
  'header.new': {
    en: 'new',
    hi: 'नई',
  },
  'header.logout': {
    en: 'Logout',
    hi: 'लॉग आउट',
  },
  'header.languageToggle': {
    en: 'हिन्दी',
    hi: 'English',
  },

  // Common Actions & Buttons
  'action.save': {
    en: 'Save',
    hi: 'सुरक्षित करें',
  },
  'action.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
  },
  'action.confirm': {
    en: 'Confirm',
    hi: 'पुष्टि करें',
  },
  'action.edit': {
    en: 'Edit',
    hi: 'संपादित करें',
  },
  'action.delete': {
    en: 'Delete',
    hi: 'हटाएं',
  },
  'action.submit': {
    en: 'Submit',
    hi: 'प्रस्तुत करें',
  },
  'action.print': {
    en: 'Print',
    hi: 'प्रिंट करें',
  },
  'action.view': {
    en: 'View Details',
    hi: 'विवरण देखें',
  },
  'action.back': {
    en: 'Back',
    hi: 'वापस जाएं',
  },
  'action.reset': {
    en: 'Reset Filters',
    hi: 'फ़िल्टर रीसेट करें',
  },
  'action.search': {
    en: 'Search',
    hi: 'खोजें',
  },
  'action.export': {
    en: 'Export',
    hi: 'निर्यात करें',
  },
  'action.refresh': {
    en: 'Refresh',
    hi: 'ताज़ा करें',
  },
  'action.close': {
    en: 'Close',
    hi: 'बंद करें',
  },

  // Table Column Headers
  'col.sno': {
    en: 'S.No.',
    hi: 'क्र.सं.',
  },
  'col.reqId': {
    en: 'Requisition ID',
    hi: 'मांग पत्र क्रमांक',
  },
  'col.poId': {
    en: 'Purchase Order ID',
    hi: 'क्रय आदेश क्रमांक',
  },
  'col.itemCode': {
    en: 'Item Code',
    hi: 'सामग्री कोड',
  },
  'col.itemName': {
    en: 'Item Name',
    hi: 'सामग्री का नाम',
  },
  'col.specs': {
    en: 'Technical Specifications',
    hi: 'तकनीकी विशिष्टताएं',
  },
  'col.qty': {
    en: 'Quantity (Unit)',
    hi: 'मात्रा (इकाई)',
  },
  'col.unit': {
    en: 'Unit',
    hi: 'इकाई',
  },
  'col.category': {
    en: 'Category / Trade',
    hi: 'श्रेणी / व्यवसाय',
  },
  'col.department': {
    en: 'Department / Trade',
    hi: 'विभाग / व्यवसाय',
  },
  'col.officer': {
    en: 'Requesting Officer',
    hi: 'मांगकर्ता अधिकारी',
  },
  'col.supervisor': {
    en: 'Assigned Supervisor (TS)',
    hi: 'पर्यवेक्षक (प्रशिक्षण अधीक्षक)',
  },
  'col.status': {
    en: 'Status',
    hi: 'स्थिति',
  },
  'col.date': {
    en: 'Date',
    hi: 'दिनांक',
  },
  'col.timestamp': {
    en: 'Timestamp',
    hi: 'समय एवं दिनांक',
  },
  'col.actions': {
    en: 'Actions',
    hi: 'कार्यवाही',
  },
  'col.performedBy': {
    en: 'Performed By',
    hi: 'कर्ता / अधिकारी',
  },
  'col.summary': {
    en: 'Action Summary',
    hi: 'कार्यवाही विवरण',
  },
  'col.recordId': {
    en: 'Record ID',
    hi: 'अभिलेख क्रमांक',
  },

  // Filter Bar
  'filter.title': {
    en: 'Filter & Search Records',
    hi: 'रिकॉर्ड खोजें एवं फ़िल्टर करें',
  },
  'filter.searchKeyword': {
    en: 'Search Keyword',
    hi: 'खोज शब्द',
  },
  'filter.searchPlaceholder': {
    en: 'Search records...',
    hi: 'रिकॉर्ड खोजें...',
  },
  'filter.category': {
    en: 'Category / Trade',
    hi: 'श्रेणी / व्यवसाय',
  },
  'filter.status': {
    en: 'Status',
    hi: 'स्थिति',
  },
  'filter.allCategories': {
    en: 'All Categories / Trades',
    hi: 'सभी श्रेणियां / व्यवसाय',
  },
  'filter.allStatuses': {
    en: 'All Statuses',
    hi: 'सभी स्थितियां',
  },
  'filter.activeOnly': {
    en: 'Active Only',
    hi: 'केवल सक्रिय',
  },
  'filter.inactiveOnly': {
    en: 'Inactive Only',
    hi: 'केवल निष्क्रिय',
  },

  // Pagination & DataTable
  'table.showing': {
    en: 'Showing',
    hi: 'प्रदर्शित',
  },
  'table.to': {
    en: 'to',
    hi: 'से',
  },
  'table.of': {
    en: 'of',
    hi: 'कुल',
  },
  'table.records': {
    en: 'records',
    hi: 'रिकॉर्ड',
  },
  'table.page': {
    en: 'Page',
    hi: 'पृष्ठ',
  },
  'table.jumpTo': {
    en: 'Jump to page',
    hi: 'पृष्ठ संख्या',
  },
  'table.previous': {
    en: 'Previous',
    hi: 'पिछला',
  },
  'table.next': {
    en: 'Next',
    hi: 'अगला',
  },
  'table.empty': {
    en: 'No matching institutional records found.',
    hi: 'कोई संबंधित शासकीय अभिलेख प्राप्त नहीं हुआ।',
  },

  // Status Badges
  'status.PENDING_TS_VERIFICATION': {
    en: 'Pending TS Verification',
    hi: 'टी.एस. सत्यापन प्रतीक्षारत',
  },
  'status.REVERTED_BY_TS': {
    en: 'Reverted by TS',
    hi: 'टी.एस. द्वारा सुधार हेतु वापस',
  },
  'status.REJECTED_BY_TS': {
    en: 'Rejected by TS',
    hi: 'टी.एस. द्वारा निरस्त',
  },
  'status.REJECTED_BY_PRINCIPAL': {
    en: 'Rejected by Principal',
    hi: 'प्राचार्य द्वारा निरस्त',
  },
  'status.PENDING_PRINCIPAL_APPROVAL': {
    en: 'Pending Principal Approval',
    hi: 'प्राचार्य स्वीकृति प्रतीक्षारत',
  },
  'status.APPROVED_FOR_STORE': {
    en: 'Approved for Store Issue',
    hi: 'भंडार प्रदाय हेतु स्वीकृत',
  },
  'status.APPROVED_FOR_PURCHASE': {
    en: 'Approved for Purchase',
    hi: 'क्रय हेतु स्वीकृत (अनुमोदित)',
  },
  'status.PRINTED_AWAITING_AVAK_JAVAK': {
    en: 'Printed • Awaiting Avak/Javak',
    hi: 'पत्र प्रिंट • आवक/जावक प्रतीक्षारत',
  },
  'status.AWAITING_AVAK_JAVAK': {
    en: 'Awaiting Avak/Javak',
    hi: 'आवक/जावक क्रमांक प्रतीक्षारत',
  },
  'status.PURCHASE_IN_PROGRESS': {
    en: 'Purchase In Progress',
    hi: 'क्रय प्रक्रियाधीन',
  },
  'status.PARTIALLY_FULFILLED': {
    en: 'Partially Fulfilled',
    hi: 'आंशिक सामग्री प्राप्त',
  },
  'status.PARTIALLY_RECEIVED': {
    en: 'Partially Received',
    hi: 'आंशिक चालान प्राप्त',
  },
  'status.ITEM_RECEIVED_AT_STORE': {
    en: 'Material Delivered (Ready)',
    hi: 'सामग्री भंडार में प्राप्त (सत्यापित)',
  },
  'status.CLOSED': {
    en: 'Closed & Verified',
    hi: 'पूर्णतः संपन्न एवं संचित',
  },
  'status.ORDER_PLACED_AWAITING_DELIVERY': {
    en: 'Order Placed • Awaiting Delivery',
    hi: 'आदेश जारी • सामग्री प्रदाय प्रतीक्षारत',
  },
  'status.ACTIVE': {
    en: 'Active',
    hi: 'सक्रिय',
  },
  'status.INACTIVE': {
    en: 'Inactive',
    hi: 'निष्क्रिय',
  },

  // Item Types
  'itemType.TRADE': {
    en: 'Trade Syllabus Material',
    hi: 'पाठ्यक्रम सामग्री (Trade)',
  },
  'itemType.NON_TRADE': {
    en: 'Special Workshop / Non-Trade',
    hi: 'विशेष / गैर-ट्रेड सामग्री',
  },

  // Audit Actions
  'audit.CREATE_REQUEST_COPY': {
    en: 'Requisition Indent Created',
    hi: 'नवीन मांग पत्र दर्ज',
  },
  'audit.TS_VERIFICATION_COPY': {
    en: 'TS Verified Indent',
    hi: 'टी.एस. सत्यापन प्रति',
  },
  'audit.PRINCIPAL_APPROVAL_COPY': {
    en: 'Principal Sanctioned',
    hi: 'प्राचार्य स्वीकृति प्रति',
  },
  'audit.PRINT_FORWARD_LETTER_COPY': {
    en: 'Forwarding Letter Printed',
    hi: 'अग्रसारण पत्र प्रिंट प्रति',
  },
  'audit.GENERATE_ORDER_AVAK_JAVAK_COPY': {
    en: 'Avak/Javak PO Created',
    hi: 'आवक/जावक क्रय आदेश प्रति',
  },
  'audit.STORE_CHALLAN_RECEIPT_COPY': {
    en: 'Store Challan Inward',
    hi: 'भंडार चालान आवक प्रति',
  },
  'audit.DIRECT_STORE_ISSUE_COPY': {
    en: 'Direct Store Issue',
    hi: 'भंडार सीधी सामग्री प्रदाय प्रति',
  },
  'audit.STORE_DIRECT_ISSUE_COPY': {
    en: 'Direct Store Issue',
    hi: 'भंडार सीधी सामग्री प्रदाय प्रति',
  },
  'audit.TO_REQUEST_COPY': {
    en: 'TO Requisition Copy',
    hi: 'प्रशिक्षण अधिकारी मांग पत्र प्रति',
  },
  'audit.TO_RECEIPT_CONFIRMATION_COPY': {
    en: 'TO Receipt Verified',
    hi: 'प्रशिक्षण अधिकारी प्राप्ति सत्यापन',
  },
  'audit.ADMIN_CONFIG_CHANGE': {
    en: 'Admin Configuration Updated',
    hi: 'सिस्टम प्रशासक विन्यास अद्यतन',
  },

  // Institutional Footer
  'footer.text': {
    en: '© 2026 Government Industrial Training Institute (ITI), Rewa (M.P.) | Store & Procurement Workflow',
    hi: '© 2026 शासकीय औद्योगिक प्रशिक्षण संस्था (आई.टी.आई.), रीवा (म.प्र.) | भंडार एवं क्रय कार्यप्रणाली',
  },

  // Trades / Categories
  'trade.Electrician': {
    en: 'Electrician',
    hi: 'इलेक्ट्रीशियन',
  },
  'trade.Electrition': {
    en: 'Electrician',
    hi: 'इलेक्ट्रीशियन',
  },
  'trade.Fitter': {
    en: 'Fitter',
    hi: 'फ़िटर',
  },
  'trade.Welder': {
    en: 'Welder',
    hi: 'वेल्डर',
  },
  'trade.Electronics': {
    en: 'Electronics',
    hi: 'इलेक्ट्रॉनिक्स',
  },
  'trade.COPA': {
    en: 'COPA',
    hi: 'कोपा (COPA)',
  },
  'trade.Electrical & Mechanical Wing': {
    en: 'Electrical & Mechanical Wing',
    hi: 'विद्युत एवं यांत्रिकी शाखा',
  },
  'trade.Electronics Wing': {
    en: 'Electronics Wing',
    hi: 'इलेक्ट्रॉनिक्स शाखा',
  },
  'trade.Automobile & Welding Wing': {
    en: 'Automobile & Welding Wing',
    hi: 'ऑटोमोबाइल एवं वेल्डिंग शाखा',
  },
  'trade.IT & Computer Wing': {
    en: 'IT & Computer Wing',
    hi: 'आईटी एवं कंप्यूटर शाखा',
  },
  'trade.Administration': {
    en: 'Administration',
    hi: 'प्रशासन',
  },
  'trade.Purchase Cell': {
    en: 'Purchase Cell',
    hi: 'क्रय शाखा',
  },
  'trade.Central Store': {
    en: 'Central Store',
    hi: 'केंद्रीय भंडार',
  },
  'trade.IT & Governance': {
    en: 'IT & Governance',
    hi: 'आईटी एवं सुशासन',
  },

  // TO Dashboard Greetings & Subtitle
  'to.welcome': {
    en: 'Welcome, {name}',
    hi: 'स्वागत है, {name}',
  },
  'to.deptInfo': {
    en: 'Department: {trade} Trade | Supervising TS: {tsName}',
    hi: 'विभाग: {trade} व्यवसाय | पर्यवेक्षी टी.एस.: {tsName}',
  },
  'to.raiseNewRequest': {
    en: 'Raise New Request',
    hi: 'नवीन मांग पत्र दर्ज करें',
  },

  // TO Dashboard KPIs
  'to.kpi.totalIndents': {
    en: 'Total Indents Raised',
    hi: 'कुल मांग पत्र दर्ज',
  },
  'to.kpi.tradeRequisitions': {
    en: '{trade} Trade Requisitions',
    hi: '{trade} ट्रेड मांग पत्र',
  },
  'to.kpi.pendingVerification': {
    en: 'Pending Verification / Approval',
    hi: 'सत्यापन / स्वीकृति प्रतीक्षारत',
  },
  'to.kpi.withTsOrPrincipal': {
    en: 'With TS or Principal Desk',
    hi: 'टी.एस. अथवा प्राचार्य पटल पर',
  },
  'to.kpi.reverted': {
    en: 'Reverted (Action Needed)',
    hi: 'सुधार हेतु वापस',
  },
  'to.kpi.zeroReverts': {
    en: 'Zero pending reverts',
    hi: 'कोई सुधार लंबित नहीं',
  },
  'to.kpi.requiresEdit': {
    en: 'Requires Edit & Resubmit',
    hi: 'संशोधन एवं पुनः प्रस्तुति आवश्यक',
  },
  'to.kpi.readyPickup': {
    en: 'Ready for Pickup / Handover',
    hi: 'सामग्री प्रदाय / प्राप्ति हेतु तैयार',
  },
  'to.kpi.noHandovers': {
    en: 'No pending handovers',
    hi: 'कोई प्रदाय लंबित नहीं',
  },
  'to.kpi.collectConfirm': {
    en: 'Collect & Confirm Receipt',
    hi: 'प्राप्ति एवं पावती पुष्टि करें',
  },

  // Workflow Status Dropdown Option Labels
  'status.ALL': {
    en: 'All Statuses ({count})',
    hi: 'सभी स्थितियां ({count})',
  },
  'status.REVERTED_ACTION_NEEDED': {
    en: 'Reverted by TS (Action Needed)',
    hi: 'टी.एस. द्वारा सुधार हेतु वापस',
  },
  'status.PRINTED_AWAITING_PO_DISPATCH': {
    en: 'Printed • Awaiting PO Dispatch',
    hi: 'पत्र प्रिंट • आवक/जावक प्रतीक्षारत',
  },
  'status.MATERIAL_DELIVERED_READY': {
    en: 'Material Delivered (Ready for Pickup)',
    hi: 'सामग्री भंडार में प्राप्त (तैयार)',
  },
  'status.CLOSED_CONFIRMED': {
    en: 'Closed & Confirmed',
    hi: 'पूर्णतः संपन्न एवं संचित',
  },

  // Table Columns & Actions
  'to.tableTitle': {
    en: 'Material Requisitions & Indents Register',
    hi: 'सामग्री मांग पत्र पंजी (Register)',
  },
  'col.requestId': {
    en: 'Request ID',
    hi: 'मांग पत्र क्रमांक',
  },
  'col.requestedMaterials': {
    en: 'Requested Materials',
    hi: 'मांगी गई सामग्री',
  },
  'col.purposeJustification': {
    en: 'Purpose / Syllabus Justification',
    hi: 'उद्देश्य / पाठ्यक्रम औचित्य',
  },
  'col.currentStatus': {
    en: 'Current Status',
    hi: 'वर्तमान स्थिति',
  },
  'col.latestRemark': {
    en: 'Latest Remark',
    hi: 'नवीनतम टीप',
  },
  'action.editResubmit': {
    en: 'Edit & Resubmit',
    hi: 'संपादित करें',
  },
  'action.confirmReceipt': {
    en: 'Confirm Receipt',
    hi: 'प्राप्ति पुष्टि करें',
  },
  'action.confirmPhysicalReceipt': {
    en: 'Confirm Physical Receipt',
    hi: 'भौतिक प्राप्ति पुष्टि करें',
  },

  // Raise Request Page (TORaiseRequestPage)
  'req.newMaterialIndent': {
    en: 'NEW MATERIAL INDENT',
    hi: 'नवीन सामग्री मांग',
  },
  'req.raiseRequisition': {
    en: 'Raise Material Requisition',
    hi: 'नवीन सामग्री मांग पत्र दर्ज करें',
  },
  'req.editRequisition': {
    en: 'Edit & Resubmit Requisition — {id}',
    hi: 'मांग पत्र संशोधन एवं पुनः प्रस्तुति — {id}',
  },
  'req.createSubtitle': {
    en: 'Create a Trade or Non-Trade material indent for workshop practicals or institutional events.',
    hi: 'कार्यशाला प्रायोगिक प्रशिक्षण अथवा संस्थागत गतिविधियों हेतु मांग पत्र तैयार करें।',
  },
  'req.editSubtitle': {
    en: 'Update quantities, specifications, or syllabus justification as requested by your Training Superintendent.',
    hi: 'प्रशिक्षण अधीक्षक के निर्देशानुसार मात्रा, विशिष्टताएं या प्रायोगिक औचित्य अद्यतन करें।',
  },
  'req.backToDashboard': {
    en: 'Back to Dashboard',
    hi: 'डैशबोर्ड पर वापस जाएं',
  },
  'req.addMaterialItems': {
    en: 'Add Material Items',
    hi: 'सामग्री विवरण जोड़ें',
  },
  'req.addMaterialItem': {
    en: 'Add Material Item',
    hi: 'सामग्री विवरण दर्ज करें',
  },
  'req.editMaterialItem': {
    en: 'Edit Material Item',
    hi: 'सामग्री विवरण संपादित करें',
  },
  'req.cancelEdit': {
    en: 'Cancel Edit',
    hi: 'संपादन रद्द करें',
  },
  'req.selectMaterialItem': {
    en: 'Select Material Item',
    hi: 'सामग्री का चयन करें',
  },
  'req.chooseItemPlaceholder': {
    en: '— Choose Item or Other —',
    hi: '— सामग्री चुनें अथवा अन्य दर्ज करें —',
  },
  'req.searchMaterialPlaceholder': {
    en: 'Search material name, code, or trade...',
    hi: 'सामग्री नाम, कोड या ट्रेड खोजें...',
  },
  'req.otherItemLabel': {
    en: 'Other (Non-Trade / Ad-hoc Item)',
    hi: 'अन्य (गैर-ट्रेड / विशेष आवश्यकता सामग्री)',
  },
  'req.otherItemSubLabel': {
    en: 'Custom requirement not listed in institutional catalog',
    hi: 'संस्थागत सूची से पृथक विशेष आवश्यकता',
  },
  'req.customName': {
    en: 'Specify Custom Name',
    hi: 'विशेष सामग्री का नाम दर्ज करें',
  },
  'req.customUnit': {
    en: 'Unit',
    hi: 'इकाई',
  },
  'req.quantity': {
    en: 'Quantity',
    hi: 'मात्रा',
  },
  'req.specsOptional': {
    en: 'Specifications (Optional)',
    hi: 'तकनीकी विशिष्टताएं (वैकल्पिक)',
  },
  'req.specsPlaceholder': {
    en: 'e.g. 20W 6500K Cool Daylight',
    hi: 'उदा. 20W 6500K कूल डेलाइट',
  },
  'req.addItem': {
    en: 'Add Item',
    hi: 'सामग्री जोड़ें',
  },
  'req.updateItem': {
    en: 'Update',
    hi: 'अद्यतन करें',
  },
  'req.previewTitle': {
    en: 'Requisition Items Preview',
    hi: 'मांग पत्र सामग्री पूर्वावलोकन',
  },
  'req.noMaterials': {
    en: 'No materials added to this requisition yet.',
    hi: 'अभी तक कोई सामग्री नहीं जोड़ी गई है।',
  },
  'req.noMaterialsSub': {
    en: 'Select an item in the form above and click "+ Add Item" to include it.',
    hi: 'कृपया ऊपर दिए गए फॉर्म से सामग्री चुनकर "+ सामग्री जोड़ें" पर क्लिक करें।',
  },
  'req.previewColName': {
    en: 'Item Name & Type',
    hi: 'सामग्री का नाम एवं प्रकार',
  },
  'req.previewColTrade': {
    en: 'Category / Trade',
    hi: 'श्रेणी / व्यवसाय',
  },
  'req.previewColQty': {
    en: 'Quantity',
    hi: 'मात्रा',
  },
  'req.previewColSpecs': {
    en: 'Technical Specifications',
    hi: 'तकनीकी विशिष्टताएं',
  },
  'req.purposeSection': {
    en: 'Purpose & Syllabus Justification',
    hi: 'उद्देश्य एवं पाठ्यक्रम औचित्य',
  },
  'req.purposeSectionSub': {
    en: 'Provide justification for TS technical verification and Principal sanction',
    hi: 'टी.एस. तकनीकी सत्यापन एवं प्राचार्य अनुमोदन हेतु औचित्य विवरण प्रदान करें',
  },
  'req.purposeLabel': {
    en: 'Purpose / Practical Justification',
    hi: 'प्रायोगिक प्रशिक्षण औचित्य / उद्देश्य',
  },
  'req.purposePlaceholder': {
    en: 'Specify NCVT practical exercise number, trainee batch size, or institutional event details (min 10 characters)...',
    hi: 'NCVT प्रायोगिक अभ्यास क्रमांक, प्रशिक्षणार्थी बैच संख्या, अथवा संस्थागत विवरण दर्ज करें (न्यूनतम 10 अक्षर)...',
  },
  'req.noteLabel': {
    en: 'Forwarding Note to Training Superintendent (Optional)',
    hi: 'प्रशिक्षण अधीक्षक को अग्रेषण टीप (वैकल्पिक)',
  },
  'req.notePlaceholder': {
    en: 'Optional note for your Supervising TS regarding urgency or lab bay allocation...',
    hi: 'आवश्यकता की प्राथमिकता या कार्यशाला आवंटन संबंध में टी.एस. हेतु वैकल्पिक टीप...',
  },
  'req.submitToTs': {
    en: 'Submit Requisition to TS',
    hi: 'टी.एस. को मांग पत्र प्रस्तुत करें',
  },
  'req.resubmit': {
    en: 'Resubmit',
    hi: 'पुनः प्रस्तुत करें',
  },
  'req.errorSelectMaterial': {
    en: 'Please select a catalog material or choose "Other"',
    hi: 'कृपया सामग्री का चयन करें अथवा "अन्य" चुनें',
  },
  'req.errorCustomName': {
    en: 'Custom item name cannot be empty',
    hi: 'विशेष सामग्री का नाम रिक्त नहीं हो सकता',
  },
  'req.errorQuantityMin': {
    en: 'Quantity must be at least 1',
    hi: 'मात्रा कम से कम 1 होनी चाहिए',
  },

  // Common Table Columns
  'col.verificationAction': {
    en: 'VERIFICATION ACTION',
    hi: 'सत्यापन कार्यवाही',
  },
  'col.trainingOfficer': {
    en: 'Training Officer',
    hi: 'प्रशिक्षण अधिकारी',
  },
  'col.departmentTrade': {
    en: 'Department / Trade',
    hi: 'विभाग / व्यवसाय',
  },
  'col.details': {
    en: 'Details',
    hi: 'विवरण',
  },

  // Request Details Modal & TS Review Modal
  'modal.trainingOfficer': {
    en: 'Training Officer:',
    hi: 'प्रशिक्षण अधिकारी:',
  },
  'modal.supervisingTs': {
    en: 'Supervising TS:',
    hi: 'पर्यवेक्षी टी.एस.:',
  },
  'modal.purpose': {
    en: 'Purpose:',
    hi: 'उद्देश्य:',
  },
  'modal.deptTrade': {
    en: 'Department / Trade:',
    hi: 'विभाग / व्यवसाय:',
  },
  'modal.requestedItems': {
    en: 'Requested Material Items ({count} Line Items)',
    hi: 'मांगी गई सामग्री ({count} मद)',
  },
  'modal.singleRequestedItem': {
    en: 'Requested Material Items (1 Line Item)',
    hi: 'मांगी गई सामग्री (1 मद)',
  },
  'modal.chronologicalRemarks': {
    en: 'Chronological Remarks History',
    hi: 'टीप एवं कार्यवाही इतिहास',
  },
  'modal.noRemarks': {
    en: 'No remarks recorded yet.',
    hi: 'अभी तक कोई टीप दर्ज नहीं है।',
  },
  'modal.close': {
    en: 'Close',
    hi: 'बंद करें',
  },
  'modal.tsReviewTitle': {
    en: 'TS Verification Review — {id}',
    hi: 'टी.एस. सत्यापन समीक्षा — {id}',
  },
  'modal.tsRemarksLabel': {
    en: 'Training Superintendent (TS) Verification Remarks',
    hi: 'प्रशिक्षण अधीक्षक (टी.एस.) सत्यापन टीप',
  },
  'modal.tsRemarksPlaceholder': {
    en: 'Enter technical verification notes (Optional for Verify, Mandatory for Revert to TO or Reject)...',
    hi: 'तकनीकी सत्यापन टीप दर्ज करें (सत्यापन हेतु वैकल्पिक, टी.ओ. को वापसी अथवा निरस्त करने हेतु अनिवार्य)...',
  },
  'modal.rejectRequest': {
    en: 'Reject Request',
    hi: 'निरस्त करें',
  },
  'modal.revertToTo': {
    en: 'Revert to TO',
    hi: 'टी.ओ. को वापस भेजें',
  },
  'modal.verifyForward': {
    en: 'Verify & Forward to Principal',
    hi: 'सत्यापित कर प्राचार्य को अग्रेषित करें',
  },
  'modal.tsRemarksRequiredRevert': {
    en: 'TS Remarks are required when reverting a request back to the TO.',
    hi: 'टी.ओ. को मांग पत्र वापस करने हेतु टी.एस. टीप दर्ज करना अनिवार्य है।',
  },
  'modal.tsRemarksRequiredReject': {
    en: 'TS Remarks are required when rejecting a request.',
    hi: 'मांग पत्र निरस्त करने हेतु टी.एस. टीप दर्ज करना अनिवार्य है।',
  },

  // TS Verification Queue & Dashboard
  'ts.badge': {
    en: 'TRAINING SUPERINTENDENT • {wing}',
    hi: 'प्रशिक्षण अधीक्षक • {wing}',
  },
  'ts.dashboardTitle': {
    en: 'TS Dashboard — {name}',
    hi: 'टी.एस. डैशबोर्ड — {name}',
  },
  'ts.queueTitle': {
    en: 'TS Requisition Verification Queue',
    hi: 'टी.एस. मांग पत्र सत्यापन कतार',
  },
  'ts.supervisingTos': {
    en: 'Supervising Training Officers: {list}',
    hi: 'पर्यवेक्षित प्रशिक्षण अधिकारी: {list}',
  },
  'ts.assignedWing': {
    en: 'Assigned Wing',
    hi: 'आवंटित शाखा',
  },
  'ts.viewHistory': {
    en: 'View Verification History',
    hi: 'सत्यापन इतिहास देखें',
  },
  'ts.kpi.pendingVerification': {
    en: 'Pending My Verification',
    hi: 'सत्यापन प्रतीक्षारत',
  },
  'ts.kpi.pendingVerificationSub': {
    en: 'Awaiting technical review & forwarding',
    hi: 'तकनीकी समीक्षा एवं अग्रेषण प्रतीक्षारत',
  },
  'ts.kpi.verifiedForwarded': {
    en: 'Verified & Forwarded',
    hi: 'सत्यापित एवं अग्रेषित',
  },
  'ts.kpi.verifiedForwardedSub': {
    en: 'Sent to Principal Sanction Desk',
    hi: 'प्राचार्य स्वीकृति पटल पर प्रेषित',
  },
  'ts.kpi.revertedToTo': {
    en: 'Reverted to TO',
    hi: 'टी.ओ. को वापस',
  },
  'ts.kpi.revertedToToSub': {
    en: 'Returned for specification clarification',
    hi: 'विशिष्टता स्पष्टीकरण हेतु वापस',
  },
  'ts.tableTitle': {
    en: 'Requisitions Pending TS Verification',
    hi: 'सत्यापन हेतु लंबित मांग पत्र',
  },
  'ts.emptyQueue': {
    en: 'All requisitions from your supervised Training Officers have been verified!',
    hi: 'आपके पर्यवेक्षित प्रशिक्षण अधिकारियों के समस्त मांग पत्र सत्यापित किए जा चुके हैं!',
  },
  'ts.reviewRequest': {
    en: 'Review Request',
    hi: 'समीक्षा करें',
  },

  // TS History Page
  'ts.histBadge': {
    en: 'TS VERIFICATION ARCHIVE • {wing}',
    hi: 'टी.एस. सत्यापन अभिलेख • {wing}',
  },
  'ts.histTitle': {
    en: 'Verification History',
    hi: 'सत्यापन इतिहास',
  },
  'ts.histSubtitle': {
    en: 'Complete register of requisitions verified, reverted, or rejected by {name}',
    hi: '{name} द्वारा सत्यापित, वापस अथवा निरस्त मांग पत्रों की संपूर्ण पंजी',
  },
  'ts.histFilterTitle': {
    en: 'Filter Verification History',
    hi: 'सत्यापन इतिहास फ़िल्टर करें',
  },
  'ts.histSearchLabel': {
    en: 'Search Req ID / TO / Item',
    hi: 'मांग पत्र क्र. / अधिकारी / सामग्री खोजें',
  },
  'ts.histSearchPlaceholder': {
    en: 'Search REQ-1003, REQ-1005, Rajesh Sharma...',
    hi: 'मांग पत्र क्र., अधिकारी का नाम खोजें...',
  },
  'ts.histStatusLabel': {
    en: 'Current Workflow Status',
    hi: 'वर्तमान स्थिति',
  },
  'ts.histAllActed': {
    en: 'All Acted Statuses ({count})',
    hi: 'सभी प्रसंस्कृत स्थितियां ({count})',
  },
  'ts.histPendingPrincipal': {
    en: 'Pending Principal Approval',
    hi: 'प्राचार्य स्वीकृति प्रतीक्षारत',
  },
  'ts.histPendingPrincipalSub': {
    en: 'Verified & forwarded to Principal',
    hi: 'सत्यापित एवं प्राचार्य को अग्रेषित',
  },
  'ts.histRevertedByTs': {
    en: 'Reverted by TS',
    hi: 'टी.एस. द्वारा सुधार हेतु वापस',
  },
  'ts.histRevertedByTsSub': {
    en: 'Returned to TO for modification',
    hi: 'संशोधन हेतु टी.ओ. को वापस',
  },
  'ts.histRejectedByTs': {
    en: 'Rejected by TS',
    hi: 'टी.एस. द्वारा निरस्त',
  },
  'ts.histRejectedByTsSub': {
    en: 'Technical justification declined',
    hi: 'तकनीकी औचित्य अमान्य',
  },
  'ts.histRejectedByPrincipal': {
    en: 'Rejected by Principal',
    hi: 'प्राचार्य द्वारा निरस्त',
  },
  'ts.histRejectedByPrincipalSub': {
    en: 'Declined at sanction stage',
    hi: 'स्वीकृति स्तर पर अस्वीकृत',
  },
  'ts.histApprovedStore': {
    en: 'Approved for Store',
    hi: 'भंडार प्रदाय हेतु स्वीकृत',
  },
  'ts.histApprovedStoreSub': {
    en: 'Sanctioned for stock issue',
    hi: 'स्टॉक प्रदाय हेतु स्वीकृत',
  },
  'ts.histApprovedPurchase': {
    en: 'Approved for Purchase',
    hi: 'क्रय हेतु स्वीकृत (अनुमोदित)',
  },
  'ts.histApprovedPurchaseSub': {
    en: 'Sanctioned for market procurement',
    hi: 'बाजार क्रय हेतु स्वीकृत',
  },
  'ts.histReceivedStore': {
    en: 'Received at Store',
    hi: 'भंडार में प्राप्त',
  },
  'ts.histReceivedStoreSub': {
    en: 'Goods received in Central Store',
    hi: 'केंद्रीय भंडार में सामग्री प्राप्त',
  },
  'ts.histClosed': {
    en: 'Closed',
    hi: 'पूर्णतः संपन्न',
  },
  'ts.histClosedSub': {
    en: 'Workflow completed',
    hi: 'कार्यप्रणाली पूर्ण',
  },
  'ts.colActionRemark': {
    en: 'TS Action Remark',
    hi: 'टी.एस. कार्यवाही टीप',
  },
  'ts.emptyHistory': {
    en: 'No historical verification records match your filters.',
    hi: 'फ़िल्टर के अनुसार कोई सत्यापन अभिलेख प्राप्त नहीं हुआ।',
  },

  // Purchase Dashboard
  'purchase.dashBadge': {
    en: 'PURCHASE CELL COMMAND CENTER',
    hi: 'क्रय शाखा कमान केंद्र',
  },
  'purchase.dashTitle': {
    en: 'Purchase Section — Consolidation & Procurement Dashboard',
    hi: 'क्रय शाखा — समेकन एवं अधिप्राप्ति डैशबोर्ड',
  },
  'purchase.dashSubtitle': {
    en: 'Batch Principal-approved indents into consolidated Hindi/English forwarding letters, record offline Avak/Javak dispatch numbers, and track vendor POs.',
    hi: 'प्राचार्य स्वीकृत मांग पत्रों को समेकित हिंदी/अंग्रेजी अग्रसारण पत्रों में संयोजित करें, ऑफलाइन आवक/जावक प्रेषण क्रमांक दर्ज करें एवं क्रय आदेशों को ट्रैक करें।',
  },
  'purchase.btnApprovedPrint': {
    en: 'Approved Requests & Print ({count})',
    hi: 'स्वीकृत मांग पत्र एवं प्रिंट ({count})',
  },
  'purchase.btnManagePOs': {
    en: 'Manage Purchase Orders ({count})',
    hi: 'क्रय आदेश प्रबंधन ({count})',
  },
  'purchase.kpi.awaitingConsolidation': {
    en: 'Awaiting Consolidation & Print',
    hi: 'समेकन एवं प्रिंट प्रतीक्षारत',
  },
  'purchase.kpi.awaitingConsolidationSub': {
    en: 'Principal-sanctioned requisitions ready for batching',
    hi: 'समेकन हेतु तैयार प्राचार्य स्वीकृत मांग पत्र',
  },
  'purchase.kpi.consolidateAndPrint': {
    en: 'Consolidate & Print',
    hi: 'समेकित करें एवं प्रिंट',
  },
  'purchase.kpi.printedAwaitingAvak': {
    en: 'Printed (Awaiting Avak/Javak)',
    hi: 'प्रिंटेड (आवक/जावक प्रतीक्षारत)',
  },
  'purchase.kpi.printedAwaitingAvakSub': {
    en: 'Offline inward/outward dispatch stamp required',
    hi: 'ऑफलाइन आवक/जावक प्रेषण मुहर अनिवार्य',
  },
  'purchase.kpi.recordAvakJavak': {
    en: 'Record Avak/Javak',
    hi: 'आवक/जावक दर्ज करें',
  },
  'purchase.kpi.purchaseInProgress': {
    en: 'Purchase in Progress',
    hi: 'क्रय प्रक्रिया जारी',
  },
  'purchase.kpi.purchaseInProgressSub': {
    en: 'Dispatched via GeM / Tender / Direct Purchase',
    hi: 'GeM / निविदा / सीधे क्रय द्वारा प्रेषित',
  },
  'purchase.kpi.trackOrders': {
    en: 'Track Orders',
    hi: 'आदेश ट्रैक करें',
  },
  'purchase.kpi.completedOrders': {
    en: 'Completed Orders',
    hi: 'पूर्ण क्रय आदेश',
  },
  'purchase.kpi.completedOrdersSub': {
    en: '100% vendor challans received at Central Store',
    hi: 'केंद्रीय भंडार में 100% चालान प्राप्त',
  },
  'purchase.kpi.viewPoRegister': {
    en: 'View PO Register',
    hi: 'क्रय आदेश पंजी देखें',
  },
  'purchase.table1.title': {
    en: 'Requisitions Awaiting Consolidation & Official Print',
    hi: 'समेकन एवं शासकीय प्रिंट प्रतीक्षारत मांग पत्र',
  },
  'purchase.table1.subtitle': {
    en: 'Principal-approved indents ready to be batched into a single Hindi/English forwarding letter',
    hi: 'एकल हिंदी/अंग्रेजी अग्रसारण पत्र में समेकित होने हेतु तैयार मांग पत्र',
  },
  'purchase.table1.openBtn': {
    en: 'Open Consolidation & Print Queue',
    hi: 'समेकन एवं प्रिंट कतार खोलें',
  },
  'purchase.table1.emptyTitle': {
    en: 'No Requisitions Awaiting Print',
    hi: 'प्रिंट हेतु कोई मांग पत्र प्रतीक्षारत नहीं',
  },
  'purchase.table1.emptyDesc': {
    en: 'All Principal-approved requisitions have already been consolidated and printed.',
    hi: 'प्राचार्य द्वारा स्वीकृत समस्त मांग पत्र समेकित एवं प्रिंट किए जा चुके हैं।',
  },
  'purchase.table2.title': {
    en: 'Purchase Orders & Offline Avak/Javak Register',
    hi: 'क्रय आदेश एवं ऑफलाइन आवक/जावक पंजी',
  },
  'purchase.table2.subtitle': {
    en: 'Printed batches awaiting Avak/Javak number and active purchase orders in progress',
    hi: 'आवक/जावक क्रमांक प्रतीक्षारत प्रिंटेड बैच एवं प्रगतिरत क्रय आदेश',
  },
  'purchase.table2.goToBtn': {
    en: 'Go to Purchase Orders',
    hi: 'क्रय आदेश पर जाएं',
  },
  'purchase.table2.emptyTitle': {
    en: 'No Purchase Orders Created Yet',
    hi: 'अभी तक कोई क्रय आदेश नहीं बना है',
  },
  'purchase.table2.emptyDesc': {
    en: 'Consolidate and print approved requisitions to generate a purchase order batch.',
    hi: 'क्रय आदेश बैच जनरेट करने हेतु स्वीकृत मांग पत्रों को समेकित व प्रिंट करें।',
  },

  // Login Page
  'login.title': {
    en: 'Govt. ITI Rewa',
    hi: 'शासकीय आई.टी.आई. रीवा',
  },
  'login.subtitle': {
    en: 'Material Procurement & Requisition Portal',
    hi: 'सामग्री अधिप्राप्ति एवं मांग पत्र पोर्टल',
  },
  'login.officialEmail': {
    en: 'Official Email',
    hi: 'शासकीय ईमेल',
  },
  'login.password': {
    en: 'Password',
    hi: 'पासवर्ड',
  },
  'login.signIn': {
    en: 'Sign In',
    hi: 'साइन इन करें',
  },
  'login.emailRequired': {
    en: 'Email is required',
    hi: 'ईमेल दर्ज करना अनिवार्य है',
  },
  'login.emailInvalid': {
    en: 'Please enter a valid email',
    hi: 'कृपया वैध ईमेल दर्ज करें',
  },
  'login.passwordRequired': {
    en: 'Password is required',
    hi: 'पासवर्ड दर्ज करना अनिवार्य है',
  },
  'login.credentialsMismatch': {
    en: 'Credentials mismatch',
    hi: 'गलत ईमेल अथवा पासवर्ड',
  },
  'login.securityNote': {
    en: 'Protected by Institutional Security & Role-Based Access Control',
    hi: 'संस्थागत सुरक्षा एवं भूमिका आधारित पहुंच नियंत्रण (RBAC) द्वारा सुरक्षित',
  },
  'login.demoWorkbench': {
    en: 'Interactive Evaluation Workbench',
    hi: 'इंटरैक्टिव मूल्यांकन कार्यमंच',
  },
  'login.demoTitle': {
    en: 'Demo Role Quick-Login (1-Click Access)',
    hi: 'डेमो भूमिका त्वरित-लॉगिन (1-क्लिक एक्सेस)',
  },
  'login.demoSubtitle': {
    en: 'Select any institutional officer below to immediately inspect their role-specific queues and pre-seeded workflow scenarios.',
    hi: 'संबंधित अधिकारी की कतारों एवं कार्यप्रणाली परिदृश्यों की समीक्षा हेतु नीचे किसी भी संस्थागत अधिकारी का चयन करें।',
  },
  'login.resetSeed': {
    en: 'Reset Demo Seed Data',
    hi: 'डेमो डेटा रीसेट करें',
  },

  // Speech-to-Text / Voice Typing
  'speech.start': {
    en: 'Voice typing (Click to speak)',
    hi: 'आवाज़ से लिखें (बोलने हेतु क्लिक करें)',
  },
  'speech.listening': {
    en: 'Listening... (Click to stop)',
    hi: 'सुन रहे हैं... (रोकने हेतु क्लिक करें)',
  },
  'speech.notAllowed': {
    en: 'Microphone permission denied. Please allow microphone access in your browser settings.',
    hi: 'माइक्रोफ़ोन की अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति प्रदान करें।',
  },
  'speech.noSpeech': {
    en: 'No speech detected. Please speak clearly into your microphone.',
    hi: 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक्रोफ़ोन के समीप स्पष्ट बोलें।',
  },
};
