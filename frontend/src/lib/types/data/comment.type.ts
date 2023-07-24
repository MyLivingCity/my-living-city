import { IIdea } from './idea.type';

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
  displayFName: string;
  displayLName: string;
  Work_Details: {
    displayFName: string;
    displayLName: string;
  }
  School_Details: {
    displayFName: string;
    displayLName: string;
  }
  address: {
    streetAddress: string;
    postalCode: string;
  }
  userType: string;
  userSegments: {
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
}
export interface IParsedIdea {
  segmentId: number;
  subSegmentId?:number;
  superSegmentId?:number;
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
