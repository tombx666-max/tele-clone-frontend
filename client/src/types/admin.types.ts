// Admin page types
export type AdminPage = 'dashboard' | 'users' | 'logs' | 'downloads' | 'pro-requests';

// Media preview modal state
export interface MediaPreviewState {
  isOpen: boolean;
  url: string;
  type: 'photo' | 'video' | 'document';
  fileName: string;
}

// Confirmation modal state
export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

// Downloads data for admin view
export interface AdminDownloadUser {
  username: string;
  userId: string;
  email: string;
  downloads: AdminDownloadFile[];
}

export interface AdminDownloadFile {
  id: string;
  chatId: string;
  chatName: string;
  messageId: number;
  fileName: string;
  fileType: 'photo' | 'video' | 'document';
  fileSize: number;
  localPath: string;
  cloudinaryUrl: string;
  thumbnailUrl: string;
  deletedByUser: boolean;
  deletedAt?: string;
  createdAt: string;
}

// User form data for create/edit
export interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'PRO' | 'USER';
}

// Logs filter
export interface LogsFilter {
  action: string;
  username: string;
}
