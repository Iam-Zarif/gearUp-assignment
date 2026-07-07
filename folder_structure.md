
## 4.1 Project Structure

```bash
.
Root
├── prisma
│   ├── schema
│   │   ├── base.prisma
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
│   │   ├── constants
│   │   │   └── index.ts
│   │   ├── errors
│   │   │   └── AppError.ts
│   │   ├── helpers
│   │   │   ├── catchAsync.ts
│   │   │   ├── jwtHelpers.ts
│   │   │   ├── pick.ts
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
│   │   │   │   ├── constant.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   ├── auth
│   │   │   │   ├── constant.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   ├── category
│   │   │   │   ├── constant.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   ├── gear
│   │   │   │   ├── constant.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   ├── payment
│   │   │   │   ├── constant.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   ├── rental
│   │   │   │   ├── constant.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   ├── review
│   │   │   │   ├── constant.ts
│   │   │   │   ├── controller.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── validation.ts
│   │   │   └── user
│   │   │       ├── constant.ts
│   │   │       ├── controller.ts
│   │   │       ├── route.ts
│   │   │       ├── service.ts
│   │   │       └── validation.ts
│   │   ├── routes
│   │   │   └── index.ts
│   │   ├── shared
│   │   │   └── queryBuilder.ts
│   │   └── utils
│   │       ├── calculateRentalAmount.ts
│   │       └── excludeField.ts
│   ├── app.ts
│   └── server.ts
└── tsconfig.json
└── package.json

