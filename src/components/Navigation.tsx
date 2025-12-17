'use client'

import { useTab } from '@/contexts/TabContext'

export function Navigation() {
  const { activeTab, setActiveTab } = useTab()

  return (
    <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 text-xs sm:text-sm">
      <button
        onClick={() => setActiveTab('home')}
        className={`whitespace-nowrap ${
          activeTab === 'home'
            ? 'text-gray-900 font-medium'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Organize
      </button>
      <button
        onClick={() => setActiveTab('reading')}
        className={`whitespace-nowrap ${
          activeTab === 'reading'
            ? 'text-gray-900 font-medium'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Reading
      </button>
      <a
        className="hidden sm:inline text-gray-600 hover:text-gray-900 whitespace-nowrap"
        href="https://docs.google.com/forms/d/e/1FAIpQLSc4Fgq0sW7BFHfFLDvM8NIUIKLtnkDTC9RwUQ1rLin8ZqyoSQ/viewform"
        target="_blank"
        rel="noopener noreferrer"
      >
        Get Involved
      </a>
      <a
        href="https://renosparkstenantsunion.org"
        className="text-rstu-red hover:text-rstu-red-dark font-medium whitespace-nowrap"
      >
        Main site
      </a>
    </nav>
  )
}
