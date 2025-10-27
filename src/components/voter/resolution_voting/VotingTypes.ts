export interface ResolutionClause {
  title?: string;
  content: string;
}

export interface ResolutionData {
  title: string;
  code: string;
  date: string;
  clauses: ResolutionClause[];
}

export interface OptionItem {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface CountdownProps {
  minutes: number;
  seconds: string;
}

export interface VotingLayoutProps {
  title: string;
  status: string;
  data: ResolutionData;
  options: OptionItem[];
  onSubmit: (selected: string | null, comment: string) => void;
  countdown?: CountdownProps;
}
