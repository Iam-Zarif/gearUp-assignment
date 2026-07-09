
## 4.1 Project Structure

```bash
.
Root
├── README.md
├── dist
│   ├── server.js
│   └── server.js.map
├── folder_structure.md
├── package.json
├── postman
│   ├── 00_gearup-local-environment.postman_environment.json
│   ├── 01_auth.postman_collection.json
│   ├── 02_admin.postman_collection.json
│   ├── 03_categories.postman_collection.json
│   ├── 04_gear.postman_collection.json
│   ├── 05_gear_filter_and_search.postman_collection.json
│   ├── 06_rental.postman_collection.json
│   ├── 07_provider_orders.postman_collection.json
│   ├── 08_payment.postman_collection.json
│   ├── 09_review.postman_collection.json
│   └── 10_health.postman_collection.json
├── prisma
│   ├── migrations
│   │   ├── 20260707185148_init
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema
│   │   ├── category.prisma
│   │   ├── enums.prisma
│   │   ├── gear.prisma
│   │   ├── payment.prisma
│   │   ├── rental.prisma
│   │   ├── review.prisma
│   │   ├── schema.prisma
│   │   └── user.prisma
│   └── seed.ts
├── prisma.config.ts
├── src
│   ├── app
│   │   ├── config
│   │   │   └── index.ts
│   │   ├── errors
│   │   │   └── AppError.ts
│   │   ├── helpers
│   │   │   ├── catchAsync.ts
│   │   │   ├── jwtHelpers.ts
│   │   │   ├── prisma.ts
│   │   │   ├── sendResponse.ts
│   │   │   └── stripe.ts
│   │   ├── interfaces
│   │   │   ├── error.ts
│   │   │   └── index.ts
│   │   ├── middlewares
│   │   │   ├── auth.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   └── validateRequest.ts
│   │   ├── modules
│   │   │   ├── admin
│   │   │   │   ├── controller.ts
│   │   │   │   ├── interface.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   ├── auth
│   │   │   │   ├── controller.ts
│   │   │   │   ├── interface.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   ├── category
│   │   │   │   ├── controller.ts
│   │   │   │   ├── interface.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   ├── gear
│   │   │   │   ├── constant.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── interface.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── validation.ts
│   │   │   ├── payment
│   │   │   │   ├── constant.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── interface.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── validation.ts
│   │   │   ├── rental
│   │   │   │   ├── controller.ts
│   │   │   │   ├── interface.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── validation.ts
│   │   │   └── review
│   │   │       ├── constant.ts
│   │   │       ├── controller.ts
│   │   │       ├── interface.ts
│   │   │       ├── route.ts
│   │   │       ├── service.ts
│   │   │       └── validation.ts
│   │   ├── routes
│   │   │   ├── health.ts
│   │   │   ├── index.ts
│   │   │   └── root.ts
│   │   └── utils
│   │       └── excludeField.ts
│   ├── app.ts
│   ├── generated
│   │   └── prisma
│   │       ├── browser.ts
│   │       ├── client.ts
│   │       ├── commonInputTypes.ts
│   │       ├── enums.ts
│   │       ├── internal
│   │       │   ├── class.ts
│   │       │   ├── prismaNamespace.ts
│   │       │   └── prismaNamespaceBrowser.ts
│   │       ├── models
│   │       │   ├── Category.ts
│   │       │   ├── GearItem.ts
│   │       │   ├── Payment.ts
│   │       │   ├── RentalOrder.ts
│   │       │   ├── RentalOrderItem.ts
│   │       │   ├── Review.ts
│   │       │   └── User.ts
│   │       └── models.ts
│   └── server.ts
├── tsconfig.json
├── tsup.config.ts
└── vercel.json
