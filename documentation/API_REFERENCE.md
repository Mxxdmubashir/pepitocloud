# Pepito Cloud Kitchen Software - REST API & WebSocket Reference

All REST endpoints are prefixed with `/api`.

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Staff login with email and password |
| `GET` | `/api/auth/me` | Current authenticated profile |
| `GET` | `/api/auth/users` | List staff members |

---

## 2. Virtual Brands (`/api/brands`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/brands` | List all active virtual brands with item counts |
| `GET` | `/api/brands/:id` | Get single brand details |
| `POST` | `/api/brands` | Create new virtual brand |
| `PUT` | `/api/brands/:id` | Update brand information |
| `PATCH` | `/api/brands/:id/toggle` | Toggle brand online/offline status |

---

## 3. Menu & Categories (`/api/menu`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/menu/categories` | List categories (optional `?brand_id=`) |
| `POST` | `/api/menu/categories` | Create category |
| `GET` | `/api/menu/items` | List menu items (`?brand_id=`, `?category_id=`, `?search=`) |
| `GET` | `/api/menu/items/:id` | Get item details and modifier groups |
| `POST` | `/api/menu/items` | Create menu item |
| `PUT` | `/api/menu/items/:id` | Update menu item |
| `PATCH` | `/api/menu/items/:id/toggle-stock` | Instant 86 out of stock toggle |
| `DELETE` | `/api/menu/items/:id` | Delete menu item |

---

## 4. Orders & Billing (`/api/orders`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | Query orders (`?status=`, `?channel=`, `?brand_id=`, `?limit=`) |
| `GET` | `/api/orders/:id` | Get full order details with line items |
| `POST` | `/api/orders` | Create order (auto-deducts BOM inventory) |
| `PATCH` | `/api/orders/:id/status` | Update lifecycle state (`pending` -> `accepted` -> `preparing` -> `ready` -> `dispatched` -> `delivered`) |
| `PATCH` | `/api/orders/:id/assign-rider` | Assign delivery rider |
| `POST` | `/api/orders/simulate` | Simulate incoming Swiggy/Zomato order |

---

## 5. Kitchen Display System (`/api/kds`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/kds/tickets` | Active kitchen tickets (`?station=`, `?brand_id=`) |
| `POST` | `/api/kds/bump/:orderId` | Bump order (marks ready and notifies dispatch) |
| `PATCH` | `/api/kds/items/:itemId/toggle` | Toggle individual item cooking status |

---

## 6. Inventory & BOM (`/api/inventory` & `/api/recipes`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/inventory` | List raw materials with low stock indicators |
| `POST` | `/api/inventory` | Create new raw material |
| `POST` | `/api/inventory/adjust` | Record restock or wastage adjustment |
| `GET` | `/api/inventory/transactions` | Inventory audit trail |
| `GET` | `/api/recipes/item/:menuItemId`| Get recipe ingredients and estimated food cost |
| `POST` | `/api/recipes` | Link ingredient portion to menu item |

---

## 7. Delivery & Fleet (`/api/delivery`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/delivery/riders` | List delivery riders with availability status |
| `POST` | `/api/delivery/riders` | Register new fleet driver |
| `PATCH` | `/api/delivery/riders/:id/status` | Update status (`available`, `delivering`, `offline`) |

---

## 8. Analytics & Z-Report (`/api/analytics`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | KPIs, brand revenue share, channel totals, top items |
| `GET` | `/api/analytics/sales-report` | Daily financial register reconciliation (Z-Report) |

---

## 9. Real-Time WebSocket Events (Socket.io)

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `order:new` | Server -> Client | `{ order: Order, sound: true }` | Broadcast new incoming order |
| `order:updated` | Server -> Client | `{ order: Order }` | Broadcast status transition |
| `kds:ticket_bumped`| Server -> Client | `{ orderId: string }` | KDS ticket completed |
| `kds:item_updated` | Server -> Client | `{ itemId, status }` | Cook item checked off |
| `item:stock_changed` | Server -> Client | `{ itemId, is_available }` | 86 stock status update |

