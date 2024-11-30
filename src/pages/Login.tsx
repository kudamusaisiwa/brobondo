import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Moon, Sun } from 'lucide-react';
import Toast from '../components/ui/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { login, loading, error, isAuthenticated } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error: any) {
      setToastMessage(error.message);
      setShowToast(true);
    }
  };

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${
      isDarkMode 
        ? 'bg-gradient-to-br from-primary-900 via-gray-900 to-black'
        : 'bg-gradient-to-br from-primary-50 via-primary-100/50 to-white'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5 text-white" />
        ) : (
          <Moon className="h-5 w-5 text-primary-600" />
        )}
      </button>

      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <img
            className="mx-auto h-16 w-auto"
            src={isDarkMode 
              ? "https://res.cloudinary.com/fresh-ideas/image/upload/v1732284592/w95dfo6gv7dckea8htsj.png"
              : "https://res.cloudinary.com/fresh-ideas/image/upload/v1732284592/rqo2kuav7gd3ntuciejw.png"
            }
            alt="MG Accountants"
          />
          <h2 className={`mt-6 text-3xl font-bold tracking-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome Back
          </h2>
          <p className={`mt-2 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Sign in to your account to continue
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white/10 backdrop-blur-md dark:bg-gray-900/50 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-white/20">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="modern-input mt-1 bg-white/5 border-white/10"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="modern-input mt-1 bg-white/5 border-white/10"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-400 hover:text-primary-300"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="rounded-md bg-red-50/10 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-400">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex justify-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}