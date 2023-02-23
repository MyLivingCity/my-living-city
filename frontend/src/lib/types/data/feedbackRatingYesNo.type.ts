export interface IFeedbackRatingYesNo {
    id: number;
    ideaId: number;
    authorId: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

export interface IFeedbackRatingYesNoAggregateSummary {
    ratingRatio: number;
    ratingCount: number;
    yesRatings: number;
    noRatings: number;
}