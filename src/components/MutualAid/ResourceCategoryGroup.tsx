'use client'

import { memo } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { type ExternalOrganization, type ExternalResourceCategory } from '@/lib/storage/organizationStorage'
import { ExternalOrgCard } from './ExternalOrgCard'

interface ResourceCategoryGroupProps {
  category: ExternalResourceCategory
  categoryLabel: string
  organizations: ExternalOrganization[]
  isExpanded: boolean
  onToggle: () => void
}

export const ResourceCategoryGroup = memo(({
  category,
  categoryLabel,
  organizations,
  isExpanded,
  onToggle
}: ResourceCategoryGroupProps) => {
  return (
    <div className="border-b border-gray-100">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200
          ${isExpanded
            ? 'bg-red-50 hover:bg-red-100'
            : 'hover:bg-gray-50'
          }`}
      >
        {/* Chevron Icon with rotation animation */}
        <ChevronDownIcon
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
            isExpanded ? 'rotate-0 text-rstu-red' : '-rotate-90 text-gray-400'
          }`}
        />

        {/* Category Name */}
        <span className={`font-semibold transition-colors duration-200 ${
          isExpanded ? 'text-rstu-red' : 'text-gray-900'
        }`}>
          {categoryLabel}
        </span>

        {/* Organization Count */}
        <span className="text-xs text-gray-500 font-normal ml-auto">
          ({organizations.length})
        </span>
      </button>

      {/* Organizations in Category - CSS-based expand/collapse animation */}
      <div className={`overflow-hidden bg-gray-50 transition-all duration-300 ease-in-out
        ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-3 space-y-3">
          {organizations.map((org) => (
            <ExternalOrgCard key={org.id} organization={org} />
          ))}
        </div>
      </div>
    </div>
  )
})

ResourceCategoryGroup.displayName = 'ResourceCategoryGroup'
