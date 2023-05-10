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
  createdAt: string;
  updatedAt: string;
  idea: IParsedIdea;
  // userSeg: IParsedSegData;
  author: IParsedCommentAuthor;
  likes: ICommentLikeDislike[];
  dislikes: ICommentLikeDislike[];
  _count: ICommentLikeAndDislikeAggregation;
}
