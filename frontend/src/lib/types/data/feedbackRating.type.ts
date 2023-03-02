export interface IFeedbackRating {
    id: number;
    ideaId: number;
    authorId: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

export interface IFeedbackRatingScaleValueBreakdown {
    oneRatings: number;
    twoRatings: number;
    threeRatings: number;
    fourRatings: number;
}

export interface IFeedbackRatingScaleAggregateSummary {
    ratingAvg: number;
    ratingCount: number;
    ratingValueBreakdown: IFeedbackRatingScaleValueBreakdown;
}

export interface IFeedbackRatingScaleAggregateResponse {
    ratings: IFeedbackRating[];
    summary: IFeedbackRatingScaleAggregateSummary;
}

export interface IFeedbackRatingYesNoAggregateSummary {
    ratingRatio: number;
    ratingCount: number;
    yesRatings: number;
    noRatings: number;
}

export interface IFeedbackRatingYesNoAggregateResponse {
    ratings: IFeedbackRating[];
    summary: IFeedbackRatingYesNoAggregateSummary;
}