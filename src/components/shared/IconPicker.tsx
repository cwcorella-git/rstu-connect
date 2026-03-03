'use client'

import { useState } from 'react'
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
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

// Shared icon option type
export interface IconOption {
  name: string
  component: React.ComponentType<React.SVGProps<SVGSVGElement>>
  labelKey: string
}

// Icon options for picker - full list of available Heroicons
// labelKey maps to resources.icon.{labelKey} translation keys
export const ICON_OPTIONS: IconOption[] = [
  { name: 'CalendarIcon', component: CalendarIcon, labelKey: 'calendar' },
  { name: 'UserGroupIcon', component: UserGroupIcon, labelKey: 'groups' },
  { name: 'AcademicCapIcon', component: AcademicCapIcon, labelKey: 'education' },
  { name: 'MegaphoneIcon', component: MegaphoneIcon, labelKey: 'megaphone' },
  { name: 'ClipboardDocumentListIcon', component: ClipboardDocumentListIcon, labelKey: 'clipboard' },
  { name: 'SparklesIcon', component: SparklesIcon, labelKey: 'special' },
  { name: 'PencilSquareIcon', component: PencilSquareIcon, labelKey: 'custom' },
  { name: 'TagIcon', component: TagIcon, labelKey: 'tag' },
  { name: 'HomeIcon', component: HomeIcon, labelKey: 'housing' },
  { name: 'HeartIcon', component: HeartIcon, labelKey: 'health' },
  { name: 'StarIcon', component: StarIcon, labelKey: 'featured' },
  { name: 'LightBulbIcon', component: LightBulbIcon, labelKey: 'ideas' },
  { name: 'TruckIcon', component: TruckIcon, labelKey: 'transportation' },
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
  { name: 'GlobeAltIcon', component: GlobeAltIcon, labelKey: 'global' },
  { name: 'MapPinIcon', component: MapPinIcon, labelKey: 'location' },
  { name: 'PhoneIcon', component: PhoneIcon, labelKey: 'phone' },
  { name: 'EnvelopeIcon', component: EnvelopeIcon, labelKey: 'mail' },
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
]

// Map icon names to components for runtime rendering
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  TagIcon,
}

const ICONS_PER_PAGE = 12 // 2 rows of 6

interface IconPickerProps {
  selectedIcon: string | null
  onSelectIcon: (iconName: string) => void
  label?: string
}

export function IconPicker({ selectedIcon, onSelectIcon, label }: IconPickerProps) {
  const { t } = useLanguage()
  const [iconPage, setIconPage] = useState(() => {
    // Start on the page containing the selected icon
    if (selectedIcon) {
      const idx = ICON_OPTIONS.findIndex(i => i.name === selectedIcon)
      if (idx >= 0) return Math.floor(idx / ICONS_PER_PAGE)
    }
    return 0
  })

  const totalPages = Math.ceil(ICON_OPTIONS.length / ICONS_PER_PAGE)
  const startIdx = iconPage * ICONS_PER_PAGE
  const visibleIcons = ICON_OPTIONS.slice(startIdx, startIdx + ICONS_PER_PAGE)

  const selectedIconData = ICON_OPTIONS.find(i => i.name === selectedIcon)

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Icon Grid with Navigation */}
      <div className="flex items-center gap-2">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => setIconPage(p => Math.max(0, p - 1))}
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
                onClick={() => onSelectIcon(icon.name)}
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
          onClick={() => setIconPage(p => Math.min(totalPages - 1, p + 1))}
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
            type="button"
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
  )
}
