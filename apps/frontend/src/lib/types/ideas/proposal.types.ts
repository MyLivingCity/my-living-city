import { type ICategory } from "src/lib/types/home/category.types";
import { type IAddress } from "src/lib/types/user/address.types";
import { type IGeo } from "src/lib/types/user/geo.types";

import { type IProject } from "src/lib/types/ideas/project.types";
import { type IRating } from "src/lib/types/ideas/rating.types";
import { type IComment } from "src/lib/types/user/comment.types";
import { type IUser } from "src/lib/types/user/user.types";
import {
  type ISegment,
  type ISubSegment,
  type ISuperSegment,
} from "../segment.types";
import { type IIdeaWithAggregations } from "./idea.types";

export type ProposalState = "IDEA" | "PROPOSAL" | "PROJECT";

export type CreateProposalInput = {
  ideaId: number;
  needCollaborators: boolean;
  needVolunteers: boolean;
  needDonations: boolean;
  needFeedback: boolean;
  needSuggestions: boolean;
  location: string;
  feedback: string[];
  feedbackRatingType: string[];
};

export interface IProposal {
  id: number;
  authorId: string;
  championId: string;
  categoryId: number;
  segmentId: number; //
  subSegmentId?: number; //
  title: string;
  description: string;
  imagePath: string;
  communityImpact?: string;
  natureImpact?: string;
  artsImpact?: string;
  energyImpact?: string;
  manufacturingImpact?: string;
  state: ProposalState;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  quarantined_at: Date;
}

export interface IProposalWithRelationship extends IProposal {
  // Relationships can be nullable
  geo?: IGeo;
  address?: IAddress;
  category?: ICategory;
  userType: string;
  segment?: ISegment; //
  subSegment?: ISubSegment; //
  superSegment?: ISuperSegment;
  author?: IUser;
  champion?: IUser | null;

  projectInfo?: IProject | null;

  comments?: IComment[];
  ratings?: IRating[];

  isChampionable?: boolean;
}

export interface IProposalWithAggregations {
  id: number;
  ideaId: number;
  idea: IIdeaWithAggregations;
}
