import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../services';
import type {
  AdminUser,
  AdminStats,
  ActivityLogEntry,
  LogsPagination,
  ProRequest,
  UserFormData,
  AdminPage,
} from '../types';

export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [pagination, setPagination] = useState<LogsPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [downloads, setDownloads] = useState<any[]>([]);
  const [proRequests, setProRequests] = useState<ProRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await adminService.getStats();
      setStats(data.stats);
      setRecentActivity(data.recentActivity);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    }
    setIsLoading(false);
  }, []);

  // Create user
  const createUser = useCallback(async (userData: UserFormData): Promise<boolean> => {
    setIsLoading(true);
    setError('');
    try {
      await adminService.createUser(userData);
      toast.success(`User "${userData.username}" created successfully`);
      fetchUsers();
      fetchStats();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers, fetchStats]);

  // Update user
  const updateUser = useCallback(async (userId: string, userData: Partial<UserFormData>): Promise<boolean> => {
    setIsLoading(true);
    setError('');
    try {
      await adminService.updateUser(userId, userData);
      toast.success('User updated successfully');
      fetchUsers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  // Delete user
  const deleteUser = useCallback(async (userId: string, username: string): Promise<boolean> => {
    try {
      await adminService.deleteUser(userId);
      toast.success(`User "${username}" deleted`);
      fetchUsers();
      fetchStats();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(message);
      return false;
    }
  }, [fetchUsers, fetchStats]);

  // Fetch logs
  const fetchLogs = useCallback(async (page = 1, filter: { action?: string; username?: string } = {}) => {
    setIsLoading(true);
    try {
      const data = await adminService.getLogs(page, filter);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to fetch logs');
    }
    setIsLoading(false);
  }, []);

  // Fetch downloads
  const fetchDownloads = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllDownloads();
      setDownloads(data);
    } catch (err) {
      setError('Failed to fetch downloads');
    }
    setIsLoading(false);
  }, []);

  // Delete file
  const deleteFile = useCallback(async (filePath: string, fileName: string): Promise<boolean> => {
    try {
      await adminService.deleteFile(filePath);
      toast.success(`Deleted: ${fileName}`);
      fetchDownloads();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete file';
      toast.error(message);
      return false;
    }
  }, [fetchDownloads]);

  // Delete folder
  const deleteFolder = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      await adminService.deleteFolder(chatId);
      toast.success('Folder deleted successfully');
      fetchDownloads();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete folder';
      toast.error(message);
      return false;
    }
  }, [fetchDownloads]);

  // Fetch PRO requests
  const fetchProRequests = useCallback(async () => {
    try {
      const data = await adminService.getProRequests();
      setProRequests(data);
    } catch (err) {
      console.error('Failed to fetch PRO requests:', err);
    }
  }, []);

  // Accept PRO request
  const acceptProRequest = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      await adminService.acceptProRequest(requestId);
      toast.success('PRO request accepted!');
      fetchProRequests();
      fetchUsers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept request';
      toast.error(message);
      return false;
    }
  }, [fetchProRequests, fetchUsers]);

  // Cancel PRO request
  const cancelProRequest = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      await adminService.cancelProRequest(requestId);
      toast.success('PRO request cancelled');
      fetchProRequests();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel request';
      toast.error(message);
      return false;
    }
  }, [fetchProRequests]);

  // Load data for admin page
  const loadPageData = useCallback(async (page: AdminPage) => {
    switch (page) {
      case 'dashboard':
        await fetchStats();
        await fetchUsers();
        break;
      case 'users':
        await fetchUsers();
        break;
      case 'logs':
        await fetchLogs();
        break;
      case 'downloads':
        await fetchDownloads();
        break;
      case 'pro-requests':
        await fetchProRequests();
        break;
    }
  }, [fetchStats, fetchUsers, fetchLogs, fetchDownloads, fetchProRequests]);

  return {
    stats,
    users,
    logs,
    recentActivity,
    pagination,
    downloads,
    proRequests,
    isLoading,
    error,
    setError,
    fetchStats,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchLogs,
    fetchDownloads,
    deleteFile,
    deleteFolder,
    fetchProRequests,
    acceptProRequest,
    cancelProRequest,
    loadPageData,
  };
}
