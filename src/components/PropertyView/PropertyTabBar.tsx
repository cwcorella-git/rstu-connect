'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export type PropertyTab = 'chat' | 'map' | 'events' | 'issues';

interface PropertyTabBarProps {
  activeTab: PropertyTab;
  onTabChange: (tab: PropertyTab) => void;
  issueCount?: number;
}

const TAB_IDS: PropertyTab[] = ['chat', 'events', 'issues', 'map'];

export function PropertyTabBar({ activeTab, onTabChange, issueCount }: PropertyTabBarProps) {
  const { t } = useLanguage()

  const getTabLabel = (id: PropertyTab): string => {
    switch (id) {
      case 'chat': return t('property.chat')
      case 'map': return t('property.map')
      case 'events': return t('property.events')
      case 'issues': return t('property.issues') || 'Issues'
    }
  }

  return (
    <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
      {TAB_IDS.map(id => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors relative ${
            activeTab === id
              ? 'border-rstu-red text-rstu-red'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {getTabLabel(id)}
          {id === 'issues' && issueCount !== undefined && issueCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
              {issueCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
