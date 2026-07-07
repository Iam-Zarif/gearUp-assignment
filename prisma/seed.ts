import bcrypt from "bcrypt";
import { UserRole } from "../src/generated/prisma/client";
import config from "../src/app/config";
import { prisma } from "../src/app/helpers/prisma";

const main = async () => {
  const hashedPassword = await bcrypt.hash(
    config.admin.password,
    config.bcrypt_salt_rounds
  );

  await prisma.user.upsert({
    where: {
      email: config.admin.email,
    },
    update: {},
    create: {
      name: "GearUp Admin",
      email: config.admin.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      phone: "01700000000",
      address: "Dhaka, Bangladesh",
    },
  });

  const categories = [
    {
      name: "Cycling",
      description: "Bikes, helmets, and cycling accessories",
    },
    {
      name: "Camping",
      description: "Tents, backpacks, sleeping bags, and camping tools",
    },
    {
      name: "Fitness",
      description: "Gym, workout, and training equipment",
    },
    {
      name: "Water Sports",
      description: "Outdoor water sports rental equipment",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {},
      create: category,
    });
  }

  console.log("Admin user and initial categories seeded successfully");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });