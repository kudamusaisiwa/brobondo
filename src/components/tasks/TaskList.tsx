import React from 'react';
import { Calendar, Clock, AlertCircle, User } from 'lucide-react';
import type { Task, User as UserType } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  users: UserType[];
  orders?: any[];
}

export default function TaskList({ tasks, onTaskClick, users, orders }: TaskListProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="text-gray-500 dark:text-gray-400">No tasks found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        if (!task) return null;
        const assignedUser = users?.find(u => u.id === task.assignedTo);
        const assignedByUser = users?.find(u => u.id === task.assignedBy);
        const relatedOrder = orders?.find(o => o?.id === task.orderId);

        return (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {task.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {task.dueDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Due: {task.dueDate.toLocaleDateString()}
                </div>
              )}
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </div>

              {assignedUser && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Assigned to: {assignedUser.name}
                </div>
              )}

              {task.orderId && (
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Order #{task.orderId}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}