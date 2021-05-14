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
  author: IParsedCommentAuthor;
  likes: ICommentLikeDislike[];
  dislikes: ICommentLikeDislike[];
  _count: ICommentLikeAndDislikeAggregation;
}
