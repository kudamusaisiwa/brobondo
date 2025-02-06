import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { useActivityStore } from './activityStore';
import { useAuthStore } from './authStore';
import type { Task, TaskStatus, TaskPriority } from '../types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<(() => void) | undefined>;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByUser: (userId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
}

export const useTaskStore = create<TaskState>(
  createProtectedStore((set, get) => ({
    tasks: [],
    loading: false,
    error: null,

    initialize: async () => {
      set({ loading: true });
      
      try {
        const { user } = useAuthStore.getState();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Query all tasks and filter on client side based on permissions
        const q = query(
          collection(db, 'tasks'),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            let tasks = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
              dueDate: doc.data().dueDate?.toDate() || undefined,
              completedAt: doc.data().completedAt?.toDate() || undefined
            })) as Task[];

            // Filter tasks on client side based on user role
            if (user.role !== 'admin') {
              tasks = tasks.filter(task => 
                task.assignedTo === user.uid || 
                task.assignedTo === user.email || 
                task.assignedBy === user.uid
              );
            }

            set({ tasks, loading: false, error: null });
          },
          (error) => {
            console.error('Error fetching tasks:', error);
            set({ error: error.message, loading: false });
          }
        );

        return unsubscribe;
      } catch (error: any) {
        console.error('Error initializing tasks:', error);
        set({ error: error.message, loading: false });
        return undefined;
      }
    },

    addTask: async (taskData) => {
      try {
        set({ loading: true });
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();

        if (!user) {
          throw new Error('User not authenticated');
        }

        // Prepare the task data for Firebase
        const firebaseTaskData = {
          ...taskData,
          assignedBy: user.id,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          // Ensure these fields are never undefined
          description: taskData.description || null,
          assignedTo: taskData.assignedTo || null,
          orderId: taskData.orderId || null,
          dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null
        };

        const docRef = await addDoc(collection(db, 'tasks'), firebaseTaskData);

        // Log activity
        await logActivity({
          type: 'task_created',
          message: `New task created: ${taskData.title}`,
          userId: user.id,
          userName: user.name,
          entityId: docRef.id,
          entityType: 'task',
          metadata: {
            title: taskData.title,
            priority: taskData.priority,
            status: taskData.status,
            assignedTo: taskData.assignedTo
          }
        });

        set({ loading: false, error: null });
        return docRef.id;
      } catch (error: any) {
        console.error('Error adding task:', error);
        set({ 
          error: error.message, 
          loading: false 
        });
        throw error;
      }
    },

    updateTask: async (id, taskData) => {
      try {
        set({ loading: true });
        const taskRef = doc(db, 'tasks', id);
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();
        const currentTask = get().tasks.find(t => t.id === id);

        if (!user) {
          throw new Error('User not authenticated');
        }

        if (!currentTask) {
          throw new Error('Task not found');
        }

        // Add completedAt if status is being changed to completed
        if (taskData.status === 'completed' && currentTask.status !== 'completed') {
          taskData.completedAt = new Date();
        }

        await updateDoc(taskRef, {
          ...taskData,
          updatedAt: Timestamp.now(),
          ...(taskData.dueDate && { dueDate: Timestamp.fromDate(taskData.dueDate) }),
          ...(taskData.completedAt && { completedAt: Timestamp.fromDate(taskData.completedAt) })
        });

        // Log activity
        await logActivity({
          type: 'task_updated',
          message: `Task updated: ${currentTask.title}`,
          userId: user.id,
          userName: user.name,
          entityId: id,
          entityType: 'task',
          metadata: {
            previousStatus: currentTask.status,
            newStatus: taskData.status,
            title: currentTask.title,
            changes: Object.keys(taskData)
          }
        });

        set({ loading: false, error: null });
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    deleteTask: async (id) => {
      try {
        set({ loading: true });
        const { user } = useAuthStore.getState();
        const { logActivity } = useActivityStore.getState();
        const task = get().tasks.find(t => t.id === id);

        if (!user) {
          throw new Error('User not authenticated');
        }

        if (!task) {
          throw new Error('Task not found');
        }

        await deleteDoc(doc(db, 'tasks', id));

        // Log activity
        await logActivity({
          type: 'task_deleted',
          message: `Task deleted: ${task.title}`,
          userId: user.id,
          userName: user.name,
          entityId: id,
          entityType: 'task',
          metadata: {
            title: task.title,
            status: task.status,
            priority: task.priority
          }
        });

        set({ loading: false, error: null });
      } catch (error: any) {
        set({ error: error.message, loading: false });
        throw error;
      }
    },

    getTaskById: (id) => {
      return get().tasks.find(task => task.id === id);
    },

    getTasksByUser: (userId) => {
      return get().tasks.filter(task => task.assignedTo === userId);
    },

    getTasksByStatus: (status) => {
      return get().tasks.filter(task => task.status === status);
    },

    getTasksByPriority: (priority) => {
      return get().tasks.filter(task => task.priority === priority);
    }
  }))
);