# MASTER BUILD SPECIFICATION — PART 3 OF 3
## Implementing Purchase Team, Store Manager & Admin Modules (Final Assembly)

### CONTEXT & CONTINUATION
We are completing the **Govt. ITI Rewa — Store & Material Procurement Management System** built in Parts 1 & 2.
- Connect all remaining routes for **Purchase Team**, **Store Manager**, and **Admin** into `StoreContext` and `AppShell`.
- Ensure every action updates `localStorage`, triggers `sonner` toasts, and writes immutable before/after JSON snapshots to `auditLogs`.

---

### 1. PURCHASE TEAM SCREENS
Sidebar items for `PURCHASE`: `Dashboard`, `Approved Requests & Print`, `Purchase Orders`. *(NO Store/Inventory sidebar item for Purchase).*

1. **Purchase Dashboard (`/purchase/dashboard`):**
   - KPI Cards: `Awaiting Consolidation & Print`, `Printed (Awaiting Avak/Javak)`, `Purchase in Progress`, `Completed Orders`.
   - Quick summary tables of pending batches and active POs.

2. **Approved Requests & Print Screen (`/purchase/approved`):**
   - Displays all requests with status `APPROVED_FOR_PURCHASE` in a `DataTable` with row checkboxes (**all rows selected by default** so Purchase can consolidate in one click, while still allowing selective batching).
   - **Primary Toolbar Action:** **"Print Consolidated Official Letter"** button (enabled when >= 1 request is selected).
   - **Hybrid Hindi/English Official Print Letter Modal (`@media print` ready):**
     - Add `@media print` CSS so clicking **Print Document (`window.print()`)** hides all app chrome/modals/buttons and prints only the clean A4 institutional letter.
     - **Top Header (Hindi):**
       - `कार्यालय प्राचार्य, शासकीय औद्योगिक प्रशिक्षण संस्था (ITI), रीवा (म.प्र.)`
       - `पत्र क्रमांक / आवक-जावक: ____________________` | `दिनांक: {Today's Date}`
       - `प्रति,` / `प्राचार्य,` / `औद्योगिक प्रशिक्षण संस्था, रीवा (म.प्र.)`
       - `विषय :- सामग्री प्रदाय किए जाने बाबत।`
       - `महोदय, विषयान्तर्गत निवेदन है कि संस्था के विभिन्न प्रशिक्षण व्यवसायों (Trades) में प्रायोगिक प्रशिक्षण कार्य सुचारू रूप से संचालित करने हेतु निम्नलिखित सामग्रियों की आवश्यकता है, जिनका विवरण निम्नानुसार है:-`
     - **Body — Two Consolidated Tables (English):**
       - **Table 1: `1. Trade Order Items (Approved Catalog Material)`** — Automatically consolidates/sums quantities of identical `TRADE` items across selected requests (e.g., `REQ-1002` + `REQ-1007` sums `Industrial Exhaust Fan 18"` to `6 Nos`). Columns: `S.No.`, `Item Code`, `Item Description`, `Trade / Dept.`, `Consolidated Qty`, `Unit`, `Source Req IDs`.
       - **Table 2: `2. Non-Trade Order Items (Special / Ad-hoc Requirement)`** — Rendered whenever any `NON_TRADE` ("Other") items exist in the selected batch. Columns: `S.No.`, `Item Description`, `Purpose / Justification`, `Trade / Dept.`, `Consolidated Qty`, `Unit`, `Source Req IDs`.
     - **Bottom Closing & Signature Block (Hindi):**
       - `अतः महोदय से निवेदन है कि उपरोक्त सामग्री क्रय/प्रदाय करने की स्वीकृति प्रदान करने की कृपा करें।`
       - Right-aligned: `भवदीय` / `____________________` / `क्रय प्रभारी / भंडार अधिकारी, शासकीय औद्योगिक प्रशिक्षण संस्था, रीवा`.
     - **Modal Action Buttons:**
       1. **`Print Letter (window.print)`**
       2. **`Confirm Printed & Move to Order Generation`** -> Creates a new `PurchaseOrder` (`PO-xxxx`) with status `AWAITING_AVAK_JAVAK`, updates the bundled requests to `PRINTED_AWAITING_AVAK_JAVAK`, logs `PRINT_FORWARD_LETTER_COPY` in Audit Logs, and navigates to `/purchase/orders`.

3. **Purchase Orders Screen (`/purchase/orders`):**
   - **Section 1 — Awaiting Offline Avak/Javak Entry (`AWAITING_AVAK_JAVAK`):**
     - Table of printed batches waiting for physical signature & dispatch registry number.
     - **"Enter Avak/Javak & Generate Order"** button opens a validated modal:
       - **Avak / Javak Number** (Required text input, e.g., `ITI/REWA/2026/AVK-505`)
       - **Procurement Mode** (Dropdown: `Direct Purchase` | `GeM Portal` | `Tender`)
       - **Tender / GeM Reference No.** (Optional text input)
       - Submitting moves PO status to `PURCHASE_IN_PROGRESS`, updates linked requests to `PURCHASE_IN_PROGRESS`, logs `GENERATE_ORDER_AVAK_JAVAK_COPY` in Audit Logs, and notifies Store Manager.
   - **Section 2 — Active & Completed Purchase Orders (`PURCHASE_IN_PROGRESS` / `COMPLETED`):**
     - `DataTable` showing `PO ID`, `Avak/Javak No.`, `Procurement Mode`, `Items Fulfillment Pill` (e.g., `5 / 8 Received · 3 Pending`), `Challan Count`, and `StatusBadge`.

---

### 2. STORE MANAGER SCREENS
Sidebar items for `STORE_MANAGER`: `Dashboard`, `Inward Receiving`, `Direct Store Issues`, `Store / Inventory`.

1. **Store Manager Dashboard (`/store/dashboard`):**
   - KPI Cards: `Total Catalog SKUs`, `Low Stock Alerts`, `Active POs Awaiting Delivery`, `Pending Direct Store Issues`.

2. **Inward Receiving Screen (`/store/receiving` — Vendor Challan & FIFO Allocation):**
   - `DataTable` of `PURCHASE_IN_PROGRESS` Purchase Orders.
   - **"Log Vendor Challan"** button opens the Inward Receiving Modal:
     - **Challan Number** (Required input, e.g., `CH-402`) + **Delivery Date**.
     - **Items Table:** Shows `Item Name`, `Type (Trade/Non-Trade)`, `Total Ordered`, `Previously Received`, `Balance Expected`, and an editable numeric input **`Actual Received Now`** (`0 <= qty <= Balance Expected`).
     - **Live FIFO Allocation Preview:** Sort all source TO requests containing that item by **`createdAt` ascending (Oldest First)**. Display a real-time preview showing which TO request(s) will receive units from this delivery!
     - **On Save (`Confirm Challan Receipt`):**
       - For `TRADE` items: Increment `catalogItem.currentStock` by `Actual Received Now`. *(For `NON_TRADE` items, do NOT add to permanent catalog stock, only allocate to the requesting TO).*
       - Allocate received units to the linked TO requests strictly in **FIFO (`createdAt` oldest first)** order:
         - Update `lineItem.allocatedQty`.
         - If all line items in a TO request have `allocatedQty >= requestedQty`: set request status to `ITEM_RECEIVED_AT_STORE` and push an unread notification to that TO: *"Your order for {Req ID} has been received at Store (Challan {Challan No.}). Kindly collect your order from store."*
         - If a TO request only received partial units (`0 < allocatedQty < requestedQty`): set request status to `PARTIALLY_FULFILLED` (awaiting next challan).
       - Update PO's `receivedQty` and append the challan record. If all PO items are 100% received, set PO status to `COMPLETED`; otherwise keep PO status as `PURCHASE_IN_PROGRESS`.
       - Log `STORE_CHALLAN_RECEIPT_COPY` in Audit Logs.

3. **Direct Store Issues Screen (`/store/issues` — `Send to Store` Requests):**
   - `DataTable` of requests with status `APPROVED_FOR_STORE`.
   - **"Issue Stock to TO"** modal:
     - Shows `Requested Qty`, `Current Store Stock`, editable **`Issued Qty Now`**, and `Store Issue Note`.
     - Confirming deducts `Issued Qty Now` from `catalogItem.currentStock`, updates request status to `ITEM_RECEIVED_AT_STORE` (or `PARTIALLY_FULFILLED` if partial), notifies the TO for pickup, and logs `DIRECT_STORE_ISSUE_COPY`.

4. **Store / Inventory Ledger (`/store/inventory`):**
   - `ModuleFilterBar` (Search item/code, Category/Trade filter, Low Stock toggle) + `DataTable` of `catalogItems` with **`+ Add / Adjust Stock`** modal for manual opening/adjustment entries.

---

### 3. ADMIN SCREENS
Sidebar items for `ADMIN`: `Analytics Dashboard`, `Store / Inventory` (Read-Only), `Master Product Catalog`, `Users & Hierarchy Mapping`, `Audit Trails`.

1. **Admin Analytics Dashboard (`/admin/dashboard`):**
   - Reuses the Principal's KPI & Recharts suite PLUS an **Operational Turnaround & Partial Delivery Watchlist** card highlighting open `PARTIALLY_FULFILLED` indents and catalog usage.
2. **Store / Inventory (`/admin/store`):** Read-only stock ledger view.
3. **Master Product Catalog (`/admin/catalog`):**
   - `DataTable` of `catalogItems` + **"Add / Edit Trade Item"** modal (`Item Code`, `Item Name`, `Category/Trade`, `Unit`, `Initial Stock`, `Min Threshold`, `Active` switch) so Admin can add new dropdown items live during the demo.
4. **Users & TO-to-TS Hierarchy Mapping (`/admin/users`):**
   - `DataTable` of all institutional users showing Role, Department, and Assigned Supervisor (`TS`).
   - Allows Admin to reassign which **Training Superintendent (`TS`)** a **Training Officer (`TO`)** reports to via dropdown, updating `localStorage` and logging to Audit Logs.
5. **Audit Trails (`/admin/audit-logs`):**
   - Full `AuditLogsPage` with `ModuleFilterBar` (Search Record ID/Action/User, Audit Document Stage dropdown, Status filter), `DataTable`, and the **Side-by-Side JSON Diff Modal (`OLD DATA` vs `NEW DATA`)**.

---

### FINAL VERIFICATION CHECKLIST
1. Verify all 6 roles can log in via the Login page's 1-click Demo Cards, execute their actions, log out, and see updated state in the next role immediately.
2. Verify **"Reset Demo Seed Data"** restores all 8 scenarios cleanly.
3. Verify zero TypeScript or runtime errors.