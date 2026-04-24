import type { IIdea } from 'src/types/idea.type';
import type { IUserHandle } from 'src/types/userHandle.type';
import type { IParsedSegment} from 'src/types/segment.types';


export interface ICommentLikeAndDislikeAggregation {
  likes: number;
  dislikes: number;
}

export interface ICommentAggregateCount {
  count: number;
}

export interface IParsedCommentAuthor {
  id: string;
  email: string;
  fname: string;
  lname: string;
  organizationName: string;
  address: {
    streetAddress: string;
    postalCode: string;
  }
  userType: string;
  userSegment: {
    homeSegmentId: number;
    workSegmentId: number;
    schoolSegmentId: number;
    homeSubSegmentId: number;
    workSubSegmentId: number;
    schoolSubSegmentId: number;
    homeSuperSegmentId: number;
    workSuperSegmentId: number;
    schoolSuperSegmentId: number;
    homeSegHandle: string;
    workSegHandle: string;
    schoolSegHandle: string;
  }
  userHandles?: IUserHandle[];
}
export interface IParsedIdea {
  segments: IParsedSegment[];
  description?: string;
  title?: string;
}
export interface IParsedSegData {
  id: string;
  homeSegId: number;
  workSegId: number;
  schoolSegId: number;
}
export interface ICommentLikeDislike {
  id: number;
  ideaCommentId: number;
  authorId: string;
}

export interface IComment {
  id:        number;
  ideaId:    number;
  authorId:  string;
  content:   string;
  active:    boolean;
  bannedComment: boolean;
  reviewed: boolean;
  commentFlagNumber: number;
  createdAt: string;
  updatedAt: string;
  quarantined_at: Date;
  idea: IParsedIdea;
  // userSeg: IParsedSegData;
  notification_dismissed: boolean;
  author: IParsedCommentAuthor;
  likes: ICommentLikeDislike[];
  dislikes: ICommentLikeDislike[];
  _count: ICommentLikeAndDislikeAggregation;
}

export interface ICommentAggregations extends IComment {
  id:        number;
  ideaId:    number;
  authorId:  string;
  content:   string;
  active:    boolean;
  bannedComment: boolean;
  reviewed: boolean;
  commentFlagNumber: number;
  createdAt: string;
  updatedAt: string;
  quarantined_at: Date;
  idea: IParsedIdea;
  // userSeg: IParsedSegData;
  notification_dismissed: boolean;
  author: IParsedCommentAuthor;
  likes: ICommentLikeDislike[];
  dislikes: ICommentLikeDislike[];
  _count: ICommentLikeAndDislikeAggregation;
}
