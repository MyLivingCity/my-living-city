import { ICategory } from "./category.type";
import { IAddress } from "./address.type";
import { IGeo } from "./geo.type";
import { IProposal } from "./proposal.type";
import { IProject } from "./project.type";
import { IRating } from "./rating.type";
import { IComment } from "./comment.type";
import { IUser } from "./user.type";
import { ISegment, ISubSegment, ISuperSegment } from "./segment.type";

export type IdeaState = "IDEA" | "PROPOSAL" | "PROJECT";

// Root Idea with no relationships
export interface IIdea {
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
  state: IdeaState;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Idea with relationships (Used in Single Idea Page) extends Root base Idea
export interface IIdeaWithRelationship extends IIdea {
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

  // Comments and Ratings are fetched seperately but could be fetched
  comments?: IComment[];
  ratings?: IRating[];

  // Checks to see if idea has met thresholds
  isChampionable?: boolean;
}

// Idea Breakdown (Used in Landing Page and Ideas Page) extends Root base Idea
export interface IIdeaWithAggregations {
  id: number;
  authorId: string;
  categoryId: number;
  segmentName: string; //
  subSegmentName?: string; //
  firstName: string; //
  streetAddress: string; //
  title: string;
  description: string;
  state: IdeaState;
  active: boolean;
  createdAt: string;
  updatedAt: string;

  // Aggregate breakdown
  engagements: number;
  ratingAvg: number;
  commentCount: number;
  ratingCount: number;
  posRatings: number;
  negRatings: number;

  ratings?: IRating[];
  comments?: IComment[];
}
