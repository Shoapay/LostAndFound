export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface Item {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  image_url?: string;
  status: 'pending' | 'claimed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface Claim {
  id: number;
  item_id: number;
  claimer_id: number;
  status: 'pending' | 'approved' | 'rejected';
  claim_message?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message?: string;
  type: 'claim' | 'approve' | 'reject' | 'system';
  is_read: boolean;
  created_at: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
}
