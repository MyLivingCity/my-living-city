export interface IQuarantineNotification {
  id: number;
  userId: string;
  ideaId: number;
  createdAt: Date;
  seen: boolean;
  ideaTitle: string;
}