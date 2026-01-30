// App User (for web authentication)
export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'PRO' | 'USER';
}

// Auth step for Telegram connection
export type AuthStep = 'credentials' | 'phone' | 'code' | '2fa' | 'authorized' | 'unavailable';

// Admin user type
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'PRO' | 'USER';
  createdAt: string;
}

// Admin statistics
export interface AdminStats {
  totalUsers: number;
  adminCount: number;
  regularUsers: number;
  activeTelegramSessions: number;
  loginsLast24h: number;
}

// Activity log entry
export interface ActivityLogEntry {
  id: string;
  userId?: string;
  username: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

// Logs pagination
export interface LogsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// PRO Request
export interface ProRequest {
  _id: string;
  userId: string;
  username: string;
  email: string;
  status: 'pending' | 'accepted' | 'cancelled';
  paymentConfirmed: boolean;
  processedBy?: {
    username: string;
  };
  processedAt?: string;
  createdAt: string;
}

// User Notification
export interface UserNotification {
  _id: string;
  userId: string;
  type: 'pro_accepted' | 'pro_cancelled' | 'info' | 'warning';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
