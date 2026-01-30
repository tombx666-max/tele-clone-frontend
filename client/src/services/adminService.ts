import { apiCall, API_BASE } from './api';
import type {
  AdminUser,
  AdminStats,
  ActivityLogEntry,
  LogsPagination,
  ProRequest,
  UserFormData,
} from '../types';

export const adminService = {
  // Fetch admin dashboard stats
  async getStats(): Promise<{ stats: AdminStats; recentActivity: ActivityLogEntry[] }> {
    const response = await apiCall('/api/admin/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Fetch all users
  async getUsers(): Promise<AdminUser[]> {
    const response = await apiCall('/api/admin/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return data.users;
  },

  // Create a new user
  async createUser(userData: UserFormData): Promise<AdminUser> {
    const response = await apiCall('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create user');
    return data.user;
  },

  // Update a user
  async updateUser(userId: string, userData: Partial<UserFormData>): Promise<AdminUser> {
    const response = await apiCall(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update user');
    return data.user;
  },

  // Delete a user
  async deleteUser(userId: string): Promise<void> {
    const response = await apiCall(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete user');
    }
  },

  // Fetch activity logs
  async getLogs(
    page: number = 1,
    filter: { action?: string; username?: string } = {}
  ): Promise<{ logs: ActivityLogEntry[]; pagination: LogsPagination }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(filter.action && { action: filter.action }),
      ...(filter.username && { username: filter.username }),
    });
    const response = await apiCall(`/api/admin/logs?${params}`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  },

  // Fetch all downloads (admin view)
  async getAllDownloads(): Promise<any[]> {
    const response = await apiCall('/api/admin/all-downloads');
    if (!response.ok) {
      // Fallback to local files API
      const fallbackRes = await fetch(`${API_BASE}/api/downloads-list`);
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        return data.downloads || [];
      }
      throw new Error('Failed to fetch downloads');
    }
    const data = await response.json();
    return data.downloads || [];
  },

  // Fetch PRO requests
  async getProRequests(): Promise<ProRequest[]> {
    const response = await apiCall('/api/pro-requests');
    if (!response.ok) throw new Error('Failed to fetch PRO requests');
    const data = await response.json();
    return data.requests || [];
  },

  // Accept a PRO request
  async acceptProRequest(requestId: string): Promise<void> {
    const response = await apiCall(`/api/pro-requests/${requestId}/accept`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to accept request');
  },

  // Cancel a PRO request
  async cancelProRequest(requestId: string): Promise<void> {
    const response = await apiCall(`/api/pro-requests/${requestId}/cancel`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to cancel request');
  },

  // Delete a file
  async deleteFile(filePath: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/downloads-file`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete file');
  },

  // Delete a folder
  async deleteFolder(chatId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/downloads/${encodeURIComponent(chatId)}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete folder');
  },
};
