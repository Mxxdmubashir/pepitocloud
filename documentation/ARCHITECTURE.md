# Pepito Cloud Kitchen Software - Architecture & Technical Blueprint

Pepito Cloud Kitchen is an enterprise-grade multi-brand cloud kitchen management, Point-of-Sale (POS), Kitchen Display System (KDS), and inventory automation system.

---

## 1. System Overview

```
                      +---------------------------------------+
                      |       Delivery Aggregators Feed       |
                      |  (Swiggy, Zomato, UberEats, Direct)  |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Fast Ingestion Engine         |
                      |   (REST API + Socket.io WebSockets)   |
                      +-------------------+-------------------+
                                          |
            +-----------------------------+-----------------------------+
            |                             |                             |
            v                             v                             v
+-----------------------+     +-----------------------+     +-----------------------+
|  Point of Sale (POS)  |     | Kitchen Display (KDS) |     |  Inventory BOM Engine |
| Multi-Brand Billing   |     | Station-based Routing |     | Auto Portion Deduct   |
| 80mm Thermal Receipt  |     | Elapsed Time Alerts   |     | Cost & Margin Calc    |
+-----------------------+     +-----------------------+     +-----------------------+
            |                             |                             |
            +-----------------------------+-----------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |      Embedded SQLite with WAL Mode    |
                      |     (Zero-Latency Node:SQLite Sync)   |
                      +---------------------------------------+
```

---

## 2. Core Architectural Pillars

### A. Multi-Brand Virtual Storefront Management
A single cloud kitchen facility typically operates multiple virtual culinary brands from one kitchen footprint. Pepito supports:
- Unlimited virtual brands under one or more physical kitchen hubs.
- Brand-specific categorizations, pricing channels, and preparation stations.
- Unified aggregation: incoming orders from all brands are funneled into synchronized kitchen display stations.

### B. Dual Channel Pricing & Instant 86ing
- Cloud kitchens face varying aggregator commission fees (e.g., Swiggy/Zomato 18-24%). Pepito stores separate base POS prices and aggregator prices per dish.
- **86ing (Out of Stock)**: When an ingredient runs out during a dinner rush, 1-click 86ing immediately marks the item unavailable across POS and kitchen views.

### C. Station Routing Kitchen Display System (KDS)
Incoming orders are split by dish station (`Oven`, `Grill`, `Wok`, `Fryer`, `Assembly`, `Beverage`):
- Line cooks only see tickets relevant to their station.
- Visual wait-time urgency:
  - **Normal**: < 10 mins (Green)
  - **Expedite Warning**: 10–18 mins (Amber)
  - **Delayed / Critical**: > 18 mins (Pulsing Red)
- Interactive cook checkboxes allow marking items as cooked before bumping the whole order.

### D. Recipe Bill of Materials (BOM) & Inventory Auto-Deduction
Whenever an order is accepted or generated:
1. The system inspects the recipe matrix for each ordered item.
2. Deducts the exact proportion of raw materials (e.g. 140g mozzarella, 220g dough, 1 pizza box).
3. Records audit log entries in `stock_transactions`.
4. Flags materials below minimum safety thresholds.
5. Calculates true food cost percentages for gross profit analysis.

---

## 3. Technology Stack

- **Backend**: Node.js v22/24 + Express + TypeScript
- **Real-Time Engine**: Socket.io (bi-directional events)
- **Database**: Native `node:sqlite` (`DatabaseSync` with Write-Ahead Logging)
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Lucide Icons
- **Audio Synthesizer**: Native HTML5 Web Audio API (zero external audio file dependencies)
- **Hardware Integration**: Standard 80mm ESC/POS Thermal Receipt printing with monospace formatting

