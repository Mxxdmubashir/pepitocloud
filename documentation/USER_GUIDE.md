# Pepito Cloud Kitchen Software - Operator & Staff Manual

A quick-start user guide for Cloud Kitchen Managers, Cashiers, Line Chefs, and Dispatch Riders.

---

## 1. Quick Start / Running the Software

Run the complete software with a single command:
```bash
npm run dev
```
- **Backend REST & WebSockets**: Runs on `http://localhost:5000`
- **Frontend Dashboard & POS**: Runs on `http://localhost:5173`

---

## 2. Testing Live Aggregator Ingestion
To see how the multi-brand cloud kitchen reacts in real time:
1. Look at the top navbar.
2. Click **"Simulate Order (Swiggy/Zomato)"**.
3. You will hear an authentic two-tone restaurant chime.
4. The ticket will instantly appear on:
   - **Kitchen Display System (KDS)**: Line cooks see the items.
   - **Live Orders Hub**: Staff see aggregator order details, customer notes, and elapsed time.
   - **Dashboard**: Live metrics and active order counters tick up automatically.

---

## 3. Fast POS Billing (Phone & Walk-In Orders)
1. Open the **POS & Billing** tab.
2. Select the virtual brand tab (e.g. *Pepito's Pizza*, *Burger Beast*, *Wok & Roll*, *Sweet Escape*).
3. Click any dish to add to the active ticket.
4. Enter the customer's phone number — if they have ordered before, their name and address autofill from the CRM.
5. Select tender method (Cash, UPI, Card).
6. Click **"Charge & Print"** — an authentic 80mm thermal receipt popup appears ready to print on any thermal printer or export as PDF.
7. The required raw materials are **automatically deducted** from the inventory according to the recipe's Bill of Materials!

---

## 4. Kitchen Display Operations (KDS)
1. Mount a tablet or monitor in each kitchen station.
2. Filter the station dropdown (e.g. `Oven`, `Grill`, `Wok`, `Fryer`).
3. Chefs see order tickets arranged by urgency:
   - **Green**: Under 10 minutes.
   - **Amber**: 10–18 minutes.
   - **Pulsing Red**: Over 18 minutes (delayed).
4. Click on individual items to check them off as cooked.
5. Once all items are ready, click **"Bump Order Ready"** — this alerts the packaging counter and moves the order to dispatch!

---

## 5. 86ing (Instant Out-of-Stock)
1. Go to **Brands & Menus**.
2. Find the item that ran out of stock.
3. Click the green **"In Stock"** button — it toggles to red **"86ed (Out of Stock)"**.
4. The dish is immediately disabled in the POS and hidden from live order creation.

---

## 6. End of Day Register Closing (Z-Report)
1. Go to **Analytics & Z-Report**.
2. View today's gross sales, discounts, collected GST (5%), packaging fees, and breakdown by tender (Cash vs UPI vs Card vs Aggregator Prepaid).
3. Click **"Print Daily Z-Report"** to print the audited register closing slip.

