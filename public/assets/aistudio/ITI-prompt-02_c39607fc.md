# MASTER BUILD SPECIFICATION — PART 2 OF 3
## Implementing Training Officer (TO), Training Superintendent (TS) & Principal Modules

### CONTEXT & CONTINUATION
We are continuing the **Govt. ITI Rewa — Store & Material Procurement Management System** built in Part 1.
- Reuse the exact `StoreContext`, `AppShell`, `PageHeader`, `DataTable` (with integer-only page input pagination), `ModuleFilterBar`, `FormFields`, `StatusBadge`, `appendAuditLog`, and `sonner` toasts from Part 1.
- Every state change MUST update `localStorage` via `StoreContext` and append an immutable `AuditLogEntry` with `oldData` and `newData` JSON snapshots.

---

### 1. TRAINING OFFICER (TO) SCREENS
Sidebar items for `TO`: `Dashboard`, `Raise Request`, `My Requests`. *(Remember: NO Store/Inventory sidebar item for TO).*

1. **TO Dashboard (`/to/dashboard`):**
   - 4 KPI Cards: `Total Indents Raised`, `Pending Verification / Approval`, `Reverted (Action Needed)`, `Ready for Pickup at Store`.
   - Recent Requests `DataTable` (latest 5 indents) + quick button **"Raise New Request"**.

2. **Raise Request Screen (`/to/raise-request`):**
   - Department/Trade auto-populated from logged-in TO (read-only).
   - Dynamic Line-Item Builder (`+ Add Material Item` / remove row):
     - **Item Dropdown:** Lists all active `catalogItems` from `StoreContext` (showing `Item Name (Unit)`) PLUS a final option: **`Other (Non-Trade / Ad-hoc Item)`**.
     - **Conditional Custom Input:** When `"Other"` is selected, reveal a required text input *"Specify Custom Item Name"* (e.g., *Tea & Biscuits for Workshop*) and tag the line item as `NON_TRADE` (amber badge). Catalog items are auto-tagged as `TRADE` (indigo badge).
     - **Quantity:** Required positive integer (`>= 1`).
   - **Purpose / Practical Justification:** Required textarea (`min 10 chars`).
   - On Submit: Creates `REQ-xxxx` with status `PENDING_TS_VERIFICATION`, assigns `tsId` from user's `assignedTsId`, logs `TO_REQUEST_COPY` in Audit Logs, triggers `toast.success`, and redirects to `/to/requests`.

3. **My Requests Screen (`/to/requests`):**
   - `ModuleFilterBar` (Search by Req ID/Item, Status filter, Reset).
   - `DataTable` showing `Req ID`, `Created Date`, `Items & Type Badges`, `Current Status`, `Latest Remark`, and `Actions`:
     - **If `REVERTED_BY_TS`:** Button **"Edit & Resubmit"** -> opens modal pre-filled with existing items & purpose so TO can edit quantities/items/purpose and resubmit back to `PENDING_TS_VERIFICATION` (logging `TO_REQUEST_COPY` diff).
     - **If `ITEM_RECEIVED_AT_STORE`:** Prominent green button **"Confirm Receipt & Close"** -> marks request & line items as `CLOSED`, logs `TO_REQUEST_COPY` closure diff, and shows `toast.success("Request marked as received and closed")`.
     - **View Details Modal:** Shows full item fulfillment progress (`allocatedQty / requestedQty`) and complete chronological `remarksHistory`.

---

### 2. TRAINING SUPERINTENDENT (TS) SCREENS
Sidebar items for `TS`: `Dashboard`, `Verification Queue`, `Verification History`. *(NO Store/Inventory sidebar item for TS).*

1. **TS Dashboard & Verification Queue (`/ts/dashboard` & `/ts/queue`):**
   - Scoped strictly to requests where `request.tsId === currentUser.id`.
   - KPI Cards: `Pending My Verification`, `Verified & Forwarded`, `Reverted to TO`.
   - `DataTable` of `PENDING_TS_VERIFICATION` requests with **"Review Request"** button.
   - **Verification Review Modal:**
     - Displays TO Name, Department, Purpose, and requested items (`TRADE` / `NON_TRADE` badges + quantities).
     - **TS Remarks** textarea (required for Revert/Reject, optional for Verify).
     - **3 Action Buttons:**
       1. **Verify & Forward to Principal** -> Status becomes `PENDING_PRINCIPAL_APPROVAL`.
       2. **Revert to TO** -> Requires remarks; status becomes `REVERTED_BY_TS` and notifies TO.
       3. **Reject Request** -> Requires remarks; status becomes `REJECTED_BY_TS`.
     - All 3 actions log `TS_VERIFICATION_COPY` with `oldData`/`newData` JSON snapshots.

2. **Verification History (`/ts/history`):**
   - `ModuleFilterBar` + `DataTable` showing all requests already acted upon by this TS.

---

### 3. PRINCIPAL SCREENS
Sidebar items for `PRINCIPAL`: `Analytics Dashboard`, `Approval Queue`, `Store / Inventory` (Read-Only), `All Requests`.

1. **Principal Analytics Dashboard (`/principal/dashboard`):**
   - 4 Institutional KPI Cards:
     1. `Total Material Indents` (total requests count)
     2. `Pending My Approval` (count in `PENDING_PRINCIPAL_APPROVAL`)
     3. `Active Purchase Pipeline` (`PURCHASE_IN_PROGRESS` count + pending units)
     4. `Fulfillment Completion Rate` (% of requests in `CLOSED` or `ITEM_RECEIVED_AT_STORE`)
   - **3 Recharts Visualizations** inside clean white cards:
     1. **AreaChart / LineChart:** *Monthly Material Indent & Closure Trend* (6-month institutional trend).
     2. **BarChart:** *Department / Trade-Wise Demand* (*Electrician*, *Fitter*, *Electronics*, *General* — Fulfilled vs. Pending).
     3. **PieChart (Donut):** *Procurement Routing & Classification Split* (`Sent to Purchase` vs `Sent to Store` vs `Rejected`, plus summary pills for `Trade` vs `Non-Trade` item counts).

2. **Principal Approval Queue (`/principal/approvals`):**
   - `DataTable` of `PENDING_PRINCIPAL_APPROVAL` requests showing TO, Department, TS Verifier Remarks, Items, and **"Review & Approve"** action.
   - **Principal Approval & Routing Modal (CRITICAL FEATURES):**
     - **Live Store Stock Visibility:** Next to every requested line item, display a live badge pulling current stock from `catalogItems`: e.g., `Requested: 2 Rolls | Store Stock: 18 Rolls Available` (emerald if sufficient, rose if `Store Stock < Requested`).
     - **Pending Pipeline Deviation Alert:** Check if any requested `catalogItemId` already has unfulfilled units (`orderedQty - receivedQty > 0`) inside an active `PURCHASE_IN_PROGRESS` order. If yes (for example on `REQ-1006` requesting `LED Tube Light 20W`), display a prominent amber/indigo alert banner:
       *"Pipeline Deviation Notice: 3 units of LED Tube Light 20W from PO-2001 (Challan CH-401 partial delivery) are already awaiting balance vendor delivery."*
     - **Principal Remarks** input.
     - **Decision Controls:**
       - Radio / Toggle: **Approve Request** vs. **Reject / Discard**.
       - When **Approve Request** is selected, display the required **Routing Destination Dropdown** with two options:
         1. **`Send to Store (Direct Issue from Available Stock)`** -> Sets status to `APPROVED_FOR_STORE`, `routingDestination: "STORE"`.
         2. **`Send to Purchase (Procure & Print Official Letter)`** -> Sets status to `APPROVED_FOR_PURCHASE`, `routingDestination: "PURCHASE"`.
       - Logs `PRINCIPAL_APPROVAL_COPY` in Audit Logs and fires `sonner` toast.

3. **Principal Store / Inventory View (`/principal/store`) & All Requests (`/principal/requests`):**
   - Read-only `DataTable` of `catalogItems` (no stock edit buttons) and read-only master tracker of all `requests`.

Build Part 2 completely and verify all routes and interactions work seamlessly with `StoreContext`. When done, confirm readiness for Part 3.