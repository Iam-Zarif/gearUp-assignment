import bcrypt from "bcrypt";
import { GearStatus, UserRole } from "../src/generated/prisma/client";
import config from "../src/app/config";
import { prisma } from "../src/app/helpers/prisma";

const categories = [
  { name: "Camping", description: "Tents, sleeping gear, and campsite essentials.", imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4" },
  { name: "Hiking", description: "Reliable equipment for trails and treks.", imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306" },
  { name: "Cycling", description: "Bikes and protective cycling equipment.", imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e" },
  { name: "Water Sports", description: "Gear for lakes, rivers, and the sea.", imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635" },
  { name: "Winter Sports", description: "Equipment for cold-weather adventures.", imageUrl: "https://images.unsplash.com/photo-1486911278844-a81c5267e227" },
  { name: "Fitness", description: "Training equipment for every workout.", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438" },
  { name: "Climbing", description: "Safety-first climbing and bouldering gear.", imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851" },
  { name: "Team Sports", description: "Equipment for competitive group sports.", imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211" },
];

const products = [
  ["Camping", "Alpine 4-Person Tent", "TrailMaster", 850, "Four-season tent with rainfly", "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4"],
  ["Camping", "Summit Sleeping Bag", "NorthPeak", 350, "Warm and compact sleeping bag", "https://images.unsplash.com/photo-1504851149312-7a075b496cc7"],
  ["Camping", "Portable Camp Stove", "FireTrail", 220, "Two-burner outdoor cooking stove", "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7"],
  ["Camping", "LED Lantern Set", "CampGlow", 120, "Rechargeable lanterns for campsites", "https://images.unsplash.com/photo-1532339142463-fd0a8979791a"],
  ["Camping", "Family Camping Table", "OutdoorPro", 180, "Foldable aluminium camp table", "https://images.unsplash.com/photo-1532339142463-fd0a8979791a"],
  ["Hiking", "Trekking Backpack 55L", "PeakPath", 450, "Adjustable backpack with rain cover", "https://images.unsplash.com/photo-1551632811-561732d1e306"],
  ["Hiking", "Carbon Trekking Poles", "TrailMaster", 160, "Lightweight adjustable pole pair", "https://images.unsplash.com/photo-1551632811-561732d1e306"],
  ["Hiking", "Hydration Pack 2L", "AquaTrail", 140, "Insulated hydration pack", "https://images.unsplash.com/photo-1526481280695-3c687fd643ed"],
  ["Hiking", "GPS Hiking Device", "PathFinder", 300, "Offline trail navigation device", "https://images.unsplash.com/photo-1551632811-561732d1e306"],
  ["Hiking", "All-Weather Hiking Boots", "SummitStep", 280, "Waterproof ankle-support boots", "https://images.unsplash.com/photo-1551632811-561732d1e306"],
  ["Cycling", "Mountain Bike Pro", "RidgeRide", 1100, "29-inch trail mountain bike", "https://images.unsplash.com/photo-1485965120184-e220f721d03e"],
  ["Cycling", "Road Bike Carbon", "Velocity", 1400, "Lightweight endurance road bike", "https://images.unsplash.com/photo-1485965120184-e220f721d03e"],
  ["Cycling", "Cycling Helmet", "SafeRide", 90, "Ventilated impact-protection helmet", "https://images.unsplash.com/photo-1502744688674-c619d1586c9e"],
  ["Cycling", "Bike Travel Case", "RoadReady", 250, "Hard-shell bicycle travel case", "https://images.unsplash.com/photo-1485965120184-e220f721d03e"],
  ["Cycling", "Electric City Bike", "UrbanWheel", 950, "Comfortable pedal-assist city bike", "https://images.unsplash.com/photo-1502744688674-c619d1586c9e"],
  ["Water Sports", "Stand Up Paddle Board", "BlueWave", 700, "Inflatable paddle board with paddle", "https://images.unsplash.com/photo-1530549387789-4c1017266635"],
  ["Water Sports", "Single Kayak", "RiverRun", 650, "Stable sit-on-top recreational kayak", "https://images.unsplash.com/photo-1502680390469-be75c86b636f"],
  ["Water Sports", "Wetsuit 3mm", "AquaFlex", 250, "Flexible full-body wetsuit", "https://images.unsplash.com/photo-1530549387789-4c1017266635"],
  ["Water Sports", "Snorkel Set", "OceanView", 100, "Mask, snorkel, and fins set", "https://images.unsplash.com/photo-1544551763-46a013bb70d5"],
  ["Water Sports", "Life Jacket", "SafeFloat", 80, "Certified buoyancy vest", "https://images.unsplash.com/photo-1502680390469-be75c86b636f"],
  ["Winter Sports", "All-Mountain Skis", "SnowLine", 950, "Versatile skis with bindings", "https://images.unsplash.com/photo-1486911278844-a81c5267e227"],
  ["Winter Sports", "Snowboard Set", "WhitePeak", 900, "Board and binding package", "https://images.unsplash.com/photo-1486911278844-a81c5267e227"],
  ["Winter Sports", "Ski Helmet", "FrostGuard", 110, "Warm and protective snow helmet", "https://images.unsplash.com/photo-1486911278844-a81c5267e227"],
  ["Winter Sports", "Snowshoes", "TrailFrost", 240, "All-terrain snowshoe pair", "https://images.unsplash.com/photo-1486911278844-a81c5267e227"],
  ["Winter Sports", "Ski Goggles", "IceLens", 75, "Anti-fog UV-protection goggles", "https://images.unsplash.com/photo-1486911278844-a81c5267e227"],
  ["Fitness", "Adjustable Dumbbell Set", "IronCore", 300, "Weight-adjustable dumbbell pair", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438"],
  ["Fitness", "Yoga Mat Premium", "FlexFlow", 70, "Non-slip cushioned yoga mat", "https://images.unsplash.com/photo-1518611012118-696072aa579a"],
  ["Fitness", "Kettlebell Set", "IronCore", 220, "Three weighted kettlebells", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438"],
  ["Fitness", "Resistance Band Kit", "FlexFlow", 65, "Five-band training kit", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438"],
  ["Fitness", "Folding Treadmill", "RunSmart", 850, "Compact home cardio machine", "https://images.unsplash.com/photo-1538805060514-97d9cc17730c"],
  ["Climbing", "Climbing Rope 70m", "RockSafe", 280, "Dynamic rope for sport climbing", "https://images.unsplash.com/photo-1522163182402-834f871fd851"],
  ["Climbing", "Harness and Belay Set", "RockSafe", 200, "Comfort harness with belay device", "https://images.unsplash.com/photo-1522163182402-834f871fd851"],
  ["Climbing", "Bouldering Crash Pad", "GripStone", 350, "Foldable high-density crash pad", "https://images.unsplash.com/photo-1522163182402-834f871fd851"],
  ["Climbing", "Climbing Helmet", "CliffGuard", 100, "Lightweight protective climbing helmet", "https://images.unsplash.com/photo-1522163182402-834f871fd851"],
  ["Climbing", "Quickdraw Set", "RockSafe", 190, "Six durable quickdraws", "https://images.unsplash.com/photo-1522163182402-834f871fd851"],
  ["Team Sports", "Football Match Ball", "PlayPro", 70, "Professional-size football", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211"],
  ["Team Sports", "Cricket Bat Pro", "WillowStrike", 250, "English willow cricket bat", "https://images.unsplash.com/photo-1593341646782-e0b495cff86d"],
  ["Team Sports", "Badminton Racket Pair", "ShuttlePro", 120, "Two graphite badminton rackets", "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea"],
  ["Team Sports", "Volleyball Net Set", "CourtKing", 160, "Portable net and ball set", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211"],
  ["Team Sports", "Basketball Hoop", "CourtKing", 400, "Adjustable portable basketball hoop", "https://images.unsplash.com/photo-1546519638-68e109498ffc"],
] as const;

const main = async () => {
  const providerPassword = await bcrypt.hash("provider123", config.bcrypt_salt_rounds);
  const provider = await prisma.user.upsert({
    where: { email: "catalog.provider@gearup.com" },
    update: { name: "GearUp Catalog Provider", role: UserRole.PROVIDER },
    create: { name: "GearUp Catalog Provider", email: "catalog.provider@gearup.com", password: providerPassword, role: UserRole.PROVIDER, phone: "01700000000", address: "Dhaka, Bangladesh" },
  });

  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const result = await prisma.category.upsert({ where: { name: category.name }, update: category, create: category });
    categoryMap.set(result.name, result.id);
  }

  for (const [categoryName, name, brand, pricePerDay, description, imageUrl] of products) {
    const categoryId = categoryMap.get(categoryName);
    if (!categoryId) throw new Error(`Category ${categoryName} was not created`);
    const data = { providerId: provider.id, categoryId, brand, description, pricePerDay, stockQuantity: 5, availableQuantity: 5, imageUrl, specifications: { condition: "Excellent", rentalReady: true }, status: GearStatus.AVAILABLE };
    const existingGear = await prisma.gearItem.findFirst({ where: { providerId: provider.id, name } });
    if (existingGear) await prisma.gearItem.update({ where: { id: existingGear.id }, data });
    else await prisma.gearItem.create({ data: { name, ...data } });
  }

  console.log("Created 8 categories and 40 catalog products.");
};

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
