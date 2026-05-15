export type ModelType = 'standard' | 'premium';
export type MeetingStatus = 'pending' | 'transcribing' | 'analyzing' | 'pending_speaker_mapping' | 'completed' | 'failed';
export type ContributionType = 'idea' | 'problem' | 'question' | 'summary' | 'decision' | 'promise';

export interface TeamMember {
  id: string;
  member_name: string;
}

export interface Team {
  id: string;
  name: string;
  subject: string;
  deadline: string;
  is_completed: boolean;
  created_at: string;
  members: TeamMember[];
  meeting_count: number;
  promise_completion_rate: number;
}

export interface MeetingStatusResponse {
  id: string;
  status: MeetingStatus;
  error_message?: string;
}

export interface ContributionCard {
  id: string;
  member_name: string;
  contribution_type: ContributionType;
  content: string;
  score: number;
}

export interface PromiseCard {
  id: string;
  member_name: string;
  task_title: string;
  due_date: string | null;
  is_completed: boolean;
}

export interface MemberContribution {
  member_name: string;
  total_score: number;
  percentage: number;
  type_counts: Partial<Record<ContributionType, number>>;
}

export interface Report {
  team_name: string;
  subject: string;
  deadline: string;
  meeting_count: number;
  promise_completion_rate: number;
  member_contributions: MemberContribution[];
  type_distribution: Partial<Record<ContributionType, number>>;
}
