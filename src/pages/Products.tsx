import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, ImageOff, Download, Upload, Trash } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import EditProductModal from '../components/modals/EditProductModal';
import DeleteProductModal from '../components/modals/DeleteProductModal';
import ImportProductsModal from '../components/modals/ImportProductsModal';
import BulkDeleteModal from '../components/modals/BulkDeleteModal';
import Pagination from '../components/ui/Pagination';
import Toast from '../components/ui/Toast';

export default function Products() {
  const { products, loading, error, deleteProduct, initialize } = useProductStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
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

  const handleImageError = (productId: string) => {
    setFailedImages(prev => new Set([...prev, productId]));
  };

  const handleEditSuccess = () => {
    setToastMessage('Product updated successfully');
    setToastType('success');
    setShowToast(true);
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleDelete = async () => {
    try {
      if (!selectedProduct) return;
      await deleteProduct(selectedProduct);
      setToastMessage('Product deleted successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to delete product');
      setToastType('error');
      setShowToast(true);
    }
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const handleBulkDelete = async () => {
    try {
      for (const productId of selectedProducts) {
        await deleteProduct(productId);
      }
      setToastMessage(`${selectedProducts.size} products deleted successfully`);
      setToastType('success');
      setSelectedProducts(new Set());
    } catch (error) {
      setToastMessage('Failed to delete selected products');
      setToastType('error');
    }
    setShowToast(true);
    setShowBulkDeleteModal(false);
  };

  const toggleProductSelection = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    }
  };

  // Calculate pagination
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = itemsPerPage === -1 
    ? products 
    : products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedProducts(new Set());
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedProducts(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error loading products: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white hidden sm:block">Products</h1>
        <div className="flex space-x-2 sm:space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            title="Import Products"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button
            onClick={() => {}} // Add export functionality
            className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            title="Export Products"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <Link
            to="/products/add"
            className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            title="Add Product"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Add Product</span>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      checked={selectedProducts.size === paginatedProducts.length}
                      onChange={toggleAllProducts}
                    />
                    {selectedProducts.size > 0 && (
                      <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        className="ml-4 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Min Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.imageUrl ? (
                        !failedImages.has(product.id) ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                            onError={() => handleImageError(product.id)}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full mr-3 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <ImageOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        )
                      ) : (
                        <div className="h-10 w-10 rounded-full mr-3 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.minQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${product.basePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedProduct(product.id);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={products.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {selectedProduct && (
        <>
          <EditProductModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProduct(null);
            }}
            onSuccess={handleEditSuccess}
            product={products.find(p => p.id === selectedProduct)!}
          />
          <DeleteProductModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedProduct(null);
            }}
            onConfirm={handleDelete}
            productName={products.find(p => p.id === selectedProduct)?.name || ''}
          />
        </>
      )}

      <ImportProductsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        count={selectedProducts.size}
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