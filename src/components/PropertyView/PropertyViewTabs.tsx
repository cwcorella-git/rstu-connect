'use client'

import { useState } from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { PropertyTabBar, PropertyTab } from './PropertyTabBar';
import { PropertyChatTab } from './PropertyChatTab';
import { PropertyInfoTab } from './PropertyInfoTab';
import { MapPlaceholder } from './MapPlaceholder';

interface PropertyViewTabsProps {
  building: EnhancedBuilding;
}

export function PropertyViewTabs({ building }: PropertyViewTabsProps) {
  const [activeTab, setActiveTab] = useState<PropertyTab>('chat');

  const handleOpenMap = () => {
    setActiveTab('map');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
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
          <MapPlaceholder />
        )}
        {activeTab === 'info' && (
          <PropertyInfoTab building={building} />
        )}
      </div>
    </div>
  );
}
