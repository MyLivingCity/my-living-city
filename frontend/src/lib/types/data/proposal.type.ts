
// Extension to Idea state
export interface IProposal {
  id: number;
  ideaId: number;

  // More unique fields must be added 
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}