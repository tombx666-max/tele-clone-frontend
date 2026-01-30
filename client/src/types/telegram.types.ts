// Telegram User (for Telegram API)
export interface TelegramUser {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
}

// Dialog (chat) type
export interface Dialog {
  id: string;
  name: string;
  type: 'user' | 'group' | 'channel';
  isPrivate: boolean;
  unreadCount: number;
  date: number;
}

// Media info attached to a message
export interface MediaInfo {
  type: 'photo' | 'video' | 'document';
  id: string;
  duration?: number;
  size?: string;
  mimeType?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

// Message type
export interface Message {
  id: string;
  text: string;
  date: number;
  media?: MediaInfo | null;
  sender?: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  } | null;
}

// Download progress tracking
export interface DownloadProgress {
  [messageId: string]: number;
}

// Downloaded file info
export interface DownloadedFile {
  messageId: string;
  filename: string;
  path: string;
  cloudinaryUrl?: string;
}

// WebSocket message types
export type WebSocketMessageType =
  | 'connected'
  | 'authorized'
  | 'needAuth'
  | 'noSession'
  | 'codeSent'
  | 'need2FA'
  | 'dialogs'
  | 'messages'
  | 'downloadProgress'
  | 'downloadComplete'
  | 'bulkDownloadStart'
  | 'bulkDownloadProgress'
  | 'bulkDownloadComplete'
  | 'allChatsMessagesStart'
  | 'allChatsMessages'
  | 'allChatsMessagesComplete'
  | 'bulkDownloadAllChatsStart'
  | 'bulkDownloadAllChatsProgress'
  | 'bulkDownloadAllChatsComplete'
  | 'error';
