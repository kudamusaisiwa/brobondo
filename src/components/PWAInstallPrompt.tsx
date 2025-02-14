import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function PWAInstallPrompt() {
  const { isAuthenticated } = useAuthStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show prompt if user is authenticated
      setShowPrompt(isAuthenticated);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isAuthenticated]); // Add isAuthenticated to dependencies

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  if (!showPrompt || !isAuthenticated) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src="https://res.cloudinary.com/fresh-ideas/image/upload/v1732284590/l1f8x7pugcg71yswofrc.png"
              alt="MG Accountants"
              className="h-10 w-10 rounded-lg mr-3"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Install MG Accountants
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Install our app for a better experience
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                • Access the app directly from your home screen
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                • Work offline when you don't have internet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                • Get push notifications for important updates
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Maybe later
            </button>
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}