'use client'

import { useState, useEffect } from 'react';
import { Building } from '@/lib/getBuildingsData';
import { BuildingList } from '@/components/BuildingList';
import { BuildingChatEmbed } from '@/components/BuildingChatEmbed';
import { BuildingMetadata } from '@/components/BuildingMetadata';
import { ReadingList } from '@/components/Reading/ReadingList';
import { ReadingContent } from '@/components/Reading/ReadingContent';
import { AdminPanel } from '@/components/Reading/AdminPanel';
import { AdminLogin } from '@/components/Reading/AdminLogin';
import { DocumentEditor } from '@/components/Reading/DocumentEditor';
import { getReadingState } from '@/lib/readingStorage';
import { getAdminState, checkAdminAuth } from '@/lib/adminStorage';
import { useTab } from '@/contexts/TabContext';
import type { ReadingDocument } from '@/lib/getReadingData';
import readingManifest from '@/data/reading-manifest.json';

// Get buildings at build time (server-side)
// For now, we'll fetch client-side to avoid build-time database access issues
// TODO: Move to server component when database path is resolved
export default function Home() {
  const { activeTab, setActiveTab } = useTab();
  // Building list with Socket.io chat rooms
  // Filtered to include only legitimate apartment complexes (200+ units)
  // Removed hotels/casinos: Peppermill, Golden Road Motor Inn, Nugget, Eldorado
  const buildings: Building[] = [
    {
      apn: "1221136",
      address: "2500 E 2ND ST, RENO, NV 89502",
      owner: "GAGE VILLAGE COMMERCIAL DEV LLC et al",
      units: 1495,
      value: 36827351,
      yearBuilt: 1978,
      sqft: 1048514,
      chatSlug: "rstu-2500-e-2nd-st"
    },
    {
      apn: "726128",
      address: "500 WEST ST, RENO, NV 89501",
      owner: "CCR NEWCO LLC",
      units: 906,
      value: 10209015,
      yearBuilt: 1983,
      sqft: 613385,
      chatSlug: "rstu-500-west-st"
    },
    {
      apn: "726129",
      address: "130 W 6TH ST, RENO, NV 89501",
      owner: "UCCELLI LIVING TRUST et al",
      units: 905,
      value: 1592806,
      yearBuilt: 1985,
      sqft: 80566,
      chatSlug: "rstu-130-w-6th-st"
    },
    {
      apn: "726112",
      address: "190 W 6TH ST, RENO, NV 89501",
      owner: "CCR NEWCO LLC",
      units: 905,
      value: 789043,
      yearBuilt: 1985,
      sqft: 36621,
      chatSlug: "rstu-190-w-6th-st"
    },
    {
      apn: "754215",
      address: "345 N ARLINGTON AVE, RENO, NV 89501",
      owner: "JESR LLC",
      units: 779,
      value: 10862110,
      yearBuilt: 1992,
      sqft: 573331,
      chatSlug: "rstu-345-n-arlington-ave"
    },
    {
      apn: "726226",
      address: "500 N SIERRA ST, RENO, NV 89501",
      owner: "CCR NEWCO LLC",
      units: 673,
      value: 15560272,
      yearBuilt: 1969,
      sqft: 587380,
      chatSlug: "rstu-500-n-sierra-st"
    },
    {
      apn: "8638040",
      address: "7711 SKY VISTA PKWY, RENO, NV",
      owner: "LAKES AT LEMMON VALLEY LLC",
      units: 489,
      value: 21963348,
      yearBuilt: 2020,
      sqft: 371855,
      chatSlug: "rstu-7711-sky-vista-pkwy"
    },
    {
      apn: "14021217",
      address: "1160 DAMONTE RANCH PKWY, RENO, NV",
      owner: "KIW RENO VENTURE LLC",
      units: 483,
      value: 27317617,
      yearBuilt: 2023,
      sqft: 476624,
      chatSlug: "rstu-1160-damonte-ranch-pkwy"
    },
    {
      apn: "2128106",
      address: "4500 MIRA LOMA DR, RENO, NV",
      owner: "ROSEWOOD PARK SPE LLC",
      units: 450,
      value: 8633681,
      yearBuilt: 1979,
      sqft: 381852,
      chatSlug: "rstu-4500-mira-loma-dr"
    },
    {
      apn: "16309026",
      address: "9200 DOUBLE R BLVD, RENO, NV",
      owner: "OAKMONT PROPERTIES DOUBLE R LLC",
      units: 441,
      value: 25526215,
      yearBuilt: 2020,
      sqft: 451635,
      chatSlug: "rstu-9200-double-r-blvd"
    },
    {
      apn: "2128107",
      address: "4650 SIERRA MADRE DR, RENO, NV",
      owner: "ROSEWOOD PARK SPE LLC et al",
      units: 428,
      value: 7877324,
      yearBuilt: 1979,
      sqft: 344784,
      chatSlug: "rstu-4650-sierra-madre-dr"
    },
    {
      apn: "3917036",
      address: "5200 SUMMIT RIDGE DR, RENO, NV",
      owner: "TOMANEK GROUP LLC",
      units: 419,
      value: 19337992,
      yearBuilt: 1997,
      sqft: 477926,
      chatSlug: "rstu-5200-summit-ridge-dr"
    },
    {
      apn: "16401004",
      address: "8455 OFFENHAUSER DR, RENO, NV",
      owner: "RIVIERA TERRACE INVESTORS LTD",
      units: 408,
      value: 14776407,
      yearBuilt: 1998,
      sqft: 342019,
      chatSlug: "rstu-8455-offenhauser-dr"
    },
    {
      apn: "16320003",
      address: "1001 SOUTH MEADOWS PKWY, RENO, NV",
      owner: "SEQUOIA EQUITIES TRINITY HOUSE et al",
      units: 388,
      value: 14616695,
      yearBuilt: 1999,
      sqft: 365634,
      chatSlug: "rstu-1001-south-meadows-pkwy"
    },
    {
      apn: "1154411",
      address: "255 N SIERRA ST 140, RENO, NV",
      owner: "TFI HOLDINGS LLC",
      units: 377,
      value: 524633,
      yearBuilt: 1978,
      sqft: 5735,
      chatSlug: "rstu-255-n-sierra-st-140"
    }
  ];

  const [selectedBuilding, setSelectedBuilding] = useState<Building>(buildings[0]);

  // Reading tab state
  const allDocuments = readingManifest.documents as ReadingDocument[];

  // Filter documents based on admin state
  const [adminState, setAdminState] = useState(getAdminState());
  const documents = allDocuments.filter(doc =>
    !adminState.hiddenDocuments.includes(doc.id) &&
    !adminState.deletedDocuments.includes(doc.id)
  );

  const [selectedDocument, setSelectedDocument] = useState<ReadingDocument | null>(() => {
    if (typeof window === 'undefined') return documents[0] || null;
    const state = getReadingState();
    return documents.find(doc => doc.id === state.lastDocument) || documents[0] || null;
  });

  // Admin panel
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Document editor
  const [editingDocument, setEditingDocument] = useState<ReadingDocument | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  // Check admin auth on mount
  useEffect(() => {
    setIsAdminAuthenticated(checkAdminAuth());
  }, []);

  // Resizable reading list
  const [listWidth, setListWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 40;
    const saved = localStorage.getItem('rstu_reading_list_width');
    return saved ? parseInt(saved) : 40;
  });

  const handleListResize = (newWidth: number) => {
    const clamped = Math.max(25, Math.min(60, newWidth)); // Between 25% and 60%
    setListWidth(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rstu_reading_list_width', clamped.toString());
    }
  };

  // Handle URL deep linking for reading documents
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const docSlug = urlParams.get('doc');
    if (docSlug) {
      const doc = documents.find(d => d.slug === docSlug);
      if (doc) {
        setSelectedDocument(doc);
        setActiveTab('reading'); // Switch to reading tab when doc parameter is present
      }
    }
  }, [documents, setActiveTab]);

  // Admin keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        // Check if already authenticated
        if (checkAdminAuth()) {
          setShowAdminPanel(prev => !prev);
        } else {
          setShowAdminLogin(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle document edit
  const handleEditDocument = async (doc: ReadingDocument) => {
    // Fetch current content
    const basePath = process.env.NODE_ENV === 'production' ? '/rstu-connect' : '';
    try {
      const response = await fetch(`${basePath}/documents/${encodeURIComponent(doc.category)}/${encodeURIComponent(doc.filename)}`);
      const content = await response.text();
      setEditingDocument(doc);
      setEditingContent(content);
    } catch (error) {
      console.error('Failed to load document for editing:', error);
      alert('Failed to load document content');
    }
  };

  // Render home view
  if (activeTab === 'home') {
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

  // Render reading view
  return (
    <>
      {/* Admin Login */}
      {showAdminLogin && (
        <AdminLogin
          onSuccess={() => {
            setIsAdminAuthenticated(true);
            setShowAdminLogin(false);
            setShowAdminPanel(true);
          }}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel
          documents={allDocuments}
          onClose={() => setShowAdminPanel(false)}
          onUpdate={() => setAdminState(getAdminState())}
          onEdit={(doc) => {
            handleEditDocument(doc);
            setShowAdminPanel(false);
          }}
          onLogout={() => {
            setIsAdminAuthenticated(false);
            setShowAdminPanel(false);
          }}
        />
      )}

      {/* Document Editor */}
      {editingDocument && (
        <DocumentEditor
          document={editingDocument}
          initialContent={editingContent}
          onClose={() => {
            setEditingDocument(null);
            setEditingContent('');
          }}
          onSave={() => {
            setAdminState(getAdminState());
            if (selectedDocument && selectedDocument.id === editingDocument.id) {
              // Refresh current document view
              setSelectedDocument({ ...selectedDocument });
            }
          }}
        />
      )}

      <div className="flex h-screen relative" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left: Reading List (resizable) */}
      <div style={{ width: `${listWidth}%` }} className="relative">
        <ReadingList
          documents={documents}
          categories={readingManifest.categories}
          selectedDocument={selectedDocument}
          onSelectDocument={setSelectedDocument}
        />

        {/* Resize Handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-rstu-red/30 bg-gray-200 group"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = listWidth;

            const handleMouseMove = (e: MouseEvent) => {
              const deltaX = e.clientX - startX;
              const containerWidth = window.innerWidth;
              const deltaPercent = (deltaX / containerWidth) * 100;
              handleListResize(startWidth + deltaPercent);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-rstu-red opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Right: Content Viewer */}
      <div style={{ width: `${100 - listWidth}%` }} className="flex flex-col bg-white relative">
        {selectedDocument ? (
          <ReadingContent document={selectedDocument} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a document to read
          </div>
        )}
      </div>
    </div>
    </>
  );
}
