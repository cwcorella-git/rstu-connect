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
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  createCustomCategory,
  getNextAvailableColor,
  type CustomCategory,
} from '@/lib/organizationStorage'

// Icon options for picker
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
]

// Map color class to display name
const COLOR_LABELS: Record<string, string> = {
  'text-rose-500': 'Rose',
  'text-lime-500': 'Lime',
  'text-emerald-500': 'Emerald',
  'text-sky-500': 'Sky',
  'text-violet-500': 'Violet',
  'text-fuchsia-500': 'Fuchsia',
  'text-yellow-500': 'Yellow',
  'text-amber-500': 'Amber',
  'text-blue-500': 'Blue',
  'text-purple-500': 'Purple',
  'text-teal-500': 'Teal',
  'text-red-500': 'Red',
  'text-slate-500': 'Slate',
  'text-orange-500': 'Orange',
  'text-green-500': 'Green',
  'text-pink-500': 'Pink',
  'text-indigo-500': 'Indigo',
  'text-cyan-500': 'Cyan',
  'text-gray-500': 'Gray',
}

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
  const [autoColor, setAutoColor] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate next available color on mount
  useEffect(() => {
    if (isOpen) {
      setAutoColor(getNextAvailableColor())
      // Reset form
      setName('')
      setSelectedIcon(null)
      setError('')
      // Focus input
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

  const canSubmit = name.trim().length >= 2 && selectedIcon !== null && !isSubmitting

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
  const colorLabel = COLOR_LABELS[autoColor] || 'Custom'

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                text-gray-900 placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              {name.length}/40 {t('resources.characters')}
            </p>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('resources.chooseIcon')}
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((icon) => {
                const IconComponent = icon.component
                const isSelected = selectedIcon === icon.name
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setSelectedIcon(icon.name)}
                    title={icon.label}
                    className={`p-3 rounded-lg border-2 transition-all ${
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
            {selectedIconData && (
              <p className="mt-2 text-sm text-gray-600">
                {t('resources.selectedIcon')}: <span className="font-medium">{selectedIconData.label}</span>
              </p>
            )}
          </div>

          {/* Auto Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('resources.autoColor')}
            </label>
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className={`w-5 h-5 rounded-full ${autoColor.replace('text-', 'bg-')}`} />
              <span className="text-gray-700">{colorLabel}</span>
            </div>
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
}
