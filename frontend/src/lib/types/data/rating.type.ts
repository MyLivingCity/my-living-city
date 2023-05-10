export interface IRating {
	id: number;
	ideaId: number;
	authorId: string;
	rating: number;
	ratingExplanation?: string;
	createdAt: string;
	updatedAt: string;
}

export interface IRatingValueBreakdown {
	strongDisagree: number;
	slightDisagree: number;
	neutral: number;
	slightAgree: number;
	strongAgree: number;
}

// export interface RatingValueBreakdown {
// 	[ratingValue: string]: number;
// }

export interface IRatingAggregateSummary {
	ratingAvg: number;
	ratingCount: number;
	posRatings: number;
	negRatings: number;
	ratingValueBreakdown: IRatingValueBreakdown;
}
export interface IRatingAggregateResponse {
	ratings: IRating[];
	summary: IRatingAggregateSummary;
}
