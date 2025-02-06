import React, { useState, useEffect } from 'react';
import { Bell, LogOut, Menu, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useThemeStore } from '../store/themeStore';
import NotificationPanel from './NotificationPanel';
import ThemeToggle from './ThemeToggle';
import OmniSearch from './OmniSearch';
import Logo from './Logo';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, userName, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const { isDarkMode } = useThemeStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Logo width={140} className="hidden md:block ml-4" />
            <Link
              to="/"
              className="ml-4 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Public Site
            </Link>
          </div>

          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1/3 min-w-[400px]">
            <OmniSearch />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              className="md:hidden p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-6 w-6" />
            </button>

            <div className="notifications-container relative">
              <button
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>
            <ThemeToggle />
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {userName ? getInitials(userName) : '?'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</span>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="p-4 md:hidden border-t border-gray-200 dark:border-gray-700">
          <OmniSearch />
        </div>
      )}
    </header>
  );
}