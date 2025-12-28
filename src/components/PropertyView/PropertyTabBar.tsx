'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export type PropertyTab = 'chat' | 'map' | 'events' | 'strike-toolkit';

interface PropertyTabBarProps {
  activeTab: PropertyTab;
  onTabChange: (tab: PropertyTab) => void;
}

const TAB_IDS: PropertyTab[] = ['chat', 'events', 'map', 'strike-toolkit'];

export function PropertyTabBar({ activeTab, onTabChange }: PropertyTabBarProps) {
  const { t } = useLanguage()

  const getTabLabel = (id: PropertyTab): string => {
    switch (id) {
      case 'chat': return t('property.chat')
      case 'map': return t('property.map')
      case 'events': return t('property.events')
      case 'strike-toolkit': return 'Strike Toolkit'
    }
  }

  return (
    <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
      {TAB_IDS.map(id => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === id
              ? 'border-rstu-red text-rstu-red'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {getTabLabel(id)}
        </button>
      ))}
    </div>
  );
}
