import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  Menu,
  Download,
  FileText,
  Lock,
  Users,
  MessageCircle,
  LogOut,
  Check,
  X,
  Phone,
  Key,
  Shield,
  FolderDown,
  Play,
  Mail,
  User as UserIcon,
  UserPlus,
  Crown,
  Eye,
  EyeOff,
  LayoutDashboard,
  Activity,
  Zap,
  ArrowRight,
  Trash2,
  Edit,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Clock,
  Bell,
  Sparkles,
  CheckCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';

// Import types from new modular structure
import type {
  AppUser,
  TelegramUser,
  Dialog,
  Message,
  DownloadProgress,
  DownloadedFile,
  AuthStep,
  AdminPage,
  AdminUser,
  AdminStats,
  ActivityLogEntry,
  LogsPagination,
  ProRequest,
  UserNotification,
} from './types';

// Import API service from new modular structure
import { apiCall } from './services/api';
import { ChatView, LoadingSpinner, TurnstileWidget } from './components';

const LazyWelcomePage = lazy(() => import('./pages/WelcomePage').then((m) => ({ default: m.WelcomePage })));

/** Trigger a browser download so the file is saved to the user's device. */
async function saveFileToDevice(url: string, filename: string): Promise<void> {
  try {
    const res = await fetch(url, { credentials: 'include', mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.warn('Save to device failed:', err);
  }
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // App authentication state
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [appAuthLoading, setAppAuthLoading] = useState(true);
  const [appAuthError, setAppAuthError] = useState('');
  
  // Login/Register form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerAcceptedTerms, setRegisterAcceptedTerms] = useState(false);
  const [loginCaptchaToken, setLoginCaptchaToken] = useState('');
  const [registerCaptchaToken, setRegisterCaptchaToken] = useState('');
  const [loginCaptchaReset, setLoginCaptchaReset] = useState(0);
  const [registerCaptchaReset, setRegisterCaptchaReset] = useState(0);

  const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string) ?? '';

  // Telegram connection state
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [, setTelegramUser] = useState<TelegramUser | null>(null);
  // Initialize telegramReconnecting to true if we have saved credentials (prevents redirect during reconnect)
  const [telegramReconnecting, setTelegramReconnecting] = useState(() => {
    const savedApiId = localStorage.getItem('telegramApiId');
    const savedApiHash = localStorage.getItem('telegramApiHash');
    return !!(savedApiId && savedApiHash);
  });

  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');

  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [selectedChat, setSelectedChat] = useState<Dialog | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, _setSearchTerm] = useState('');
  const [filterType, _setFilterType] = useState<'all' | 'private' | 'channels' | 'groups'>('all');

  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({});
  const [downloadedFiles, setDownloadedFiles] = useState<DownloadedFile[]>([]);
  const [_bulkDownloading, setBulkDownloading] = useState(false);
  const [_bulkProgress, setBulkProgress] = useState(0);
  const [, setBulkDownloadingAllChats] = useState(false);
  const [, setBulkDownloadAllChatsProgress] = useState(0);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDownloadsPage, setShowDownloadsPage] = useState(false);
  const [downloadsData, setDownloadsData] = useState<any[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [_recentActivity, setRecentActivity] = useState<ActivityLogEntry[]>([]);
  const [_logsPagination, setLogsPagination] = useState<LogsPagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [_adminLoading, setAdminLoading] = useState(false);
  const [_adminError, setAdminError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFormData, setUserFormData] = useState({ username: '', email: '', password: '', role: 'USER' as 'ADMIN' | 'PRO' | 'USER' });
  const [logsFilter, setLogsFilter] = useState({ action: '', username: '' });
  const [adminDownloads, setAdminDownloads] = useState<any[]>([]);

  // PRO Request state
  const [showProRequestModal, setShowProRequestModal] = useState(false);
  const [proRequestLoading, setProRequestLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [myProRequest, setMyProRequest] = useState<ProRequest | null>(null);
  const [proRequests, setProRequests] = useState<ProRequest[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Media preview modal state (for admin to view high quality media)
  const [mediaPreview, setMediaPreview] = useState<{
    isOpen: boolean;
    url: string;
    type: 'photo' | 'video' | 'document';
    fileName: string;
  }>({
    isOpen: false,
    url: '',
    type: 'photo',
    fileName: ''
  });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirmation = (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      ...options,
    });
  };

  const closeConfirmation = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const selectedChatRef = useRef<Dialog | null>(null);
  const pendingChatIdRef = useRef<string | null>(null);
  const loadMorePendingRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Check app authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setAppAuthLoading(false);
        return;
      }

      try {
        const response = await apiCall('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setAppUser(data.user);
          // Automatically show admin panel for admin users
          if (data.user.role === 'ADMIN') {
            setShowAdminPanel(true);
          }
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
      setAppAuthLoading(false);
    };

    checkAuth();
  }, []);

  // Handle app login
  const handleAppLogin = async () => {
    setAppAuthError('');
    if (turnstileSiteKey && !loginCaptchaToken) {
      toast.error('Please complete the captcha');
      return;
    }
    setAppAuthLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          ...(turnstileSiteKey && { captchaToken: loginCaptchaToken }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAppAuthLoading(false);
        setLoginCaptchaReset((r) => r + 1);
        setLoginCaptchaToken('');
        toast.error(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setAppUser(data.user);
      toast.success(`Welcome back, ${data.user.username}!`);
      
      // Automatically show admin panel for admin users
      if (data.user.role === 'ADMIN') {
        setShowAdminPanel(true);
      }
    } catch (error) {
      setLoginCaptchaReset((r) => r + 1);
      setLoginCaptchaToken('');
      toast.error('Login failed. Please try again.');
    }
    setAppAuthLoading(false);
  };

  // Handle app register
  const handleAppRegister = async () => {
    setAppAuthError('');

    if (!registerAcceptedTerms) {
      toast.error('You must accept the Terms and Conditions to register');
      return;
    }

    if (turnstileSiteKey && !registerCaptchaToken) {
      toast.error('Please complete the captcha');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setAppAuthLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
          ...(turnstileSiteKey && { captchaToken: registerCaptchaToken }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAppAuthLoading(false);
        setRegisterCaptchaReset((r) => r + 1);
        setRegisterCaptchaToken('');
        toast.error(data.error || 'Registration failed');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setAppUser(data.user);
      toast.success(`Welcome, ${data.user.username}! Account created successfully.`);
    } catch (error) {
      setRegisterCaptchaReset((r) => r + 1);
      setRegisterCaptchaToken('');
      toast.error('Registration failed. Please try again.');
    }
    setAppAuthLoading(false);
  };

  // Handle app logout
  const handleAppLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('telegramApiId');
    localStorage.removeItem('telegramApiHash');
    setAppUser(null);
    setTelegramUser(null);
    setAuthStep('credentials');
    setTelegramReconnecting(false);
    setDialogs([]);
    setMessages([]);
    setSelectedChat(null);
    setShowAdminPanel(false);
    toast.success('Logged out successfully');
  };

  // Admin Panel Functions
  const fetchAdminStats = async () => {
    try {
      const response = await apiCall('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setAdminStats(data.stats);
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const fetchAdminUsers = async () => {
    setAdminLoading(true);
    try {
      const response = await apiCall('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setAdminError('Failed to fetch users');
    }
    setAdminLoading(false);
  };

  const fetchActivityLogs = async (page = 1) => {
    setAdminLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(logsFilter.action && { action: logsFilter.action }),
        ...(logsFilter.username && { username: logsFilter.username }),
      });
      const response = await apiCall(`/api/admin/logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data.logs);
        setLogsPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setAdminError('Failed to fetch activity logs');
    }
    setAdminLoading(false);
  };

  const handleCreateUser = async () => {
    setAdminError('');
    if (!userFormData.username || !userFormData.email || !userFormData.password) {
      setAdminError('All fields are required');
      toast.error('All fields are required');
      return;
    }
    
    setAdminLoading(true);
    try {
      const response = await apiCall('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userFormData),
      });
      const data = await response.json();
      if (response.ok) {
        setShowUserModal(false);
        setUserFormData({ username: '', email: '', password: '', role: 'USER' });
        fetchAdminUsers();
        fetchAdminStats();
        toast.success(`User "${userFormData.username}" created successfully`);
      } else {
        setAdminError(data.error || 'Failed to create user');
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      setAdminError('Failed to create user');
      toast.error('Failed to create user');
    }
    setAdminLoading(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setAdminError('');
    
    setAdminLoading(true);
    try {
      const updateData: any = {
        username: userFormData.username,
        email: userFormData.email,
        role: userFormData.role,
      };
      if (userFormData.password) {
        updateData.password = userFormData.password;
      }
      
      const response = await apiCall(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (response.ok) {
        setShowUserModal(false);
        setEditingUser(null);
        setUserFormData({ username: '', email: '', password: '', role: 'USER' });
        fetchAdminUsers();
        toast.success('User updated successfully');
      } else {
        setAdminError(data.error || 'Failed to update user');
        toast.error(data.error || 'Failed to update user');
      }
    } catch (error) {
      setAdminError('Failed to update user');
      toast.error('Failed to update user');
    }
    setAdminLoading(false);
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    showConfirmation({
      title: 'Delete User',
      message: `Are you sure you want to delete user "${username}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        closeConfirmation();
        await performDeleteUser(userId, username);
      },
    });
  };

  const performDeleteUser = async (userId: string, username: string) => {
    try {
      const response = await apiCall(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchAdminUsers();
        fetchAdminStats();
        toast.success(`User "${username}" deleted`);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowUserModal(true);
    setAdminError('');
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setUserFormData({ username: '', email: '', password: '', role: 'USER' });
    setShowUserModal(true);
    setAdminError('');
  };

  const fetchAdminDownloads = async () => {
    setAdminLoading(true);
    try {
      const response = await apiCall('/api/admin/all-downloads');
      if (response.ok) {
        const data = await response.json();
        setAdminDownloads(data.downloads || []);
      } else {
        // Fallback to local files if database API fails
        const fallbackRes = await fetch('/api/downloads-list');
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setAdminDownloads(data.downloads || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch downloads:', error);
      setAdminError('Failed to fetch downloads');
    }
    setAdminLoading(false);
  };

  // Reserved for admin downloads UI (delete file)
  // @ts-expect-error TS6133 - handler reserved for future admin UI
  const handleAdminDeleteFile = async (filePath: string, fileName: string) => {
    showConfirmation({
      title: 'Delete File',
      message: `Are you sure you want to delete "${fileName}"?`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        closeConfirmation();
        await performAdminDeleteFile(filePath, fileName);
      },
    });
  };

  const performAdminDeleteFile = async (filePath: string, fileName: string) => {
    try {
      const res = await fetch('/api/downloads-file', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminDownloads();
        toast.success(`Deleted: ${fileName}`);
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  // Reserved for admin downloads UI (delete folder)
  // @ts-expect-error TS6133 - handler reserved for future admin UI
  const handleAdminDeleteFolder = async (chatId: string) => {
    showConfirmation({
      title: 'Delete Folder',
      message: `Are you sure you want to delete all downloads from "${chatId}"? This action cannot be undone.`,
      confirmText: 'Delete All',
      type: 'danger',
      onConfirm: async () => {
        closeConfirmation();
        await performAdminDeleteFolder(chatId);
      },
    });
  };

  const performAdminDeleteFolder = async (chatId: string) => {
    try {
      const res = await fetch(`/downloads/${encodeURIComponent(chatId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAdminDownloads();
        toast.success('Folder deleted successfully');
      } else {
        toast.error('Error: ' + data.message);
      }
    } catch (err) {
      toast.error('Failed to delete folder');
    }
  };

  // ============== PRO REQUEST FUNCTIONS ==============

  const fetchMyProRequest = async () => {
    try {
      const response = await apiCall('/api/pro-requests/my');
      if (response.ok) {
        const data = await response.json();
        setMyProRequest(data.request);
      }
    } catch (error) {
      console.error('Failed to fetch PRO request:', error);
    }
  };

  const fetchProRequests = async () => {
    try {
      const response = await apiCall('/api/pro-requests');
      if (response.ok) {
        const data = await response.json();
        setProRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch PRO requests:', error);
    }
  };

  const submitProRequest = async () => {
    if (!paymentConfirmed) {
      toast.error('Please confirm that you have paid for PRO version');
      return;
    }

    setProRequestLoading(true);
    try {
      const response = await apiCall('/api/pro-requests', {
        method: 'POST',
        body: JSON.stringify({ paymentConfirmed }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('PRO request submitted successfully! It may take up to 3 hours to process your request.', { duration: 6000 });
        setShowProRequestModal(false);
        setPaymentConfirmed(false);
        fetchMyProRequest();
      } else {
        toast.error(data.message || 'Failed to submit request');
      }
    } catch (error) {
      toast.error('Failed to submit PRO request');
    }
    setProRequestLoading(false);
  };

  const handleAcceptProRequest = async (requestId: string) => {
    try {
      const response = await apiCall(`/api/pro-requests/${requestId}/accept`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('PRO request accepted!');
        fetchProRequests();
        fetchAdminUsers();
      } else {
        toast.error(data.message || 'Failed to accept request');
      }
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleCancelProRequest = async (requestId: string) => {
    try {
      const response = await apiCall(`/api/pro-requests/${requestId}/cancel`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('PRO request cancelled');
        fetchProRequests();
      } else {
        toast.error(data.message || 'Failed to cancel request');
      }
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  // ============== NOTIFICATION FUNCTIONS ==============

  const fetchNotifications = async () => {
    try {
      const response = await apiCall('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        const newNotifications = data.notifications || [];
        setNotifications(newNotifications);
        setUnreadNotificationCount(data.unreadCount || 0);

        // Check if there's an unread pro_accepted notification - refresh user profile
        const hasUnreadProAccepted = newNotifications.some(
          (n: UserNotification) => n.type === 'pro_accepted' && !n.read
        );
        if (hasUnreadProAccepted && appUser?.role === 'USER') {
          // Refresh user profile to get updated role
          const profileRes = await apiCall('/api/auth/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setAppUser(profileData.user);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiCall(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await apiCall('/api/notifications/read-all', {
        method: 'PUT',
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotificationCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Fetch admin data when admin panel is opened
  useEffect(() => {
    if (showAdminPanel && appUser?.role === 'ADMIN') {
      fetchAdminStats();
      if (adminPage === 'dashboard') {
        fetchAdminUsers(); // Dashboard shows recent users
      } else if (adminPage === 'users') {
        fetchAdminUsers();
      } else if (adminPage === 'pro-requests') {
        fetchProRequests();
      } else if (adminPage === 'logs') {
        fetchActivityLogs();
      } else if (adminPage === 'downloads') {
        fetchAdminDownloads();
      }
    }
  }, [showAdminPanel, adminPage]);

  // Fetch notifications and PRO request status when user is authenticated
  useEffect(() => {
    if (appUser) {
      fetchNotifications();
      if (appUser.role === 'USER') {
        fetchMyProRequest();
      }
      if (appUser.role === 'ADMIN') {
        fetchProRequests();
      }
    }
  }, [appUser]);

  // Poll notifications periodically (every 30 seconds)
  useEffect(() => {
    if (!appUser || appUser.role === 'ADMIN') return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [appUser]);

  // Handle routing based on auth state
  useEffect(() => {
    if (appAuthLoading) return;
    
    if (!appUser) {
      // Not logged in - allow /, /login, /register
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(location.pathname)) {
        navigate('/');
      }
    } else {
      // User is logged in
      // Admin users skip tele-login and go directly to home (admin dashboard)
      if (appUser.role === 'ADMIN') {
        if (location.pathname !== '/home') {
          navigate('/home');
        }
      } else if (authStep !== 'authorized' && !telegramReconnecting) {
        // Regular users: Telegram not authenticated, go to tele-login
        if (location.pathname !== '/tele-login') {
          navigate('/tele-login');
        }
      } else if (authStep === 'authorized') {
        // Telegram authenticated, go to main app (/home)
        if (location.pathname !== '/home') {
          navigate('/home');
        }
      }
    }
  }, [appUser, appAuthLoading, authStep, telegramReconnecting, location.pathname, navigate]);

  // Connect to WebSocket
  useEffect(() => {
    let isCleanedUp = false;
    let connectionTimeout: ReturnType<typeof setTimeout>;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:3001`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      if (isCleanedUp) return;
      clearTimeout(connectionTimeout);
      setConnected(true);
      setError('');
      toast.success('Connected to server', { id: 'ws-connection' });
      
      // Auto-reconnect Telegram if credentials are saved
      const savedApiId = localStorage.getItem('telegramApiId');
      const savedApiHash = localStorage.getItem('telegramApiHash');
      if (savedApiId && savedApiHash) {
        setApiId(savedApiId);
        setApiHash(savedApiHash);
        setTelegramReconnecting(true);
        toast.loading('Reconnecting to Telegram...', { id: 'telegram-reconnect' });
        // Send init to reconnect
        websocket.send(JSON.stringify({ type: 'init', apiId: savedApiId, apiHash: savedApiHash }));
      }
    };

    websocket.onclose = () => {
      if (isCleanedUp) return; // Ignore if cleanup triggered this
      setConnected(false);
      setError('Disconnected from server');
      toast.error('Disconnected from server', { id: 'ws-connection' });
    };

    websocket.onerror = () => {
      if (isCleanedUp) return; // Ignore if cleanup triggered this
      // Delay error to avoid React Strict Mode double-invoke flicker
      connectionTimeout = setTimeout(() => {
        if (!isCleanedUp) {
          setError('Failed to connect to server. Make sure the server is running.');
          toast.error('Failed to connect to server', { id: 'ws-connection' });
        }
      }, 100);
    };

    websocket.onmessage = (event) => {
      if (isCleanedUp) return;
      const data = JSON.parse(event.data);
      handleServerMessage(data);
    };

    setWs(websocket);

    return () => {
      isCleanedUp = true;
      clearTimeout(connectionTimeout);
      websocket.close();
    };
  }, []);

  const handleServerMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'connected':
        // Connection established
        break;

      case 'authorized':
        setTelegramUser(data.user);
        setAuthStep('authorized');
        setLoading(false);
        setTelegramReconnecting(false);
        toast.dismiss('telegram-reconnect');
        toast.dismiss('telegram-init');
        toast.dismiss('send-code');
        toast.dismiss('verify-code');
        toast.dismiss('verify-2fa');
        toast.success(`Welcome back, ${data.user.firstName}!`);
        navigate('/home');
        // Ensure credentials are saved (backup save)
        const savedId = localStorage.getItem('telegramApiId');
        const savedHash = localStorage.getItem('telegramApiHash');
        if (!savedId && apiId) localStorage.setItem('telegramApiId', apiId);
        if (!savedHash && apiHash) localStorage.setItem('telegramApiHash', apiHash);
        break;

      case 'needAuth':
      case 'noSession':
        setAuthStep('phone');
        setLoading(false);
        setTelegramReconnecting(false);
        toast.dismiss('telegram-reconnect');
        toast.dismiss('telegram-init');
        break;

      case 'codeSent':
        setAuthStep('code');
        setLoading(false);
        toast.dismiss('telegram-init');
        toast.dismiss('send-code');
        toast.success('Verification code sent to your Telegram');
        break;

      case 'need2FA':
        setAuthStep('2fa');
        setLoading(false);
        toast.dismiss('verify-code');
        toast('Two-factor authentication required', { icon: '🔐' });
        break;

      case 'dialogs':
        setDialogs(data.dialogs);
        setLoading(false);
        toast.success(`Loaded ${data.dialogs.length} chats`);
        break;

      case 'messages': {
        const currentChatId = selectedChatRef.current?.id || pendingChatIdRef.current;
        if (data.chatId !== currentChatId) {
          setLoading(false);
          break;
        }
        if (loadMorePendingRef.current) {
          loadMorePendingRef.current = false;
          setLoadingMore(false);
          const newBatch = data.messages || [];
          setHasMoreMessages(newBatch.length >= 100);
          setMessages((prev) => {
            const ids = new Set(prev.map((m: Message) => m.id));
            const appended = newBatch.filter((m: Message) => !ids.has(m.id));
            return appended.length ? [...prev, ...appended] : prev;
          });
        } else {
          setMessages(data.messages || []);
          setHasMoreMessages((data.messages?.length ?? 0) >= 500);
        }
        setLoading(false);
        break;
      }

      case 'downloadProgress':
        setDownloadProgress((prev) => ({
          ...prev,
          [data.messageId]: data.progress,
        }));
        // Show cloud upload status if present
        if (data.status) {
          toast.loading(data.status, { id: `upload-${data.messageId}` });
        }
        break;

      case 'downloadComplete':
        setDownloadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[data.messageId];
          return newProgress;
        });
        setDownloadedFiles((prev) => [
          ...prev,
          { 
            messageId: data.messageId, 
            filename: data.filename, 
            path: data.path,
            cloudinaryUrl: data.cloudinaryUrl,
          },
        ]);
        toast.dismiss(`upload-${data.messageId}`);
        toast.success(`Downloaded: ${data.filename}`, {
          icon: data.cloudinaryUrl ? '☁️' : '💾',
        });
        // Save file to user's device (browser download)
        const downloadUrl = data.cloudinaryUrl || `${import.meta.env.VITE_API_URL || ''}${data.path}`;
        saveFileToDevice(downloadUrl, data.filename);
        break;

      case 'bulkDownloadStart':
        setBulkDownloading(true);
        setBulkProgress(0);
        toast.loading('Starting bulk download...', { id: 'bulk-download' });
        break;

      case 'bulkDownloadProgress':
        setBulkProgress(data.downloaded);
        toast.loading(`Downloaded ${data.downloaded} files...`, { id: 'bulk-download' });
        break;

      case 'bulkDownloadComplete':
        setBulkDownloading(false);
        toast.dismiss('bulk-download');
        toast.success(`Bulk download complete! ${data.totalDownloaded} files downloaded`, {
          duration: 5000,
          icon: '🎉',
        });
        break;

      case 'bulkDownloadAllChatsStart':
        setBulkDownloadingAllChats(true);
        setBulkDownloadAllChatsProgress(0);
        toast.loading('Downloading photos & videos from all chats...', { id: 'download-all-chats' });
        break;

      case 'bulkDownloadAllChatsProgress':
        setBulkDownloadAllChatsProgress(data.totalDownloaded);
        toast.loading(`Downloaded ${data.totalDownloaded} files...`, { id: 'download-all-chats' });
        break;

      case 'bulkDownloadAllChatsComplete':
        setBulkDownloadingAllChats(false);
        toast.dismiss('download-all-chats');
        toast.success(`Downloaded ${data.totalDownloaded} photos & videos from all chats`, {
          duration: 5000,
          icon: '🎉',
        });
        break;

      case 'error':
        setError(data.message);
        setLoading(false);
        setBulkDownloading(false);
        setBulkDownloadingAllChats(false);
        toast.dismiss('bulk-download');
        toast.dismiss('download-all-chats');
        toast.dismiss('telegram-reconnect');
        toast.dismiss('telegram-init');
        toast.dismiss('send-code');
        toast.dismiss('verify-code');
        toast.dismiss('verify-2fa');
        toast.error(data.message);
        break;
    }
  }, []);

  const send = useCallback((message: object) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, [ws]);

  const handleInitialize = () => {
    if (!apiId || !apiHash) {
      setError('Please enter API ID and API Hash');
      toast.error('Please enter API ID and API Hash');
      return;
    }
    setLoading(true);
    setError('');
    // Save credentials for auto-reconnect
    localStorage.setItem('telegramApiId', apiId);
    localStorage.setItem('telegramApiHash', apiHash);
    toast.loading('Connecting to Telegram...', { id: 'telegram-init' });
    send({ type: 'init', apiId, apiHash });
  };

  const handleSendCode = () => {
    if (!phoneNumber) {
      toast.error('Please enter phone number');
      return;
    }
    setLoading(true);
    setError('');
    toast.loading('Sending verification code...', { id: 'send-code' });
    send({ type: 'sendCode', phoneNumber });
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      toast.error('Please enter verification code');
      return;
    }
    setLoading(true);
    setError('');
    toast.loading('Verifying code...', { id: 'verify-code' });
    send({ type: 'verifyCode', code: verificationCode });
  };

  const handleVerify2FA = () => {
    if (!password) {
      toast.error('Please enter 2FA password');
      return;
    }
    setLoading(true);
    setError('');
    toast.loading('Verifying 2FA...', { id: 'verify-2fa' });
    send({ type: 'verifyCode', code: verificationCode, password });
  };

  const loadDialogs = () => {
    setLoading(true);
    send({ type: 'getDialogs' });
  };

  const handleSelectChat = (dialog: Dialog) => {
    setSelectedChat(dialog);
    selectedChatRef.current = dialog;
    pendingChatIdRef.current = dialog.id;
    setShowDownloadsPage(false);
    setMessages([]);
    setLoading(true);
    setLoadingMore(false);
    setHasMoreMessages(true);
    send({ type: 'getMessages', chatId: dialog.id, limit: 500 });
  };

  const handleLoadMoreMessages = () => {
    const chat = selectedChatRef.current;
    if (!chat || loadingMore || !hasMoreMessages) return;
    const currentMessages = messages;
    if (currentMessages.length === 0) return;
    const sorted = [...currentMessages].sort((a, b) => a.date - b.date);
    const oldestId = sorted[0].id;
    loadMorePendingRef.current = true;
    setLoadingMore(true);
    send({ type: 'getMessages', chatId: chat.id, limit: 100, offsetId: parseInt(oldestId, 10) || oldestId });
  };

  // Check if user can download (PRO or ADMIN only)
  const canDownload = appUser?.role === 'PRO' || appUser?.role === 'ADMIN';

  const handleDownloadMedia = useCallback((messageId: string) => {
    if (!selectedChat) return;
    if (!canDownload) {
      toast.error('Upgrade to PRO to download media');
      return;
    }
    send({
      type: 'downloadMedia',
      chatId: selectedChat.id,
      chatName: selectedChat.name,
      messageId,
      userId: appUser?.id,
      username: appUser?.username
    });
  }, [selectedChat, canDownload, appUser?.id, appUser?.username, send]);

  const resetTelegramState = () => {
    setTelegramUser(null);
    setAuthStep('credentials');
    setDialogs([]);
    setMessages([]);
    setSelectedChat(null);
    setBulkDownloadingAllChats(false);
    setApiId('');
    setApiHash('');
    setPhoneNumber('');
    setVerificationCode('');
    setPassword('');
    // Clear saved Telegram credentials
    localStorage.removeItem('telegramApiId');
    localStorage.removeItem('telegramApiHash');
  };

  // Reset telegram when app logs out
  useEffect(() => {
    if (!appUser) {
      resetTelegramState();
    }
  }, [appUser]);

  useEffect(() => {
    if (authStep === 'authorized' && dialogs.length === 0) {
      loadDialogs();
    }
  }, [authStep]);

  const filteredDialogs = dialogs.filter((dialog) => {
    const matchesSearch = dialog.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'private' && dialog.isPrivate) ||
      (filterType === 'channels' && dialog.type === 'channel') ||
      (filterType === 'groups' && dialog.type === 'group');
    return matchesSearch && matchesFilter;
  });

  const getDialogIcon = (dialog: Dialog) => {
    if (dialog.type === 'channel') {
      return dialog.isPrivate ? <Lock className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />;
    }
    if (dialog.type === 'group') {
      return dialog.isPrivate ? <Lock className="w-4 h-4" /> : <Users className="w-4 h-4" />;
    }
    return <MessageCircle className="w-4 h-4" />;
  };

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, []);

  const getDownloadedFile = useCallback((messageId: string) => {
    return downloadedFiles.find((f) => f.messageId === messageId);
  }, [downloadedFiles]);

  const isDownloaded = useCallback((messageId: string) => {
    return downloadedFiles.some((f) => f.messageId === messageId);
  }, [downloadedFiles]);

  const getMediaUrl = useCallback((messageId: string) => {
    const file = getDownloadedFile(messageId);
    if (!file) return '';
    if (file.cloudinaryUrl) return file.cloudinaryUrl;
    return `${import.meta.env.VITE_API_URL || ''}${file.path}`;
  }, [getDownloadedFile]);

  // Fetch downloads data
  const fetchDownloadsData = async () => {
    setLoadingDownloads(true);
    try {
      // Fetch downloads list from API
      const folderRes = await fetch('/api/downloads-list');
      if (folderRes.ok) {
        const data = await folderRes.json();
        setDownloadsData(data.downloads || []);
      }
    } catch (err) {
      console.error('Failed to fetch downloads:', err);
    }
    setLoadingDownloads(false);
  };

  const openDownloadsPage = () => {
    setShowDownloadsPage(true);
    setSelectedChat(null);
    fetchDownloadsData();
  };

  // App loading state
  if (appAuthLoading && !appUser) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
        <LoadingSpinner size="xl" className="text-telegram-accent" />
      </div>
    );
  }

  // Public pages (Welcome, Login, Register)
  if (!appUser) {
    // Welcome Page at /
    if (location.pathname === '/') {
      return (
        <Suspense fallback={<LoadingSpinner size="xl" className="text-telegram-accent" />}>
          <LazyWelcomePage />
        </Suspense>
      );
    }
    // Login Page at /login
    if (location.pathname === '/login') {
      return (
        <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4 relative overflow-hidden safe-area-top safe-area-bottom">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-telegram-accent/10 via-transparent to-transparent" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-purple-500/10 via-transparent to-transparent" />
          </div>
          
          <div className="card p-5 md:p-8 w-full max-w-md relative z-10 animate-fade-in">
            <button
              onClick={() => navigate('/')}
              className="btn-ghost text-sm mb-4 md:mb-6 -ml-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </button>
            
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-telegram-accent/20 rounded-full blur-xl" />
                <img src="/TGM.jpg" alt="Telegram" className="w-16 h-16 md:w-20 md:h-20 relative rounded-full object-cover" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-telegram-text">Welcome Back</h1>
            <p className="text-telegram-text-secondary text-center mb-6 md:mb-8 text-sm md:text-base">
              Sign in to continue to your account
            </p>

            {appAuthError && (
              <div className="bg-telegram-error/10 border border-telegram-error/30 rounded-xl p-4 mb-6 flex items-start gap-3 animate-slide-down">
                <AlertCircle className="w-5 h-5 text-telegram-error flex-shrink-0 mt-0.5" />
                <p className="text-telegram-error text-sm">{appAuthError}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-telegram-text-secondary">
                  Username or Email
                </label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter username or email"
                    className="input-with-icon"
                    onKeyDown={(e) => e.key === 'Enter' && handleAppLogin()}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-telegram-text-secondary">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input-with-icon pr-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleAppLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-telegram-text-muted hover:text-telegram-text hover:bg-telegram-accent-muted transition-all"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {turnstileSiteKey && (
                <div className="flex justify-center">
                  <TurnstileWidget
                    sitekey={turnstileSiteKey}
                    onVerify={setLoginCaptchaToken}
                    onExpire={() => setLoginCaptchaToken('')}
                    theme="dark"
                    size="normal"
                    resetTrigger={loginCaptchaReset}
                  />
                </div>
              )}
              
              <button
                onClick={handleAppLogin}
                disabled={appAuthLoading || (!!turnstileSiteKey && !loginCaptchaToken)}
                className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {appAuthLoading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-telegram-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-telegram-bg-secondary px-3 text-telegram-text-muted">or</span>
                </div>
              </div>
              
              <p className="text-center text-telegram-text-secondary">
                Don't have an account?{' '}
                <button
                  onClick={() => { navigate('/register'); setAppAuthError(''); }}
                  className="text-telegram-accent hover:text-telegram-accent-hover font-medium transition-colors"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Register Page at /register
    if (location.pathname === '/register') {
      return (
        <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4 relative overflow-hidden safe-area-top safe-area-bottom">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-radial from-purple-500/10 via-transparent to-transparent" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-radial from-telegram-accent/10 via-transparent to-transparent" />
          </div>
          
          <div className="card p-5 md:p-8 w-full max-w-md relative z-10 animate-fade-in">
            <button
              onClick={() => navigate('/')}
              className="btn-ghost text-sm mb-4 md:mb-6 -ml-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </button>
            
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl" />
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-telegram-accent to-purple-500 flex items-center justify-center relative">
                  <UserPlus className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-telegram-text">Create Account</h1>
            <p className="text-telegram-text-secondary text-center mb-6 md:mb-8 text-sm md:text-base">
              Join us and start saving your media
            </p>

            {appAuthError && (
              <div className="bg-telegram-error/10 border border-telegram-error/30 rounded-xl p-4 mb-6 flex items-start gap-3 animate-slide-down">
                <AlertCircle className="w-5 h-5 text-telegram-error flex-shrink-0 mt-0.5" />
                <p className="text-telegram-error text-sm">{appAuthError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-telegram-text-secondary">
                  Username
                </label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="input-with-icon"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-telegram-text-secondary">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-with-icon"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-telegram-text-secondary">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="input-with-icon pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-telegram-text-muted hover:text-telegram-text transition-colors"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-telegram-text-secondary">
                    Confirm
                  </label>
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                    <input
                      type={showRegisterConfirmPassword ? "text" : "password"}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="Confirm"
                      className="input-with-icon pr-10"
                      onKeyDown={(e) => e.key === 'Enter' && handleAppRegister()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-telegram-text-muted hover:text-telegram-text transition-colors"
                    >
                      {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer mt-4 p-2 rounded-lg border border-telegram-border bg-telegram-bg-secondary/50 hover:border-telegram-accent/50 transition-colors">
                <input
                  type="checkbox"
                  checked={registerAcceptedTerms}
                  onChange={(e) => setRegisterAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border border-telegram-border bg-telegram-bg text-telegram-accent focus:ring-2 focus:ring-telegram-accent focus:ring-offset-0 focus:ring-offset-telegram-bg cursor-pointer accent-telegram-accent"
                />
                <span className="text-xs text-telegram-text-secondary">
                  I agree to the{' '}
                  <span className="text-telegram-accent font-medium">Terms and Conditions</span>
                </span>
              </label>

              {turnstileSiteKey && (
                <div className="flex justify-center">
                  <TurnstileWidget
                    sitekey={turnstileSiteKey}
                    onVerify={setRegisterCaptchaToken}
                    onExpire={() => setRegisterCaptchaToken('')}
                    theme="dark"
                    size="normal"
                    resetTrigger={registerCaptchaReset}
                  />
                </div>
              )}
              
              <button
                onClick={handleAppRegister}
                disabled={appAuthLoading || !registerAcceptedTerms || (!!turnstileSiteKey && !registerCaptchaToken)}
                className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {appAuthLoading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-telegram-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-telegram-bg-secondary px-3 text-telegram-text-muted">or</span>
                </div>
              </div>
              
              <p className="text-center text-telegram-text-secondary">
                Already have an account?{' '}
                <button
                  onClick={() => { navigate('/login'); setAppAuthError(''); }}
                  className="text-telegram-accent hover:text-telegram-accent-hover font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Fallback - redirect to welcome
    return null;
  }

  // Telegram Auth screens (only show at /tele-login)
  if (authStep !== 'authorized' && location.pathname === '/tele-login') {
    // Show loading while reconnecting
    if (telegramReconnecting) {
      return (
        <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4 relative overflow-hidden safe-area-top safe-area-bottom">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-telegram-accent/10 via-transparent to-transparent" />
          </div>
          <div className="card p-5 md:p-8 w-full max-w-md text-center animate-fade-in">
            <div className="relative mb-6 md:mb-8">
              <div className="absolute inset-0 bg-telegram-accent/20 rounded-full blur-xl" />
              <img src="/TGM.jpg" alt="Telegram" className="w-20 h-20 md:w-24 md:h-24 mx-auto relative rounded-full object-cover" />
            </div>
            <LoadingSpinner size="xl" className="text-telegram-accent mx-auto mb-4" />
            <h2 className="text-lg md:text-xl font-semibold mb-2 text-telegram-text">Reconnecting to Telegram...</h2>
            <p className="text-telegram-text-secondary text-sm md:text-base">Please wait while we restore your session</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4 relative overflow-hidden safe-area-top safe-area-bottom">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-telegram-accent/10 via-transparent to-transparent" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-cyan-500/10 via-transparent to-transparent" />
        </div>
        
        <div className="card p-5 md:p-8 w-full max-w-md relative z-10 animate-fade-in">
          <button
            onClick={() => { handleAppLogout(); navigate('/'); }}
            className="btn-ghost text-sm mb-4 md:mb-6 -ml-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
          
          <div className="relative mb-6 md:mb-8">
            <div className="absolute inset-0 bg-telegram-accent/20 rounded-full blur-xl" />
            <img src="/TGM.jpg" alt="Telegram" className="w-20 h-20 md:w-24 md:h-24 mx-auto relative rounded-full object-cover" />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2 text-telegram-text">Connect Telegram</h1>
          <p className="text-telegram-text-secondary text-center mb-8">
            Link your Telegram account to start saving media
          </p>

          {authStep === 'credentials' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-telegram-text-secondary">
                  API ID
                </label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                  <input
                    type="text"
                    value={apiId}
                    onChange={(e) => setApiId(e.target.value)}
                    placeholder="Enter your API ID"
                    className="input-with-icon"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-telegram-text-secondary">
                  API Hash
                </label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                  <input
                    type="password"
                    value={apiHash}
                    onChange={(e) => setApiHash(e.target.value)}
                    placeholder="Enter your API Hash"
                    className="input-with-icon"
                  />
                </div>
              </div>
              <div className="bg-telegram-accent-muted rounded-xl p-4">
                <p className="text-xs text-telegram-text-secondary">
                  Get your API credentials at{' '}
                  <a
                    href="https://my.telegram.org/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-telegram-accent hover:text-telegram-accent-hover font-medium transition-colors"
                  >
                    my.telegram.org/apps
                  </a>
                </p>
              </div>
              <button
                onClick={handleInitialize}
                disabled={loading || !connected}
                className="btn-primary w-full py-3.5"
              >
                {loading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {authStep === 'phone' && (
            <div className="space-y-5 animate-fade-in">
              <p className="text-sm text-telegram-text-secondary text-center">
                One-time verification. Next time you can sign in with only API ID and API Hash.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-telegram-text-secondary">
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="input-with-icon"
                  />
                </div>
                <p className="text-xs text-telegram-text-muted">Include country code (e.g., +1 for US)</p>
              </div>
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="btn-primary w-full py-3.5"
              >
                {loading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <>
                    Send Code
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {authStep === 'code' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-telegram-text-secondary text-center">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="12345"
                  className="input text-center text-3xl tracking-[0.5em] font-mono"
                  maxLength={5}
                />
                <p className="text-xs text-telegram-text-muted text-center">Check your Telegram app for the code</p>
              </div>
              <button
                onClick={handleVerifyCode}
                disabled={loading}
                className="btn-primary w-full py-3.5"
              >
                {loading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <>
                    Verify
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {authStep === '2fa' && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-telegram-accent-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-telegram-accent" />
                </div>
                <h3 className="font-semibold text-telegram-text">Two-Factor Authentication</h3>
                <p className="text-sm text-telegram-text-secondary mt-1">Enter your 2FA password to continue</p>
              </div>
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-telegram-text-muted group-focus-within:text-telegram-accent transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your 2FA password"
                    className="input-with-icon"
                  />
                </div>
              </div>
              <button
                onClick={handleVerify2FA}
                disabled={loading}
                className="btn-primary w-full py-3.5"
              >
                {loading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin-only dashboard (no chat sidebar)
  if (appUser?.role === 'ADMIN') {
    return (
      <div className="h-screen flex flex-col bg-telegram-bg overflow-hidden">
        {/* Admin Header */}
        <div className="h-14 md:h-16 bg-telegram-header/80 backdrop-blur-xl flex items-center justify-between px-3 md:px-6 border-b border-telegram-border sticky top-0 z-20 safe-area-top">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-icon md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <img src="/TGM.jpg" alt="" className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover" />
            <div>
              <h1 className="text-base md:text-xl font-bold text-telegram-text">Admin</h1>
              <p className="text-[10px] md:text-xs text-telegram-text-muted hidden sm:block">Manage your application</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl hover:bg-telegram-accent-muted transition-all cursor-pointer"
            >
              <div className="avatar avatar-sm from-telegram-accent to-blue-600">
                <span className="text-xs font-semibold">{appUser?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-sm font-medium text-telegram-text block">{appUser?.username}</span>
                <span className="text-xs text-telegram-text-muted flex items-center gap-1">
                  <Crown className="w-3 h-3 text-yellow-500" />
                  Admin
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 text-telegram-text-muted -rotate-90 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="dropdown-menu right-0 top-14">
                  <div className="px-3 py-4 border-b border-telegram-border mb-2">
                    <div className="flex items-center gap-3">
                      <div className="avatar avatar-lg from-telegram-accent to-blue-600">
                        <span className="font-semibold">{appUser?.username?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="badge-warning text-[10px] px-1.5 py-0.5 mb-1 inline-flex">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                        <span className="font-medium text-telegram-text truncate block">{appUser?.username}</span>
                        <span className="text-xs text-telegram-text-muted truncate block">{appUser?.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-telegram-border pt-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleAppLogout();
                      }}
                      className="dropdown-item-danger"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Admin Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Admin Sidebar */}
          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            fixed md:relative inset-y-0 left-0 z-40 md:z-auto
            w-64 bg-telegram-sidebar border-r border-telegram-border flex flex-col
            transition-transform duration-300 ease-in-out
            pt-14 md:pt-0
          `}>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', onClick: () => { setAdminPage('dashboard'); setSidebarOpen(false); } },
                { id: 'users', icon: Users, label: 'Users', onClick: () => { setAdminPage('users'); fetchAdminUsers(); setSidebarOpen(false); } },
                { id: 'pro-requests', icon: Sparkles, label: 'PRO Requests', onClick: () => { setAdminPage('pro-requests'); fetchProRequests(); setSidebarOpen(false); } },
                { id: 'logs', icon: Activity, label: 'Activity Logs', onClick: () => { setAdminPage('logs'); fetchActivityLogs(); setSidebarOpen(false); } },
                { id: 'downloads', icon: FolderDown, label: 'All Downloads', onClick: () => { setAdminPage('downloads'); fetchAdminDownloads(); setSidebarOpen(false); } },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    adminPage === item.id 
                      ? 'bg-telegram-accent text-white shadow-lg shadow-telegram-accent/25' 
                      : 'text-telegram-text-secondary hover:text-telegram-text hover:bg-telegram-accent-muted'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Admin Main Content */}
          <div className="flex-1 overflow-auto bg-telegram-bg-secondary/50 p-3 md:p-6">
            {adminPage === 'dashboard' && (
              <div className="animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-telegram-text">Dashboard</h2>
                    <p className="text-telegram-text-secondary text-sm mt-1">Overview of your application</p>
                  </div>
                  <button
                    onClick={() => { fetchAdminStats(); fetchAdminUsers(); }}
                    className="btn-secondary self-start sm:self-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
                  {[
                    { label: 'Total Users', value: adminStats?.totalUsers || 0, icon: Users, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
                    { label: 'Admins', value: adminStats?.adminCount || 0, icon: Crown, color: 'yellow', gradient: 'from-yellow-500 to-orange-500' },
                    { label: 'Telegram Sessions', value: adminStats?.activeTelegramSessions || 0, icon: MessageCircle, color: 'green', gradient: 'from-green-500 to-emerald-500' },
                    { label: 'Logins (24h)', value: adminStats?.loginsLast24h || 0, icon: TrendingUp, color: 'purple', gradient: 'from-purple-500 to-pink-500' },
                  ].map((stat, index) => (
                    <div key={stat.label} className="card-hover p-3 md:p-5" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-telegram-text-secondary text-xs md:text-sm font-medium truncate">{stat.label}</p>
                          <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2 text-telegram-text">{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Users */}
                <div className="glass-card rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-semibold text-telegram-text">Recent Users</h3>
                    <button 
                      onClick={() => { setAdminPage('users'); fetchAdminUsers(); setSidebarOpen(false); }}
                      className="text-sm text-telegram-accent hover:text-telegram-accent-hover transition-colors"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {adminUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-telegram-message rounded-lg">
                        <div className="avatar avatar-md from-telegram-accent to-blue-600">
                          <span className="font-medium">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-telegram-text">{user.username}</span>
                            {user.role === 'ADMIN' && <Crown className="w-4 h-4 text-yellow-500" />}
                            {user.role === 'PRO' && <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />}
                          </div>
                          <span className="text-sm text-telegram-text-muted">{user.email}</span>
                        </div>
                        <span className="text-xs text-telegram-text-muted">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {adminUsers.length === 0 && (
                      <p className="text-center text-telegram-text-muted py-4">No users found</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {adminPage === 'users' && (
              <div className="animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-telegram-text">Users</h2>
                    <p className="text-telegram-text-secondary text-sm mt-1">Manage user accounts</p>
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="btn-primary self-start sm:self-auto"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
                
                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="glass-card rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="avatar avatar-md from-telegram-accent to-blue-600 flex-shrink-0">
                            <span className="font-medium">{user.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-telegram-text truncate">{user.username}</span>
                              {user.role === 'ADMIN' && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                              {user.role === 'PRO' && <Zap className="w-4 h-4 text-orange-500 fill-orange-500 flex-shrink-0" />}
                            </div>
                            <p className="text-sm text-telegram-text-muted truncate">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'ADMIN' ? 'bg-yellow-500/20 text-yellow-400' : 
                                user.role === 'PRO' ? 'bg-orange-500/20 text-orange-400' : 
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {user.role}
                              </span>
                              <span className="text-xs text-telegram-text-muted">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn-icon"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="btn-icon text-telegram-error hover:bg-telegram-error/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Table Layout */}
                <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-telegram-bg-secondary/50">
                        <tr>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">User</th>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">Email</th>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">Role</th>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">Created</th>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((user) => (
                          <tr key={user.id} className="border-t border-telegram-border hover:bg-telegram-accent-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="avatar avatar-md from-telegram-accent to-blue-600">
                                  <span className="font-medium">{user.username.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-telegram-text">{user.username}</span>
                                  {user.role === 'ADMIN' && <Crown className="w-4 h-4 text-yellow-500" />}
                                  {user.role === 'PRO' && <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-telegram-text-secondary">{user.email}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                                user.role === 'ADMIN' ? 'bg-yellow-500/20 text-yellow-400' : 
                                user.role === 'PRO' ? 'bg-orange-500/20 text-orange-400' : 
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {user.role === 'PRO' && <Zap className="w-3 h-3 fill-current" />}
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-telegram-text-secondary text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="btn-icon"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                  className="btn-icon text-telegram-error hover:bg-telegram-error/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminPage === 'pro-requests' && (
              <div className="animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-telegram-text">PRO Upgrade Requests</h2>
                    <p className="text-telegram-text-secondary text-sm mt-1">Review and manage PRO upgrade requests from users</p>
                  </div>
                  <button
                    onClick={fetchProRequests}
                    className="btn-secondary self-start sm:self-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-telegram-text">{proRequests.filter(r => r.status === 'pending').length}</p>
                        <p className="text-xs text-telegram-text-muted">Pending</p>
                      </div>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-telegram-text">{proRequests.filter(r => r.status === 'accepted').length}</p>
                        <p className="text-xs text-telegram-text-muted">Accepted</p>
                      </div>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-telegram-text">{proRequests.filter(r => r.status === 'cancelled').length}</p>
                        <p className="text-xs text-telegram-text-muted">Rejected</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Requests */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-telegram-text mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Pending Requests
                  </h3>
                  {proRequests.filter(r => r.status === 'pending').length === 0 ? (
                    <div className="glass-card rounded-xl p-8 text-center border border-dashed border-telegram-border">
                      <Sparkles className="w-14 h-14 text-yellow-500/30 mx-auto mb-4" />
                      <p className="text-telegram-text-secondary font-medium text-lg">No pending requests</p>
                      <p className="text-telegram-text-muted text-sm mt-2">When users request PRO upgrades, they will appear here for your review</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {proRequests.filter(r => r.status === 'pending').map((request) => (
                        <div key={request._id} className="glass-card rounded-xl p-4 border-l-4 border-yellow-500 hover:bg-telegram-accent-muted/20 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="avatar avatar-md from-yellow-500 to-orange-500">
                                <span className="font-medium text-white">{request.username.charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-telegram-text">{request.username}</span>
                                  {request.paymentConfirmed && (
                                    <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                                      <Check className="w-3 h-3" />
                                      Payment Confirmed
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-telegram-text-muted">{request.email}</p>
                                <p className="text-xs text-telegram-text-muted mt-1">
                                  Requested: {new Date(request.createdAt).toLocaleDateString()} {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                onClick={() => handleCancelProRequest(request._id)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-sm font-medium"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                              <button
                                onClick={() => handleAcceptProRequest(request._id)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-green-500/25"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Accept
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Request History */}
                {proRequests.filter(r => r.status !== 'pending').length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-telegram-text mb-4">Request History</h3>
                    <div className="glass-card rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-telegram-bg-secondary/50">
                            <tr>
                              <th className="text-left p-4 text-telegram-text-secondary font-medium">User</th>
                              <th className="text-left p-4 text-telegram-text-secondary font-medium">Email</th>
                              <th className="text-left p-4 text-telegram-text-secondary font-medium">Status</th>
                              <th className="text-left p-4 text-telegram-text-secondary font-medium">Processed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {proRequests.filter(r => r.status !== 'pending').map((request) => (
                              <tr key={request._id} className="border-t border-telegram-border">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`avatar avatar-sm ${request.status === 'accepted' ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500'}`}>
                                      <span className="text-xs font-medium text-white">{request.username.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="font-medium text-telegram-text">{request.username}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-telegram-text-secondary">{request.email}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    request.status === 'accepted' 
                                      ? 'bg-green-500/20 text-green-400' 
                                      : 'bg-red-500/20 text-red-400'
                                  }`}>
                                    {request.status === 'accepted' ? 'Accepted' : 'Rejected'}
                                  </span>
                                </td>
                                <td className="p-4 text-telegram-text-secondary text-sm">
                                  {request.processedAt ? new Date(request.processedAt).toLocaleDateString() : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {adminPage === 'logs' && (
              <div className="animate-slide-up">
                <div className="flex flex-col gap-4 mb-6 md:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-telegram-text">Activity Logs</h2>
                      <p className="text-telegram-text-secondary text-sm mt-1">Track user activity</p>
                    </div>
                    <button
                      onClick={() => fetchActivityLogs()}
                      className="btn-secondary self-start sm:self-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                  <div className="flex items-center">
                    <select
                      value={logsFilter.action}
                      onChange={(e) => setLogsFilter({ ...logsFilter, action: e.target.value })}
                      className="bg-telegram-bg border border-telegram-border rounded-lg py-2 px-3 text-sm text-telegram-text focus:outline-none focus:border-telegram-accent w-full sm:w-auto"
                    >
                      <option value="">All Actions</option>
                      <option value="login">Login</option>
                      <option value="logout">Logout</option>
                      <option value="register">Register</option>
                      <option value="download">Download</option>
                      <option value="telegram_connect">Telegram Connect</option>
                    </select>
                  </div>
                </div>
                
                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="glass-card rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="font-medium text-telegram-text">{log.username}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          log.action === 'login' ? 'bg-green-500/20 text-green-400' :
                          log.action === 'logout' ? 'bg-red-500/20 text-red-400' :
                          log.action === 'register' ? 'bg-blue-500/20 text-blue-400' :
                          log.action === 'download' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-sm text-telegram-text-secondary truncate mb-2">{log.details}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-telegram-text-muted">
                        <span className="font-mono">{log.ipAddress || '-'}</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Table Layout */}
                <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-telegram-bg-secondary/50">
                        <tr>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">User</th>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">Action</th>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">Details</th>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">IP Address</th>
                          <th className="text-left p-4 text-telegram-text-secondary font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.map((log) => (
                          <tr key={log.id} className="border-t border-telegram-border hover:bg-telegram-accent-muted/30 transition-colors">
                            <td className="p-4 font-medium text-telegram-text">{log.username}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                log.action === 'login' ? 'bg-green-500/20 text-green-400' :
                                log.action === 'logout' ? 'bg-red-500/20 text-red-400' :
                                log.action === 'register' ? 'bg-blue-500/20 text-blue-400' :
                                log.action === 'download' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 text-telegram-text-secondary text-sm max-w-xs truncate">
                              {log.details || '-'}
                            </td>
                            <td className="p-4 text-telegram-text-secondary text-sm font-mono">
                              {log.ipAddress || '-'}
                            </td>
                            <td className="p-4 text-telegram-text-secondary text-sm">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {adminPage === 'downloads' && (
              <div className="animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-telegram-text">All Downloads</h2>
                    <p className="text-telegram-text-secondary text-sm mt-1">View all user downloads (includes deleted)</p>
                  </div>
                  <button
                    onClick={fetchAdminDownloads}
                    className="btn-secondary self-start sm:self-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
                
                {/* Downloads grouped by user */}
                <div className="space-y-4 md:space-y-6">
                  {adminDownloads.map((userGroup: any) => (
                    <div key={userGroup.username} className="glass-card rounded-xl md:rounded-2xl overflow-hidden">
                      {/* User header */}
                      <div className="p-3 md:p-4 border-b border-telegram-border bg-telegram-sidebar/50">
                        <div className="flex items-center gap-3">
                          <div className="avatar avatar-sm md:avatar-md from-telegram-accent to-blue-600">
                            <span className="font-medium text-sm">{userGroup.username?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-telegram-text text-sm md:text-base truncate">{userGroup.username}</h3>
                            <p className="text-[10px] md:text-xs text-telegram-text-muted truncate">{userGroup.email} • {userGroup.downloads?.length || 0} downloads</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Downloads grid */}
                      <div className="p-2 md:p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5 md:gap-2">
                        {userGroup.downloads?.map((download: any) => {
                          const isImage = download.fileType === 'photo';
                          const isVideo = download.fileType === 'video';
                          const mediaUrl = download.cloudinaryUrl || download.localPath;
                          const formatSize = (bytes: number) => {
                            if (!bytes) return '';
                            if (bytes < 1024) return bytes + ' B';
                            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                            return (bytes / 1024 / 1024).toFixed(1) + ' MB';
                          };
                          return (
                            <div
                              key={download.id}
                              className={`bg-telegram-message rounded-lg overflow-hidden hover:ring-2 hover:ring-telegram-accent transition-all relative group ${
                                download.deletedByUser ? 'opacity-60' : ''
                              }`}
                            >
                              {/* Deleted badge */}
                              {download.deletedByUser && (
                                <div className="absolute top-1 left-1 z-10 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                  Deleted
                                </div>
                              )}
                              
                              <button
                                onClick={() => setMediaPreview({
                                  isOpen: true,
                                  url: mediaUrl,
                                  type: download.fileType,
                                  fileName: download.fileName
                                })}
                                className="block w-full text-left"
                              >
                                {isImage ? (
                                  <img src={mediaUrl} alt={download.fileName} loading="lazy" className="w-full h-14 md:h-20 object-cover" />
                                ) : isVideo ? (
                                  <div className="relative w-full h-14 md:h-20 bg-black flex items-center justify-center">
                                    <video src={mediaUrl} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="bg-black/50 rounded-full p-1 md:p-2">
                                        <Play className="w-4 h-4 md:w-6 md:h-6 text-white fill-white" />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-14 md:h-20 flex items-center justify-center bg-telegram-bg">
                                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-telegram-text-secondary" />
                                  </div>
                                )}
                                <div className="p-1.5 md:p-2">
                                  <p className="text-[10px] md:text-xs truncate text-telegram-text" title={download.fileName}>{download.fileName}</p>
                                  <div className="hidden md:flex items-center justify-between mt-1">
                                    <span className="text-[10px] text-telegram-text-muted">{formatSize(download.fileSize)}</span>
                                    <span className="text-[10px] text-telegram-text-muted">{new Date(download.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {adminDownloads.length === 0 && (
                    <div className="text-center py-12 text-telegram-text-muted">
                      <FolderDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-medium mb-2">No Downloads Yet</h3>
                      <p>User downloads will appear here, even if they delete them.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in">
              <h3 className="text-xl font-bold text-telegram-text mb-6">
                {editingUser ? 'Edit User' : 'Add User'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-telegram-text-secondary mb-2">Username</label>
                  <input
                    type="text"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    className="w-full bg-telegram-bg border border-telegram-border rounded-lg py-2 px-4 text-telegram-text focus:outline-none focus:border-telegram-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-telegram-text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full bg-telegram-bg border border-telegram-border rounded-lg py-2 px-4 text-telegram-text focus:outline-none focus:border-telegram-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-telegram-text-secondary mb-2">
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full bg-telegram-bg border border-telegram-border rounded-lg py-2 px-4 text-telegram-text focus:outline-none focus:border-telegram-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-telegram-text-secondary mb-2">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as 'ADMIN' | 'PRO' | 'USER' })}
                    className="w-full bg-telegram-bg border border-telegram-border rounded-lg py-2 px-4 text-telegram-text focus:outline-none focus:border-telegram-accent"
                  >
                    <option value="USER">User</option>
                    <option value="PRO">Pro</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editingUser ? handleUpdateUser() : handleCreateUser()}
                  className="btn-primary flex-1"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Preview Modal */}
        {mediaPreview.isOpen && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={() => setMediaPreview({ ...mediaPreview, isOpen: false })}
          >
            <div className="relative max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button
                onClick={() => setMediaPreview({ ...mediaPreview, isOpen: false })}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X className="w-8 h-8" />
              </button>
              
              {/* Download button */}
              <a
                href={mediaPreview.url}
                download={mediaPreview.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -top-12 right-12 text-white hover:text-gray-300 transition-colors z-10"
                title="Download"
              >
                <Download className="w-7 h-7" />
              </a>
              
              {/* Media content */}
              <div className="flex items-center justify-center">
                {mediaPreview.type === 'photo' ? (
                  <img 
                    src={mediaPreview.url} 
                    alt={mediaPreview.fileName}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  />
                ) : mediaPreview.type === 'video' ? (
                  <video 
                    src={mediaPreview.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                  />
                ) : (
                  <div className="bg-telegram-sidebar rounded-2xl p-8 text-center">
                    <FileText className="w-20 h-20 text-telegram-accent mx-auto mb-4" />
                    <p className="text-telegram-text font-medium mb-4">{mediaPreview.fileName}</p>
                    <a
                      href={mediaPreview.url}
                      download={mediaPreview.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      <Download className="w-5 h-5" />
                      Download File
                    </a>
                  </div>
                )}
              </div>
              
              {/* File name */}
              <p className="text-white text-center mt-4 text-sm opacity-75">{mediaPreview.fileName}</p>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  confirmModal.type === 'danger' ? 'bg-red-500/20' : 
                  confirmModal.type === 'warning' ? 'bg-yellow-500/20' : 'bg-telegram-accent/20'
                }`}>
                  <AlertCircle className={`w-6 h-6 ${
                    confirmModal.type === 'danger' ? 'text-red-500' : 
                    confirmModal.type === 'warning' ? 'text-yellow-500' : 'text-telegram-accent'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-telegram-text">{confirmModal.title}</h3>
                </div>
              </div>
              <p className="text-telegram-text-secondary mb-6 leading-relaxed">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={closeConfirmation}
                  className="btn-secondary flex-1"
                >
                  {confirmModal.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    confirmModal.type === 'danger' 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'btn-primary'
                  }`}
                >
                  {confirmModal.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main app
  return (
    <div className="h-screen flex bg-telegram-bg overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${sidebarOpen ? 'w-[85vw] max-w-[320px] md:w-80' : 'md:w-0'}
          fixed md:relative inset-y-0 left-0 z-40
          bg-telegram-sidebar flex flex-col transition-all duration-300 
          border-r border-telegram-border
          md:overflow-hidden
        `}
      >
        {/* Sidebar Header */}
        <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 bg-telegram-sidebar/80 backdrop-blur-xl border-b border-telegram-border sticky top-0 z-10">
          {/* App Logo & Branding */}
          <div className="flex items-center gap-2">
            <img src="/TGM.jpg" alt="" className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover" />
            <span className="text-sm font-bold text-telegram-text hidden sm:block">Media Saver</span>
          </div>
          {/* Downloads Button */}
          <button
            onClick={() => { openDownloadsPage(); setSidebarOpen(false); }}
            className={`btn-icon ${
              showDownloadsPage ? 'bg-telegram-accent text-white hover:bg-telegram-accent-hover' : ''
            }`}
            title="Downloads"
          >
            <FolderDown className="w-5 h-5" />
          </button>
        </div>

        {/* Dialogs List */}
        <div className="flex-1 overflow-y-auto px-1 md:px-2 scroll-container">
          {loading && dialogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <LoadingSpinner size="lg" className="text-telegram-accent" />
              <span className="text-sm text-telegram-text-muted">Loading chats...</span>
            </div>
          ) : filteredDialogs.length === 0 ? (
            <div className="empty-state py-12">
              <MessageCircle className="empty-state-icon w-12 h-12" />
              <p className="text-telegram-text-secondary text-sm">No chats found</p>
            </div>
          ) : (
            <div className="space-y-0.5 md:space-y-1 py-2">
              {filteredDialogs.map((dialog, index) => (
                <div
                  key={dialog.id}
                  onClick={() => { handleSelectChat(dialog); setSidebarOpen(false); }}
                  className={`chat-item flex items-center gap-2 md:gap-3 ${
                    selectedChat?.id === dialog.id ? 'active' : ''
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className={`avatar avatar-md md:avatar-lg flex-shrink-0 ${
                    dialog.type === 'channel' 
                      ? 'from-purple-500 to-pink-500' 
                      : dialog.type === 'group' 
                        ? 'from-telegram-accent to-cyan-500'
                        : 'from-telegram-accent to-blue-600'
                  }`}>
                    {getDialogIcon(dialog)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium truncate flex items-center gap-1.5 text-telegram-text text-sm md:text-base">
                        {dialog.isPrivate && <Lock className="w-3 h-3 text-telegram-text-muted" />}
                        {dialog.name}
                      </span>
                      <span className="text-xs text-telegram-text-muted ml-2 flex-shrink-0">
                        {formatDate(dialog.date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-telegram-text-secondary truncate">
                        {dialog.type === 'channel' ? 'Channel' : dialog.type === 'group' ? 'Group' : 'Chat'}
                      </span>
                      {dialog.unreadCount > 0 && (
                        <span className="badge-primary text-[10px] px-2 py-0.5 min-w-[20px] text-center">
                          {dialog.unreadCount > 99 ? '99+' : dialog.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - min-h-0 so column shrinks and inner scroll works */}
      <div className="flex-1 flex flex-col min-h-0 bg-telegram-bg min-w-0">
        {/* Header */}
        <div className="h-14 md:h-16 bg-telegram-header/80 backdrop-blur-xl flex items-center justify-between px-3 md:px-4 border-b border-telegram-border sticky top-0 z-20">
          {/* Left Section - Menu & Logo/Title */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            {/* Menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-icon flex-shrink-0"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Current Page/Context Info */}
            {selectedChat ? (
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 ml-2">
                <div className={`avatar avatar-sm flex-shrink-0 ${
                  selectedChat.type === 'channel' 
                    ? 'from-purple-500 to-pink-500' 
                    : selectedChat.type === 'group' 
                      ? 'from-telegram-accent to-cyan-500'
                      : 'from-telegram-accent to-blue-600'
                }`}>
                  {getDialogIcon(selectedChat)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium flex items-center gap-1.5 text-telegram-text text-sm truncate">
                    {selectedChat.isPrivate && <Lock className="w-3 h-3 text-telegram-text-muted flex-shrink-0" />}
                    <span className="truncate">{selectedChat.name}</span>
                  </h2>
                  <p className="text-[10px] md:text-xs text-telegram-text-secondary flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedChat.type === 'channel' ? 'bg-purple-500' : selectedChat.type === 'group' ? 'bg-cyan-500' : 'bg-telegram-online'}`} />
                    {selectedChat.type === 'channel' ? 'Channel' : selectedChat.type === 'group' ? 'Group' : 'Chat'}
                  </p>
                </div>
              </div>
            ) : showDownloadsPage ? (
              <div className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 rounded-lg bg-telegram-success/20 flex items-center justify-center flex-shrink-0">
                  <FolderDown className="w-4 h-4 text-telegram-success" />
                </div>
                <div>
                  <h2 className="font-medium text-telegram-text text-sm">My Downloads</h2>
                  <p className="text-[10px] text-telegram-text-muted">Saved media files</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <div className="w-8 h-8 rounded-lg bg-telegram-accent/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-telegram-accent" />
                </div>
                <div className="hidden sm:block">
                  <h2 className="font-medium text-telegram-text text-sm">Welcome</h2>
                  <p className="text-[10px] text-telegram-text-muted">Select a chat to start</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4">
            {/* PRO Badge */}
            {appUser?.role === 'PRO' && (
              <span className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                <Zap className="w-3 h-3 fill-white" />
                PRO
              </span>
            )}

            {/* GET PRO Button - Only for USER role */}
            {appUser?.role === 'USER' && (
              <button
                onClick={() => setShowProRequestModal(true)}
                disabled={myProRequest?.status === 'pending'}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  myProRequest?.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-orange-500/25'
                }`}
                title={myProRequest?.status === 'pending' ? 'Request pending' : 'Upgrade to PRO'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{myProRequest?.status === 'pending' ? 'Pending' : 'GET PRO'}</span>
              </button>
            )}

            {/* Notification Button - For USER and PRO roles */}
            {(appUser?.role === 'USER' || appUser?.role === 'PRO') && (
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                  className={`btn-icon relative ${showNotifications ? 'bg-telegram-accent text-white' : ''}`}
                  title="Notifications"
                >
                  <Bell className={`w-5 h-5 ${showNotifications ? 'fill-white' : ''}`} />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                </button>
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                      onClick={() => setShowNotifications(false)}
                    />
                    {/* Mobile: Top-anchored with safe area (no upper overflow), Desktop: Dropdown below button */}
                    <div
                      className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 md:w-[340px] z-50 bg-telegram-sidebar border border-telegram-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in md:animate-slide-up top-[max(0.75rem,env(safe-area-inset-top))] max-h-[calc(100dvh-1.5rem)] md:top-12 md:max-h-[480px]"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-telegram-border bg-gradient-to-r from-telegram-header to-telegram-sidebar flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-telegram-accent/20 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-telegram-accent" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-telegram-text">Notifications</h3>
                            <p className="text-[10px] text-telegram-text-muted">
                              {notifications.length === 0 ? 'No notifications' : `${notifications.length} total`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadNotificationCount > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="flex items-center gap-1 text-xs text-telegram-accent hover:text-telegram-accent-hover bg-telegram-accent/10 hover:bg-telegram-accent/20 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span className="hidden sm:inline">Mark all read</span>
                            </button>
                          )}
                          {/* Close button - more visible on mobile */}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="p-1.5 rounded-lg hover:bg-telegram-bg-secondary transition-colors text-telegram-text-muted hover:text-telegram-text"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Notifications List - scrollable, flex-1 so it doesn't overflow */}
                      <div className="overflow-y-auto flex-1 min-h-0 overscroll-contain">
                        {notifications.length === 0 ? (
                          <div className="py-12 px-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-telegram-bg-secondary flex items-center justify-center mx-auto mb-4">
                              <Bell className="w-8 h-8 text-telegram-text-muted opacity-40" />
                            </div>
                            <h4 className="text-sm font-medium text-telegram-text mb-1">No notifications yet</h4>
                            <p className="text-xs text-telegram-text-muted max-w-[200px] mx-auto">
                              When you receive updates about your PRO requests, they'll appear here
                            </p>
                          </div>
                        ) : (
                          <div className="py-2">
                            {notifications.map((notification) => {
                              // Format time ago
                              const now = new Date();
                              const created = new Date(notification.createdAt);
                              const diffMs = now.getTime() - created.getTime();
                              const diffMins = Math.floor(diffMs / 60000);
                              const diffHours = Math.floor(diffMins / 60);
                              const diffDays = Math.floor(diffHours / 24);
                              let timeAgo = '';
                              if (diffMins < 1) timeAgo = 'Just now';
                              else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
                              else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
                              else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
                              else timeAgo = created.toLocaleDateString();

                              return (
                                <div
                                  key={notification._id}
                                  onClick={() => !notification.read && markNotificationAsRead(notification._id)}
                                  className={`mx-2 mb-2 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                    !notification.read 
                                      ? 'bg-telegram-accent/10 hover:bg-telegram-accent/15 border border-telegram-accent/20' 
                                      : 'hover:bg-telegram-bg-secondary/50 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                      notification.type === 'pro_accepted' 
                                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400' 
                                        : notification.type === 'pro_cancelled'
                                          ? 'bg-gradient-to-br from-red-500/20 to-rose-500/20 text-red-400'
                                          : 'bg-gradient-to-br from-telegram-accent/20 to-blue-500/20 text-telegram-accent'
                                    }`}>
                                      {notification.type === 'pro_accepted' ? (
                                        <CheckCircle className="w-5 h-5" />
                                      ) : notification.type === 'pro_cancelled' ? (
                                        <XCircle className="w-5 h-5" />
                                      ) : (
                                        <Bell className="w-5 h-5" />
                                      )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-medium ${!notification.read ? 'text-telegram-text' : 'text-telegram-text-secondary'}`}>
                                          {notification.title}
                                        </p>
                                        {!notification.read && (
                                          <span className="w-2 h-2 bg-telegram-accent rounded-full flex-shrink-0 mt-1.5" />
                                        )}
                                      </div>
                                      <p className={`text-xs mt-1 leading-relaxed ${!notification.read ? 'text-telegram-text-secondary' : 'text-telegram-text-muted'}`}>
                                        {notification.message}
                                      </p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Clock className="w-3 h-3 text-telegram-text-muted" />
                                        <span className="text-[10px] text-telegram-text-muted">{timeAgo}</span>
                                        {notification.type === 'pro_accepted' && (
                                          <span className="ml-auto flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                            <Zap className="w-2.5 h-2.5" />
                                            Upgraded!
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-telegram-border bg-telegram-bg-secondary/30 flex-shrink-0">
                          <p className="text-[10px] text-telegram-text-muted text-center">
                            {unreadNotificationCount > 0 
                              ? `${unreadNotificationCount} unread notification${unreadNotificationCount > 1 ? 's' : ''}`
                              : 'All caught up!'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* User Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-telegram-accent-muted/50 transition-colors"
              >
                <div className="avatar avatar-sm from-telegram-accent to-blue-600 relative">
                  <span className="text-xs font-semibold">{appUser?.username?.charAt(0).toUpperCase()}</span>
                  {appUser?.role === 'PRO' && (
                    <span className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-0.5 sm:hidden">
                      <Zap className="w-2 h-2 text-white fill-white" />
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-telegram-text leading-tight">{appUser?.username}</p>
                  <p className="text-[10px] text-telegram-text-muted leading-tight">{appUser?.role}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-telegram-text-muted -rotate-90 hidden md:block" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="dropdown-menu right-0 top-12 min-w-[220px]">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-telegram-border">
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-lg from-telegram-accent to-blue-600">
                          <span className="font-semibold">{appUser?.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-telegram-text">{appUser?.username}</span>
                            {appUser?.role === 'PRO' && (
                              <span className="flex items-center gap-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                <Zap className="w-2.5 h-2.5 fill-white" />
                                PRO
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-telegram-text-muted block truncate">{appUser?.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {appUser?.role === 'USER' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowProRequestModal(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-telegram-text hover:bg-telegram-accent-muted/50 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          <span>Upgrade to PRO</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openDownloadsPage();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-telegram-text hover:bg-telegram-accent-muted/50 transition-colors"
                      >
                        <FolderDown className="w-4 h-4 text-telegram-text-muted" />
                        <span>My Downloads</span>
                      </button>
                      <a
                        href={`https://t.me/${(import.meta.env.VITE_TELEGRAM_HELP_BOT_USERNAME || 'TGM_Save_bot').replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-telegram-text hover:bg-telegram-accent-muted/50 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-telegram-text-muted" />
                        <span>Help Center</span>
                      </a>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-telegram-border pt-2 pb-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleAppLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages / Downloads Content - min-h-0 so flex child can shrink and scroll */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto p-4 space-y-4 bg-telegram-bg-secondary/50">
          {showDownloadsPage ? (
            loadingDownloads ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" className="text-telegram-accent" />
              </div>
            ) : downloadsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-telegram-text-secondary">
                <FolderDown className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No Downloads Yet</h3>
                <p className="text-center max-w-md">
                  Downloaded media will appear here. Select a chat and download photos or videos to see them.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {downloadsData.map((folder) => (
                  <div key={folder.name} className="bg-telegram-message rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-telegram-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-telegram-accent flex items-center justify-center">
                          <FolderDown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{folder.name}</h3>
                          <p className="text-xs text-telegram-text-secondary">
                            {folder.children?.filter((c: any) => c.type === 'file').length || 0} files
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const folderName = folder.name;
                          showConfirmation({
                            title: 'Delete Folder',
                            message: `Are you sure you want to delete all downloads from "${folderName}"? This action cannot be undone.`,
                            confirmText: 'Delete All',
                            type: 'danger',
                            onConfirm: async () => {
                              closeConfirmation();
                              try {
                                const res = await fetch(`/downloads/${encodeURIComponent(folderName)}`, { method: 'DELETE' });
                                const data = await res.json();
                                if (data.success) {
                                  fetchDownloadsData();
                                  toast.success('Folder deleted successfully');
                                } else {
                                  toast.error('Error: ' + data.message);
                                }
                              } catch (err) {
                                toast.error('Failed to delete');
                              }
                            },
                          });
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete folder"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {folder.children?.filter((item: any) => item.type === 'file').map((file: any) => {
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
                        const isVideo = ['mp4', 'webm', 'mov'].includes(ext || '');
                        const formatSize = (bytes: number) => {
                          if (bytes < 1024) return bytes + ' B';
                          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                          return (bytes / 1024 / 1024).toFixed(1) + ' MB';
                        };
                        const deleteFile = (e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const fileName = file.name;
                          const filePath = file.path;
                          showConfirmation({
                            title: 'Delete File',
                            message: `Are you sure you want to delete "${fileName}"?`,
                            confirmText: 'Delete',
                            type: 'danger',
                            onConfirm: async () => {
                              closeConfirmation();
                              try {
                                const res = await fetch('/api/downloads-file', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ filePath }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  fetchDownloadsData();
                                  toast.success('File deleted');
                                } else {
                                  toast.error('Error: ' + data.message);
                                }
                              } catch (err) {
                                toast.error('Failed to delete file');
                              }
                            },
                          });
                        };
                        return (
                          <div
                            key={file.name}
                            className="bg-telegram-sidebar rounded-lg overflow-hidden hover:ring-2 hover:ring-telegram-accent transition-all relative group"
                          >
                            <a
                              href={file.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              {isImage ? (
                                <img src={file.path} alt={file.name} loading="lazy" className="w-full h-24 object-cover" />
                              ) : isVideo ? (
                                <div className="relative w-full h-24 bg-black flex items-center justify-center">
                                  <video src={file.path} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black/50 rounded-full p-2">
                                      <Play className="w-6 h-6 text-white fill-white" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-24 flex items-center justify-center bg-telegram-bg">
                                  <FileText className="w-8 h-8 text-telegram-text-secondary" />
                                </div>
                              )}
                              <div className="p-2">
                                <p className="text-xs truncate" title={file.name}>{file.name}</p>
                                <p className="text-xs text-telegram-text-secondary">{formatSize(file.size)}</p>
                              </div>
                            </a>
                            {/* Delete button */}
                            <button
                              onClick={deleteFile}
                              className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete file"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : selectedChat ? (
            <ChatView
              messages={messages}
              loading={loading}
              selectedChat={selectedChat}
              formatDate={formatDate}
              getMediaUrl={getMediaUrl}
              isDownloaded={isDownloaded}
              getDownloadedFile={getDownloadedFile}
              onDownloadMedia={handleDownloadMedia}
              canDownload={canDownload}
              downloadProgress={downloadProgress}
              onLoadMoreMessages={handleLoadMoreMessages}
              loadingMore={loadingMore}
              hasMoreMessages={hasMoreMessages}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-telegram-accent/20 rounded-full blur-3xl" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-telegram-accent to-purple-500 flex items-center justify-center relative shadow-2xl">
                  <MessageCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-telegram-text mb-3">Welcome to Media Saver</h3>
              <p className="text-center max-w-md text-telegram-text-secondary leading-relaxed mb-6">
                Select a chat from the sidebar to view messages and download media from private channels and groups.
              </p>
              <div className="flex items-center gap-4 text-sm text-telegram-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-telegram-success" />
                  <span>Connected</span>
                </div>
                <div className="w-px h-4 bg-telegram-border" />
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Ready to download</span>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* PRO Request Modal */}
      {showProRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-telegram-text">Request PRO</h3>
                  <p className="text-xs text-telegram-text-muted">Upgrade to unlock all features</p>
                </div>
              </div>
              <button
                onClick={() => { setShowProRequestModal(false); setPaymentConfirmed(false); }}
                className="btn-icon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-telegram-bg-secondary/50 rounded-xl p-4 border border-telegram-border">
                <h4 className="text-sm font-semibold text-telegram-text mb-3">PRO Benefits:</h4>
                <ul className="space-y-2 text-sm text-telegram-text-secondary">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Unlimited downloads
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    High quality photos & videos download
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Cloud backup storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Ad-free experience
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Faster download speeds
                  </li>
                </ul>
                <p className="text-sm font-semibold text-telegram-text mt-3 pt-3 border-t border-telegram-border">
                  Price: <span className="text-telegram-accent">USDT 10</span>
                </p>
                <a
                  href="https://t.me/TGM_Save_bot?start=pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Get PRO
                </a>
              </div>

              <label className="flex items-start gap-3 p-4 bg-telegram-bg-secondary/50 rounded-xl border border-telegram-border cursor-pointer hover:border-telegram-accent transition-colors">
                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-telegram-border text-telegram-accent focus:ring-telegram-accent focus:ring-offset-0 bg-telegram-bg-secondary"
                />
                <div>
                  <span className="text-sm font-medium text-telegram-text">I Paid for PRO Version</span>
                  <p className="text-xs text-telegram-text-muted mt-1">
                    Please confirm that you have completed the payment for PRO upgrade
                  </p>
                </div>
              </label>

              <button
                onClick={submitProRequest}
                disabled={proRequestLoading || !paymentConfirmed}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  paymentConfirmed
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg'
                    : 'bg-telegram-bg-secondary text-telegram-text-muted cursor-not-allowed'
                }`}
              >
                {proRequestLoading ? (
                  <LoadingSpinner size="md" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                confirmModal.type === 'danger' ? 'bg-red-500/20' : 
                confirmModal.type === 'warning' ? 'bg-yellow-500/20' : 'bg-telegram-accent/20'
              }`}>
                <AlertCircle className={`w-6 h-6 ${
                  confirmModal.type === 'danger' ? 'text-red-500' : 
                  confirmModal.type === 'warning' ? 'text-yellow-500' : 'text-telegram-accent'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-telegram-text">{confirmModal.title}</h3>
              </div>
            </div>
            <p className="text-telegram-text-secondary mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={closeConfirmation}
                className="btn-secondary flex-1"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  confirmModal.type === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'btn-primary'
                }`}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#182533',
            color: '#f5f5f5',
            border: '1px solid #2b3a4a',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#5288c1',
              secondary: '#182533',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#182533',
            },
            duration: 5000,
          },
          loading: {
            icon: <LoadingSpinner size="sm" className="text-[#5288c1]" />,
            iconTheme: {
              primary: '#5288c1',
              secondary: '#182533',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
