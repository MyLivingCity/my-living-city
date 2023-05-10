import { AdvertisementType } from "../data/advertisement.type";

export interface CreateAdvertisementInput {
	adTitle: string;
    adType: AdvertisementType;
    duration: number;
    adPosition: string;
    imagePath: any;
    externalLink: string;
    published: boolean;
}