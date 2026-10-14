# 🍕 Pepito Cloud Kitchen Software
### Enterprise Cloud Kitchen Management, POS, Kitchen Display (KDS), Multi-Brand Aggregator & Inventory System

[![Node.js](https://img.shields.io/badge/Node.js-22%2F24-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Native_WAL-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)

---

## 🌟 Overview

**Pepito Cloud Kitchen Software** is a full-stack, enterprise-grade cloud kitchen (ghost kitchen / dark kitchen) platform designed to operate multiple virtual food brands simultaneously from a single commercial facility.

It combines multi-channel order ingestion (Swiggy, Zomato, UberEats, Direct Takeaway, and Phone POS), a station-based Kitchen Display System (KDS), automated recipe portion inventory deduction (BOM), delivery fleet dispatch, and end-of-day financial reconciliation (Z-Report).

---

## 🚀 Key Modules & Capabilities

1. **Multi-Brand Virtual Storefronts**:
   - Manage multiple virtual brands under one central hub (e.g. *Pepito's Artisan Pizza*, *Burger Beast Smokehouse*, *Wok & Roll Asian Bowls*, *Sweet Escape Bakery*).
   - Independent menus, station routing, and dual-channel pricing (Base POS vs Aggregator markup).

2. **High-Speed POS & Billing**:
   - Fast touch-friendly billing for phone and walk-in counter orders.
   - Customer phone number autocomplete with repeat order preferences and loyalty points.
   - One-click tender (Cash, Card, UPI) and authentic **80mm thermal receipt printing** + PDF tax invoices.

3. **Live Orders Aggregator Hub**:
   - Unified real-time order stream from Swiggy, Zomato, UberEats, and Direct POS.
   - Live two-tone audio chime alerts on incoming orders.
   - Status stepper: `Pending` ➔ `Accepted` ➔ `Cooking` ➔ `Ready` ➔ `Dispatched` ➔ `Delivered`.

4. **Kitchen Display System (KDS)**:
   - Station-based routing (`Oven`, `Grill`, `Wok`, `Fryer`, `Assembly`, `Beverage`).
   - Urgency color-coding timers: Green (<10m), Amber (10–18m), Pulsing Red (>18m delayed!).
   - Interactive item checkoffs and 1-click **"Bump Order Ready"** action.

5. **Live Inventory & Recipe Bill of Materials (BOM)**:
   - Raw material stock monitoring with automatic portion deductions when orders are placed.
   - Low-stock threshold alerts with one-click inward restock modal.
   - Recipe margin explorer displaying exact ingredient gram portions and target food cost %.

6. **Delivery & Driver Dispatch**:
   - Internal delivery fleet roster with driver status (`Available`, `Delivering`, `Offline`).
   - One-click driver assignment to ready orders.

7. **Analytics & Daily Z-Report**:
   - Real-time revenue, average order value (AOV), and brand revenue share charts.
   - Audited daily register closing slip (Z-Report) for cash and electronic tender reconciliation.

---

## 🛠️ Quick Start

### 1. Requirements
- Node.js v22 or v24 (recommended)
- npm v10+

### 2. Installation
Install all backend and frontend dependencies:
```bash
npm run install:all
```

### 3. Initialize & Seed Database
Seed realistic brands, delicious menus, inventory, riders, and sample orders:
```bash
npm run seed
```

### 4. Start Development Servers
Run both backend REST/WebSocket server and frontend simultaneously:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Engine**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📁 Project Structure

```
Pepito-Cloud-Kitchen-Software/
├── backend/                  # Express + TypeScript + Socket.io + Native SQLite
│   ├── data/                 # SQLite Database file (pepito_kitchen.db)
│   ├── src/
│   │   ├── routes/           # REST endpoints (auth, brands, menu, orders, kds, inventory, delivery, analytics)
│   │   ├── db.ts             # Node 24 native DatabaseSync connector
│   │   ├── seed.ts           # Rich database seed data
│   │   ├── types.ts          # TypeScript domain models
│   │   └── index.ts          # HTTP & WebSockets server
│   └── package.json
│
├── frontend/                 # Vite + React 18 + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, ReceiptModal (80mm thermal receipt)
│   │   ├── pages/            # Dashboard, POSBilling, LiveOrders, KDSView, MenuBrands, InventoryBOM, DeliveryDispatch, CustomersCRM, AnalyticsReports
│   │   ├── services/         # API client, WebSockets, Web Audio API sound synthesizer
│   │   ├── types/            # Frontend interfaces
│   │   └── App.tsx           # Main application router & shell
│   └── package.json
│
├── database/                 # Schema & SQL migrations
│   ├── schema.sql            # Complete DDL script
│   └── seed.sql              # SQL seed script
│
└── documentation/            # Technical & Operator manuals
    ├── ARCHITECTURE.md       # Architectural blueprint & data flow
    ├── API_REFERENCE.md      # Complete REST & WebSocket API specification
    └── USER_GUIDE.md         # Step-by-step operating guide for kitchen staff
```

---

## 🔒 Default Staff Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin / Owner** | `admin@pepito.kitchen` | `admin123` |
| **Kitchen Manager / Chef** | `chef@pepito.kitchen` | `chef123` |
| **Front Desk Cashier** | `cashier@pepito.kitchen` | `cashier123` |
| **Delivery Driver** | `rider@pepito.kitchen` | `rider123` |

---

## 📄 License
ISC © 2026 Pepito Cloud Kitchen Software.
