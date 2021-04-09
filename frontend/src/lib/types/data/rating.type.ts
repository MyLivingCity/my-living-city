export interface Rating {
	id: number;
	ideaId: number;
	authorId: string;
	rating: number;
	ratingExplanation?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface RatingAggregateSummary {
	ratingAvg: number;
	ratingCount: number;
	posRatings: number;
	negRatings: number;
}
export interface RatingAggregateResponse {
	ratings: Rating[];
	summary: RatingAggregateSummary;
}
