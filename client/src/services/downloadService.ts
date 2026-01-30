import { apiCall, API_BASE } from './api';
import type { ProRequest, UserNotification } from '../types';

export const downloadService = {
  // Get user's own downloads
  async getMyDownloads(): Promise<any[]> {
    const response = await apiCall('/api/my-downloads');
    if (!response.ok) throw new Error('Failed to fetch downloads');
    const data = await response.json();
    return data.downloads || [];
  },

  // Soft delete a download
  async softDelete(downloadId: string): Promise<void> {
    const response = await apiCall('/api/downloads/soft-delete', {
      method: 'POST',
      body: JSON.stringify({ downloadId }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete download');
  },

  // Get downloads list (directory listing)
  async getDownloadsList(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/api/downloads-list`);
    if (!response.ok) throw new Error('Failed to fetch downloads');
    const data = await response.json();
    return data.downloads || [];
  },

  // Delete all downloads
  async deleteAll(): Promise<void> {
    const response = await fetch(`${API_BASE}/downloads`, { method: 'DELETE' });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete downloads');
  },

  // Delete chat downloads
  async deleteChatDownloads(chatId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/downloads/${encodeURIComponent(chatId)}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete downloads');
  },
};

export const proRequestService = {
  // Get user's own PRO request
  async getMyRequest(): Promise<ProRequest | null> {
    const response = await apiCall('/api/pro-requests/my');
    if (!response.ok) throw new Error('Failed to fetch PRO request');
    const data = await response.json();
    return data.request || null;
  },

  // Submit a PRO request
  async submit(paymentConfirmed: boolean): Promise<void> {
    const response = await apiCall('/api/pro-requests', {
      method: 'POST',
      body: JSON.stringify({ paymentConfirmed }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to submit request');
  },
};

export const notificationService = {
  // Get user's notifications
  async getAll(): Promise<{ notifications: UserNotification[]; unreadCount: number }> {
    const response = await apiCall('/api/notifications');
    if (!response.ok) throw new Error('Failed to fetch notifications');
    const data = await response.json();
    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0,
    };
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await apiCall(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiCall('/api/notifications/read-all', {
      method: 'PUT',
    });
  },
};
