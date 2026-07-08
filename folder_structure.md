
## 4.1 Project Structure

```bash
.
Root
|
src
├── app
│   ├── config
│   │   └── index.ts
│   ├── errors
│   │   └── AppError.ts
│   ├── helpers
│   │   ├── catchAsync.ts
│   │   ├── jwtHelpers.ts
│   │   ├── prisma.ts
│   │   ├── sendResponse.ts
│   │   └── stripe.ts
│   ├── interfaces
│   │   ├── error.ts
│   │   └── index.ts
│   ├── middlewares
│   │   ├── auth.ts
│   │   ├── globalErrorHandler.ts
│   │   ├── notFound.ts
│   │   └── validateRequest.ts
│   ├── modules
│   │   ├── admin
│   │   │   ├── controller.ts
│   │   │   ├── interface.ts
│   │   │   ├── route.ts
│   │   │   ├── service.ts
│   │   │   └── validation.ts
│   │   ├── auth
│   │   │   ├── controller.ts
│   │   │   ├── interface.ts
│   │   │   ├── route.ts
│   │   │   ├── service.ts
│   │   │   └── validation.ts
│   │   ├── category
│   │   │   ├── controller.ts
│   │   │   ├── interface.ts
│   │   │   ├── route.ts
│   │   │   ├── service.ts
│   │   │   └── validation.ts
│   │   ├── gear
│   │   │   ├── constant.ts
│   │   │   ├── controller.ts
│   │   │   ├── interface.ts
│   │   │   ├── route.ts
│   │   │   ├── service.ts
│   │   │   ├── utils.ts
│   │   │   └── validation.ts
│   │   ├── payment
│   │   │   ├── constant.ts
│   │   │   ├── controller.ts
│   │   │   ├── interface.ts
│   │   │   ├── route.ts
│   │   │   ├── service.ts
│   │   │   ├── utils.ts
│   │   │   └── validation.ts
│   │   ├── rental
│   │   │   ├── controller.ts
│   │   │   ├── interface.ts
│   │   │   ├── route.ts
│   │   │   ├── service.ts
│   │   │   ├── utlis.ts
│   │   │   └── validation.ts
│   │   └── review
│   │       ├── constant.ts
│   │       ├── controller.ts
│   │       ├── interface.ts
│   │       ├── route.ts
│   │       ├── service.ts
│   │       └── validation.ts
│   ├── routes
│   │   ├── health.ts
│   │   ├── index.ts
│   │   └── root.ts
│   └── utils
│       └── excludeField.ts
├── app.ts
├── generated
│   └── prisma
│       ├── browser.ts
│       ├── client.ts
│       ├── commonInputTypes.ts
│       ├── enums.ts
│       ├── internal
│       │   ├── class.ts
│       │   ├── prismaNamespace.ts
│       │   └── prismaNamespaceBrowser.ts
│       ├── models
│       │   ├── Category.ts
│       │   ├── GearItem.ts
│       │   ├── Payment.ts
│       │   ├── RentalOrder.ts
│       │   ├── RentalOrderItem.ts
│       │   ├── Review.ts
│       │   └── User.ts
│       └── models.ts
└── server.ts