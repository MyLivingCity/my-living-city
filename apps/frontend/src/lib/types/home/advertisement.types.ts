export type AdvertisementType = "PAID" | "COMPLIMENTARY";

export interface IAdvertisement {
  id: number;
  ownerId: string;
  ownerEmail: string;
  adTitle: string;
  adType: AdvertisementType;
  duration: number;
  adPosition: string;
  externalLink: string;
  published: boolean;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISegmentAdPrice {
  id: number | null;
  segmentId: number;
  segmentName: string;
  weeklyPrice: string | null;
}

export interface IDefaultAdPrice {
  id: number;
  weeklyPrice: string;
}
