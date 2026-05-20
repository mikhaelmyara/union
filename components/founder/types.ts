export type EngagementStatus = "pending" | "approved" | "rejected";

export type Campaign = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
  referral_reward_amount: number;
  is_active: boolean;
};

export type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: EngagementStatus;
  created_at: string;
  client_id: string | null;
  campaign_title_snapshot: string | null;
  campaigns: {
    title: string;
    reward_amount: number;
    referral_reward_amount: number;
  } | null;
};

export type Reward = {
  id: string;
  user_id: string;
  lead_id: string;
  amount: number;
  type: "direct" | "referral";
};

export type Challenge = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
  period_type: "weekly" | "monthly";
  start_date: string;
  end_date: string;
  is_active: boolean;
};
