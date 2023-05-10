export interface IGeo {
	id: number;
	userId: string;
	lat?: string | null;
	lon?: string | null;
	createdAt: Date;
	updatedAt: Date;
}
