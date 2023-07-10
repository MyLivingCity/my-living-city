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



  return res.data
};

export const getUserIdeas = async (userId: string) => {
  const res = await axios.get<any>(`${API_BASE_URL}/idea/getall/${userId}`);
 
  return res.data;
};

export const getSingleIdea = async (ideaId: string) => {
  const res = await axios.get<IIdeaWithRelationship>(
    `${API_BASE_URL}/idea/get/${ideaId}`
  );

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
    proposal_role,
    requirements,
    proposal_benefits,
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

  if (banned) {
    throw new Error("You cannot post while banned.");
  }

  let formBody = new FormData();

  formBody.append("categoryId", categoryId.toString());

  formBody.append("title", title);

  formBody.append("proposal_role", proposal_role);
  formBody.append("requirements", requirements);
  formBody.append("proposal_benefits", proposal_benefits);
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

export const isIdeaFollowedByUser = async (token: string | null, userId: string | null, ideaId: string | null) => {
  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/idea/isFollowed`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: { userId: userId, ideaId: ideaId },
    withCredentials: true,
  })
  return res.data;
}

export const isIdeaEndorsedByUser = async (token: string | null, userId: string | null, ideaId: string | null) => {
  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/idea/isEndorsed`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: { userId: userId, ideaId: ideaId },
    withCredentials: true,
  })
  return res.data;
}

export const updateIdeaStatus = async(token: String | null, ideaId: string|null, active: boolean|null, reviewed: boolean|null, banned: boolean|null, quarantined_at: Date) => {
  const res = await axios({
    method: "put",
    url: `${API_BASE_URL}/idea/updateState/${ideaId}`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: {ideaId: ideaId, active: active, reviewed: reviewed, banned: banned, quarantined_at: quarantined_at},
    withCredentials: true,
  })
  return res.data;
}
export const updateIdeaNotificationStatus = async(token: String | null, userId: string|undefined, ideaId: string|null, notification_dismissed: boolean|null) => {

  const res = await axios({
    method: "put",
    url: `${API_BASE_URL}/idea/updateNotificationState/${ideaId}`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },

    data: { userId: userId, ideaId: ideaId, notification_dismissed },
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
    data: { userId: userId, ideaId: ideaId },
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
    data: { userId: userId, ideaId: ideaId },
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

export const endorseIdeaByUser = async (token: string, userId: string, ideaId: string) => {
  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/idea/endorse`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: { userId: userId, ideaId: ideaId },
    withCredentials: true,
  })
  return res.data;
}

export const unendorseIdeaByUser = async (token: string, userId: string, ideaId: string) => {
  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/idea/unendorse`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: { userId: userId, ideaId: ideaId },
    withCredentials: true,
  })
  return res.data;
}

export const getIdeasEndorsedByUser = async (userId: string) => {
  const res = await axios({
    method: "get",
    url: `${API_BASE_URL}/idea/getAllEndorsedByUser/${userId}`,
    withCredentials: true,
  })
  return res.data;
}

export const getEndorsedUsersByIdea = async (token: string | null, ideaId: string) => {
  const res = await axios({
    method: "get",
    url: `${API_BASE_URL}/idea/getAllEndorsersByIdea/${ideaId}`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    withCredentials: true,
  })
  return res.data;
}

export const getEndorsedMunicipalUsersByIdea = async (
  token: string | null,
  ideas: { ideaId: number }[]
 
): Promise<any[][]> => {
  const fetchPromises = ideas.map(({ ideaId }) =>
    axios.get<any[]>(`${API_BASE_URL}/idea/getAllEndorsersByIdea/${ideaId}`, {
      method: "get",
      headers: {
        "x-auth-token": token,
        "Access-Control-Allow-Origin": "*",
      },
      withCredentials: true,
    })
  );

  const responses = await Promise.all(fetchPromises);
  const allEndorsedPosts = responses.map(response => response.data);

  return allEndorsedPosts;
};




export const isIdeaFlaggedByUser = async (token: string | null, userId: string | null, ideaId: string | null) => {
  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/idea/isFlagged`,
    headers: {
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    data: { userId: userId, ideaId: ideaId },
    withCredentials: true,
  })
  return res.data;
}