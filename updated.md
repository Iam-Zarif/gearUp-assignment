# Update Summary

## Backend updates

### Search optimization
- Updated `src/app/modules/gear/utils.ts` to use index-friendly search for `searchTerm`:
  - `name.startsWith(searchTerm)`
  - `brand.startsWith(searchTerm)`
  - `description.contains(searchTerm)` only as fallback
- Updated `prisma/schema/gear.prisma` to add indexes for faster search:
  - `@@index([name])`
  - `@@index([categoryId, status])`

### Pagination support added
- Added paginated listing for admin APIs in `src/app/modules/admin/service.ts` and `src/app/modules/admin/controller.ts`:
  - `GET /admin/users`
  - `GET /admin/gear`
  - `GET /admin/rentals`
  - `GET /admin/payments`
  - `GET /admin/reviews`
- Added paginated review listing in `src/app/modules/review/service.ts` and `src/app/modules/review/controller.ts`:
  - `GET /reviews`
- Added paginated provider order listing in `src/app/modules/rental/service.ts` and `src/app/modules/rental/controller.ts`:
  - provider order list endpoint

### Rental performance improvement
- Updated `src/app/modules/rental/service.ts` to use a `Map` for gear lookup when creating rentals.
- This removes repeated `.find()` scans over the item list.

## Frontend implications

### Required frontend updates
- If the frontend wants to use pagination controls, pass query params:
  - `page`
  - `limit`
- Read the response `meta` object on list endpoints to support pagination UI.
- Always use the returned `meta.limit` value rather than hard-coding a page size in the frontend.
- Keep request `limit` and response `meta.limit` synced so the UI reflects the backend page count exactly.

### Pagination contract
- Backend defaults to `page=1` and `limit=10` when parameters are omitted.
- Backend enforces a maximum `limit` of `100`.
- Frontend should not assume the total page count; use `meta.totalPage` from the response.

### Not required for basic usage
- Existing endpoints still return item data under `data`.
- If no pagination params are provided, endpoints default to `page=1` and `limit=10`.
- No frontend code change is needed if the UI continues to consume `data` as the list payload.

## Big O impact
- Admin listing APIs:
  - before: `O(n)` full list scan
  - after: `O(k)` for page retrieval plus a constant `O(1)` count operation
- Review listing API:
  - before: `O(n)`
  - after: `O(k)`
- Provider order listing:
  - before: `O(n)`
  - after: `O(k)`
- Rental creation lookup:
  - before: `O(m * n)` for repeated `.find()` per item
  - after: `O(m + n)` using a lookup map
- Gear search:
  - before: `O(n)` with unindexed substring searches
  - after: `O(log n + k)` for indexed starts-with searches on `name` and `brand`, with fallback to `description`

## Notes
- The backend changes are already coded in the repository.
- A Prisma migration should be generated to apply the new `gear_items` indexes to the database.
- Frontend should use `data` plus `meta` when consuming paginated response endpoints.
