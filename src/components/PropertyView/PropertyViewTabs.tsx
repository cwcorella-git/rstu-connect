'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { PropertyHeader } from './PropertyHeader';
import { PropertyTabBar, PropertyTab } from './PropertyTabBar';
import { PropertyChatTab } from './PropertyChatTab';
import { PropertyInfoTab } from './PropertyInfoTab';
import { MapPlaceholder } from './MapPlaceholder';

// Lazy load map to reduce initial bundle size (~300KB)
const PropertyMapTab = dynamic(
  () => import('./PropertyMapTab').then(mod => ({ default: mod.PropertyMapTab })),
  {
    loading: () => <MapPlaceholder />,
    ssr: false
  }
);

interface PropertyViewTabsProps {
  building: EnhancedBuilding;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function PropertyViewTabs({ building, showBackButton, onBack }: PropertyViewTabsProps) {
  const [activeTab, setActiveTab] = useState<PropertyTab>('chat');

  const handleOpenMap = () => {
    setActiveTab('map');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Unified Header with back button (mobile) */}
      <PropertyHeader
        building={building}
        showBackButton={showBackButton}
        onBack={onBack}
      />

      {/* Tab Bar */}
      <PropertyTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <PropertyChatTab
            chatSlug={building.chatSlug}
            buildingAddress={building.address}
            onOpenMap={handleOpenMap}
          />
        )}
        {activeTab === 'map' && (
          <PropertyMapTab building={building} />
        )}
        {activeTab === 'info' && (
          <PropertyInfoTab building={building} />
        )}
      </div>
    </div>
  );
}
