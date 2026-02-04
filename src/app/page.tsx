'use client'
import { createLogger } from '@/lib/utils/logger'
const log = createLogger('App')

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { EnhancedBuilding } from '@/lib/data/getBuildingsData';
import { loadAllProperties } from '@/lib/data/loadAllProperties';
import { BuildingList } from '@/components/building/BuildingList';
import { PropertyViewTabs } from '@/components/PropertyView';
import { LandingPage } from '@/components/LandingPage/LandingPage';
import { ReadingList } from '@/components/Reading/ReadingList';
import { ReadingContent } from '@/components/Reading/ReadingContent';
import { ToolsPage } from '@/components/Tools/ToolsPage';
import { ProfilePage } from '@/components/Profile/ProfilePage';
import { MutualAidPage } from '@/components/MutualAid/MutualAidPage';
import { ResourcesPage } from '@/components/Resources/ResourcesPage';
import { AdminLogin } from '@/components/Reading/AdminLogin';
import { DocumentEditor } from '@/components/Reading/DocumentEditor';
import {
  getAdminState,
  checkAdminAuth,
  toggleDocumentVisibility,
  deleteDocument,
  logoutAdmin,
  getDocumentEdits,
  syncAdminStateFromDatabase,
  syncDocumentEditsFromDatabase,
  toggleDocumentVisibilityAsync,
  deleteDocumentAsync,
  saveDocumentEditAsync
} from '@/lib/storage/adminStorage';
import { initBootstrapCode, bootstrapFirstAdmin, getCurrentProfile } from '@/lib/storage/profileStorage';
import { createLinkedGroup, generateGroupName, getLinkedGroups, validateBlocFormationRequirement } from '@/lib/storage/linkedPropertiesStorage';
import { createProposal } from '@/lib/storage/governanceStorage';
import { runStorageHealthCheck } from '@/lib/utils/safeStorage';
import { useTab } from '@/contexts/TabContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDisplay, usePanelConfig } from '@/contexts/DisplayContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ReadingDocument } from '@/lib/data/getReadingData';
import readingManifest from '@/data/reading-manifest.json';
import { ConfirmModal, AlertModal } from '@/components/ui/ConfirmModal';

// Load all 5,600+ multi-unit properties from compressed JSON
// Contains: apn, address, name, owner, units, value, yearBuilt, zoning, landUseCode, lat/lon
export default function Home() {
  const { activeTab, setActiveTab, markLandingAsSeen } = useTab();
  const { isAdminAuthenticated, canAccessOrganizeTab, refreshAuth } = useAuth();
  const { t } = useLanguage();

  // Display preferences
  const { preferences } = useDisplay();
  const homePanelConfig = usePanelConfig('home');
  const readingPanelConfig = usePanelConfig('reading');

  // Load all properties from compressed JSON and expand to EnhancedBuilding format
  // Using client-side fetch to avoid inlining 4.1MB JSON into HTML (was creating 24MB file)
  const [buildingsData, setBuildingsData] = useState<EnhancedBuilding[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const buildings = buildingsData;

  const [selectedBuilding, setSelectedBuilding] = useState<EnhancedBuilding | null>(null);

  // Fetch buildings data on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // basePath is always /rstu-connect as configured in next.config.js
    const basePath = '/rstu-connect';

    fetch(`${basePath}/data/all-properties.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load properties: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Validate structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid JSON structure: not an object');
        }

        if (!data.p || !Array.isArray(data.p)) {
          throw new Error('Invalid JSON structure: missing or invalid "p" array');
        }

        if (typeof data.c !== 'number' || data.c !== data.p.length) {
          log.warn(
            `Count mismatch: data.c=${data.c}, data.p.length=${data.p.length}`
          );
        }

        // Load and validate
        const expanded = loadAllProperties(data);

        if (expanded.length === 0) {
          throw new Error('No valid properties found after validation');
        }

        // Final check
        const hasInvalid = expanded.some(b => !b || !b.apn || !b.address);
        if (hasInvalid) {
          throw new Error('CRITICAL: Invalid buildings detected after validation!');
        }

        setBuildingsData(expanded);
        setIsLoadingBuildings(false);
      })
      .catch(error => {
        log.error('Error loading properties:', error);
        setLoadError(error.message);
        setIsLoadingBuildings(false);
      });
  }, []);

  // Property linking state (Ctrl+click on desktop, press-and-hold on mobile)
  const [linkingSelection, setLinkingSelection] = useState<EnhancedBuilding[]>([]);

  // Mobile view toggle for buildings page
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Mobile view toggle for reading page
  const [readingMobileView, setReadingMobileView] = useState<'list' | 'content'>('list');

  // Track if we're on mobile for conditional styling
  const [isDesktop, setIsDesktop] = useState(true); // Default true for SSR

  // Track hydration status to avoid mismatches
  const [isHydrated, setIsHydrated] = useState(false);

  // Reading tab state - merge manifest with localStorage edits
  const [allDocuments, setAllDocuments] = useState<ReadingDocument[]>(() => {
    const manifestDocs = (readingManifest as { documents: ReadingDocument[] }).documents;
    // Initial state - will be updated in useEffect after mount
    return manifestDocs;
  });

  // Admin state - declare early to avoid hoisting issues
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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
    const manifestDocs = (readingManifest as { documents: ReadingDocument[] }).documents;
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

  // Set initial selected building when buildings load (desktop only)
  useEffect(() => {
    if (!isHydrated) return; // Wait for hydration to detect actual screen size
    if (buildings.length > 0 && !selectedBuilding && isDesktop) {
      const firstValid = buildings.find(b => b && b.apn);
      if (firstValid) {
        setSelectedBuilding(firstValid);
      }
    }
  }, [buildings, selectedBuilding, isHydrated, isDesktop]);

  // Initialize from localStorage after mount to avoid hydration issues
  useEffect(() => {
    // Merge document edits
    mergeDocumentEdits();

    // Load admin state from localStorage first (fast)
    setAdminState(getAdminState());

    // Then sync from database (async, merges with local)
    syncAdminStateFromDatabase().then(mergedState => {
      setAdminState(mergedState);
    });

    // Also sync document edits from database
    syncDocumentEditsFromDatabase().then(() => {
      mergeDocumentEdits();
    });

    // Disabled: "remember where you left off" feature
    // Previously loaded last viewed document - now always start fresh
    // const state = getReadingState();
    // if (state.lastDocument) {
    //   const doc = documents.find(d => d.id === state.lastDocument);
    //   if (doc) setSelectedDocument(doc);
    // }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Resizable reading list (width now from DisplayContext)
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number>();

  // Run storage health check on mount
  useEffect(() => {
    runStorageHealthCheck();
  }, []);

  // Detect desktop/mobile for conditional styling
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    setIsHydrated(true);
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleListResize = useCallback((newWidth: number) => {
    const clamped = Math.max(20, Math.min(80, newWidth)); // Between 20% and 80%
    readingPanelConfig.setWidth(clamped);
  }, [readingPanelConfig]);

  // Fast resize using direct DOM manipulation (supports mouse and touch)
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startWidth = readingPanelConfig.config.width;

    const getClientX = (e: MouseEvent | TouchEvent): number => {
      return 'touches' in e ? e.touches[0]?.clientX ?? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;

      // Cancel any pending animation frame
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const deltaX = getClientX(e) - startX;
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

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      // Calculate final width and update React state
      const deltaX = getClientX(e) - startX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;
      handleListResize(startWidth + deltaPercent);

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [readingPanelConfig.config.width, handleListResize]);

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

  // Auto-navigate to profile onboarding when invite QR code is scanned
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');

    if (inviteCode) {
      const currentProfile = getCurrentProfile();
      if (!currentProfile) {
        // No profile - auto-navigate to profile tab for onboarding wizard
        setActiveTab('profile');
      }
    }
  }, [setActiveTab]);

  // Admin keyboard shortcut (Ctrl+Shift+A) - Logout only (login is automatic via profile)
  // Disabled in reading tab to prevent accidental logout while reading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        // Don't logout while in reading tab (prevents accidental logout)
        if (activeTab === 'reading') return;
        // Check if already authenticated - can logout
        if (checkAdminAuth()) {
          logoutAdmin();
          refreshAuth(); // Update auth context
          setLogoutAlert(true);
        }
        // Login is now automatic via profile system - no manual login needed
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshAuth, activeTab]);

  // Handle linking selection (admin: instant link, tenant: create proposal)
  const handleLinkingSelection = useCallback(() => {
    if (linkingSelection.length < 2) return;

    const profile = getCurrentProfile();
    const isAdminOrOrganizer = profile?.role === 'admin' || profile?.role === 'organizer';
    const selectedApns = linkingSelection.map(b => b.apn);
    const selectedAddresses = linkingSelection.map(b => b.address);

    try {
      if (isAdminOrOrganizer) {
        // ADMIN/ORGANIZER PATH: Instant link (existing behavior)
        const name = generateGroupName(selectedAddresses);
        createLinkedGroup(selectedApns, name, profile?.id || 'anonymous');
        setLinkingSelection([]);
        // Toast would go here if available
      } else {
        // TENANT PATH: Create voting proposal
        const validation = validateBlocFormationRequirement(selectedApns);

        if (!validation.valid) {
          // Show error with shortfall details
          const shortfallText = validation.shortfalls
            .map(s => `${s.apn}: ${s.current}/${s.needed} registered tenants`)
            .join('; ');
          setErrorAlert(`Insufficient registered tenants: ${shortfallText}`);
          return;
        }

        // Create proposal for first building's chat room
        const firstBuildingSlug = linkingSelection[0].chatSlug;
        createProposal('form-bloc', firstBuildingSlug, {
          targetApns: selectedApns,
          targetValue: generateGroupName(selectedAddresses),
          reason: 'Tenant proposal to form new bloc for coordinated organizing',
        });

        setLinkingSelection([]);
        // Toast would go here: "Bloc formation proposal created..."
      }
    } catch (error) {
      setErrorAlert(`Failed to create bloc: ${(error as Error).message}`);
    }
  }, [linkingSelection]);

  // Property linking keyboard shortcuts (Enter to confirm, Escape to cancel)
  useEffect(() => {
    const handleLinkingKeys = (e: KeyboardEvent) => {
      // Don't handle if focus is in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (linkingSelection.length === 0) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleLinkingSelection();
      } else if (e.key === 'Escape') {
        setLinkingSelection([]);
      }
    };

    window.addEventListener('keydown', handleLinkingKeys);
    return () => window.removeEventListener('keydown', handleLinkingKeys);
  }, [handleLinkingSelection, linkingSelection.length]);

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
    // basePath is always /rstu-connect as configured in next.config.js
    const basePath = '/rstu-connect';
    try {
      const response = await fetch(`${basePath}/documents/${encodeURIComponent(doc.category)}/${encodeURIComponent(doc.filename)}`);
      const content = await response.text();
      setEditingDocument(doc);
      setEditingContent(content);
    } catch (error) {
      log.error('Failed to load document for editing:', error);
      setErrorAlert('Failed to load document content');
    }
  };

  // Handle document hide/show toggle (async for database sync)
  const handleToggleHide = async (docId: string) => {
    await toggleDocumentVisibilityAsync(docId);
    setAdminState(getAdminState());
  };

  // Handle document delete
  const handleDeleteDocument = (docId: string, title: string) => {
    setDeleteConfirm({ id: docId, title });
  };

  const confirmDocumentDelete = async () => {
    if (deleteConfirm) {
      await deleteDocumentAsync(deleteConfirm.id);
      setAdminState(getAdminState());
      setDeleteConfirm(null);
    }
  };

  // Handle document feature status (placeholder for future implementation)
  const handleFeatureDocument = (_docId: string) => {
    // Placeholder for future featured documents functionality
  };

  // Render landing page for first-time visitors
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onEnter={() => {
          markLandingAsSeen();
          setActiveTab('home');
        }}
        onNavigate={(tab) => {
          markLandingAsSeen();
          setActiveTab(tab as any);
        }}
      />
    );
  }

  // Render home view
  if (activeTab === 'home') {
    // Check if user has access to organize tab
    if (!canAccessOrganizeTab) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {t('organize.verificationRequired')}
          </h2>
          <p className="text-gray-600 max-w-md mb-6">
            {t('organize.verificationMessage')}
          </p>
          <button
            onClick={() => setActiveTab('profile')}
            className="px-6 py-2 bg-rstu-red text-white rounded-lg hover:bg-red-700"
          >
            {t('organize.goToProfile')}
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col overflow-hidden flex-1 h-full">
        {/* Linking status bar - shows when properties are selected */}
        {linkingSelection.length > 0 && (() => {
          const profile = getCurrentProfile();
          const isAdminOrOrganizer = profile?.role === 'admin' || profile?.role === 'organizer';
          const actionLabel = isAdminOrOrganizer ? t('organize.actionLinking') : t('organize.actionBlocProposal');
          const buttonLabel = isAdminOrOrganizer ? t('organize.linkButton') : t('organize.createProposalButton');

          return (
            <div className="bg-rstu-red text-white px-4 py-2 flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-sm">
                  {t('organize.propertiesSelected', { count: linkingSelection.length.toString(), action: actionLabel })}
                </span>
                {!isAdminOrOrganizer && linkingSelection.length >= 2 && (
                  <div className="text-xs text-white/80 mt-1">
                    {t('organize.tenantVoteNotice')}
                  </div>
                )}
                <div className="text-xs text-white/70 mt-0.5">
                  {t('organize.selectMoreHint')}
                </div>
              </div>
              <div className="flex gap-2">
                {linkingSelection.length >= 2 && (
                  <button
                    onClick={handleLinkingSelection}
                    className="text-xs bg-white text-rstu-red px-3 py-1.5 rounded font-medium min-h-[36px] min-w-[44px]"
                  >
                    {buttonLabel}
                  </button>
                )}
                <button
                  onClick={() => setLinkingSelection([])}
                  className="text-xs bg-white/20 px-3 py-1.5 rounded min-h-[36px] min-w-[44px]"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Loading State */}
        {isLoadingBuildings && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rstu-red mb-4"></div>
              <p className="text-gray-600">{t('organize.loadingProperties')}</p>
              <p className="text-xs text-gray-400 mt-2">{t('organize.propertyCount')}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {loadError && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center max-w-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('organize.loadFailed')}</h2>
              <p className="text-gray-600 mb-4">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-rstu-red text-white rounded hover:bg-red-700"
              >
                {t('organize.retry')}
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Show when buildings are loaded */}
        {!isLoadingBuildings && !loadError && (
        <div className="flex flex-col md:flex-row overflow-hidden flex-1 min-h-0">
        {/* Left: Building List - hidden on mobile when property is selected */}
        <div
          className={`${mobileView === 'list' || !selectedBuilding ? 'flex' : 'hidden'} md:flex flex-col w-full min-h-0 h-full overflow-hidden`}
          style={isHydrated && isDesktop && homePanelConfig.config.visible ? { flex: `0 0 ${homePanelConfig.config.width}%` } : undefined}
        >
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
        <div
          className={`${mobileView === 'chat' && selectedBuilding ? 'flex' : 'hidden'} md:flex w-full flex-col bg-white relative min-h-0 h-full overflow-hidden`}
          style={isHydrated && isDesktop && homePanelConfig.config.visible ? { flex: `1 1 ${100 - homePanelConfig.config.width}%` } : { flex: '1 1 100%' }}
        >
          {selectedBuilding ? (
            <PropertyViewTabs
              building={selectedBuilding}
              allBuildings={buildings}
              onSelectBuilding={setSelectedBuilding}
              linkingSelection={linkingSelection}
              onToggleLinkSelection={handleToggleLinkSelection}
              showBackButton={!isDesktop}
              onBack={() => setMobileView('list')}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center max-w-md p-6">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('organize.noPropertySelected')}</h3>
                <p className="text-sm text-gray-500">{t('organize.selectPropertyHint')}</p>
              </div>
            </div>
          )}
        </div>
        </div>
        )}
      </div>
    );
  }

  // Render mutual aid view
  if (activeTab === 'mutualAid') {
    return <MutualAidPage buildings={buildings} />;
  }

  // Render resources view
  if (activeTab === 'resources') {
    return <ResourcesPage />;
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
    <div className="flex flex-col flex-1 h-full min-h-0">
      {/* Admin Login */}
      {showAdminLogin && (
        <AdminLogin
          onSuccess={() => {
            refreshAuth(); // Update auth context
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

      <div className="flex flex-col md:flex-row overflow-hidden flex-1 h-full">
        {/* Left: Reading List - hidden on mobile when document is selected */}
        <div
          ref={leftPanelRef}
          className={`${readingMobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col min-h-0 w-full overflow-hidden`}
          style={isHydrated && isDesktop && readingPanelConfig.config.visible ? { flex: `0 0 ${readingPanelConfig.config.width}%` } : { flex: '1 1 0%' }}
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
            onFeature={handleFeatureDocument}
          />
        </div>

        {/* Resize Handle - separate element between panels, only on desktop */}
        <div
          className="hidden md:flex items-center justify-center w-2 cursor-col-resize hover:bg-rstu-red/20 bg-gray-100 border-x border-gray-200 group flex-shrink-0 touch-none"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <div className="w-0.5 h-8 bg-gray-300 rounded-full group-hover:bg-rstu-red transition-colors" />
        </div>

        {/* Right: Content Viewer */}
        <div
          ref={rightPanelRef}
          className={`${readingMobileView === 'content' ? 'flex' : 'hidden'} md:flex flex-col bg-white relative min-h-0 w-full overflow-hidden`}
          style={isHydrated && isDesktop && readingPanelConfig.config.visible ? { flex: `1 1 ${100 - readingPanelConfig.config.width}%` } : { flex: '1 1 0%' }}
        >
          {selectedDocument ? (
            <ReadingContent
              document={selectedDocument}
              showBackButton={!isDesktop}
              onBack={() => setReadingMobileView('list')}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              {t('organize.selectDocumentHint')}
            </div>
          )}
        </div>
      </div>

      {/* Custom Modals */}
      <AlertModal
        isOpen={logoutAlert}
        title={t('organize.loggedOut')}
        message={t('organize.loggedOutMessage')}
        variant="success"
        onClose={() => setLogoutAlert(false)}
      />

      <AlertModal
        isOpen={errorAlert !== null}
        title={t('common.error')}
        message={errorAlert || ''}
        variant="error"
        onClose={() => setErrorAlert(null)}
      />

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title={t('organize.deleteDocument')}
        message={t('organize.deleteConfirm', { title: deleteConfirm?.title || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        onConfirm={confirmDocumentDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
