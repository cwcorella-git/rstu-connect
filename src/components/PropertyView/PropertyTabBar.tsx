'use client'

export type PropertyTab = 'chat' | 'map' | 'info';

interface PropertyTabBarProps {
  activeTab: PropertyTab;
  onTabChange: (tab: PropertyTab) => void;
}

const TABS: { id: PropertyTab; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'map', label: 'Map' },
  { id: 'info', label: 'Property Info' },
];

export function PropertyTabBar({ activeTab, onTabChange }: PropertyTabBarProps) {
  return (
    <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-rstu-red text-rstu-red'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
