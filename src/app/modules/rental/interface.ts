export type TRentalItemPayload = {
  gearItemId: string;
  quantity: number;
};

export type TCreateRentalPayload = {
  startDate: string;
  endDate: string;
  items: TRentalItemPayload[];
};

export type TProviderRentalStatus =
  | "CONFIRMED"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELLED";

export type TUpdateRentalStatusPayload = {
  status: TProviderRentalStatus;
};