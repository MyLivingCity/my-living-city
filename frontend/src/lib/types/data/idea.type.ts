import { ICategory } from "./category.type";
import { IAddress } from './address.type'
import { IGeo } from "./geo.type";
import { IProposal } from "./proposal.type";
import { IProject } from "./project.type";
import { IRating } from "./rating.type";
import { IComment } from "./comment.type";
import { IUser } from "./user.type";

export type IdeaState = 'IDEA' | 'PROPOSAL' | 'PROJECT';

// Root Idea with no relationships
export interface IIdea {
  id: number;
	authorId: string;
	championId: string;
	categoryId: number;
	title: string;
	description: string;
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
  author?: IUser;
	champion?: IUser | null;
  proposalInfo?: IProposal | null;
  projectInfo?: IProject | null;
	
	// Comments and Ratings are fetched seperately but could be fetched
	comments?: IComment[];
	ratings?: IRating[]

	// Checks to see if idea has met thresholds
	isChampionable?: boolean;
}

// Idea Breakdown (Used in Landing Page and Ideas Page) extends Root base Idea
export interface IIdeaWithAggregations {
	id: number;
	authorId: string;
	categoryId: number;
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
}