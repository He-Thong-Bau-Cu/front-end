// src/interfaces/Candidate.ts

export interface CandidateTag {
  label: string;
  color: string;
}

export interface Candidate {
  name: string;
  age: number;
  department: string;
  position: string;
  experience: string;
  description: string;
  maxVotes: number;
  tags: CandidateTag[];
}
