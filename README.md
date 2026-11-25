# Govt. ITI Rewa — Store & Material Procurement System
### शासकीय औद्योगिक प्रशिक्षण संस्था रीवा — भंडार एवं सामग्री उपार्जन प्रणाली

A comprehensive, role-based institutional procurement lifecycle and inventory management system designed for **Government ITI Rewa (M.P.)**. 

The system digitizes the entire vocational material lifecycle across **6 institutional roles**:
$$\text{Training Officer (TO)} \longrightarrow \text{Training Superintendent (TS)} \longrightarrow \text{Principal} \longrightarrow \text{Purchase Cell} \longrightarrow \text{Central Store (FIFO)} \longrightarrow \text{Direct Issue / Handover}$$

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Quickstart & Installation](#2-quickstart--installation)
3. [Seed / Demo Data & Test Accounts](#3-seed--demo-data--test-accounts)
4. [Browser Settings & Feature Setup](#4-browser-settings--feature-setup)
   - [Bilingual Language Translator (English / हिन्दी)](#a-bilingual-language-translator-english--हिन्दी)
   - [Voice Typing / Speech-to-Text (बोलकर लिखें)](#b-voice-typing--speech-to-text-बोलकर-लिखें)
   - [Brave Browser Setup (Important)](#c-brave-browser-setup-important)
   - [A4 Multi-Page Official Print Engine](#d-a4-multi-page-official-print-engine)
5. [Complete Role-Based Testing Guide for Reviewers](#5-complete-role-based-testing-guide-for-reviewers)
6. [Available Scripts & Quality Verification](#6-available-scripts--quality-verification)

---

## 1. Prerequisites

Before running the application, make sure your computer has:
* **Node.js**: Version `18.0` or higher (`20.x` or `22.x` LTS recommended).  
  *Verify by running `node -v` in your terminal.*
* **npm**: Version `9.0` or higher (bundled with Node.js).
* **Modern Web Browser**: **Google Chrome** or **Microsoft Edge** (recommended for full native voice recognition support).

---

## 2. Quickstart & Installation

Follow these 3 simple steps to start the application:

### Step 1: Extract and Open Directory
Extract the project ZIP archive and navigate to the project root in your terminal:
```bash
cd "govt.-iti-rewa-—-store-&-material-procurement-system"
```

### Step 2: Install Package Dependencies
Install all required frontend and utility dependencies:
```bash
npm install
```

### Step 3: Start the Development Server
Launch the local Vite server:
```bash
npm run dev
```

The application will immediately start at:
👉 **`http://localhost:3000`** (or `http://127.0.0.1:3000`)

Open that URL in your browser to view the login portal.

---

## 3. Seed / Demo Data & Test Accounts

### Automatic Data Seeding
* The system is **pre-loaded with realistic institutional seed data** on first run:
  * 13 institutional officers across all 4 vocational wings.
  * 30+ standardized ITI trade tools and consumable catalog items.
  * Active requisitions across various workflow stages (pending TS review, pending Principal sanction, awaiting PO generation, pending Challan receiving, and ready for store issue).
  * Purchase orders, vendor challans with FIFO shelf records, tamper-evident JSON-diff audit logs, and bilingual notifications.
* All data is preserved across page refreshes in browser `localStorage`.

### Resetting Seed Data to Pristine State
If at any point you want to clear your changes and restart from fresh factory seed data:
1. Navigate to the Login screen: `http://localhost:3000/login`.
2. Click the red **"Reset All Demo Data"** button at the top right of the login screen.
3. The demo dataset will instantly reset.

---

### Test Credentials (1-Click Quick Login Cards Available)
On the login screen (`/login`), you can click any of the **1-Click Quick Role Cards** to log in instantly without typing. Alternatively, you can use the manual credentials below:

**Default Password for all accounts**: `password123`

| Role | Officer Name | Institutional Email | Assigned Wing / Scope |
| :--- | :--- | :--- | :--- |
| **Principal** | Dr. A.K. Mishra | `principal@itirewa.mp.gov.in` | Institute Head — Approvals & Routing |
| **Purchase Officer** | Vikram Singh | `purchase@itirewa.mp.gov.in` | Purchase Cell — PO Batches, Avak/Javak, GeM |
| **Store Manager** | Manoj Dubey | `store@itirewa.mp.gov.in` | Central Store — FIFO Challans & Direct Issues |
| **System Admin** | System Admin | `admin@itirewa.mp.gov.in` | IT & Admin — User Hierarchy & Audit Logs |
| **TS 1 (E&M)** | R.K. Tiwari | `rk.tiwari@itirewa.mp.gov.in` | Supervises Electrician & Fitter trades |
| **TS 2 (Electronics)** | Meena Nair | `meena.nair@itirewa.mp.gov.in` | Supervises Electronics trade |
| **TS 3 (Auto/Welding)** | Sunil Saxena | `sunil.saxena@itirewa.mp.gov.in` | Supervises Welder trade |
| **TS 4 (IT/COPA)** | Pooja Pandey | `pooja.pandey@itirewa.mp.gov.in` | Supervises COPA & Computer trade |
| **TO (Electrician)** | Rajesh Sharma | `rajesh.sharma@itirewa.mp.gov.in` | Training Officer — Electrician Trade |
| **TO (Fitter)** | Suresh Verma | `suresh.verma@itirewa.mp.gov.in` | Training Officer — Fitter Trade |
| **TO (Electronics)** | Anita Joshi | `anita.joshi@itirewa.mp.gov.in` | Training Officer — Electronics Trade |
| **TO (Welder)** | Dinesh Kushwaha | `dinesh.kushwaha@itirewa.mp.gov.in` | Training Officer — Welder Trade |
| **TO (COPA)** | Priya Sharma | `priya.sharma@itirewa.mp.gov.in` | Training Officer — COPA Trade |

---

## 4. Browser Settings & Feature Setup

### A. Bilingual Language Translator (English / हिन्दी)
* **How to Use**: Click the language toggle button `[🌐 English]` / `[🌐 हिन्दी]` located in the top navigation header.
* **Scope**: 100% of the platform instantly translates into authentic official Hindi (and back to English), including:
  * Navigation menus, dashboard KPI metric cards, and table headers.
  * Form inputs, placeholders, field helper hints, and mandatory validation errors.
  * Notification popover feed, timestamps, and officer designations.
  * Modal dialogs and action confirmations.
* **Requirements**: Zero setup or network dependencies needed; runs 100% locally and offline.

---

### B. Voice Typing / Speech-to-Text (बोलकर लिखें)
* **Technology**: Built using the browser-native **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`).
* **Cost & Privacy**: **100% Free** — No third-party AI tokens, no cloud subscriptions, no external API keys, and zero per-word costs.
* **Dual Locations**:
  1. **Top Navbar Master Toggle**: Click `[🎙️ Voice Type]` / `[🎙️ बोलकर लिखें]` in the top header. Click any input or textarea on the page and speak.
  2. **In-Modal Header Toggles**: Every interactive modal (Principal Decision, TS Review, Avak/Javak Dispatch, Store Challan Receiving, Direct Store Issue, User Creation, and Trade Item builder) has a dedicated voice toggle button in its header. You do **not** need to close the modal to dictate remarks or notes!
* **Bilingual Dictation**:
  * When app language is set to **English**, it recognizes and writes in English (`en-IN`).
  * When app language is set to **हिन्दी**, it recognizes Hindi and writes in authentic Devanagari script (`hi-IN`).
* **Microphone Access**:
  * On your first click of the voice button, the browser will display a permission popup:  
    👉 **Click "Allow" (अनुमति दें)** to permit microphone access.

---

### C. Brave Browser Setup (Important)
If you or your manager are testing in **Brave Browser**, Brave disables Chromium's speech recognition by default for privacy reasons. To enable speech-to-text in Brave:

1. In the Brave address bar, open:  
   `brave://settings/system`
2. Locate the toggle:  
   **"Use Google services for speech recognition"**
3. Turn this toggle **ON**.
4. Refresh `http://localhost:3000`.

> **Note**: In **Google Chrome** and **Microsoft Edge**, voice recognition works immediately out of the box with zero settings required.

---

### D. A4 Multi-Page Official Print Engine
* Located at: `Purchase Officer Dashboard` $\rightarrow$ `Approved & Print Letters` $\rightarrow$ **"Generate Official Letter"**.
* Generates an authentic Madhya Pradesh Government administrative sanction letter with institutional crest, official Hindi letterhead, auto-paginated table of items, and official signature blocks.
* Fully styled for physical A4 printing (`Ctrl + P`) or export to PDF without clipping table rows or page headers.

---

## 5. Complete Role-Based Testing Guide for Reviewers

To experience the full lifecycle workflow, test the following steps in sequence:

```
[1. TO Raises Indent] ➡️ [2. TS Verifies] ➡️ [3. Principal Sanctions] ➡️ [4. Purchase Creates PO] ➡️ [5. Store Receives & Issues]
```

1. **Step 1 — Training Officer (TO)**:
   - Quick Login as **TO - Electrician (Rajesh Sharma)**.
   - Go to **"Raise Requisition"** (`/to/raise-request`).
   - Add trade materials (e.g., Copper Wire or LED Tube Lights).
   - Use voice typing to speak the practical justification. Submit to TS.

2. **Step 2 — Training Superintendent (TS)**:
   - Logout and Quick Login as **TS 1 - E&M Wing (R.K. Tiwari)**.
   - Go to **"Pending Verification Queue"** (`/ts/dashboard`).
   - Open the submitted requisition. Verify the technical specifications, dictate or type approval remarks using the header voice button, and click **"Verify & Recommend"**.

3. **Step 3 — Principal**:
   - Quick Login as **Principal (Dr. A.K. Mishra)**.
   - Go to **"Sanctions & Routing"** (`/principal/approvals`).
   - Open the pending requisition. Choose either:
     - **"Approve & Send to Purchase Cell"** (for institutional procurement).
     - **"Approve for Direct Store Issue"** (if stock is already available on store shelves).
   - Click the voice button in the modal header to record remarks, then confirm.

4. **Step 4 — Purchase Officer**:
   - Quick Login as **Purchase Officer (Vikram Singh)**.
   - Go to **"Approved & Print Letters"** (`/purchase/approved`) to view consolidated requisitions and preview the official bilingual letter.
   - Go to **"Purchase Orders"** (`/purchase/orders`), click **"Enter Avak/Javak"**, dictate the dispatch reference number via the voice toggle, and dispatch the PO.

5. **Step 5 — Store Manager (FIFO Receiving & Direct Issue)**:
   - Quick Login as **Store Manager (Manoj Dubey)**.
   - Go to **"Store Receiving"** (`/store/receiving`). Log the incoming vendor challan with live FIFO shelf allocation.
   - Go to **"Direct Store Issues"** (`/store/direct-issues`) to issue sanctioned materials directly to the indenting TO.

6. **Step 6 — System Admin (Audit Logs & Users)**:
   - Quick Login as **System Admin**.
   - Go to **"Audit Logs"** (`/admin/audit-logs`) to inspect tamper-evident JSON-diff records tracking every field-level change made across the workflow.
   - Go to **"Users & Hierarchy"** (`/admin/users`) to inspect supervisory TO-to-TS mappings.

---

## 6. Available Scripts & Quality Verification

You can run the following terminal commands to verify code quality and build stability:

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on port 3000. |
| `npm test` | Runs the automated test suite (16 comprehensive unit tests covering FIFO, consolidation, isolation, password validation, and i18n). |
| `npm run lint` | Runs TypeScript compiler check (`tsc --noEmit`) to verify 0 type errors. |
| `npm run build` | Builds optimized production assets in `dist/`. |
| `npm run preview` | Previews the compiled production build locally. |

---

### Verification Summary
* **Test Suite**: 16/16 Passed (`storeLogic.test.ts`)
* **TypeScript Check**: 0 errors (`tsc --noEmit`)
* **Production Build**: 100% Successful (`vite build`)

---
*Developed for **Government Industrial Training Institute (ITI) Rewa, Directorate of Skill Development, Madhya Pradesh**.*
