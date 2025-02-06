import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo width={140} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 ml-auto">
            <Link 
              to="/browse-properties"
              className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              Our Properties
            </Link>
            <Link 
              to="/blog"
              className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              Blog
            </Link>
            <Link 
              to="/about"
              className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Contact Us
            </Link>
            <div className="ml-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ThemeToggle />
            </div>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle for Mobile */}
            <div className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ThemeToggle />
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => {
                // TODO: Implement mobile menu
                console.log('Mobile menu clicked');
              }}
            >
              <svg 
                className="w-6 h-6 text-gray-600 dark:text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
