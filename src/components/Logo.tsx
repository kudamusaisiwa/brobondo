import React from 'react';
import { useThemeStore } from '../store/themeStore';

interface LogoProps {
  className?: string;
  width?: number;
}

export default function Logo({ className = '', width = 120 }: LogoProps) {
  const { isDarkMode } = useThemeStore();

  const logoUrl = isDarkMode
    ? 'https://res.cloudinary.com/fresh-ideas/image/upload/v1731768522/zwiwt7coga9a6dp5sigk.png'
    : 'https://res.cloudinary.com/fresh-ideas/image/upload/v1731768522/p4pd0uk0foxwz2gxgf4x.png';

  return (
    <img
      src={logoUrl}
      alt="Brobondo Logo"
      className={`h-auto ${className}`}
      style={{ width }}
    />
  );
}
