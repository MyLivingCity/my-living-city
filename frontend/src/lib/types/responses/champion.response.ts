import { IIdeaWithRelationship } from "../data/idea.type";

export interface ISubmitChampionRequestResponse {
  message: string;
  updatedIdea: IIdeaWithRelationship;
}