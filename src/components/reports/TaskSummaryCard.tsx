import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useUserStore } from '../../store/userStore';
import { CheckCircle, Clock } from 'lucide-react';

interface TaskSummaryCardProps {
  timeRange: string;
  customStartDate?: Date | null;
  customEndDate?: Date | null;
}

export default function TaskSummaryCard({
  timeRange,
  customStartDate,
  customEndDate
}: TaskSummaryCardProps) {
  const { tasks = [] } = useTaskStore();
  const { users = [] } = useUserStore();

  // Calculate task statistics by user
  const taskStats = users.map(user => {
    const userTasks = tasks.filter(task => 
      task?.assignedTo === user.id &&
      (!customStartDate || !customEndDate || 
        (task.createdAt >= customStartDate && task.createdAt <= customEndDate))
    );

    return {
      userId: user.id,
      userName: user.name,
      pending: userTasks.filter(task => task.status === 'pending').length,
      inProgress: userTasks.filter(task => task.status === 'in_progress').length,
      completed: userTasks.filter(task => task.status === 'completed').length,
      total: userTasks.length,
      completionRate: userTasks.length > 0 
        ? (userTasks.filter(task => task.status === 'completed').length / userTasks.length) * 100 
        : 0
    };
  }).sort((a, b) => b.total - a.total); // Sort by total tasks

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Task Summary by User</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Pending
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                In Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Completed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Completion Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {taskStats.map((stat) => (
              <tr key={stat.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {stat.userName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {stat.pending}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {stat.inProgress}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {stat.completed}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${stat.completionRate}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {stat.completionRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}