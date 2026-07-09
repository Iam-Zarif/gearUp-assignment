# GearUp Backend Assignment

Student ID: `L2B7-0284`  
Last digit is `4`, so the assigned project is **GearUp**.

## Links

Live API: https://gear-up-assignment.vercel.app  
Local API: http://localhost:5001   
GitHub Repo: https://github.com/Iam-Zarif/gearUp-assignment  
ERD: https://drawsql.app/teams/webefo/diagrams/gearup/embed  
Folder Structure: https://github.com/Iam-Zarif/gearUp-assignment/blob/main/folder_structure.md  
Postman Collection: https://github.com/Iam-Zarif/gearUp-assignment/tree/main/postman   
API Walkthrow: https://drive.google.com/file/d/1fUVNBNrIILGMPHD1qxDS7fR03mop30ip/view?usp=sharing

## Admin Credentials

Email: `admin@gearup.com`  
Password: `admin123`

## Development Approach

1. Designed ERD manually.
2. Selected and installed required technologies.
3. Configured Prisma, Stripe, environment variables, and server setup.
4. Planned folder structure before coding.
5. Developed modules service-by-service, tested with Postman, and pushed with logical commits.

## Database Note

The assignment required these main tables:

- Users
- GearItems
- Categories
- RentalOrders
- Payments
- Reviews

I added one extra bridge table:

- RentalOrderItems

Reason: one rental order can contain multiple gear items, and one gear item can be rented in multiple orders. Following the module guideline, I avoided direct many-to-many relation and used a bridge table.

## API Documentation

Postman collections are included feature-wise inside the `postman/` folder.

All requests use dynamic environment variables:

| Variable | Purpose |
|---|---|
| `AdminToken` | Admin JWT token |
| `ProviderToken` | Provider JWT token |
| `CustomerToken` | Customer JWT token |
| `userId` | User id for admin user status update |
| `categoryId` | Category id for category update/delete |
| `gearItemId` | Gear item id for gear, rental, and review APIs |
| `rentalOrderId` | Rental order id for payment, provider order, and review APIs |
| `paymentId` | Payment id for payment details |
| `reviewId` | Review id for review details/update/delete |
| `sessionId` | Stripe checkout session id for payment confirmation |
