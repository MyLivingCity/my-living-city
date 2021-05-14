import axios from "axios";
import { API_BASE_URL } from "../constants";
import { IGetAllIdeasWithSort, getAllIdeasWithSortDefault, IIdeaOrderByAggregate } from "../types/args/getAllIdeas.args";
import { IIdeaWithAggregations, IIdeaWithRelationship } from "../types/data/idea.type";
import { ICreateIdeaInput } from "../types/input/createIdea.input";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";

export const getAllIdeas = async () => {
  const res = await axios.get<IIdeaWithRelationship[]>(`${API_BASE_URL}/idea/getall`);
  return res.data;
}

export const postAllIdeasWithSort = async (
  sortOptions: IGetAllIdeasWithSort = getAllIdeasWithSortDefault
) => {
  const res = await axios.post<IIdeaWithRelationship[]>(
    `${API_BASE_URL}/idea/getall/with-sort`,
    sortOptions,
  );
  return res.data;
}

export const postAllIdeasWithBreakdown = async (
  take?: number
) => {
  let reqBody = {};
  if (!!take) {
    reqBody = {
      take
    }
  }
  const res = await axios.post<IIdeaWithAggregations[]>(
    `${API_BASE_URL}/idea/getall/aggregations`,
    reqBody,
  );
  return res.data;
}


export const getSingleIdea = async (ideaId: string) => {
  const res = await axios.get<IIdeaWithRelationship>(`${API_BASE_URL}/idea/get/${ideaId}`);
  return res.data;
}

export const postCreateIdea = async (ideaData: ICreateIdeaInput, token: string | null) => {
  // Parse data and data checking
  const { categoryId, title, description} = ideaData;
  const parsedCatId = Number(categoryId);

  if (!parsedCatId || !title || !description) {
    throw new Error('You must choose a category, define a title, and description of your idea.');
  }

  if (!token) {
    throw new Error('Your session has expired. Please relogin and try again.');
  }

  const parsedPayload = {
    ...ideaData,
    categoryId: parsedCatId,
  }

  const res = await axios.post<IIdeaWithRelationship>(
    `${API_BASE_URL}/idea/create`, 
    parsedPayload, 
    getAxiosJwtRequestOption(token)
  );
  return res.data;
}

