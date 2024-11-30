import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color = 'text-blue-500' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full border-4 border-t-4 border-gray-200 ${color} ${sizeClasses[size]}`}
        style={{
          borderTopColor: 'currentColor'
        }}
      />
    </div>
  );
};

export default Spinner;
