import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Bell, Crown, Shield, ChevronDown } from 'lucide-react';
import { useAuth, useApp } from '../../contexts';
import { useNotifications } from '../../hooks';
import { RoleBadge } from '../common';

export function Header() {
  const { user, logout } = useAuth();
  const { toggleSidebar, setShowAdminPanel, setShowNotifications, showNotifications } = useApp();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click / escape (mobile-friendly)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(target)) setShowNotifications(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (!user) return null;

  return (
    <header className="h-14 md:h-16 bg-telegram-header border-b border-telegram-border flex items-center justify-between px-3 md:px-4 safe-area-top">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="btn-icon flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-telegram-text-secondary" />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-telegram-text truncate">Save TG</h1>
      </div>

      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon relative"
            aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
            aria-expanded={showNotifications}
          >
            <Bell className="w-5 h-5 text-telegram-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-telegram-error rounded-full text-[10px] font-medium text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-menu right-0 left-auto mt-2 w-[min(100vw-2rem,320px)] max-h-[min(70vh,calc(100dvh-5rem))] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-telegram-border flex-shrink-0 bg-telegram-sidebar/95 backdrop-blur-xl">
                <h3 className="font-semibold text-telegram-text">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs text-telegram-accent hover:underline min-h-[44px] min-w-[44px] flex items-center justify-center -m-2"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 min-h-0 overscroll-contain">
                {notifications.length === 0 ? (
                  <p className="text-telegram-text-muted text-sm text-center py-6">No notifications</p>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <button
                      type="button"
                      key={notif._id}
                      onClick={() => !notif.read && markAsRead(notif._id)}
                      className={`dropdown-item w-full text-left rounded-lg border-b border-telegram-border/50 last:border-0 ${
                        !notif.read ? 'bg-telegram-accent-muted' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-telegram-text">{notif.title}</p>
                      <p className="text-xs text-telegram-text-muted mt-0.5">{notif.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 min-h-[44px] min-w-[44px] md:min-w-0 rounded-xl hover:bg-telegram-sidebar-hover transition-colors"
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            <div className="avatar avatar-sm flex-shrink-0">
              <span>{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-telegram-text text-sm hidden sm:block truncate max-w-[120px]">{user.username}</span>
            <RoleBadge role={user.role} />
            <ChevronDown className="w-4 h-4 text-telegram-text-muted flex-shrink-0" />
          </button>

          {showUserMenu && (
            <div className="dropdown-menu right-0 left-auto mt-2 w-[min(100vw-2rem,240px)]">
              <div className="px-4 py-3 border-b border-telegram-border">
                <p className="font-medium text-telegram-text truncate">{user.username}</p>
                <p className="text-telegram-text-muted text-sm truncate">{user.email}</p>
              </div>

              {user.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPanel(true);
                    setShowUserMenu(false);
                  }}
                  className="dropdown-item w-full text-left"
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  Admin Panel
                </button>
              )}

              {user.role === 'USER' && (
                <button type="button" onClick={() => setShowUserMenu(false)} className="dropdown-item w-full text-left">
                  <Crown className="w-4 h-4 flex-shrink-0 text-telegram-warning" />
                  Request PRO
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="dropdown-item dropdown-item-danger w-full text-left"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
