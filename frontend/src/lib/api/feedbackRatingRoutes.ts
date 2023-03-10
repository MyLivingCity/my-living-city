import axios from "axios";
import { type } from "os";
import { API_BASE_URL } from "../constants";
import { IFeedbackRating, IFeedbackRatingYesNoAggregateResponse, IFeedbackRatingScaleAggregateResponse } from "../types/data/feedbackRating.type";

export const getAllFeedbackRatingsUnderFeedback = async (
    feedbackId: string,
    proposalId: string
): Promise<IFeedbackRating[]> => {
    /*
    if (!ideaId) {
      throw new Error("An ideaId must be specified to fetch all ratings under idea.")
    }
  */
    const res = await axios.get<IFeedbackRating[]>(
        `${API_BASE_URL}/feedbackRating/getall/${feedbackId ? feedbackId : "7"}/${proposalId ? proposalId : "7"}`
    );
    return res.data;
}

export const getAllFeedbackRatingsUnderFeedbackWithAggregations = async (
    feedbackId: string,
    proposalId: string,
    type: string
): Promise<IFeedbackRatingYesNoAggregateResponse | IFeedbackRatingScaleAggregateResponse> => {
    if (!feedbackId) {
        throw new Error(
            "An feedbackId must be specified to fetch all ratings under feedback."
        );
    }

    if (!proposalId) {
        throw new Error(
            "An proposalId must be specified to fetch all feedbacks under proposal."
        );
    }

    const res = await axios.get<IFeedbackRatingYesNoAggregateResponse | IFeedbackRatingScaleAggregateResponse>(
        `${API_BASE_URL}/feedbackRating/getall/${proposalId ? proposalId : "7"}/${feedbackId ? feedbackId : "7"}/aggregations/${type ? type : "scale"}`
    );
    return res.data;
}