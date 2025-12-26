'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export type ProfileTab = 'overview' | 'messages';

interface ProfileTabBarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  unreadCount?: number;
}

const TAB_IDS: ProfileTab[] = ['overview', 'messages'];

export function ProfileTabBar({ activeTab, onTabChange, unreadCount = 0 }: ProfileTabBarProps) {
  const { t } = useLanguage()

  const getTabLabel = (id: ProfileTab): string => {
    switch (id) {
      case 'overview': return t('profile.overview')
      case 'messages': return t('profile.messages')
    }
  }

  return (
    <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
      {TAB_IDS.map(id => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors relative ${
            activeTab === id
              ? 'border-rstu-red text-rstu-red'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span>{getTabLabel(id)}</span>
            {id === 'messages' && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
