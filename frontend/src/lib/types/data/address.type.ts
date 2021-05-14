export interface IAddress {
	id: number;
	userId: string;
	streetAddress?: string;
	streetAddress2?: string;
	city?: string;
	country?: string;
	postalCode?: string;
	createdAt: Date;
	updatedAt: Date;
}
