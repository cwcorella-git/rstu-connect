'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { EnhancedBuilding } from '@/lib/getBuildingsData';
import { loadAllProperties } from '@/lib/loadAllProperties';
import { BuildingList } from '@/components/BuildingList';
import { PropertyViewTabs } from '@/components/PropertyView';
import { ReadingList } from '@/components/Reading/ReadingList';
import { ReadingContent } from '@/components/Reading/ReadingContent';
import { ToolsPage } from '@/components/Tools/ToolsPage';
import { ProfilePage } from '@/components/Profile/ProfilePage';
import { MutualAidPage } from '@/components/MutualAid/MutualAidPage';
import { AdminLogin } from '@/components/Reading/AdminLogin';
import { DocumentEditor } from '@/components/Reading/DocumentEditor';
import { getReadingState } from '@/lib/readingStorage';
import { getAdminState, checkAdminAuth, toggleDocumentVisibility, deleteDocument, logoutAdmin, getDocumentEdits } from '@/lib/adminStorage';
import { initBootstrapCode, bootstrapFirstAdmin, getCurrentProfile } from '@/lib/profileStorage';
import { createLinkedGroup, generateGroupName, getLinkedGroups } from '@/lib/linkedPropertiesStorage';
import { runStorageHealthCheck } from '@/lib/safeStorage';
import { useTab } from '@/contexts/TabContext';
import type { ReadingDocument } from '@/lib/getReadingData';
import readingManifest from '@/data/reading-manifest.json';
import allPropertiesData from '../../public/data/all-properties.json';
import { ConfirmModal, AlertModal } from '@/components/ui/ConfirmModal';

// Load all 5,600+ multi-unit properties from compressed JSON
// Contains: apn, address, name, owner, units, value, yearBuilt, zoning, landUseCode, lat/lon
export default function Home() {
  const { activeTab, setActiveTab } = useTab();

  // Load all properties from compressed JSON and expand to EnhancedBuilding format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildings = loadAllProperties(allPropertiesData as any);

  const [selectedBuilding, setSelectedBuilding] = useState<EnhancedBuilding>(buildings[0]);

  // Property linking state (Ctrl+click to add, L to confirm)
  const [linkingSelection, setLinkingSelection] = useState<EnhancedBuilding[]>([]);

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

  // Modal states for custom dialogs
  const [logoutAlert, setLogoutAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

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
  // Run storage health check on mount
  useEffect(() => {
    runStorageHealthCheck();
  }, []);

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

  // Bootstrap admin account via URL param
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize bootstrap code (logs to console on first visit)
    initBootstrapCode();

    // Check for bootstrap URL param
    const urlParams = new URLSearchParams(window.location.search);
    const bootstrapCode = urlParams.get('bootstrap');

    if (bootstrapCode) {
      const profile = bootstrapFirstAdmin(bootstrapCode);
      if (profile) {
        // Clear URL param and switch to profile tab
        window.history.replaceState({}, '', window.location.pathname);
        setActiveTab('profile');
      }
    }
  }, [setActiveTab]);

  // Admin keyboard shortcut (Ctrl+Shift+A) - Logout only (login is automatic via profile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        // Check if already authenticated - can logout
        if (checkAdminAuth()) {
          logoutAdmin();
          setIsAdminAuthenticated(false);
          setLogoutAlert(true);
        }
        // Login is now automatic via profile system - no manual login needed
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Property linking keyboard shortcuts (Enter to confirm, Escape to cancel)
  useEffect(() => {
    const handleLinkingKeys = (e: KeyboardEvent) => {
      // Don't handle if focus is in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (linkingSelection.length === 0) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (linkingSelection.length >= 2) {
          const profile = getCurrentProfile();
          const addresses = linkingSelection.map(b => b.address);
          const name = generateGroupName(addresses);
          createLinkedGroup(
            linkingSelection.map(b => b.apn),
            name,
            profile?.id || 'anonymous',
          );
          setLinkingSelection([]);
        }
      } else if (e.key === 'Escape') {
        setLinkingSelection([]);
      }
    };

    window.addEventListener('keydown', handleLinkingKeys);
    return () => window.removeEventListener('keydown', handleLinkingKeys);
  }, [linkingSelection]);

  // Toggle a building in the linking selection
  const handleToggleLinkSelection = useCallback((building: EnhancedBuilding) => {
    setLinkingSelection(prev => {
      const exists = prev.some(b => b.apn === building.apn);
      if (exists) {
        return prev.filter(b => b.apn !== building.apn);
      } else {
        return [...prev, building];
      }
    });
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
      setErrorAlert('Failed to load document content');
    }
  };

  // Handle document hide/show toggle
  const handleToggleHide = (docId: string) => {
    toggleDocumentVisibility(docId);
    setAdminState(getAdminState());
  };

  // Handle document delete
  const handleDeleteDocument = (docId: string, title: string) => {
    setDeleteConfirm({ id: docId, title });
  };

  const confirmDocumentDelete = () => {
    if (deleteConfirm) {
      deleteDocument(deleteConfirm.id);
      setAdminState(getAdminState());
      setDeleteConfirm(null);
    }
  };

  // Render home view
  if (activeTab === 'home') {
    return (
      <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Linking status bar */}
        {linkingSelection.length > 0 && (
          <div className="bg-rstu-red text-white px-4 py-2 flex items-center justify-between flex-shrink-0">
            <span className="text-sm">
              <strong>{linkingSelection.length}</strong> properties selected for linking
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (linkingSelection.length >= 2) {
                    const profile = getCurrentProfile();
                    const addresses = linkingSelection.map(b => b.address);
                    const name = generateGroupName(addresses);
                    createLinkedGroup(linkingSelection.map(b => b.apn), name, profile?.id || 'anonymous');
                    setLinkingSelection([]);
                  }
                }}
                disabled={linkingSelection.length < 2}
                className="text-xs bg-white text-rstu-red px-3 py-1 rounded font-medium disabled:opacity-50"
              >
                Link (Enter)
              </button>
              <button
                onClick={() => setLinkingSelection([])}
                className="text-xs bg-white/20 px-3 py-1 rounded"
              >
                Cancel (Esc)
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row overflow-hidden flex-1 min-h-0">
        {/* Left: Building List - hidden on mobile when property is selected */}
        <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/5 min-h-0 h-full overflow-hidden`}>
          <BuildingList
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={(building) => {
              setSelectedBuilding(building);
              // Auto-switch to property view on mobile when building is selected
              setMobileView('chat');
            }}
            linkingSelection={linkingSelection}
            onToggleLinkSelection={handleToggleLinkSelection}
          />
        </div>

        {/* Right: Property View with Tabs (Chat, Map, Info) - full screen on mobile with back button */}
        <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex w-full md:w-3/5 flex-col bg-white relative min-h-0 h-full overflow-hidden`}>
          <PropertyViewTabs
            building={selectedBuilding}
            allBuildings={buildings}
            onSelectBuilding={setSelectedBuilding}
            linkingSelection={linkingSelection}
            onToggleLinkSelection={handleToggleLinkSelection}
            showBackButton={!isDesktop}
            onBack={() => setMobileView('list')}
          />
        </div>
        </div>
      </div>
    );
  }

  // Render mutual aid view
  if (activeTab === 'mutualAid') {
    return <MutualAidPage buildings={buildings} />;
  }

  // Render tools view
  if (activeTab === 'tools') {
    return <ToolsPage buildings={buildings} />;
  }

  // Render profile view
  if (activeTab === 'profile') {
    return <ProfilePage buildings={buildings} />;
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
        {/* Left: Reading List - hidden on mobile when document is selected */}
        <div
          ref={leftPanelRef}
          className={`${readingMobileView === 'list' ? 'flex' : 'hidden'} md:flex relative flex-col min-h-0 w-full overflow-hidden`}
          style={isDesktop ? { flex: `0 0 ${listWidth}%` } : { flex: '1 1 0%' }}
          suppressHydrationWarning
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
          suppressHydrationWarning
        >
          {selectedDocument ? (
            <ReadingContent
              document={selectedDocument}
              showBackButton={!isDesktop}
              onBack={() => setReadingMobileView('list')}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a document to read
            </div>
          )}
        </div>
      </div>

      {/* Custom Modals */}
      <AlertModal
        isOpen={logoutAlert}
        title="Logged Out"
        message="Logged out successfully from document library admin."
        variant="success"
        onClose={() => setLogoutAlert(false)}
      />

      <AlertModal
        isOpen={errorAlert !== null}
        title="Error"
        message={errorAlert || ''}
        variant="error"
        onClose={() => setErrorAlert(null)}
      />

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Delete Document"
        message={`Permanently delete "${deleteConfirm?.title}"? This will hide it from all users.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDocumentDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
