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
      phone: "01933329902",
      address: "Dhaka, Bangladesh",
    },
  });


};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });