export type IdeaState = 'IDEA' | 'PROPOSAL' | 'PROJECT';

// Root Idea with no relationships
export interface IIdea {
  id: number;
  authorId: string;
  championId: string;
  categoryId: number;
  segmentId: number; //
  subSegmentId?: number; //
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