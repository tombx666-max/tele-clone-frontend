// Role colors
export const ROLE_COLORS = {
  ADMIN: 'bg-purple-500',
  PRO: 'bg-yellow-500',
  USER: 'bg-blue-500',
} as const;

// Role badges
export const ROLE_BADGES = {
  ADMIN: { label: 'Admin', color: 'bg-purple-500/20 text-purple-300' },
  PRO: { label: 'PRO', color: 'bg-yellow-500/20 text-yellow-300' },
  USER: { label: 'User', color: 'bg-blue-500/20 text-blue-300' },
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  pro_accepted: { icon: 'check-circle', color: 'text-green-400' },
  pro_cancelled: { icon: 'x-circle', color: 'text-red-400' },
  info: { icon: 'info', color: 'text-blue-400' },
  warning: { icon: 'alert-circle', color: 'text-yellow-400' },
} as const;

// Action colors for activity logs
export const ACTION_COLORS = {
  login: 'bg-green-500/20 text-green-300',
  logout: 'bg-gray-500/20 text-gray-300',
  register: 'bg-blue-500/20 text-blue-300',
  download: 'bg-purple-500/20 text-purple-300',
  telegram_connect: 'bg-cyan-500/20 text-cyan-300',
  telegram_disconnect: 'bg-orange-500/20 text-orange-300',
  user_created: 'bg-green-500/20 text-green-300',
  user_updated: 'bg-yellow-500/20 text-yellow-300',
  user_deleted: 'bg-red-500/20 text-red-300',
} as const;

// Media types
export const MEDIA_TYPES = {
  photo: { icon: 'image', color: 'text-green-400' },
  video: { icon: 'video', color: 'text-blue-400' },
  document: { icon: 'file-text', color: 'text-yellow-400' },
} as const;

// Chat types
export const CHAT_TYPES = {
  user: { icon: 'user', label: 'Private' },
  group: { icon: 'users', label: 'Group' },
  channel: { icon: 'message-circle', label: 'Channel' },
} as const;
