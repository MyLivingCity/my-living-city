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

export const postCreateCollabotator = async (
  proposalId: number,
  collaboratorData: any,
  banned: boolean,
  token: string | null
) => {
  const { experience, role, time, contactInfo } = collaboratorData;

  if (!experience || !role || !time || !contactInfo) {
    throw new Error("Missing data");
  }

  if (!token) {
    throw new Error("Your session has expired. Please relogin and try again.");
  }

  let formBody = {
    proposalId: proposalId.toString(),
    experience: experience.toString(),
    role: role.toString(),
    time: time.toString(),
    contactInfo: contactInfo.toString(),
  };

  const res = await axios({
    method: "post",
    url: `${API_BASE_URL}/create/collaborator/${proposalId}`,
    data: formBody,
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token,
      "Access-Control-Allow-Origin": "*",
    },
    withCredentials: true,
  });

  if (!(res.status == 201 || res.status == 200)) {
    throw new Error(res.data);
  }
  //return response data
  return res.data;
};
