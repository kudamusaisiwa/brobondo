import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, ImageOff, Download, Upload, Trash } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import AddProductModal from '../components/modals/AddProductModal'; 
import Pagination from '../components/ui/Pagination';
import Toast from '../components/ui/Toast';

export default function Products() {
  const { products, loading, error, initialize } = useProductStore();
  const [showAddModal, setShowAddModal] = useState(false); 
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const initializeProducts = async () => {
      try {
        const cleanup = await initialize();
        return () => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        };
      } catch (error) {
        console.error('Error initializing products:', error);
        return undefined;
      }
    };

    const cleanupPromise = initializeProducts();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [initialize]);

  // Calculate pagination
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = itemsPerPage === -1 
    ? products 
    : products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error loading: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white hidden sm:block">Products</h1>
        <div className="flex space-x-2 sm:space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center"
            title="Add Product"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Add Product</span>
          </button>
        </div>
      </div>

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

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