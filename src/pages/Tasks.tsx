import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Users } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import { usePermissions } from '../hooks/usePermissions';
import TaskList from '../components/tasks/TaskList';
import AddTaskModal from '../components/tasks/AddTaskModal';
import TaskDetailsModal from '../components/tasks/TaskDetailsModal';
import type { Task, TaskStatus, TaskPriority } from '../types';
import Toast from '../components/ui/Toast';

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [viewAllTasks, setViewAllTasks] = useState(false);

  const { tasks = [], loading, addTask, updateTask, deleteTask, initialize: initTasks } = useTaskStore();
  const { users = [], initialize: initUsers } = useUserStore();
  const { orders = [], initialize: initOrders } = useOrderStore();
  const { user } = useAuthStore();
  const { canViewUsers } = usePermissions();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          initTasks(),
          initUsers(),
          initOrders()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, [initTasks, initUsers, initOrders]);

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addTask(taskData);
      setToastMessage('Task created successfully');
      setToastType('success');
      setShowAddModal(false);
      setShowToast(true);
    } catch (error: any) {
      // Don't close modal or show toast on validation error
      // The modal will handle displaying the error
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Partial<Task>) => {
    try {
      await updateTask(taskId, taskData);
      setToastMessage('Task updated successfully');
      setToastType('success');
      setSelectedTask(null);
    } catch (error) {
      setToastMessage('Failed to update task');
      setToastType('error');
    }
    setShowToast(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setToastMessage('Task deleted successfully');
      setToastType('success');
      setSelectedTask(null);
    } catch (error) {
      setToastMessage('Failed to delete task');
      setToastType('error');
    }
    setShowToast(true);
  };

  // Filter and sort tasks based on search, filters, and user permissions
  const filteredTasks = tasks
    .filter(task => {
      if (!task || !user) return false;

      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      const matchesAssignee = selectedAssignee === 'all' || task.assignedTo === selectedAssignee;
      
      // Show all tasks for admins when viewing all tasks, otherwise show only assigned tasks
      const isVisible = viewAllTasks ? true : task.assignedTo === user.id;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && isVisible;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        // Handle cases where dueDate might be undefined
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return sortOrder === 'asc' ? 1 : -1;
        if (!b.dueDate) return sortOrder === 'asc' ? -1 : 1;
        
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return sortOrder === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });

  // Group tasks by status
  const groupedTasks = {
    urgent: filteredTasks.filter(t => t.priority === 'urgent'),
    pending: filteredTasks.filter(t => t.status === 'pending'),
    inProgress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white hidden sm:block">
            {viewAllTasks ? 'All Tasks' : 'My Tasks'}
          </h1>
          {canViewUsers && (
            <button
              onClick={() => setViewAllTasks(!viewAllTasks)}
              className="inline-flex items-center px-2 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
              title={viewAllTasks ? 'View My Tasks' : 'View All Tasks'}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline sm:ml-2">
                {viewAllTasks ? 'View My Tasks' : 'View All Tasks'}
              </span>
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center rounded-md bg-primary-600 px-2 sm:px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
          title="Add Task"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline sm:ml-2">Add Task</span>
        </button>
      </div>

      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input pl-10 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 w-full"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2 sm:space-x-4">
          <div className="relative">
            <Filter className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | 'all')}
              className="modern-select pl-8 pr-2 sm:pl-12 sm:pr-4 py-2 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
              className="modern-select pl-8 pr-2 sm:pl-12 sm:pr-4 py-2 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full min-w-[120px]"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="relative col-span-2 sm:col-span-1">
            <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as ['dueDate' | 'createdAt', 'asc' | 'desc'];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="modern-select pl-8 pr-2 sm:pl-12 sm:pr-4 py-2 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full min-w-[160px]"
            >
              <option value="dueDate-asc">Due Date (Earliest First)</option>
              <option value="dueDate-desc">Due Date (Latest First)</option>
              <option value="createdAt-desc">Created (Newest First)</option>
              <option value="createdAt-asc">Created (Oldest First)</option>
            </select>
          </div>

          {viewAllTasks && (
            <div className="relative col-span-2 sm:col-span-1">
              <Users className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="modern-select pl-8 pr-2 sm:pl-12 sm:pr-4 py-2 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full min-w-[120px]"
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Urgent Tasks */}
        {groupedTasks.urgent.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
              Urgent Tasks ({groupedTasks.urgent.length})
            </h2>
            <TaskList
              tasks={groupedTasks.urgent}
              onTaskClick={setSelectedTask}
              users={users}
              orders={orders}
            />
          </div>
        )}

        {/* Pending Tasks */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Pending Tasks ({groupedTasks.pending.length})
          </h2>
          <TaskList
            tasks={groupedTasks.pending}
            onTaskClick={setSelectedTask}
            users={users}
            orders={orders}
          />
        </div>

        {/* In Progress Tasks */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            In Progress ({groupedTasks.inProgress.length})
          </h2>
          <TaskList
            tasks={groupedTasks.inProgress}
            onTaskClick={setSelectedTask}
            users={users}
            orders={orders}
          />
        </div>

        {/* Completed Tasks */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Completed ({groupedTasks.completed.length})
          </h2>
          <TaskList
            tasks={groupedTasks.completed}
            onTaskClick={setSelectedTask}
            users={users}
            orders={orders}
          />
        </div>
      </div>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
        users={users}
        currentUserId={user?.id}
      />

      {selectedTask && (
        <TaskDetailsModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          users={users}
          currentUserId={user?.id}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}