'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { isAdmin } from '@/lib/storage/profileStorage'
import {
  LandingPageConfig,
  DEFAULT_PAGE_1,
  getLandingPages,
  saveLandingPage,
  deleteLandingPage,
  getActiveLandingPageId,
  setActiveLandingPageId,
  createBlankPage,
  createSection,
  syncFromSupabase,
} from '@/lib/storage/landingPageStorage'
import { PageSelector } from './PageSelector'
import { SectionRenderer } from './SectionRenderer'
import { SectionControls } from './SectionControls'
import { SectionSettingsPanel } from './SectionSettingsPanel'
import { AddSectionButton } from './AddSectionButton'
import { EmptyPageState } from './EmptyPageState'

interface LandingPageProps {
  onEnter: () => void
  onNavigate: (tab: string) => void
}

export function LandingPage({ onEnter, onNavigate }: LandingPageProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { isEditMode } = useEditMode()
  const [admin, setAdmin] = useState(false)
  const [pages, setPages] = useState<LandingPageConfig[]>([])
  const [activePageId, setActivePageIdState] = useState('page-1')
  const [settingsOpenForId, setSettingsOpenForId] = useState<string | null>(null)

  // Load pages on mount
  useEffect(() => {
    setAdmin(isAdmin())
    const stored = getLandingPages()
    setPages(stored)
    setActivePageIdState(getActiveLandingPageId())
    // Async sync from Supabase
    syncFromSupabase().then(synced => {
      if (synced.length > 0) {
        setPages(synced)
      }
    })
  }, [])

  const activePage = pages.find(p => p.id === activePageId) || DEFAULT_PAGE_1

  const handlePageChange = useCallback((id: string) => {
    setActivePageIdState(id)
    setActiveLandingPageId(id)
  }, [])

  const handleAddPage = useCallback((name: string) => {
    const newPage = createBlankPage(name)
    saveLandingPage(newPage)
    setPages(getLandingPages())
    handlePageChange(newPage.id)
  }, [handlePageChange])

  const handleDeletePage = useCallback((id: string) => {
    deleteLandingPage(id)
    setPages(getLandingPages())
    if (activePageId === id) {
      handlePageChange('page-1')
    }
  }, [activePageId, handlePageChange])

  // Section manipulation
  const updateActivePage = useCallback((updater: (page: LandingPageConfig) => LandingPageConfig) => {
    const updated = updater({ ...activePage, sections: [...activePage.sections] })
    saveLandingPage(updated)
    setPages(getLandingPages())
  }, [activePage])

  const handleMoveSection = useCallback((index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= activePage.sections.length) return
    updateActivePage(page => {
      const sections = [...page.sections]
      const [moved] = sections.splice(index, 1)
      sections.splice(newIndex, 0, moved)
      return { ...page, sections }
    })
  }, [activePage.sections.length, updateActivePage])

  const handleRemoveSection = useCallback((index: number) => {
    updateActivePage(page => ({
      ...page,
      sections: page.sections.filter((_, i) => i !== index),
    }))
  }, [updateActivePage])

  const handleAddSection = useCallback((afterIndex: number, type: string) => {
    const section = createSection(type)
    updateActivePage(page => {
      const sections = [...page.sections]
      sections.splice(afterIndex + 1, 0, section)
      return { ...page, sections }
    })
  }, [updateActivePage])

  const handleSectionConfigChange = useCallback((sectionId: string, config: Record<string, unknown>) => {
    updateActivePage(page => ({
      ...page,
      sections: page.sections.map(s =>
        s.id === sectionId ? { ...s, config } : s
      ),
    }))
  }, [updateActivePage])

  const scrollToNext = useCallback((currentIndex: number) => {
    const nextSection = activePage.sections[currentIndex + 1]
    if (nextSection) {
      const el = document.getElementById(`section-${nextSection.id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activePage.sections])

  return (
    <div
      ref={contentRef}
      className="w-full bg-white overflow-y-scroll h-full"
      style={{ scrollbarGutter: 'stable' }}
    >
      {/* Admin page selector */}
      {admin && (
        <PageSelector
          pages={pages}
          activeId={activePageId}
          onChange={handlePageChange}
          onAdd={handleAddPage}
          onDelete={handleDeletePage}
        />
      )}

      <div>
        {activePage.sections.map((section, i) => (
          <div key={section.id} id={`section-${section.id}`} className="relative">
            {/* Section controls (edit mode only) */}
            {admin && isEditMode && (
              <>
                <SectionControls
                  index={i}
                  total={activePage.sections.length}
                  sectionType={section.type}
                  onMoveUp={() => handleMoveSection(i, -1)}
                  onMoveDown={() => handleMoveSection(i, 1)}
                  onRemove={() => handleRemoveSection(i)}
                  onOpenSettings={() => setSettingsOpenForId(
                    settingsOpenForId === section.id ? null : section.id
                  )}
                  settingsOpen={settingsOpenForId === section.id}
                />
                {settingsOpenForId === section.id && (
                  <SectionSettingsPanel
                    section={section}
                    onConfigChange={(config) => handleSectionConfigChange(section.id, config)}
                    onClose={() => setSettingsOpenForId(null)}
                  />
                )}
              </>
            )}

            <SectionRenderer
              section={section}
              onEnter={onEnter}
              onNavigate={onNavigate}
              onScrollClick={() => scrollToNext(i)}
              onSectionConfigChange={handleSectionConfigChange}
            />

            {/* Add section button between sections (edit mode only) */}
            {admin && isEditMode && (
              <AddSectionButton onAdd={(type) => handleAddSection(i, type)} />
            )}
          </div>
        ))}

        {/* Prominent empty state when page has no sections */}
        {admin && isEditMode && activePage.sections.length === 0 && (
          <EmptyPageState onAddSection={(type) => handleAddSection(-1, type)} />
        )}
      </div>
    </div>
  )
}
