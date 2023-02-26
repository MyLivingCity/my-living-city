export interface IFeedbackRatingScale {
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