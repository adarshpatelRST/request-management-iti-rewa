# MASTER BUILD SPECIFICATION — PART 1 OF 3
## Project: Govt. ITI Rewa — Store & Material Procurement Management System (Frontend Demo)

### IMPORTANT EXECUTION CONTEXT (MULTI-PART BUILD)
You are building a complete, production-grade React + TypeScript frontend demo application in **3 sequential parts**.
- **THIS IS PART 1 OF 3:** You must build the project foundation, educational institutional design system, all reusable common UI primitives, the complete `localStorage` state store with 8 pre-seeded demo scenarios, the immutable JSON-diff Audit Logger, the Login screen (with 1-click Demo Role cards + Reset Demo Data), and the AppShell layout with role-based navigation.
- **COMING IN PART 2:** Training Officer (TO), Training Superintendent (TS), and Principal screens (including live stock badges, duplicate/pending pipeline deviation alerts, and Analytics Dashboard).
- **COMING IN PART 3:** Purchase Team screens (consolidated batching, hybrid Hindi/English A4 printable forwarding letter with `@media print`, Avak/Javak order generation), Store Manager screens (Inward Challan receiving with FIFO allocation + Direct Store Issues), and Admin screens (Analytics, Master Catalog, TO-to-TS Hierarchy Mapping, and JSON-diff Audit Logs).
- **CRITICAL ARCHITECTURAL RULE:** Build the shared `StoreContext` (`src/context/StoreContext.tsx`) and TypeScript DTOs (`src/types/index.ts`) cleanly right now so Parts 2 and 3 plug directly into them without refactoring. For routes belonging to Parts 2 and 3, create clean placeholder route components that we will replace in Parts 2 and 3.

---

### 1. TECH STACK & DEPENDENCIES
- **Framework:** React 18/19 + TypeScript (Strict Mode) + Vite
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"; @theme { ... }`)
- **Routing:** `react-router-dom` v6 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Icons:** `lucide-react`
- **Forms & Validation:** `react-hook-form` + `zod` + `@hookform/resolvers/zod`
- **Charts:** `recharts`
- **Toasts:** `sonner` (`<Toaster position="top-right" richColors closeButton />`)
- **Dates & Utils:** `date-fns`, `clsx`, `tailwind-merge`

---

### 2. EDUCATIONAL INSTITUTIONAL DESIGN SYSTEM (`src/index.css`)
Do NOT use commercial retail blue. Use an **Academic / Government Technical Institute** color palette:
- **Fonts:**
  - `--font-sans`: `"Public Sans", system-ui, -apple-system, sans-serif` (Body & UI)
  - `--font-display`: `"Plus Jakarta Sans", system-ui, -apple-system, sans-serif` (Headings)
  - `--font-mono`: `"JetBrains Mono", monospace` (IDs like `REQ-1001`, `PO-2001`, Avak/Javak numbers, Challan numbers, stock counts, timestamps)
- **Color Tokens:**
  - Background: `#f6f8fb`
  - Card / Surface: `#ffffff` with `border-[#e2e8f0]` and `shadow-2xs`
  - Foreground: `#0f172a`
  - Muted Foreground: `#64748b`
  - Primary (Deep Academic Indigo): `#1e3a8a`
  - Accent (Technical Teal): `#0f766e`
  - Destructive: `#dc2626`

---

### 3. REUSABLE COMMON UI COMPONENTS (`src/components/ui/` & `src/components/layouts/`)
Build these exact reusable components so every screen in Parts 2 & 3 uses them:

1. **`AppShell.tsx` (`src/components/layouts/AppShell.tsx`):**
   - **Sticky Top Header (`h-16 bg-white border-b`):**
     - Left: Mobile menu toggle + Institutional Logo (`GraduationCap` icon in `#1e3a8a` badge) + Title **"Govt. ITI Rewa"** with badge **"MP-DSD"** and subtitle *"Store & Material Procurement System"*.
     - Right: **Notification Bell** with red unread badge counter (opens popover showing pickup/action alerts for the logged-in user, with "Mark all read"), User Avatar initials, User Name, Role Badge, Department, and a clean **Logout** button.
     - **CRITICAL:** Do NOT put a role-switcher dropdown in the header/navbar. Role switching must happen strictly via **Logout -> Login Page**.
   - **Left Sidebar (`w-64 bg-white border-r`):**
     - Renders grouped navigation sections (`DASHBOARDS`, `OPERATIONS`, `INVENTORY & STORE`, `ADMINISTRATION`) filtered strictly by the logged-in user's role.
     - **Store / Inventory Sidebar Rule:** The `"Store / Inventory"` link MUST ONLY appear in the sidebar for `STORE_MANAGER`, `PRINCIPAL`, and `ADMIN`. Hide it completely for `TO`, `TS`, and `PURCHASE`.
   - **Page Body & Slim Institutional Footer:**
     - Main viewport (`max-w-[1440px] mx-auto p-4 sm:p-6`) + Footer: *"© 2026 Government Industrial Training Institute (ITI), Rewa (M.P.) | Store & Procurement Workflow"*.

2. **`DataTable.tsx` (`src/components/ui/DataTable.tsx`):**
   - Accepts `data`, `columns` (`key`, `header`, `width`, `minWidth`, `align`, `wrapText`, `render`), `keyExtractor`, `pageSize` (default `10`), `emptyMessage`, and `toolbar`.
   - **Text Wrapping & Scroll:** Horizontal scroll container (`overflow-x-auto`). Cells default to `whitespace-normal break-words max-w-xs` so long remarks/descriptions wrap cleanly without breaking layout.
   - **Exact Pagination Bar:**
     - Left: `"Showing {start}-{end} of {total} results"`.
     - Right: `[ < ]` button, **Integer-Only Page Input Box** (`w-12 h-8 text-center font-mono`, accepts only digits `1 <= page <= totalPages`, commits on `Enter` or `onBlur`), `"of {totalPages}"`, `[ > ]` button.

3. **`ModuleFilterBar.tsx` (`src/components/ui/ModuleFilterBar.tsx`):**
   - White card (`rounded-xl border p-4 mb-5`) with Teal filter header icon + title, responsive 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`), uppercase micro-labels (`text-[11px] font-bold uppercase text-slate-600`), bottom divider, and right-aligned rose-accented **Reset** button.

4. **`FormFields.tsx` (`src/components/ui/FormFields.tsx`):**
   - `FormInput`, `FormSelect`, `FormTextarea` with required red asterisks (`*`) and inline validation error messages (`AlertCircle` icon + rose text).

5. **`StatusBadge.tsx` (`src/components/ui/StatusBadge.tsx`):**
   - Standardized semantic pills for all workflow statuses:
     - `PENDING_TS_VERIFICATION` (Indigo)
     - `REVERTED_BY_TS` (Amber)
     - `REJECTED_BY_TS` / `REJECTED_BY_PRINCIPAL` (Rose)
     - `PENDING_PRINCIPAL_APPROVAL` (Blue)
     - `APPROVED_FOR_STORE` / `APPROVED_FOR_PURCHASE` (Teal)
     - `PRINTED_AWAITING_AVAK_JAVAK` (Purple)
     - `PURCHASE_IN_PROGRESS` (Orange)
     - `PARTIALLY_FULFILLED` (Amber)
     - `ITEM_RECEIVED_AT_STORE` (Emerald)
     - `CLOSED` / `COMPLETED` (Slate/Emerald)
     - Plus `TRADE` (Indigo pill) vs `NON_TRADE` (Amber pill).

---

### 4. COMPLETE `localStorage` DATA MODEL & 8 PRE-SEEDED SCENARIOS (`src/types/index.ts` & `src/context/StoreContext.tsx`)

Create `StoreContext` persisting these 5 collections in `localStorage` (`iti_rewa_v1_*`):

1. **`users` (7 Demo Users across 6 Roles):**
   - `u-to-1`: **Rajesh Sharma** | Role: `TO` | Dept: `Electrician` | `assignedTsId: "u-ts-1"`
   - `u-to-2`: **Suresh Verma** | Role: `TO` | Dept: `Fitter` | `assignedTsId: "u-ts-1"`
   - `u-to-3`: **Anita Joshi** | Role: `TO` | Dept: `Electronics` | `assignedTsId: "u-ts-2"`
   - `u-ts-1`: **R.K. Tiwari** | Role: `TS` | Dept: `Electrical & Mechanical Wing` (Supervises Rajesh & Suresh)
   - `u-ts-2`: **Meena Nair** | Role: `TS` | Dept: `Electronics Wing` (Supervises Anita)
   - `u-princ`: **Dr. A.K. Mishra** | Role: `PRINCIPAL` | Dept: `Administration`
   - `u-purch`: **Vikram Singh** | Role: `PURCHASE` | Dept: `Purchase Cell`
   - `u-store`: **Manoj Dubey** | Role: `STORE_MANAGER` | Dept: `Central Store`
   - `u-admin`: **System Admin** | Role: `ADMIN` | Dept: `IT & Governance`

2. **`catalogItems` (Master Store Stock — Electrician, Fitter, Electronics):**
   - `ELC-101`: **LED Tube Light 20W** | Category: `Electrician` | Unit: `Nos` | `currentStock: 4` | `minThreshold: 10` (Low stock!)
   - `ELC-102`: **1.5mm Copper Wire Roll (90m)** | Category: `Electrician` | Unit: `Rolls` | `currentStock: 18` | `minThreshold: 5` (Healthy stock for Direct Store Issue!)
   - `ELC-103`: **Ceiling Fan 48" Heavy Duty** | Category: `Electrician` | Unit: `Nos` | `currentStock: 1` | `minThreshold: 4`
   - `ELC-104`: **Industrial Exhaust Fan 18"** | Category: `Electrician` | Unit: `Nos` | `currentStock: 0` | `minThreshold: 3`
   - `ELC-105`: **Modular Switch 6A** | Category: `Electrician` | Unit: `Nos` | `currentStock: 45` | `minThreshold: 15`
   - `FIT-201`: **Steel Measuring Iron Tape (5m)** | Category: `Fitter` | Unit: `Nos` | `currentStock: 6` | `minThreshold: 5`
   - `ELN-301`: **Digital Multimeter** | Category: `Electronics` | Unit: `Nos` | `currentStock: 3` | `minThreshold: 5`
   - `GEN-401`: **Whiteboard Marker Set** | Category: `General` | Unit: `Boxes` | `currentStock: 2` | `minThreshold: 5`

3. **`requests` (8 Pre-Seeded Scenarios Covering Happy Paths & All Deviations):**
   - **`REQ-1006` (Scenario A — Fresh Happy Path at TS Verification):**
     - TO: `Rajesh Sharma` (`Electrician`), `tsId: "u-ts-1"`, Status: `PENDING_TS_VERIFICATION`, Created: `2026-11-16T09:15:00Z`.
     - Items: `5 Nos LED Tube Light 20W` (`ELC-101`, `TRADE`) + `2 Nos Ceiling Fan 48"` (`ELC-103`, `TRADE`).
     - *(Note: Because `LED Tube Light 20W` also has 3 units pending in `PO-2001`, when this reaches Principal, it will trigger the Pending Pipeline Deviation Alert!)*
   - **`REQ-1005` (Scenario B — TS Revert Deviation):**
     - TO: `Suresh Verma` (`Fitter`), `tsId: "u-ts-1"`, Status: `REVERTED_BY_TS`.
     - Items: `10 Nos Steel Measuring Iron Tape (5m)` (`FIT-201`, `TRADE`).
     - Remark from TS `R.K. Tiwari`: *"Reverted: Please specify blade width (19mm or 25mm) and confirm practical batch size in purpose."*
   - **`REQ-1004` (Scenario C — Principal Rejection Deviation):**
     - TO: `Anita Joshi` (`Electronics`), `tsId: "u-ts-2"`, Status: `REJECTED_BY_PRINCIPAL`.
     - Items: `4 Nos Digital Multimeter` (`ELN-301`, `TRADE`).
     - Remark from Principal: *"Rejected: Defer to next quarterly equipment grant; use existing lab meters."*
   - **`REQ-1003` (Scenario D — Ready for Principal "Send to Store" Direct Issue):**
     - TO: `Rajesh Sharma` (`Electrician`), `tsId: "u-ts-1"`, Status: `PENDING_PRINCIPAL_APPROVAL` (Verified by TS `R.K. Tiwari`).
     - Items: `2 Rolls 1.5mm Copper Wire Roll (90m)` (`ELC-102`, `TRADE`). (Store has `18 Rolls` available -> demonstrates `Send to Store` direct issue!).
   - **`REQ-1002` & `REQ-1007` (Scenario E — Trade + Non-Trade Split Ready for Purchase Consolidation & Hindi Letter Print):**
     - Both have Status: `APPROVED_FOR_PURCHASE`, `routingDestination: "PURCHASE"`.
     - `REQ-1002` (`Rajesh Sharma`): `4 Nos Industrial Exhaust Fan 18"` (`TRADE`) + `25 Packets Tea & Biscuits for Kaushal Mela Practical Exam` (`NON_TRADE`, `catalogItemId: null`).
     - `REQ-1007` (`Suresh Verma`): `2 Nos Industrial Exhaust Fan 18"` (`TRADE`) + `5 Boxes Whiteboard Marker Set` (`TRADE`).
   - **`REQ-1001` & `REQ-1008` (Scenario G — Partial Challan Delivery & FIFO Allocation Linked to `PO-2001`):**
     - `REQ-1001` (`Rajesh Sharma`, created `2026-11-10T10:00:00Z`): Requested `3 Nos LED Tube Light 20W` -> FIFO allocated `3/3` from `PO-2001` Challan `CH-401` -> Status: `ITEM_RECEIVED_AT_STORE` (Ready for TO to click **Confirm Receipt & Close**!).
     - `REQ-1008` (`Anita Joshi`, created `2026-11-12T11:30:00Z`): Requested `5 Nos LED Tube Light 20W` -> FIFO allocated `2/5` from `PO-2001` Challan `CH-401` -> Status: `PARTIALLY_FULFILLED` (Awaiting remaining 3 units on next vendor challan).
   - **`REQ-1000` (Scenario H — Completed & Closed Historical Cycle):**
     - `Rajesh Sharma`, `15 Nos Modular Switch 6A`, Status: `CLOSED` (with full remarks history).

4. **`purchaseOrders` (2 Pre-Seeded Orders):**
   - **`PO-2001` (Active Partial Delivery Order — Scenario G):**
     - Status: `PURCHASE_IN_PROGRESS`, `avakJavakNumber: "ITI/REWA/2026/AVK-412"`, `procurementMode: "GeM Portal"`, `tenderRef: "GEMC-5116877901"`, `sourceRequestIds: ["REQ-1001", "REQ-1008"]`.
     - Consolidated Items: `LED Tube Light 20W` (`orderedQty: 8`, `receivedQty: 5`, `itemType: "TRADE"`).
     - Challans: `[{ challanNumber: "CH-401", receivedDate: "2026-11-15T14:20:00Z", receivedBy: "Manoj Dubey", itemsReceived: [{ itemName: "LED Tube Light 20W", qty: 5 }] }]`.
   - **`PO-2002` (Printed Batch Awaiting Offline Avak/Javak — Scenario F):**
     - Status: `AWAITING_AVAK_JAVAK`, `avakJavakNumber: ""`, `procurementMode: "Direct Purchase"`, `sourceRequestIds: ["REQ-1009"]`.
     - Consolidated Items: `Digital Multimeter` (`orderedQty: 3`, `receivedQty: 0`, `itemType: "TRADE"`).

5. **`auditLogs` & `notifications`:**
   - Pre-seed `auditLogs` with rich entries across `TO_REQUEST_COPY`, `TS_VERIFICATION_COPY`, `PRINCIPAL_APPROVAL_COPY`, `PRINT_FORWARD_LETTER_COPY`, `GENERATE_ORDER_AVAK_JAVAK_COPY`, and `STORE_CHALLAN_RECEIPT_COPY`—each containing realistic `oldData` and `newData` JSON objects so the Admin Audit Logs viewer works immediately.
   - Pre-seed a notification for `u-to-1` (`Rajesh Sharma`): *"Your order (3 Nos LED Tube Light 20W) for REQ-1001 has been received at Central Store via Challan CH-401. Kindly collect your order from store."*

---

### 5. LOGIN SCREEN (`src/pages/LoginPage.tsx`)
- Clean institutional login card for **Govt. ITI Rewa (M.P.)** with Email/Password form + Zod validation.
- Directly below the form: **"Demo Role Quick-Login"** grid with 1-click cards for all 6 roles (*TO - Electrician*, *TO - Fitter*, *TS - Dept Head*, *Principal*, *Purchase Officer*, *Store Manager*, *System Admin*). Clicking any card logs in as that user and navigates to their role's default dashboard.
- Bottom utility button: **"Reset Demo Seed Data"** (resets all `localStorage` keys to initial seed state and shows a `sonner` success toast).

Build Part 1 completely and cleanly now, ensuring zero TypeScript errors. When done, confirm readiness for Part 2.