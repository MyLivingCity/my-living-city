import { IAddressInput } from "./address.input";
import { IGeoInput } from "./geo.input";

export interface ICreateIdeaInput {
  categoryId: number;
  userType: string;
  title: string;
  description: string;
  proposal_role: string;
  proposal_benefits: string;
  requirements: string;
  communityImpact?: string;
  natureImpact?: string;
  artsImpact?: string;
  energyImpact?: string;
  manufacturingImpact?: string;
  address?: IAddressInput;
  geo?: IGeoInput;
  segmentId?: number;
  subSegmentId?: number;
  superSegmentId?: number;
  imagePath?: any;
  supportingProposalId?: number;
  active?: boolean
  state?: string;
  needCollaborators?: boolean;
  needVolunteers?: boolean;
  needDonations?: boolean;
  needSuggestions?: boolean;
  needFeedback?: boolean;
  location?: string;
  feedback?: string[];
  feedbackRatingType?: string[]; //YESNO or
  feedbackYes?: number[];
  feedbackNo?: number[];
  feedbackOnes?: number[];
  feedbackTwos?: number[];
  feedbackThrees?: number[];
  feedbackFours?: number[];
  feedbackRating?: number[];
}
