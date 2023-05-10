

export type AdvertisementType = 'BASIC' | 'EXTRA';


export interface IAdvertisement {
	id: number;
	ownerId: string;
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