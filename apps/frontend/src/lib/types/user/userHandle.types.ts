export interface IUserHandle {
  id: number;
  userId: string;
  handle?: string;
  userSegmentRelationship: "HOME" | "WORK" | "SCHOOL";
}
