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
  updateCustomCategory,
  categoryNameExists,
  type CustomCategory,
} from '@/lib/organizationStorage'

// Icon options for picker - same as AddCategoryModal
const ICON_OPTIONS = [
  { name: 'TruckIcon', component: TruckIcon, label: 'Transportation' },
  { name: 'AcademicCapIcon', component: AcademicCapIcon, label: 'Education' },
  { name: 'BriefcaseIcon', component: BriefcaseIcon, label: 'Employment' },
  { name: 'ShoppingBagIcon', component: ShoppingBagIcon, label: 'Clothing' },
  { name: 'WrenchScrewdriverIcon', component: WrenchScrewdriverIcon, label: 'Repairs' },
  { name: 'ComputerDesktopIcon', component: ComputerDesktopIcon, label: 'Technology' },
  { name: 'MusicalNoteIcon', component: MusicalNoteIcon, label: 'Arts' },
  { name: 'SunIcon', component: SunIcon, label: 'Recreation' },
  { name: 'BanknotesIcon', component: BanknotesIcon, label: 'Financial' },
  { name: 'ShieldCheckIcon', component: ShieldCheckIcon, label: 'Safety' },
  { name: 'UserPlusIcon', component: UserPlusIcon, label: 'Social' },
  { name: 'ChatBubbleLeftRightIcon', component: ChatBubbleLeftRightIcon, label: 'Communication' },
  { name: 'HomeIcon', component: HomeIcon, label: 'Housing' },
  { name: 'HeartIcon', component: HeartIcon, label: 'Health' },
  { name: 'StarIcon', component: StarIcon, label: 'Featured' },
  { name: 'SparklesIcon', component: SparklesIcon, label: 'Special' },
  { name: 'LightBulbIcon', component: LightBulbIcon, label: 'Ideas' },
  { name: 'GlobeAltIcon', component: GlobeAltIcon, label: 'Global' },
  { name: 'MapPinIcon', component: MapPinIcon, label: 'Location' },
  { name: 'PhoneIcon', component: PhoneIcon, label: 'Phone' },
  { name: 'EnvelopeIcon', component: EnvelopeIcon, label: 'Mail' },
  { name: 'CalendarIcon', component: CalendarIcon, label: 'Calendar' },
  { name: 'ClockIcon', component: ClockIcon, label: 'Time' },
  { name: 'BookOpenIcon', component: BookOpenIcon, label: 'Reading' },
  { name: 'DocumentTextIcon', component: DocumentTextIcon, label: 'Documents' },
  { name: 'PuzzlePieceIcon', component: PuzzlePieceIcon, label: 'Games' },
  { name: 'CameraIcon', component: CameraIcon, label: 'Photography' },
  { name: 'FilmIcon', component: FilmIcon, label: 'Video' },
  { name: 'MicrophoneIcon', component: MicrophoneIcon, label: 'Audio' },
  { name: 'SpeakerWaveIcon', component: SpeakerWaveIcon, label: 'Sound' },
  { name: 'WifiIcon', component: WifiIcon, label: 'Internet' },
  { name: 'BoltIcon', component: BoltIcon, label: 'Energy' },
  { name: 'FireIcon', component: FireIcon, label: 'Urgent' },
  { name: 'BeakerIcon', component: BeakerIcon, label: 'Science' },
  { name: 'ScaleIcon', component: ScaleIcon, label: 'Legal' },
  { name: 'BuildingOfficeIcon', component: BuildingOfficeIcon, label: 'Office' },
  { name: 'BuildingStorefrontIcon', component: BuildingStorefrontIcon, label: 'Store' },
  { name: 'ShoppingCartIcon', component: ShoppingCartIcon, label: 'Shopping' },
  { name: 'GiftIcon', component: GiftIcon, label: 'Gifts' },
  { name: 'TicketIcon', component: TicketIcon, label: 'Events' },
  { name: 'KeyIcon', component: KeyIcon, label: 'Access' },
  { name: 'LockClosedIcon', component: LockClosedIcon, label: 'Security' },
  { name: 'FlagIcon', component: FlagIcon, label: 'Priority' },
  { name: 'HandRaisedIcon', component: HandRaisedIcon, label: 'Volunteer' },
  { name: 'HandThumbUpIcon', component: HandThumbUpIcon, label: 'Approval' },
  { name: 'FaceSmileIcon', component: FaceSmileIcon, label: 'Community' },
  { name: 'UserGroupIcon', component: UserGroupIcon, label: 'Groups' },
]

const ICONS_PER_PAGE = 12

interface EditCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdated: (category: CustomCategory) => void
  category: CustomCategory
}

export function EditCategoryModal({
  isOpen,
  onClose,
  onUpdated,
  category,
}: EditCategoryModalProps) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(category.name)
  const [selectedIcon, setSelectedIcon] = useState<string>(category.icon)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [iconPage, setIconPage] = useState(0)

  const totalPages = Math.ceil(ICON_OPTIONS.length / ICONS_PER_PAGE)

  // Initialize form when modal opens or category changes
  useEffect(() => {
    if (isOpen) {
      setName(category.name)
      setSelectedIcon(category.icon)
      setError('')
      // Navigate to the page containing the current icon
      const iconIndex = ICON_OPTIONS.findIndex(i => i.name === category.icon)
      if (iconIndex >= 0) {
        setIconPage(Math.floor(iconIndex / ICONS_PER_PAGE))
      } else {
        setIconPage(0)
      }
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, category])

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

  // Check for duplicate name (excluding current category)
  const nameError = name.trim().length >= 2 && categoryNameExists(name, category.id)
    ? t('resources.categoryExists')
    : ''

  // Check if anything changed
  const hasChanges = name.trim() !== category.name || selectedIcon !== category.icon
  const canSubmit = name.trim().length >= 2 && selectedIcon && !nameError && !isSubmitting && hasChanges

  const handleSubmit = () => {
    if (!canSubmit) return

    setError('')
    setIsSubmitting(true)

    try {
      const updated = updateCustomCategory(category.id, {
        name: name.trim(),
        icon: selectedIcon,
      })

      if (updated) {
        onUpdated(updated)
      } else {
        setError(t('resources.errorUpdatingCategory'))
        setIsSubmitting(false)
      }
    } catch (e) {
      setError(t('resources.errorUpdatingCategory'))
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
            {t('resources.editCategoryTitle')}
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
                      title={icon.label}
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
                {t('resources.selectedIcon')}: <span className="font-medium">{selectedIconData.label}</span>
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
            {isSubmitting ? t('common.saving') : t('common.saveChanges')}
          </button>
        </div>
      </div>
    </div>
  )
}
