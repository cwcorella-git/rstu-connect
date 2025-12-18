'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { Building } from '@/lib/getBuildingsData';
import { BuildingList } from '@/components/BuildingList';
import { BuildingChatEmbed } from '@/components/BuildingChatEmbed';
import { BuildingMetadata } from '@/components/BuildingMetadata';
import { ReadingList } from '@/components/Reading/ReadingList';
import { ReadingContent } from '@/components/Reading/ReadingContent';
import { ToolsPage } from '@/components/Tools/ToolsPage';
import { AdminLogin } from '@/components/Reading/AdminLogin';
import { DocumentEditor } from '@/components/Reading/DocumentEditor';
import { getReadingState } from '@/lib/readingStorage';
import { getAdminState, checkAdminAuth, toggleDocumentVisibility, deleteDocument, logoutAdmin, getDocumentEdits } from '@/lib/adminStorage';
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

  // Mobile view toggle for buildings page
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Mobile view toggle for reading page
  const [readingMobileView, setReadingMobileView] = useState<'list' | 'content'>('list');

  // Track if we're on mobile for conditional styling
  const [isDesktop, setIsDesktop] = useState(true); // Default true for SSR

  // Reading tab state - merge manifest with localStorage edits
  const [allDocuments, setAllDocuments] = useState<ReadingDocument[]>(() => {
    const manifestDocs = readingManifest.documents as ReadingDocument[];
    // Initial state - will be updated in useEffect after mount
    return manifestDocs;
  });

  // Admin state - declare early to avoid hoisting issues
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Filter documents based on admin state
  const [adminState, setAdminState] = useState<{
    hiddenDocuments: string[];
    deletedDocuments: string[];
    lastModified: number;
  }>({
    hiddenDocuments: [],
    deletedDocuments: [],
    lastModified: 0
  });

  // For admins, show hidden docs too (they can unhide them)
  // For regular users, filter out hidden and deleted docs
  const documents = allDocuments.filter(doc => {
    if (isAdminAuthenticated) {
      // Admins see everything except deleted
      return !adminState.deletedDocuments.includes(doc.id);
    } else {
      // Regular users don't see hidden or deleted
      return !adminState.hiddenDocuments.includes(doc.id) && !adminState.deletedDocuments.includes(doc.id);
    }
  });

  const [selectedDocument, setSelectedDocument] = useState<ReadingDocument | null>(documents[0] || null);

  // Document editor
  const [editingDocument, setEditingDocument] = useState<ReadingDocument | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  // Function to merge document edits from localStorage
  const mergeDocumentEdits = () => {
    const manifestDocs = readingManifest.documents as ReadingDocument[];
    const edits = getDocumentEdits();

    // Merge edits into documents
    const mergedDocs = manifestDocs.map(doc => {
      const edit = edits[doc.id];
      if (edit) {
        return {
          ...doc,
          title: edit.title
        };
      }
      return doc;
    });

    setAllDocuments(mergedDocs);
  };

  // Initialize from localStorage after mount to avoid hydration issues
  useEffect(() => {
    // Merge document edits
    mergeDocumentEdits();

    // Load admin state
    setAdminState(getAdminState());

    // Load reading state and set selected document
    const state = getReadingState();
    if (state.lastDocument) {
      const doc = documents.find(d => d.id === state.lastDocument);
      if (doc) setSelectedDocument(doc);
    }

    // Check admin auth
    setIsAdminAuthenticated(checkAdminAuth());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Resizable reading list
  const [listWidth, setListWidth] = useState<number>(40);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number>();

  // Load list width from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rstu_reading_list_width');
      if (saved) setListWidth(parseInt(saved));
    }
  }, []);

  // Detect desktop/mobile for conditional styling
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleListResize = useCallback((newWidth: number) => {
    const clamped = Math.max(25, Math.min(60, newWidth)); // Between 25% and 60%
    setListWidth(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rstu_reading_list_width', clamped.toString());
    }
  }, []);

  // Fast resize using direct DOM manipulation
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const startX = e.clientX;
    const startWidth = listWidth;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      // Cancel any pending animation frame
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - startX;
        const containerWidth = window.innerWidth;
        const deltaPercent = (deltaX / containerWidth) * 100;
        const newWidth = Math.max(25, Math.min(60, startWidth + deltaPercent));

        // Direct DOM manipulation for smooth dragging
        if (leftPanelRef.current) {
          leftPanelRef.current.style.flex = `0 0 ${newWidth}%`;
        }
        if (rightPanelRef.current) {
          rightPanelRef.current.style.flex = `1 1 ${100 - newWidth}%`;
        }
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      // Calculate final width and update React state
      const deltaX = e.clientX - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      handleListResize(startWidth + deltaPercent);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [listWidth, handleListResize]);

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

  // Admin keyboard shortcut (Ctrl+Shift+A) - Login/Logout only
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        // Check if already authenticated
        if (checkAdminAuth()) {
          // Logout
          logoutAdmin();
          setIsAdminAuthenticated(false);
          alert('Logged out successfully');
        } else {
          // Show login
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

  // Handle document hide/show toggle
  const handleToggleHide = (docId: string) => {
    toggleDocumentVisibility(docId);
    setAdminState(getAdminState());
  };

  // Handle document delete
  const handleDeleteDocument = (docId: string, title: string) => {
    if (confirm(`Permanently delete "${title}"? This will hide it from all users.`)) {
      deleteDocument(docId);
      setAdminState(getAdminState());
    }
  };

  // Render home view
  if (activeTab === 'home') {
    return (
      <div className="flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Mobile View Toggle */}
        <div className="md:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              mobileView === 'list'
                ? 'border-rstu-red text-rstu-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Buildings ({buildings.length})
          </button>
          <button
            onClick={() => setMobileView('chat')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              mobileView === 'chat'
                ? 'border-rstu-red text-rstu-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chat
          </button>
        </div>

        {/* Left: Building List - hidden on mobile when chat is active */}
        <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 min-h-0 h-full overflow-hidden`}>
          <BuildingList
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={(building) => {
              setSelectedBuilding(building);
              // Auto-switch to chat view on mobile when building is selected
              setMobileView('chat');
            }}
          />
        </div>

        {/* Right: Building Chat with Metadata Overlay - hidden on mobile when list is active */}
        <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex w-full md:w-3/5 flex-col bg-white relative min-h-0 h-full overflow-hidden`}>
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

  // Render tools view
  if (activeTab === 'tools') {
    return <ToolsPage buildings={buildings} />;
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
          }}
          onCancel={() => setShowAdminLogin(false)}
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
            // Re-merge document edits to update titles in the list
            mergeDocumentEdits();
            setAdminState(getAdminState());

            // Update selected document if it's the one being edited
            if (selectedDocument && selectedDocument.id === editingDocument.id) {
              const edits = getDocumentEdits();
              const edit = edits[editingDocument.id];
              if (edit) {
                setSelectedDocument({ ...selectedDocument, title: edit.title });
              }
            }
          }}
        />
      )}

      <div className="flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Mobile View Toggle */}
        <div className="md:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => setReadingMobileView('list')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              readingMobileView === 'list'
                ? 'border-rstu-red text-rstu-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Documents ({documents.length})
          </button>
          <button
            onClick={() => setReadingMobileView('content')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              readingMobileView === 'content'
                ? 'border-rstu-red text-rstu-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reader
          </button>
        </div>

        {/* Left: Reading List (resizable on desktop, full width on mobile) */}
        <div
          ref={leftPanelRef}
          className={`${readingMobileView === 'list' ? 'flex' : 'hidden'} md:flex relative flex-col min-h-0 w-full overflow-hidden`}
          style={isDesktop ? { flex: `0 0 ${listWidth}%` } : { flex: '1 1 0%' }}
        >
          <ReadingList
            documents={documents}
            categories={readingManifest.categories}
            selectedDocument={selectedDocument}
            onSelectDocument={(doc) => {
              setSelectedDocument(doc);
              // Auto-switch to content view on mobile when document is selected
              setReadingMobileView('content');
            }}
            isAdminAuthenticated={isAdminAuthenticated}
            hiddenDocuments={adminState.hiddenDocuments}
            onEdit={handleEditDocument}
            onHide={handleToggleHide}
            onDelete={handleDeleteDocument}
          />

          {/* Resize Handle - only on desktop */}
          <div
            className="hidden md:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-rstu-red/30 bg-gray-200 group"
            onMouseDown={handleResizeStart}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-rstu-red opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Right: Content Viewer */}
        <div
          ref={rightPanelRef}
          className={`${readingMobileView === 'content' ? 'flex' : 'hidden'} md:flex flex-col bg-white relative min-h-0 w-full overflow-hidden`}
          style={isDesktop ? { flex: `1 1 ${100 - listWidth}%` } : { flex: '1 1 0%' }}
        >
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
