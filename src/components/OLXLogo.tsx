import React from 'react';

export function OLXLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="14" stroke="#00e676" strokeWidth="6" />
      <rect x="42" y="6" width="6" height="28" rx="3" fill="#6a1b9a" />
      <path d="M68 6 L86 34 M86 6 L68 34" stroke="#ff9800" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
