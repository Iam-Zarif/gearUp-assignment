# GearUp API Documentation

Base path: `/api`

## Global behavior

- All responses follow this envelope:
  ```json
  {
    "success": true,
    "message": "...",
    "meta": { ... },
    "data": { ... }
  }
  ```
- Paginated responses include `meta` with these fields:
  - `page`: current page number
  - `limit`: number of items returned per page
  - `total`: total matching items in the backend
  - `totalPage`: total number of pages
- The backend defaults to `page=1` and `limit=10` when omitted.
- The backend clamps `limit` to a maximum of `100`.
- Frontend must read `meta.limit` and `meta.totalPage` from the response and use them to keep UI controls synced.
- Protected endpoints require authentication via either:
  - `Authorization: Bearer <accessToken>` header
  - or cookie `accessToken`

---

## Authentication

### POST `/api/auth/register`

- Purpose: create a new user account
- Auth: none
- Request body:
  - `name` (string, required)
  - `email` (string, required, valid email)
  - `password` (string, required)
    - min 8 chars
    - at least one uppercase letter
    - at least one number
    - at least one special character
    - no sequential patterns like `abc`, `123`, `qwe`
  - `phone` (string, optional)
  - `address` (string, optional)
  - `profilePhoto` (string, optional)
  - `role` (string, required)
    - allowed values: `CUSTOMER`, `PROVIDER`
- Response data:
  - created user record plus session/auth tokens if implemented in controller

### POST `/api/auth/login`

- Purpose: authenticate a user
- Auth: none
- Request body:
  - `email` (string, required)
  - `password` (string, required)
- Response data:
  - user data and tokens / session information

### GET `/api/auth/me`

- Purpose: get current logged-in user profile
- Auth: `CUSTOMER`, `PROVIDER`, `ADMIN`
- Request body: none
- Response data:
  - current user object

### PATCH `/api/auth/me`

- Purpose: update current user profile
- Auth: `CUSTOMER`, `PROVIDER`, `ADMIN`
- Request body (all optional):
  - `name` (string)
  - `email` (string, valid email)
  - `phone` (string)
  - `address` (string)
  - `profilePhoto` (string)
  - `oldPassword` (string)
  - `newPassword` (string)
    - must follow strong password rules
- Notes:
  - if `newPassword` is provided, `oldPassword` is required
  - if `oldPassword` is provided, `newPassword` is required

### POST `/api/auth/logout`

- Purpose: log out the authenticated user
- Auth: `CUSTOMER`, `PROVIDER`, `ADMIN`
- Request body: none

---

## Categories

### GET `/api/categories`

- Purpose: fetch all categories
- Auth: none
- Query parameters: none
- Response data: list of category objects

### POST `/api/categories`

- Purpose: create a new category
- Auth: `ADMIN`
- Request body:
  - `name` (string, required)
  - `description` (string, optional)
  - `imageUrl` (string, optional, must be a valid URL)
- Response data: created category object

### PATCH `/api/categories/:id`

- Purpose: update a category
- Auth: `ADMIN`
- URL params:
  - `id` (string, required)
- Request body (all optional):
  - `name` (string)
  - `description` (string)
  - `imageUrl` (string, valid URL)
- Response data: updated category object

### DELETE `/api/categories/:id`

- Purpose: delete a category
- Auth: `ADMIN`
- URL params:
  - `id` (string, required)
- Response data: deleted category object

---

## Gear

### GET `/api/gear`

- Purpose: fetch marketplace gear items
- Auth: none
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
  - `searchTerm` (string, optional)
  - `categoryId` (string, optional)
  - `category` (string, optional)
  - `brand` (string, optional)
  - `minPrice` (number, optional)
  - `maxPrice` (number, optional)
  - `availability` (string, optional)
    - allowed: `available`, `unavailable`
  - `status` (string, optional)
    - allowed: `AVAILABLE`, `UNAVAILABLE`
  - `sortBy` (string, optional)
    - allowed: `createdAt`, `pricePerDay`, `name`, `brand`, `availableQuantity`
  - `sortOrder` (string, optional)
    - allowed: `asc`, `desc`
- Response data: paginated list of gear items
- Important: use returned `meta.limit` and `meta.totalPage`

### GET `/api/gear/:id`

- Purpose: fetch a single gear item
- Auth: none
- URL params:
  - `id` (string, required)
- Response data: gear item details, category, provider, and reviews

### POST `/api/provider/gear`

- Purpose: create a gear item as provider
- Auth: `PROVIDER`
- Request body:
  - `categoryId` (string, required)
  - `name` (string, required)
  - `brand` (string, optional)
  - `description` (string, optional)
  - `pricePerDay` (number, required, positive)
  - `stockQuantity` (number, required, integer, positive)
  - `availableQuantity` (number, optional, integer, min 0)
  - `imageUrl` (string, optional)
  - `specifications` (object, optional)
- Response data: created gear item object

### GET `/api/provider/gear`

- Purpose: get provider own gear
- Auth: `PROVIDER`
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated list of provider-owned gear

### PUT `/api/provider/gear/:id`

- Purpose: update a provider gear item
- Auth: `PROVIDER`
- URL params:
  - `id` (string, required)
- Request body (all optional):
  - `categoryId` (string)
  - `name` (string)
  - `brand` (string)
  - `description` (string)
  - `pricePerDay` (number, positive)
  - `stockQuantity` (number, integer, positive)
  - `availableQuantity` (number, integer, min 0)
  - `imageUrl` (string)
  - `specifications` (object)
  - `status` (string)
    - allowed: `AVAILABLE`, `UNAVAILABLE`
- Response data: updated gear item object

### DELETE `/api/provider/gear/:id`

- Purpose: delete a provider gear item
- Auth: `PROVIDER`
- URL params:
  - `id` (string, required)
- Response data: deleted gear item object

---

## Rentals

### POST `/api/rentals`

- Purpose: create a rental order
- Auth: `CUSTOMER`
- Request body:
  - `startDate` (string, required)
  - `endDate` (string, required)
  - `items` (array, required)
    - each item object must include:
      - `gearItemId` (string, required)
      - `quantity` (number, required, integer, positive)
- Response data: created rental order with items and payment record
- Notes:
  - backend validates that all items belong to the same provider
  - backend reserves inventory by decrementing available quantity

### GET `/api/rentals`

- Purpose: get current customer rentals
- Auth: `CUSTOMER`
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated rental orders for the logged-in customer

### GET `/api/rentals/:id`

- Purpose: get a single rental order
- Auth: `CUSTOMER`, `PROVIDER`
- URL params:
  - `id` (string, required)
- Response data: rental order details
- Notes: customer may view own rental order; provider may view only orders where they provide gear

### GET `/api/provider/orders`

- Purpose: get provider rental orders
- Auth: `PROVIDER`
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated rental orders containing the provider's gear

### PATCH `/api/provider/orders/:id`

- Purpose: update provider rental order status
- Auth: `PROVIDER`
- URL params:
  - `id` (string, required)
- Request body:
  - `status` (string, required)
    - allowed: `CONFIRMED`, `PICKED_UP`, `RETURNED`, `CANCELLED`
- Response data: updated rental order with new status
- Notes:
  - if status changes to `RETURNED` or `CANCELLED`, inventory is restored for returned/cancelled items

---

## Payments

### GET `/api/payments/success`

- Purpose: Stripe redirect success endpoint
- Auth: none
- Query: managed by Stripe checkout flow
- Response: handled by payment webhook / internal logic

### GET `/api/payments/cancel`

- Purpose: Stripe redirect cancel endpoint
- Auth: none
- Response: placeholder cancel handling

### POST `/api/payments/create`

- Purpose: create or reuse Stripe checkout session for a rental order
- Auth: `CUSTOMER`
- Request body:
  - `rentalOrderId` (string, required)
- Response data:
  - `payment` object
  - `sessionId` (string)
  - `checkoutUrl` (string)
- Notes:
  - backend uses advisory lock to avoid duplicate payment session creation

### POST `/api/payments/confirm`

- Purpose: confirm Stripe payment after redirect
- Auth: `CUSTOMER`
- Request body:
  - `sessionId` (string, required)
- Response data: payment details
- Notes:
  - if payment is already completed, backend returns existing details

### GET `/api/payments`

- Purpose: get customer payments
- Auth: `CUSTOMER`
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated payment list for logged-in customer

### GET `/api/payments/:id`

- Purpose: get a single payment record
- Auth: `CUSTOMER`
- URL params:
  - `id` (string, required)
- Response data: payment object

---

## Reviews

### GET `/api/reviews`

- Purpose: fetch reviews
- Auth: none
- Query parameters:
  - `gearItemId` (string, optional)
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated list of reviews

### GET `/api/reviews/:id`

- Purpose: get a single review
- Auth: none
- URL params:
  - `id` (string, required)
- Response data: review object

### POST `/api/reviews`

- Purpose: create a review
- Auth: `CUSTOMER`
- Request body:
  - `gearItemId` (string, required)
  - `rentalOrderId` (string, required)
  - `rating` (number, required, integer, 1 to 5)
  - `comment` (string, optional)
- Response data: created review object
- Notes:
  - customer can review only their own returned rental order gear item
  - duplicate reviews for the same gear/rental/customer tuple are rejected

### PATCH `/api/reviews/:id`

- Purpose: update a review
- Auth: `CUSTOMER`
- URL params:
  - `id` (string, required)
- Request body (optional):
  - `rating` (number, integer, 1 to 5)
  - `comment` (string)
- Response data: updated review object

### DELETE `/api/reviews/:id`

- Purpose: delete a review
- Auth: `CUSTOMER`, `ADMIN`
- URL params:
  - `id` (string, required)
- Response data: deleted review object
- Notes:
  - customers may delete only own reviews
  - admins may delete any review

---

## Admin

### GET `/api/admin/stats`

- Purpose: get dashboard statistics
- Auth: `ADMIN`
- Response data:
  - users count
  - providers count
  - customers count
  - categories count
  - gear count
  - active gear available count
  - rentals count
  - revenue total

### GET `/api/admin/users`

- Purpose: fetch admin user list
- Auth: `ADMIN`
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated list of users

### PATCH `/api/admin/users/:id`

- Purpose: update user status
- Auth: `ADMIN`
- URL params:
  - `id` (string, required)
- Request body:
  - `status` (string, required)
    - allowed values: `ACTIVE`, `SUSPENDED`
- Response data: updated user object

### GET `/api/admin/gear`

- Purpose: fetch all gear items for admin
- Auth: `ADMIN`
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated list of gear items

### GET `/api/admin/rentals`

- Purpose: fetch all rental orders for admin
- Auth: `ADMIN`
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated list of rental orders

### GET `/api/admin/payments`

- Purpose: fetch all payments for admin
- Auth: `ADMIN`
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated list of payments

### GET `/api/admin/reviews`

- Purpose: fetch all reviews for admin
- Auth: `ADMIN`
- Query parameters:
  - `page` (number, optional)
  - `limit` (number, optional)
- Response data: paginated list of reviews

---

## Health check

### GET `/api/health`

- Purpose: verify the API is alive and healthy
- Auth: none
- Response data:
  - `status`: `healthy`
  - `uptime`: server uptime in seconds
  - `timestamp`: current server timestamp

## Common frontend notes

- Always send JSON request bodies for POST/PATCH.
- Use `application/json` header.
- Pass query params exactly as page/limit for paginated endpoints.
- Read `meta` from paginated responses and use `meta.totalPage` for UI page controls.
- Authentication is required for protected endpoints; token may also be supplied via cookie.
- When creating a rental, the backend auto-generates:
  - rental order id
  - rental item ids
  - payment record and transaction data
  - timestamps
- When registering a user, backend auto-generates:
  - user id
  - creation timestamp
  - password hashing

---

## Minimal request examples

### Example: fetch gear page 1 with 20 items
```http
GET /api/gear?page=1&limit=20
```

### Example: create rental
```http
POST /api/rentals
Content-Type: application/json
Authorization: Bearer <token>

{
  "startDate": "2026-08-10",
  "endDate": "2026-08-12",
  "items": [
    { "gearItemId": "gear-uuid-1", "quantity": 2 }
  ]
}
```

### Example: create review
```http
POST /api/reviews
Content-Type: application/json
Authorization: Bearer <token>

{
  "gearItemId": "gear-uuid-1",
  "rentalOrderId": "order-uuid-1",
  "rating": 5,
  "comment": "Excellent gear"
}
```
