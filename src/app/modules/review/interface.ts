export type TCreateReviewPayload = {
  gearItemId: string;
  rentalOrderId: string;
  rating: number;
  comment?: string;
};

export type TUpdateReviewPayload = {
  rating?: number;
  comment?: string;
};