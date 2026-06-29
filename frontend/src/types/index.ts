export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface Item {
  id: number;
  user_id: number;
  type: 'lost' | 'found';
  title: string;
  description?: string;
  category?: string;
  location?: string;
  image_url?: string;
  status: 'pending' | 'claimed' | 'cancelled';
  created_at: string;
  updated_at: string;
  username?: string;
  email?: string;
}

export interface Claim {
  id: number;
  item_id: number;
  claimer_id: number;
  status: 'pending' | 'approved' | 'rejected';
  claim_message?: string;
  created_at: string;
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  image_url?: string;
  claimer_name?: string;
  claimer_email?: string;
  owner_name?: string;
  owner_email?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message?: string;
  type: 'claim' | 'approve' | 'reject' | 'system' | 'message';
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  item_id?: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export interface Conversation {
  other_user_id: number;
  other_user_name: string;
  other_user_email: string;
  last_message_time: string;
  last_message: string;
  unread_count: number;
}

export interface LoginResponse {
  userId: number;
  username: string;
  email: string;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
