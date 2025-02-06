import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  ClipboardList,
  Home,
  Activity,
  UserPlus,
  BarChart3,
  LogOut,
  X,
  Truck,
  CreditCard,
  HelpCircle,
  MessageSquare,
  CheckSquare,
  DollarSign,
  UserCog,
  FileText,
  ExternalLink,
  UserSquare,
  Building2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePermissions } from '../hooks/usePermissions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const { canManagePayments } = usePermissions();
  const isAdmin = user?.role === 'admin';

  const navigation = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'My Tasks', icon: CheckSquare, href: '/admin/tasks' }
      ]
    },
    { 
      group: 'Sales',
      items: [
        { name: 'Leads', icon: UserPlus, href: '/admin/leads' }
      ]
    },
    {
      group: 'Property Management',
      items: [
        { name: 'Properties', icon: Building2, href: '/admin/properties' },
        { name: 'Tenants', icon: UserSquare, href: '/admin/tenants' },
        { name: 'Owners', icon: Users, href: '/admin/owners' },
        { name: 'Buyers', icon: UserPlus, href: '/admin/buyers' }
      ]
    },
    {
      group: 'Finance',
      items: [
        { name: 'Rentals', icon: Home, href: '/admin/rentals' },
        { name: 'Payments', icon: CreditCard, href: '/admin/payments', show: canManagePayments }
      ]
    },
    {
      group: 'Content Management',
      items: [
        { name: 'Blog Manager', icon: FileText, href: '/admin/blog' }
      ]
    },
    {
      group: 'Documents & Communication',
      items: [
        {
          name: 'Signed Forms',
          icon: FileText,
          href: 'https://www.jotform.com/tables/240603373079556',
          external: true
        },
        { name: 'Chat', icon: MessageSquare, href: '/admin/chat' }
      ]
    },
    {
      group: 'Administration',
      show: isAdmin,
      items: [
        { name: 'Activities', icon: Activity, href: '/admin/activities' },
        { name: 'Users', icon: UserPlus, href: '/admin/users' },
        { name: 'Reports', icon: BarChart3, href: '/admin/reports' }
      ]
    },
    {
      group: 'Support',
      items: [
        { name: 'Help', icon: HelpCircle, href: '/admin/help' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:sticky top-0 md:top-16 md:translate-x-0 z-30 h-[calc(100vh-4rem)] w-64 transition-transform duration-200 ease-in-out overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-end p-4 md:hidden">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4">
            {navigation
              .filter(group => !group.show || group.show === true)
              .map((group, groupIndex) => (
                <div key={group.group} className="mb-6">
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {group.group}
                  </h3>
                  <div className="space-y-1">
                    {group.items
                      .filter(item => item.show !== false)
                      .map(item => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={({ isActive }) => `
                            group flex items-center px-3 py-2 text-sm font-medium rounded-md
                            ${isActive && !item.external
                              ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }
                          `}
                          {...(item.external
                            ? {
                                target: '_blank',
                                rel: 'noopener noreferrer',
                                onClick: (e: React.MouseEvent) => {
                                  e.preventDefault();
                                  window.open(item.href, '_blank');
                                }
                              }
                            : {})}
                        >
                          <item.icon
                            className={`
                              mr-3 h-5 w-5 flex-shrink-0
                              ${item.external ? 'inline-flex items-center' : ''}
                              group-hover:text-gray-500 dark:group-hover:text-gray-400
                            `}
                          />
                          <span>{item.name}</span>
                          {item.external && (
                            <ExternalLink className="ml-2 h-4 w-4 opacity-75" />
                          )}
                        </NavLink>
                      ))}
                  </div>
                </div>
              ))}
          </nav>
        </div>
      </div>
    </>
  );
}