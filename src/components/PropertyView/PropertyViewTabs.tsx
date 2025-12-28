'use client'

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { PropertyHeader } from './PropertyHeader';
import { PropertyTabBar, PropertyTab } from './PropertyTabBar';
import { PropertyChatTab } from './PropertyChatTab';
import { InfoSlideout } from './InfoSlideout';
import { MapPlaceholder } from './MapPlaceholder';
import { getGroupForApn } from '@/lib/linkedPropertiesStorage';
import { RentStrikeToolkit } from '../Tools/RentStrikeToolkit';

// Lazy load map to reduce initial bundle size (~300KB)
const PropertyMapTab = dynamic(
  () => import('./PropertyMapTab').then(mod => ({ default: mod.PropertyMapTab })),
  {
    loading: () => <MapPlaceholder />,
    ssr: false
  }
);

// Lazy load events tab
const PropertyEventsTab = dynamic(
  () => import('./PropertyEventsTab').then(mod => ({ default: mod.PropertyEventsTab })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading events...</div>
      </div>
    ),
    ssr: false
  }
);

interface PropertyViewTabsProps {
  building: EnhancedBuilding;
  allBuildings?: EnhancedBuilding[];
  onSelectBuilding?: (building: EnhancedBuilding) => void;
  linkingSelection?: EnhancedBuilding[];
  onToggleLinkSelection?: (building: EnhancedBuilding) => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function PropertyViewTabs({ building, allBuildings, onSelectBuilding, linkingSelection, onToggleLinkSelection, showBackButton, onBack }: PropertyViewTabsProps) {
  const [activeTab, setActiveTab] = useState<PropertyTab>('chat');
  const [showInfoSlideout, setShowInfoSlideout] = useState(false);

  // Check if this building is in a linked group
  const linkedGroup = useMemo(() => getGroupForApn(building.apn), [building.apn]);

  // Handle opening info slideout
  const handleInfoClick = useCallback(() => {
    setShowInfoSlideout(true);
  }, []);

  // Handle closing info slideout
  const handleCloseInfo = useCallback(() => {
    setShowInfoSlideout(false);
  }, []);

  // Handle navigating to another building and opening its chat
  const handleSelectBuildingWithChat = useCallback((selectedBuilding: EnhancedBuilding) => {
    if (onSelectBuilding) {
      onSelectBuilding(selectedBuilding);
    }
    setActiveTab('chat');
    setShowInfoSlideout(false);
  }, [onSelectBuilding]);


  // Get all buildings in the linked group
  const linkedBuildings = useMemo(() => {
    if (!linkedGroup || !allBuildings) return [];
    return linkedGroup.apns
      .map(apn => allBuildings.find(b => b.apn === apn))
      .filter((b): b is EnhancedBuilding => !!b);
  }, [linkedGroup, allBuildings]);

  // Use shared chat slug for linked properties, otherwise building's own slug
  const chatSlug = linkedGroup ? `linked-${linkedGroup.id}` : building.chatSlug;
  const isLinkedChat = !!linkedGroup;


  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Linked group banner */}
      {linkedGroup && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-sm text-orange-700">
            <strong>{linkedGroup.name}</strong> - shared chat for {linkedBuildings.length} linked properties
          </span>
        </div>
      )}

      {/* Unified Header with back button (mobile) - clickable for info */}
      <PropertyHeader
        building={building}
        showBackButton={showBackButton}
        onBack={onBack}
        onInfoClick={handleInfoClick}
      />

      {/* Tab Bar */}
      <PropertyTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <PropertyChatTab
            chatSlug={chatSlug}
            building={building}
            buildingAddress={isLinkedChat ? linkedGroup!.name : building.address}
          />
        )}
        {activeTab === 'map' && (
          <PropertyMapTab
            building={building}
            allBuildings={allBuildings}
            onSelectBuilding={onSelectBuilding}
            linkingSelection={linkingSelection}
            onToggleLinkSelection={onToggleLinkSelection}
          />
        )}
        {activeTab === 'events' && (
          <PropertyEventsTab
            building={building}
            chatSlug={chatSlug}
            linkedGroup={linkedGroup || null}
          />
        )}
        {activeTab === 'strike-toolkit' && (
          <div className="h-full overflow-y-auto">
            <RentStrikeToolkit building={building} mode="building-tab" />
          </div>
        )}
      </div>

      {/* Info Slideout - opens when clicking header */}
      <InfoSlideout
        building={building}
        linkedBuildings={linkedBuildings.length > 1 ? linkedBuildings : undefined}
        onSelectBuilding={onSelectBuilding}
        allBuildings={allBuildings}
        onSelectBuildingWithChat={handleSelectBuildingWithChat}
        isOpen={showInfoSlideout}
        onClose={handleCloseInfo}
      />
    </div>
  );
}
