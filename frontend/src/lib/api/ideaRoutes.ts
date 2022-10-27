import axios from "axios";
import { API_BASE_URL } from "../constants";
import {
  IGetAllIdeasWithSort,
  getAllIdeasWithSortDefault,
  IIdeaOrderByAggregate,
} from "../types/args/getAllIdeas.args";
import {
  IIdeaWithAggregations,
  IIdeaWithRelationship,
} from "../types/data/idea.type";
import { ICreateIdeaInput } from "../types/input/createIdea.input";
import { getAxiosJwtRequestOption } from "./axiosRequestOptions";

export const getAllIdeas = async () => {
  const res = await axios.get<IIdeaWithRelationship[]>(
    `${API_BASE_URL}/idea/getall`
  );
  return res.data;
};

export const postAllIdeasWithSort = async (
  sortOptions: IGetAllIdeasWithSort = getAllIdeasWithSortDefault
) => {
  const res = await axios.post<IIdeaWithRelationship[]>(
    `${API_BASE_URL}/idea/getall/with-sort`,
    sortOptions
  );
  return res.data;
};

export const postAllIdeasWithBreakdown = async (take?: number) => {
  let reqBody = {};
  if (!!take) {
    reqBody = {
      take,
    };
  }
  const res = await axios.post<IIdeaWithAggregations[]>(
    `${API_BASE_URL}/idea/getall/aggregations`,
    reqBody
  );

  console.log("All ideas", res.data)

  return res.data
};

export const getUserIdeas = async (userId: string) => {
  const res = await axios.get<any>(`${API_BASE_URL}/idea/getall/${userId}`);
  console.log(res.data)
  return res.data;
};

export const getSingleIdea = async (ideaId: string) => {
  const res = await axios.get<IIdeaWithRelationship>(
    `${API_BASE_URL}/idea/get/${ideaId}`
  );
  console.log(res.data);
  return res.data;
};

export const postCreateIdea = async (
  ideaData: ICreateIdeaInput,
  banned: boolean,
  token: string | null
) => {
  const formData = new FormData();
  // Parse data and data checking

  const {
    categoryId,
    title,
    description,
    superSegmentId,
    segmentId,
    subSegmentId,
    communityImpact,
    natureImpact,
    artsImpact,
    energyImpact,
    manufacturingImpact,
    address,
    geo,
    imagePath,
    supportingProposalId,
    state,
  } = ideaData;

  if (!categoryId || !title || !description) {
    throw new Error(
      "You must choose a category, define a title, and description of your idea."
    );
  }

  if (!segmentId && !subSegmentId && !superSegmentId) {
    throw new Error("You must provide a segmentId or subSegmentId. ");
  }

  if (!token) {
    throw new Error("Your session has expired. Please relogin and try again.");
  }

  let formBody = new FormData();

  formBody.append("categoryId", categoryId.toString());

  formBody.append("title", title);

  formBody.append("description", description);

  if (segmentId) {
    formBody.append("segmentId", segmentId.toString());
  }
  if (superSegmentId) {
    formBody.append("superSegmentId", superSegmentId.toString());
  }
  if (subSegmentId) {
    formBody.append("subSegmentId", subSegmentId.toString());
  }

  if (communityImpact) {
    formBody.append("communityImpact", communityImpact);
  }

  if (natureImpact) {
    formBody.append("natureImpact", natureImpact);
  }

  if (artsImpact) {
    formBody.append("artsImpact", artsImpact);
  }

  if (energyImpact) {
    formBody.append("energyImpact", energyImpact);
  }

  if (manufacturingImpact) {
    formBody.append("manufacturingImpact", manufacturingImpact);
  }

  if (address) {
    formBody.append("addressData", JSON.stringify(address));
  }

  if (geo) {
    formBody.append("geo", JSON.stringify(geo));
  }

  if (imagePath) {
    formBody.append("imagePath", imagePath[0]);
  }

  //CHANGES_NEEDED
  if (supportingProposalId) {
    formBody.append("supportingProposalId", supportingProposalId.toString());
  }

  if (state) {
    formBody.append("state", state);
  }

  console.log("formBody");
  console.log(formBody);

  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/idea/create`,
    data: formBody,
    headers: {
      "Content-Type": "multipart/form-data",
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    withCredentials: true,
  });

  //if not success, throw error which will stop form reset
  if (!(res.status == 201 || res.status == 200)) {
    throw new Error(res.data);
  }
  //return response data
  return res.data;
};

export const isIdeaFollowedByUser = async (token: string|null, userId: string|null, ideaId: string|null) => {
  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/idea/isFollowed`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: {userId: userId, ideaId: ideaId},
    withCredentials: true,
  })
  return res.data;
}
export const updateIdeaStatus = async(token: String | null, userId: string|undefined, ideaId: string|null, active: boolean|null, reviewed: boolean|null) => {
  const res = await axios({
    method: "put",
    url: `${API_BASE_URL}/idea/updateState/${ideaId}`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: {userId: userId, ideaId: ideaId, active: active, reviewed: reviewed},
    withCredentials: true,
  })
  return res.data;
}
export const updateIdeaNotificationStatus = async(token: String | null, userId: string|undefined, ideaId: string|null, notification_dismissed: boolean|null) => {
  notification_dismissed = true
  const res = await axios({
    method: "put",
    url: `${API_BASE_URL}/idea/updateNotificationState/${ideaId}`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    
    data: {userId: userId, ideaId: ideaId, notification_dismissed},
    withCredentials: true,
  })
  return res.data;
}

export const followIdeaByUser = async (token: string, userId: string, ideaId: string) => {
  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/idea/follow`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: {userId: userId, ideaId: ideaId},
    withCredentials: true,
  })
  return res.data;
}

export const unfollowIdeaByUser = async (token: string, userId: string, ideaId: string) => {
  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/idea/unfollow`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: {userId: userId, ideaId: ideaId},
    withCredentials: true,
  })
  return res.data;
}

export const getIdeasFollowedByUser = async (userId: string) => {
  const res = await axios({
    method: "get",
    url: `${API_BASE_URL}/idea/getAllFollowedByUser/${userId}`,
    withCredentials: true,
  })
  return res.data;
}