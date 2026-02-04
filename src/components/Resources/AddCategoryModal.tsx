'use client'

import { useState, useEffect, useRef } from 'react'
import {
  TruckIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  MusicalNoteIcon,
  SunIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  HeartIcon,
  StarIcon,
  SparklesIcon,
  LightBulbIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  BookOpenIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  CameraIcon,
  FilmIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  WifiIcon,
  BoltIcon,
  FireIcon,
  BeakerIcon,
  ScaleIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  GiftIcon,
  TicketIcon,
  KeyIcon,
  LockClosedIcon,
  FlagIcon,
  HandRaisedIcon,
  HandThumbUpIcon,
  FaceSmileIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  createCustomCategory,
  categoryNameExists,
  type CustomCategory,
} from '@/lib/storage/organizationStorage'

// Icon options for picker - expanded list
// labelKey is the suffix for resources.icon.{labelKey}
const ICON_OPTIONS = [
  { name: 'TruckIcon', component: TruckIcon, labelKey: 'transportation' },
  { name: 'AcademicCapIcon', component: AcademicCapIcon, labelKey: 'education' },
  { name: 'BriefcaseIcon', component: BriefcaseIcon, labelKey: 'employment' },
  { name: 'ShoppingBagIcon', component: ShoppingBagIcon, labelKey: 'clothing' },
  { name: 'WrenchScrewdriverIcon', component: WrenchScrewdriverIcon, labelKey: 'repairs' },
  { name: 'ComputerDesktopIcon', component: ComputerDesktopIcon, labelKey: 'technology' },
  { name: 'MusicalNoteIcon', component: MusicalNoteIcon, labelKey: 'arts' },
  { name: 'SunIcon', component: SunIcon, labelKey: 'recreation' },
  { name: 'BanknotesIcon', component: BanknotesIcon, labelKey: 'financial' },
  { name: 'ShieldCheckIcon', component: ShieldCheckIcon, labelKey: 'safety' },
  { name: 'UserPlusIcon', component: UserPlusIcon, labelKey: 'social' },
  { name: 'ChatBubbleLeftRightIcon', component: ChatBubbleLeftRightIcon, labelKey: 'communication' },
  { name: 'HomeIcon', component: HomeIcon, labelKey: 'housing' },
  { name: 'HeartIcon', component: HeartIcon, labelKey: 'health' },
  { name: 'StarIcon', component: StarIcon, labelKey: 'featured' },
  { name: 'SparklesIcon', component: SparklesIcon, labelKey: 'special' },
  { name: 'LightBulbIcon', component: LightBulbIcon, labelKey: 'ideas' },
  { name: 'GlobeAltIcon', component: GlobeAltIcon, labelKey: 'global' },
  { name: 'MapPinIcon', component: MapPinIcon, labelKey: 'location' },
  { name: 'PhoneIcon', component: PhoneIcon, labelKey: 'phone' },
  { name: 'EnvelopeIcon', component: EnvelopeIcon, labelKey: 'mail' },
  { name: 'CalendarIcon', component: CalendarIcon, labelKey: 'calendar' },
  { name: 'ClockIcon', component: ClockIcon, labelKey: 'time' },
  { name: 'BookOpenIcon', component: BookOpenIcon, labelKey: 'reading' },
  { name: 'DocumentTextIcon', component: DocumentTextIcon, labelKey: 'documents' },
  { name: 'PuzzlePieceIcon', component: PuzzlePieceIcon, labelKey: 'games' },
  { name: 'CameraIcon', component: CameraIcon, labelKey: 'photography' },
  { name: 'FilmIcon', component: FilmIcon, labelKey: 'video' },
  { name: 'MicrophoneIcon', component: MicrophoneIcon, labelKey: 'audio' },
  { name: 'SpeakerWaveIcon', component: SpeakerWaveIcon, labelKey: 'sound' },
  { name: 'WifiIcon', component: WifiIcon, labelKey: 'internet' },
  { name: 'BoltIcon', component: BoltIcon, labelKey: 'energy' },
  { name: 'FireIcon', component: FireIcon, labelKey: 'urgent' },
  { name: 'BeakerIcon', component: BeakerIcon, labelKey: 'science' },
  { name: 'ScaleIcon', component: ScaleIcon, labelKey: 'legal' },
  { name: 'BuildingOfficeIcon', component: BuildingOfficeIcon, labelKey: 'office' },
  { name: 'BuildingStorefrontIcon', component: BuildingStorefrontIcon, labelKey: 'store' },
  { name: 'ShoppingCartIcon', component: ShoppingCartIcon, labelKey: 'shopping' },
  { name: 'GiftIcon', component: GiftIcon, labelKey: 'gifts' },
  { name: 'TicketIcon', component: TicketIcon, labelKey: 'events' },
  { name: 'KeyIcon', component: KeyIcon, labelKey: 'access' },
  { name: 'LockClosedIcon', component: LockClosedIcon, labelKey: 'security' },
  { name: 'FlagIcon', component: FlagIcon, labelKey: 'priority' },
  { name: 'HandRaisedIcon', component: HandRaisedIcon, labelKey: 'volunteer' },
  { name: 'HandThumbUpIcon', component: HandThumbUpIcon, labelKey: 'approval' },
  { name: 'FaceSmileIcon', component: FaceSmileIcon, labelKey: 'community' },
  { name: 'UserGroupIcon', component: UserGroupIcon, labelKey: 'groups' },
]

const ICONS_PER_PAGE = 12  // 2 rows of 6

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (category: CustomCategory) => void
  creatorId: string
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onCreated,
  creatorId,
}: AddCategoryModalProps) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [iconPage, setIconPage] = useState(0)

  const totalPages = Math.ceil(ICON_OPTIONS.length / ICONS_PER_PAGE)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setSelectedIcon(null)
      setError('')
      setIconPage(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Check for duplicate name on change
  const nameError = name.trim().length >= 2 && categoryNameExists(name)
    ? t('resources.categoryExists')
    : ''

  const canSubmit = name.trim().length >= 2 && selectedIcon !== null && !nameError && !isSubmitting

  const handleSubmit = () => {
    if (!canSubmit) return

    setError('')
    setIsSubmitting(true)

    try {
      const category = createCustomCategory(name.trim(), selectedIcon!, creatorId)
      onCreated(category)
    } catch (e) {
      setError(t('resources.errorCreatingCategory'))
      setIsSubmitting(false)
    }
  }

  const selectedIconData = ICON_OPTIONS.find(i => i.name === selectedIcon)

  // Get current page of icons
  const startIdx = iconPage * ICONS_PER_PAGE
  const visibleIcons = ICON_OPTIONS.slice(startIdx, startIdx + ICONS_PER_PAGE)

  const goToPrevPage = () => {
    setIconPage(p => Math.max(0, p - 1))
  }

  const goToNextPage = () => {
    setIconPage(p => Math.min(totalPages - 1, p + 1))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {t('resources.addCategoryTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-5">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('resources.categoryName')}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder={t('resources.categoryNamePlaceholder')}
              className={`w-full px-3 py-2 border rounded-lg
                focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                text-gray-900 placeholder-gray-400 ${
                  nameError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
            />
            <div className="flex justify-between mt-1">
              {nameError ? (
                <p className="text-xs text-red-600">{nameError}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-500">
                {name.length}/40 {t('resources.characters')}
              </p>
            </div>
          </div>

          {/* Icon Picker with Pagination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('resources.chooseIcon')}
            </label>

            {/* Icon Grid with Navigation */}
            <div className="flex items-center gap-2">
              {/* Left Arrow */}
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={iconPage === 0}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  iconPage === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              {/* Icons Grid */}
              <div className="flex-1 grid grid-cols-6 gap-2">
                {visibleIcons.map((icon) => {
                  const IconComponent = icon.component
                  const isSelected = selectedIcon === icon.name
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setSelectedIcon(icon.name)}
                      title={t(`resources.icon.${icon.labelKey}`)}
                      className={`aspect-square flex items-center justify-center rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-rstu-red bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`w-6 h-6 ${isSelected ? 'text-rstu-red' : 'text-gray-500'}`} />
                    </button>
                  )
                })}
              </div>

              {/* Right Arrow */}
              <button
                type="button"
                onClick={goToNextPage}
                disabled={iconPage >= totalPages - 1}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  iconPage >= totalPages - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Page indicator */}
            <div className="flex justify-center items-center mt-2 gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setIconPage(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === iconPage ? 'bg-rstu-red' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Selected indicator */}
            {selectedIconData && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                {t('resources.selectedIcon')}: <span className="font-medium">{t(`resources.icon.${selectedIconData.labelKey}`)}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              canSubmit
                ? 'bg-rstu-red text-white hover:bg-rstu-red-dark'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? t('common.creating') : t('resources.createCategory')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Export icon map for rendering custom category icons
export const CUSTOM_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TruckIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  MusicalNoteIcon,
  SunIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  HeartIcon,
  StarIcon,
  SparklesIcon,
  LightBulbIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  BookOpenIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  CameraIcon,
  FilmIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  WifiIcon,
  BoltIcon,
  FireIcon,
  BeakerIcon,
  ScaleIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  GiftIcon,
  TicketIcon,
  KeyIcon,
  LockClosedIcon,
  FlagIcon,
  HandRaisedIcon,
  HandThumbUpIcon,
  FaceSmileIcon,
  UserGroupIcon,
}
