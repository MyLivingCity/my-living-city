

export type AdvertisementType = 'PAID' | 'COMPLIMENTARY';


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
    imagePath: any;
	createdAt: string;
	updatedAt: string;
}