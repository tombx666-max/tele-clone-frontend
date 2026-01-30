import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ConfirmModalState, MediaPreviewState } from '../types';

interface AppContextType {
  // UI state
  sidebarOpen: boolean;
  showUserMenu: boolean;
  showAdminPanel: boolean;
  showDownloadsPage: boolean;
  showNotifications: boolean;

  // Modal states
  confirmModal: ConfirmModalState;
  mediaPreview: MediaPreviewState;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setShowUserMenu: (show: boolean) => void;
  setShowAdminPanel: (show: boolean) => void;
  setShowDownloadsPage: (show: boolean) => void;
  setShowNotifications: (show: boolean) => void;

  // Confirmation modal
  showConfirmation: (options: Omit<ConfirmModalState, 'isOpen'>) => void;
  closeConfirmation: () => void;

  // Media preview
  openMediaPreview: (url: string, type: 'photo' | 'video' | 'document', fileName: string) => void;
  closeMediaPreview: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showDownloadsPage, setShowDownloadsPage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [mediaPreview, setMediaPreview] = useState<MediaPreviewState>({
    isOpen: false,
    url: '',
    type: 'photo',
    fileName: '',
  });

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const showConfirmation = useCallback((options: Omit<ConfirmModalState, 'isOpen'>) => {
    setConfirmModal({
      isOpen: true,
      ...options,
    });
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const openMediaPreview = useCallback((url: string, type: 'photo' | 'video' | 'document', fileName: string) => {
    setMediaPreview({
      isOpen: true,
      url,
      type,
      fileName,
    });
  }, []);

  const closeMediaPreview = useCallback(() => {
    setMediaPreview(prev => ({ ...prev, isOpen: false }));
  }, []);

  const value: AppContextType = {
    sidebarOpen,
    showUserMenu,
    showAdminPanel,
    showDownloadsPage,
    showNotifications,
    confirmModal,
    mediaPreview,
    setSidebarOpen,
    toggleSidebar,
    setShowUserMenu,
    setShowAdminPanel,
    setShowDownloadsPage,
    setShowNotifications,
    showConfirmation,
    closeConfirmation,
    openMediaPreview,
    closeMediaPreview,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
