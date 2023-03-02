export interface IFeedbackRatingYesNo {
    id: number;
    ideaId: number;
    authorId: string;
    rating: string;
    createdAt: string;
    updatedAt: string;
}

export interface IFeedbackRatingYesNoAggregateSummary {
    ratingRatio: number;
    ratingCount: number;
    yesRatings: number;
    noRatings: number;
}

export interface IFeedbackRatingYesNoAggregateResponse {
    ratings: IFeedbackRatingYesNo[];
    summary: IFeedbackRatingYesNoAggregateSummary;
}