'use client'

import { useState, useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  updateExternalOrganization,
  getCustomCategories,
  isCustomCategory,
  EXTERNAL_CATEGORY_LABELS,
  type ExternalOrganization,
  type OrganizationContact,
  type ExternalResourceCategory,
  type OrganizationCategory,
} from '@/lib/organizationStorage'

interface EditOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdated: (org: ExternalOrganization) => void
  organization: ExternalOrganization
}

// Helper to extract contact value by type
function getContactValue(contacts: OrganizationContact[], type: OrganizationContact['type']): string {
  const contact = contacts.find(c => c.type === type)
  return contact?.value || ''
}

export function EditOrganizationModal({
  isOpen,
  onClose,
  onUpdated,
  organization,
}: EditOrganizationModalProps) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  // Form state - initialized from organization
  const [name, setName] = useState(organization.name)
  const [description, setDescription] = useState(organization.description)
  const [category, setCategory] = useState<OrganizationCategory>(organization.category)
  const [phone, setPhone] = useState(getContactValue(organization.contacts, 'phone'))
  const [website, setWebsite] = useState(getContactValue(organization.contacts, 'website'))
  const [address, setAddress] = useState(getContactValue(organization.contacts, 'address'))
  const [hours, setHours] = useState(getContactValue(organization.contacts, 'hours'))
  const [eligibility, setEligibility] = useState(organization.eligibility || '')
  const [serviceArea, setServiceArea] = useState(organization.serviceArea || '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form when modal opens or organization changes
  useEffect(() => {
    if (isOpen) {
      setName(organization.name)
      setDescription(organization.description)
      setCategory(organization.category)
      setPhone(getContactValue(organization.contacts, 'phone'))
      setWebsite(getContactValue(organization.contacts, 'website'))
      setAddress(getContactValue(organization.contacts, 'address'))
      setHours(getContactValue(organization.contacts, 'hours'))
      setEligibility(organization.eligibility || '')
      setServiceArea(organization.serviceArea || '')
      setError('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, organization])

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

  // Get all available categories
  const customCategories = getCustomCategories()

  // Check if there are changes
  const hasChanges =
    name.trim() !== organization.name ||
    description.trim() !== organization.description ||
    category !== organization.category ||
    phone.trim() !== getContactValue(organization.contacts, 'phone') ||
    website.trim() !== getContactValue(organization.contacts, 'website') ||
    address.trim() !== getContactValue(organization.contacts, 'address') ||
    hours.trim() !== getContactValue(organization.contacts, 'hours') ||
    eligibility.trim() !== (organization.eligibility || '') ||
    serviceArea.trim() !== (organization.serviceArea || '')

  const canSubmit = name.trim().length >= 2 && description.trim().length >= 10 && !isSubmitting && hasChanges

  const handleSubmit = () => {
    if (!canSubmit) return

    setError('')
    setIsSubmitting(true)

    try {
      // Build contacts array
      const contacts: OrganizationContact[] = []
      if (phone.trim()) {
        contacts.push({ type: 'phone', value: phone.trim() })
      }
      if (website.trim()) {
        contacts.push({ type: 'website', value: website.trim() })
      }
      if (address.trim()) {
        contacts.push({ type: 'address', value: address.trim() })
      }
      if (hours.trim()) {
        contacts.push({ type: 'hours', value: hours.trim() })
      }

      const updated = updateExternalOrganization(organization.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        contacts,
        eligibility: eligibility.trim() || undefined,
        serviceArea: serviceArea.trim() || undefined,
      })

      if (updated) {
        onUpdated(updated)
      } else {
        setError(t('resources.errorUpdatingOrg'))
        setIsSubmitting(false)
      }
    } catch (e) {
      setError(t('resources.errorUpdatingOrg'))
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {t('resources.editOrgTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('resources.orgName')} <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 100))}
              placeholder={t('resources.orgNamePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('resources.orgDescription')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder={t('resources.orgDescriptionPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                text-gray-900 placeholder-gray-400 resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/500 {t('resources.characters')}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('resources.category')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as OrganizationCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                text-gray-900 bg-white"
            >
              {/* Built-in categories */}
              <optgroup label={t('resources.builtInCategories')}>
                {(Object.keys(EXTERNAL_CATEGORY_LABELS) as ExternalResourceCategory[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {t(`resources.cat.${key}`)}
                    </option>
                  )
                )}
              </optgroup>
              {/* Custom categories */}
              {customCategories.length > 0 && (
                <optgroup label={t('resources.customCategories')}>
                  {customCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {category !== organization.category && (
              <p className="mt-1 text-xs text-amber-600">
                {t('resources.categoryWillMove')}
              </p>
            )}
          </div>

          {/* Contact Info Section */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">{t('resources.contactInfo')}</p>

            {/* Phone */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">{t('resources.phone')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(775) 555-0123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                  text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Website */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">{t('resources.website')}</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.org"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                  text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Address */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">{t('resources.address')}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Reno, NV 89501"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                  text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Hours */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('resources.hours')}</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Mon-Fri 9am-5pm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                  text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">{t('resources.additionalInfo')}</p>

            {/* Eligibility */}
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">{t('resources.eligibility')}</label>
              <input
                type="text"
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                placeholder={t('resources.eligibilityPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                  text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Service Area */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t('resources.serviceAreaLabel')}</label>
              <input
                type="text"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder={t('resources.serviceAreaPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-rstu-red focus:border-rstu-red
                  text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
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
