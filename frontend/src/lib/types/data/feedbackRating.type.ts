export interface IFeedbackRating {
    id: number;
    proposalId: number;
    feedbackId: number;
    authorId: string;
    rating: number;
    ratingExplanation?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IFeedbackRatingScaleAggregateSummary {
    ratingAvg: number;
}

export interface IFeedbackRatingScaleAggregateResponse {
    ratings: IFeedbackRating[];
    summary: IFeedbackRatingScaleAggregateSummary;
}

export interface IFeedbackRatingYesNoAggregateSummary {
    ratingRatio: number;
    yesRatings: number;
    noRatings: number;
}

export interface IFeedbackRatingYesNoAggregateResponse {
    ratings: IFeedbackRating[];
    summary: IFeedbackRatingYesNoAggregateSummary;
}