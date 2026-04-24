import type { ICategory } from "../home/category.types";
import type { IRating } from "./rating.types";
import type { IComment } from "./comment.types";
import type { IUser } from "./user.types";
import type { IProposalWithAggregations } from "./proposal.types";
import type { ISegment } from "../segment.types";

export type IdeaState = "IDEA" | "PROPOSAL" | "PROJECT";

export interface IIdea {
  id: number;
  authorId: string;
  championId: string;
  categoryId: number;
  segmentId: number;
  subSegmentId?: number;
  superSegmentId?: number;
  title: string;
  description: string;
  proposal_role: string;
  requirements: string;
  proposal_benefits: string;
  imagePath: string;
  communityImpact?: string;
  natureImpact?: string;
  artsImpact?: string;
  energyImpact?: string;
  manufacturingImpact?: string;
  state: IdeaState;
  active: boolean;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
  reviewed: boolean;
  notification_dismissed: boolean;
}

export interface IIdeaWithAggregations extends IIdea {
  segmentName: string;
  subSegmentName?: string;
  firstName: string;
  streetAddress: string;
  engagements: number;
  ratingAvg: number;
  commentCount: number;
  ratingCount: number;
  posRatings: number;
  negRatings: number;
  ratings?: IRating[];
  comments: IComment[];
  superSegId?: number;
  segId?: number;
  subSegId?: number;
  quarantined_at: Date;
}

export interface IIdeaWithRelationship extends IIdea {
  geo?: object;
  address?: object;
  category?: ICategory;
  userType: string;
  supportedProposal?: IProposalWithAggregations;
  segments?: ISegment[];
  author?: IUser;
  champion?: IUser | null;
  proposalInfo?: { id: number } | null;
  projectInfo?: object | null;
  comments?: IComment[];
  ratingAvg: number;
  commentCount: number;
  ratingCount: number;
  posRatings: number;
  negRatings: number;
  ratings?: IRating[];
  isChampionable?: boolean;
}
