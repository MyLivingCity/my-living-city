import { ICategory } from './category.type';
import { IAddress } from './address.type';
import { IGeo } from './geo.type';

import { IProject } from './project.type';
import { IRating } from './rating.type';
import { IComment } from './comment.type';
import { IUser } from './user.type';
import { ISegment, ISubSegment, ISuperSegment } from './segment.type';
import { IIdea, IIdeaWithAggregations } from './idea.type';

export type ProposalState = 'IDEA' | 'PROPOSAL' | 'PROJECT';

// Root Idea with no relationships
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

// Idea with relationships (Used in Single Idea Page) extends Root base Idea
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

  // Comments and Ratings are fetched seperately but could be fetched
  comments?: IComment[];
  ratings?: IRating[];

  // Checks to see if idea has met thresholds
  isChampionable?: boolean;
}

export interface IProposalWithAggregations {
  id: number;
  ideaId: number;
  idea: IIdeaWithAggregations;
}
