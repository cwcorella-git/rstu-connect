'use client'

import { useState } from 'react';
import { getBuildingsWithMatrixRooms, Building } from '@/lib/getBuildingsData';
import { BuildingList } from '@/components/BuildingList';
import { MatrixChatEmbed } from '@/components/MatrixChatEmbed';
import { BuildingMetadata } from '@/components/BuildingMetadata';

// Get buildings at build time (server-side)
// For now, we'll fetch client-side to avoid build-time database access issues
// TODO: Move to server component when database path is resolved
export default function Home() {
  // In production, this would come from server-side props
  // For now, we'll use a hardcoded list that matches the database
  const buildings: Building[] = [
    {
      apn: "1221136",
      address: "2500 E 2ND ST, RENO, NV 89502",
      owner: "GAGE VILLAGE COMMERCIAL DEV LLC et al",
      units: 1495,
      value: 36827351,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!xbzxGKIXSkAUmtxzSl:matrix.org",
      matrixAlias: "#2500-e-2nd-st:matrix.org"
    },
    {
      apn: "1925018",
      address: "2707 S VIRGINIA ST, RENO, NV 89502",
      owner: "PEPPERMILL CASINOS INC",
      units: 1453,
      value: 113983994,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!pPRMjIKPNmDVATOfQO:matrix.org",
      matrixAlias: "#2707-s-virginia-st:matrix.org"
    },
    {
      apn: "726128",
      address: "500 WEST ST, RENO, NV 89501",
      owner: "CCR NEWCO LLC",
      units: 906,
      value: 10209015,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!PaAPKhscWlluhqDrgX:matrix.org",
      matrixAlias: "#500-west-st:matrix.org"
    },
    {
      apn: "726129",
      address: "130 W 6TH ST, RENO, NV 89501",
      owner: "UCCELLI LIVING TRUST et al",
      units: 905,
      value: 1592806,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!duDzElAQWEWqIxQUla:matrix.org",
      matrixAlias: "#130-w-6th-st:matrix.org"
    },
    {
      apn: "726112",
      address: "190 W 6TH ST, RENO, NV 89501",
      owner: "CCR NEWCO LLC",
      units: 905,
      value: 789043,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!dpyGnsJlzcvNwpxkmC:matrix.org",
      matrixAlias: "#190-w-6th-st:matrix.org"
    },
    {
      apn: "2025458",
      address: "3800 S VIRGINIA ST, RENO, NV 89502",
      owner: "GOLDEN ROAD MOTOR INN INC",
      units: 825,
      value: 61763887,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!YSPUGYuKGQmiPlPpRI:matrix.org",
      matrixAlias: "#3800-s-virginia-st:matrix.org"
    },
    {
      apn: "3217228",
      address: "1100 NUGGET AVE, SPARKS, NV 89431",
      owner: "SMOOTH BOURBON LLC",
      units: 800,
      value: 17130330,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!QmYXJSkmPdehfZQFxB:matrix.org",
      matrixAlias: "#1100-nugget-ave:matrix.org"
    },
    {
      apn: "754215",
      address: "345 N ARLINGTON AVE, RENO, NV 89501",
      owner: "JESR LLC",
      units: 779,
      value: 10862110,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!fDrbbETFLNErTUQRrZ:matrix.org",
      matrixAlias: "#345-n-arlington-ave:matrix.org"
    },
    {
      apn: "726226",
      address: "500 N SIERRA ST, RENO, NV 89501",
      owner: "CCR NEWCO LLC",
      units: 673,
      value: 15560272,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!CbwbqflFzzRzxGXTTh:matrix.org",
      matrixAlias: "#500-n-sierra-st:matrix.org"
    },
    {
      apn: "729229",
      address: "325 N SIERRA ST, RENO, NV 89501",
      owner: "ELDORADO RESORTS LLC",
      units: 656,
      value: 3217496,
      yearBuilt: null,
      sqft: null,
      matrixRoomId: "!ttOrGsHCneOaOrwNAW:matrix.org",
      matrixAlias: "#325-n-sierra-st:matrix.org"
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

      {/* Right: Matrix Chat with Metadata Overlay */}
      <div className="w-3/5 flex flex-col bg-white relative">
        <MatrixChatEmbed
          roomId={selectedBuilding.matrixRoomId}
          alias={selectedBuilding.matrixAlias}
          buildingAddress={selectedBuilding.address}
        />

        {/* Metadata Overlay */}
        <BuildingMetadata building={selectedBuilding} />
      </div>
    </div>
  );
}
