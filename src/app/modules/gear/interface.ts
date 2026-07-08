import { GearStatus, Prisma } from "../../../generated/prisma/client";

export type TCreateGearPayload = {
  categoryId: string;
  name: string;
  brand?: string;
  description?: string;
  pricePerDay: number;
  stockQuantity: number;
  availableQuantity?: number;
  imageUrl?: string;
  specifications?: Prisma.InputJsonValue;
};

export type TUpdateGearPayload = Partial<TCreateGearPayload> & {
  status?: GearStatus;
};

export type TGearQuery = Record<string, unknown>;