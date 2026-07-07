import { Server } from "http";
import app from "./app";
import config from "./app/config";
import { prisma } from "./app/helpers/prisma";

let server: Server;

const main = async () => {
  try {
    await prisma.$connect();

    server = app.listen(Number(config.port), () => {
      console.log(`GearUp server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection detected:", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception detected:", error);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received");

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }
});