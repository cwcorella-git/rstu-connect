'use client'

import React, { useState } from 'react'

// Tooltip component with tap-to-toggle support for touch devices
export function Tooltip({ text, children }: { text?: string; children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipText = text || 'Code definition not available';

  return (
    <button
      type="button"
      onClick={() => setIsVisible(!isVisible)}
      onBlur={() => setIsVisible(false)}
      className="relative cursor-help border-b-2 border-dotted border-gray-400 hover:border-rstu-red focus:outline-none focus:border-rstu-red inline text-left"
      aria-label={`Show definition: ${tooltipText}`}
    >
      {children}
      <span
        className={`absolute bg-gray-900 text-white text-xs px-2 py-1 rounded
                    whitespace-nowrap bottom-full left-0 mb-1 z-50 shadow-lg
                    transition-opacity ${isVisible ? 'visible opacity-100' : 'invisible opacity-0 sm:group-hover:visible sm:group-hover:opacity-100'}`}
      >
        {tooltipText}
        <span className="absolute top-full left-2 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </button>
  );
}

// Section header component
export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
      <div className="flex-1 h-px bg-gray-200"></div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
        {title}
      </h4>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>
  );
}

// Data row component with index for alternating colors
export function DataRow({ label, value, className = '', index = 0 }: { label: string; value: React.ReactNode; className?: string; index?: number }) {
  if (!value && value !== 0) return null;
  const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  return (
    <div className={`flex justify-between py-2.5 px-3 ${bgColor}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm text-gray-900 font-medium text-right max-w-[60%] ${className}`}>{value}</span>
    </div>
  );
}

// Section container with border
export function DataSection({ children }: { children: React.ReactNode }) {
  // Filter out null children and add index for alternating colors
  const validChildren = React.Children.toArray(children).filter(Boolean);
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden mb-4 divide-y divide-gray-200">
      {React.Children.map(validChildren, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ index?: number }>, { index });
        }
        return child;
      })}
    </div>
  );
}
