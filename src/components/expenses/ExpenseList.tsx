import React, { useState } from 'react';
import { Calendar, DollarSign, CreditCard, FileText, Edit2, Trash2, AlertTriangle, X } from 'lucide-react';
import type { Expense } from '../../types';

interface ExpenseListProps {
  expenses: Expense[];
  onEditClick: (expense: Expense) => void;
  onDeleteClick: (id: string) => Promise<void>;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expenseDescription: string;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, expenseDescription }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Delete Expense
            </h2>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Are you sure you want to delete the expense "{expenseDescription}"? This action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseList({ expenses, onEditClick, onDeleteClick }: ExpenseListProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedExpense) {
      await onDeleteClick(selectedExpense.id);
      setDeleteModalOpen(false);
      setSelectedExpense(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'office_supplies':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'utilities':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'rent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'salaries':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300';
      case 'marketing':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300';
      case 'travel':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'software':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300';
      case 'hardware':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300';
      case 'consulting':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'legal':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'banking':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
      case 'food':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'director_withdrawal':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300';
      case 'transport':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300';
      case 'salary_advance':
        return 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/50 dark:text-fuchsia-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No expenses found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {expense.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditClick(expense)}
                      className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      title="Edit expense"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(expense)}
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      title="Delete expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    {expense.amount.toFixed(2)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CreditCard className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category.replace('_', ' ')}
                    </span>
                  </div>
                  {expense.reference && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FileText className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      {expense.reference}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedExpense(null);
        }}
        onConfirm={handleConfirmDelete}
        expenseDescription={selectedExpense?.description || ''}
      />
    </div>
  );
}