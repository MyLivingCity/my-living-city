import axios from "axios";
import { API_BASE_URL } from "src/lib/constants/constants";
import { type IIdeaWithAggregations } from "src/lib/types/ideas/idea.types";

export const postAllIdeasWithBreakdown = async (take?: number) => {
  let reqBody = {};
  if (!take) {
    reqBody = {
      take,
    };
  }
  const res = await axios.post<IIdeaWithAggregations[]>(
    `${API_BASE_URL}/idea/getall/aggregations`,
    reqBody,
  );
  return res.data;
};
