'use client'

import { useState } from 'react';
import { Building } from '@/lib/getBuildingsData';
import { BuildingList } from '@/components/BuildingList';
import { BuildingChatEmbed } from '@/components/BuildingChatEmbed';
import { BuildingMetadata } from '@/components/BuildingMetadata';

// Get buildings at build time (server-side)
// For now, we'll fetch client-side to avoid build-time database access issues
// TODO: Move to server component when database path is resolved
export default function Home() {
  // Hardcoded building list with Tlk.io chat rooms
  // Tlk.io provides free, anonymous chat - no login required
  const buildings: Building[] = [
    {
      apn: "1221136",
      address: "2500 E 2ND ST, RENO, NV 89502",
      owner: "GAGE VILLAGE COMMERCIAL DEV LLC et al",
      units: 1495,
      value: 36827351,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-2500-e-2nd-st"
    },
    {
      apn: "1925018",
      address: "2707 S VIRGINIA ST, RENO, NV 89502",
      owner: "PEPPERMILL CASINOS INC",
      units: 1453,
      value: 113983994,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-2707-s-virginia-st"
    },
    {
      apn: "726128",
      address: "500 WEST ST, RENO, NV 89501",
      owner: "CCR NEWCO LLC",
      units: 906,
      value: 10209015,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-500-west-st"
    },
    {
      apn: "726129",
      address: "130 W 6TH ST, RENO, NV 89501",
      owner: "UCCELLI LIVING TRUST et al",
      units: 905,
      value: 1592806,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-130-w-6th-st"
    },
    {
      apn: "726112",
      address: "190 W 6TH ST, RENO, NV 89501",
      owner: "CCR NEWCO LLC",
      units: 905,
      value: 789043,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-190-w-6th-st"
    },
    {
      apn: "2025458",
      address: "3800 S VIRGINIA ST, RENO, NV 89502",
      owner: "GOLDEN ROAD MOTOR INN INC",
      units: 825,
      value: 61763887,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-3800-s-virginia-st"
    },
    {
      apn: "3217228",
      address: "1100 NUGGET AVE, SPARKS, NV 89431",
      owner: "SMOOTH BOURBON LLC",
      units: 800,
      value: 17130330,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-1100-nugget-ave"
    },
    {
      apn: "754215",
      address: "345 N ARLINGTON AVE, RENO, NV 89501",
      owner: "JESR LLC",
      units: 779,
      value: 10862110,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-345-n-arlington-ave"
    },
    {
      apn: "726226",
      address: "500 N SIERRA ST, RENO, NV 89501",
      owner: "CCR NEWCO LLC",
      units: 673,
      value: 15560272,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-500-n-sierra-st"
    },
    {
      apn: "729229",
      address: "325 N SIERRA ST, RENO, NV 89501",
      owner: "ELDORADO RESORTS LLC",
      units: 656,
      value: 3217496,
      yearBuilt: null,
      sqft: null,
      chatSlug: "rstu-325-n-sierra-st"
    }
  ];

  const [selectedBuilding, setSelectedBuilding] = useState<Building>(buildings[0]);

  return (
    <div className="flex h-screen" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left: Building List */}
      <BuildingList
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={setSelectedBuilding}
      />

      {/* Right: Building Chat with Metadata Overlay */}
      <div className="w-3/5 flex flex-col bg-white relative">
        <BuildingChatEmbed
          chatSlug={selectedBuilding.chatSlug}
          buildingAddress={selectedBuilding.address}
        />

        {/* Metadata Overlay */}
        <BuildingMetadata building={selectedBuilding} />
      </div>
    </div>
  );
}
