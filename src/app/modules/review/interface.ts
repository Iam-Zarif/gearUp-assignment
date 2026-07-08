export type TCreateReviewPayload = {
  gearItemId: string;
  rentalOrderId: string;
  rating: number;
  comment?: string;
};