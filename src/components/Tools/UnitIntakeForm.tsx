'use client'

import { useState, useEffect, memo, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  updateUnit,
  COMPLAINT_CATEGORIES,
  INTEREST_LEVELS,
  HABITABILITY_ISSUES,
  SUBSIDY_TYPES,
  UTILITIES_OPTIONS,
  getStatusLabel,
  type UnitRecord,
  type ContactStatus,
} from '@/lib/storage/canvassStorage'
import { buildProfileQRUrl, createInvite, canAccessTools } from '@/lib/storage/profileStorage'

// Memoized Section component - MUST be defined outside the main component
// to prevent re-creation on every render which causes input focus loss
interface SectionProps {
  id: string
  title: string
  isExpanded: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}

const Section = memo(function Section({ id, title, isExpanded, onToggle, children }: SectionProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => onToggle(id)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
})

interface UnitIntakeFormProps {
  buildingId: string
  buildingAddress: string
  unit: UnitRecord
  onClose: () => void
  onSave: () => void
}

const STATUS_OPTIONS: ContactStatus[] = [
  'NOT_CONTACTED',
  'NO_ANSWER',
  'CONTACTED',
  'INTERESTED',
  'NOT_INTERESTED',
  'FOLLOW_UP',
  'ACTIVE_MEMBER',
]

// Day keys for translation lookup
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export function UnitIntakeForm({ buildingId, buildingAddress, unit, onClose, onSave }: UnitIntakeFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<Partial<UnitRecord>>({
    status: unit.status,
    name: unit.name || '',
    phone: unit.phone || '',
    email: unit.email || '',
    preferredContact: unit.preferredContact,
    language: unit.language || 'English',
    occupants: unit.occupants,
    hasChildren: unit.hasChildren,
    hasPets: unit.hasPets,
    petTypes: unit.petTypes || '',
    accessibilityNeeds: unit.accessibilityNeeds || '',
    unitType: unit.unitType,
    bedroomCount: unit.bedroomCount,
    bathroomCount: unit.bathroomCount,
    unitSqft: unit.unitSqft,
    rentAmount: unit.rentAmount,
    moveInDate: unit.moveInDate || '',
    leaseType: unit.leaseType,
    leaseExpires: unit.leaseExpires || '',
    lastRentIncrease: unit.lastRentIncrease,
    securityDeposit: unit.securityDeposit,
    depositIssues: unit.depositIssues || '',
    workHours: unit.workHours || '',
    bestTimeToReach: unit.bestTimeToReach || '',
    bestDays: unit.bestDays || [],
    complaints: unit.complaints || [],
    complaintDetails: unit.complaintDetails || '',
    maintenanceRating: unit.maintenanceRating,
    avgResponseDays: unit.avgResponseDays,
    outstandingRepairs: unit.outstandingRepairs || '',
    knowsNeighbors: unit.knowsNeighbors,
    idealRent: unit.idealRent,
    hasOrganizingExperience: unit.hasOrganizingExperience,
    interestLevel: unit.interestLevel || [],
    suggestions: unit.suggestions || '',
    notes: unit.notes || '',
    followUpDate: unit.followUpDate || '',
    organizer: unit.organizer || '',
    // Housing Quality & Assistance
    habitabilityIssues: unit.habitabilityIssues || [],
    subsidyType: unit.subsidyType,
    subsidyDetails: unit.subsidyDetails || '',
    utilitiesIncluded: unit.utilitiesIncluded || [],
  })

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['status', 'contact']))
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }, [])

  const handleSave = () => {
    updateUnit(buildingId, unit.unitNumber, formData)
    onSave()
    onClose()
  }

  const handleGenerateQR = () => {
    const url = buildProfileQRUrl(buildingId, buildingAddress, unit.unitNumber)
    setQrUrl(url)
    setShowQRCode(true)
  }

  // Generate QR code image URL using a free API
  const getQRImageUrl = (data: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
  }

  const toggleComplaint = (key: string) => {
    setFormData(prev => ({
      ...prev,
      complaints: prev.complaints?.includes(key)
        ? prev.complaints.filter(c => c !== key)
        : [...(prev.complaints || []), key],
    }))
  }

  const toggleInterest = (key: string) => {
    setFormData(prev => ({
      ...prev,
      interestLevel: prev.interestLevel?.includes(key)
        ? prev.interestLevel.filter(i => i !== key)
        : [...(prev.interestLevel || []), key],
    }))
  }

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      bestDays: prev.bestDays?.includes(day)
        ? prev.bestDays.filter(d => d !== day)
        : [...(prev.bestDays || []), day],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">{t('tools.unit') || 'Unit'} {unit.unitNumber}</h2>
            <p className="text-sm text-gray-500">{buildingAddress.split(',')[0]}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Status (Always visible) */}
          <Section id="status" title={t('tools.status') || 'Status'} isExpanded={expandedSections.has('status')} onToggle={toggleSection}>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ContactStatus }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>
          </Section>

          {/* Contact Info */}
          <Section id="contact" title={t('tools.contactInfo') || 'Contact Info'} isExpanded={expandedSections.has('contact')} onToggle={toggleSection}>
            <input
              type="text"
              placeholder={t('tools.nameNickname') || "Name / Nickname"}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="tel"
              placeholder={t('tools.phone') || "Phone"}
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="email"
              placeholder={t('tools.email') || "Email"}
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="preferredContact"
                  checked={formData.preferredContact === 'phone'}
                  onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'phone' }))}
                />
                {t('tools.phone') || 'Phone'}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="preferredContact"
                  checked={formData.preferredContact === 'text'}
                  onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'text' }))}
                />
                {t('tools.text') || 'Text'}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="preferredContact"
                  checked={formData.preferredContact === 'email'}
                  onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'email' }))}
                />
                {t('tools.email') || 'Email'}
              </label>
            </div>
            <select
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Other">Other</option>
            </select>
          </Section>

          {/* Household */}
          <Section id="household" title={t('tools.household') || 'Household'} isExpanded={expandedSections.has('household')} onToggle={toggleSection}>
            <input
              type="number"
              placeholder={t('tools.occupants') || "# of occupants"}
              value={formData.occupants || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, occupants: parseInt(e.target.value) || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">{t('tools.children') || 'Children'}:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasChildren"
                  checked={formData.hasChildren === true}
                  onChange={() => setFormData(prev => ({ ...prev, hasChildren: true }))}
                />
                {t('common.yes') || 'Yes'}
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasChildren"
                  checked={formData.hasChildren === false}
                  onChange={() => setFormData(prev => ({ ...prev, hasChildren: false }))}
                />
                {t('common.no') || 'No'}
              </label>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">{t('tools.pets') || 'Pets'}:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasPets"
                  checked={formData.hasPets === true}
                  onChange={() => setFormData(prev => ({ ...prev, hasPets: true }))}
                />
                {t('common.yes') || 'Yes'}
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasPets"
                  checked={formData.hasPets === false}
                  onChange={() => setFormData(prev => ({ ...prev, hasPets: false }))}
                />
                {t('common.no') || 'No'}
              </label>
            </div>
            {formData.hasPets && (
              <input
                type="text"
                placeholder={t('tools.petTypes') || "Pet types"}
                value={formData.petTypes}
                onChange={(e) => setFormData(prev => ({ ...prev, petTypes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            )}
            <input
              type="text"
              placeholder={t('tools.accessibility') || "Accessibility needs"}
              value={formData.accessibilityNeeds}
              onChange={(e) => setFormData(prev => ({ ...prev, accessibilityNeeds: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* Unit Details */}
          <Section id="unit" title={t('tools.unitDetails') || 'Unit Details'} isExpanded={expandedSections.has('unit')} onToggle={toggleSection}>
            <div>
              <label className="text-xs text-gray-500 block mb-1">{t('tools.unitType')}</label>
              <select
                value={formData.unitType ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unitType: e.target.value === '' ? undefined : e.target.value as typeof formData.unitType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">--</option>
                <option value="apartment">{t('tools.unitType.apartment')}</option>
                <option value="house">{t('tools.unitType.house')}</option>
                <option value="townhouse">{t('tools.unitType.townhouse')}</option>
                <option value="duplex">{t('tools.unitType.duplex')}</option>
                <option value="condo">{t('tools.unitType.condo')}</option>
                <option value="mobile">{t('tools.unitType.mobile')}</option>
                <option value="room">{t('tools.unitType.room')}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('tools.bedrooms')}</label>
                <select
                  value={formData.bedroomCount ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bedroomCount: e.target.value === '' ? undefined : parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">--</option>
                  <option value="0">{t('tools.bedrooms.studio')}</option>
                  <option value="1">{t('tools.bedrooms.1br')}</option>
                  <option value="2">{t('tools.bedrooms.2br')}</option>
                  <option value="3">{t('tools.bedrooms.3br')}</option>
                  <option value="4">{t('tools.bedrooms.4br')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('tools.bathrooms')}</label>
                <select
                  value={formData.bathroomCount ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bathroomCount: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">--</option>
                  <option value="1">{t('tools.bathrooms.1ba')}</option>
                  <option value="1.5">{t('tools.bathrooms.15ba')}</option>
                  <option value="2">{t('tools.bathrooms.2ba')}</option>
                  <option value="2.5">{t('tools.bathrooms.25ba')}</option>
                  <option value="3">{t('tools.bathrooms.3ba')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">{t('tools.sqft')}</label>
              <input
                type="number"
                placeholder={t('tools.sqftPlaceholder')}
                value={formData.unitSqft || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unitSqft: parseInt(e.target.value) || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </Section>

          {/* Lease & Rent */}
          <Section id="lease" title={t('tools.leaseRent') || 'Lease & Rent'} isExpanded={expandedSections.has('lease')} onToggle={toggleSection}>
            <div className="flex gap-2">
              <span className="text-gray-600 text-sm pt-2">$</span>
              <input
                type="number"
                placeholder={t('tools.rentAmount')}
                value={formData.rentAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: parseInt(e.target.value) || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <span className="text-gray-600 text-sm pt-2">{t('tools.perMonth')}</span>
            </div>
            <input
              type="text"
              placeholder={t('tools.moveInDate')}
              value={formData.moveInDate}
              onChange={(e) => setFormData(prev => ({ ...prev, moveInDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">{t('tools.lease')}:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="leaseType"
                  checked={formData.leaseType === 'fixed'}
                  onChange={() => setFormData(prev => ({ ...prev, leaseType: 'fixed' }))}
                />
                {t('tools.leaseFixed')}
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="leaseType"
                  checked={formData.leaseType === 'month-to-month'}
                  onChange={() => setFormData(prev => ({ ...prev, leaseType: 'month-to-month' }))}
                />
                {t('tools.leaseMonthly')}
              </label>
            </div>
            {formData.leaseType === 'fixed' && (
              <input
                type="text"
                placeholder={t('tools.leaseExpires')}
                value={formData.leaseExpires}
                onChange={(e) => setFormData(prev => ({ ...prev, leaseExpires: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            )}
            <div className="flex gap-2">
              <span className="text-gray-600 text-sm pt-2">{t('tools.deposit')}: $</span>
              <input
                type="number"
                placeholder={t('tools.securityDeposit')}
                value={formData.securityDeposit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: parseInt(e.target.value) || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <input
              type="text"
              placeholder={t('tools.depositIssues')}
              value={formData.depositIssues}
              onChange={(e) => setFormData(prev => ({ ...prev, depositIssues: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* Schedule */}
          <Section id="schedule" title={t('tools.schedule') || 'Schedule & Availability'} isExpanded={expandedSections.has('schedule')} onToggle={toggleSection}>
            <input
              type="text"
              placeholder={t('tools.workHours')}
              value={formData.workHours}
              onChange={(e) => setFormData(prev => ({ ...prev, workHours: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder={t('tools.bestTimeToReach')}
              value={formData.bestTimeToReach}
              onChange={(e) => setFormData(prev => ({ ...prev, bestTimeToReach: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div>
              <span className="text-sm text-gray-600 mb-2 block">{t('tools.bestDays')}:</span>
              <div className="flex flex-wrap gap-2">
                {DAY_KEYS.map(dayKey => (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => toggleDay(dayKey)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.bestDays?.includes(dayKey)
                        ? 'bg-rstu-red text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t(`tools.days.${dayKey}`)}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Complaints */}
          <Section id="complaints" title={t('tools.complaints') || 'Complaints'} isExpanded={expandedSections.has('complaints')} onToggle={toggleSection}>
            <div className="space-y-2">
              {COMPLAINT_CATEGORIES.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.complaints?.includes(key)}
                    onChange={() => toggleComplaint(key)}
                    className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
                  />
                  {label}
                </label>
              ))}
            </div>
            <textarea
              placeholder={t('tools.complaintDetails')}
              value={formData.complaintDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, complaintDetails: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* Maintenance */}
          <Section id="maintenance" title={t('tools.maintenance') || 'Maintenance Experience'} isExpanded={expandedSections.has('maintenance')} onToggle={toggleSection}>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">{t('tools.reliability')}:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="maintenanceRating"
                  checked={formData.maintenanceRating === 'good'}
                  onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'good' }))}
                />
                {t('tools.rating.good')}
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="maintenanceRating"
                  checked={formData.maintenanceRating === 'ok'}
                  onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'ok' }))}
                />
                {t('tools.rating.ok')}
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="maintenanceRating"
                  checked={formData.maintenanceRating === 'bad'}
                  onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'bad' }))}
                />
                {t('tools.rating.bad')}
              </label>
            </div>
            <input
              type="number"
              placeholder={t('tools.avgResponseDays')}
              value={formData.avgResponseDays || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, avgResponseDays: parseInt(e.target.value) || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder={t('tools.outstandingRepairs')}
              value={formData.outstandingRepairs}
              onChange={(e) => setFormData(prev => ({ ...prev, outstandingRepairs: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* Housing Quality Issues */}
          <Section id="habitability" title={t('tools.housingQuality') || 'Housing Quality Issues'} isExpanded={expandedSections.has('habitability')} onToggle={toggleSection}>
            <div className="grid grid-cols-2 gap-2">
              {HABITABILITY_ISSUES.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.habitabilityIssues?.includes(key)}
                    onChange={(e) => {
                      const issues = formData.habitabilityIssues || []
                      setFormData(prev => ({
                        ...prev,
                        habitabilityIssues: e.target.checked
                          ? [...issues, key]
                          : issues.filter(k => k !== key)
                      }))
                    }}
                    className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
                  />
                  {label}
                </label>
              ))}
            </div>
          </Section>

          {/* Rent Assistance */}
          <Section id="subsidy" title={t('tools.rentAssistance') || 'Rent Assistance'} isExpanded={expandedSections.has('subsidy')} onToggle={toggleSection}>
            <select
              value={formData.subsidyType || 'none'}
              onChange={(e) => setFormData(prev => ({ ...prev, subsidyType: e.target.value as typeof formData.subsidyType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {SUBSIDY_TYPES.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {formData.subsidyType && formData.subsidyType !== 'none' && (
              <input
                type="text"
                placeholder={t('tools.subsidyDetails')}
                value={formData.subsidyDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, subsidyDetails: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            )}
          </Section>

          {/* Utilities Included */}
          <Section id="utilities" title={t('tools.utilities') || 'Utilities Included in Rent'} isExpanded={expandedSections.has('utilities')} onToggle={toggleSection}>
            <div className="grid grid-cols-2 gap-2">
              {UTILITIES_OPTIONS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.utilitiesIncluded?.includes(key)}
                    onChange={(e) => {
                      const utils = formData.utilitiesIncluded || []
                      setFormData(prev => ({
                        ...prev,
                        utilitiesIncluded: e.target.checked
                          ? [...utils, key]
                          : utils.filter(k => k !== key)
                      }))
                    }}
                    className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
                  />
                  {label}
                </label>
              ))}
            </div>
          </Section>

          {/* Community & Interest */}
          <Section id="interest" title={t('tools.communityInterest') || 'Community & Interest'} isExpanded={expandedSections.has('interest')} onToggle={toggleSection}>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">{t('tools.knowsNeighbors')}:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="knowsNeighbors"
                  checked={formData.knowsNeighbors === 'yes'}
                  onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'yes' }))}
                />
                {t('tools.answer.yes')}
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="knowsNeighbors"
                  checked={formData.knowsNeighbors === 'somewhat'}
                  onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'somewhat' }))}
                />
                {t('tools.answer.some')}
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="knowsNeighbors"
                  checked={formData.knowsNeighbors === 'no'}
                  onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'no' }))}
                />
                {t('tools.answer.no')}
              </label>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600 text-sm pt-2">{t('tools.idealRent')}: $</span>
              <input
                type="number"
                placeholder={t('tools.idealRent')}
                value={formData.idealRent || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, idealRent: parseInt(e.target.value) || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">{t('tools.priorExperience')}:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasOrganizingExperience"
                  checked={formData.hasOrganizingExperience === true}
                  onChange={() => setFormData(prev => ({ ...prev, hasOrganizingExperience: true }))}
                />
                {t('tools.answer.yes')}
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasOrganizingExperience"
                  checked={formData.hasOrganizingExperience === false}
                  onChange={() => setFormData(prev => ({ ...prev, hasOrganizingExperience: false }))}
                />
                {t('tools.answer.no')}
              </label>
            </div>

            <div className="mt-3">
              <span className="text-sm text-gray-600 mb-2 block">{t('tools.interestLevel')}:</span>
              <div className="space-y-2">
                {INTEREST_LEVELS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.interestLevel?.includes(key)}
                      onChange={() => toggleInterest(key)}
                      className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </Section>

          {/* Suggestions & Notes */}
          <Section id="notes" title={t('tools.suggestionsNotes') || 'Suggestions & Notes'} isExpanded={expandedSections.has('notes')} onToggle={toggleSection}>
            <textarea
              placeholder={t('tools.whatChanges')}
              value={formData.suggestions}
              onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <textarea
              placeholder={t('tools.additionalNotes')}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder={t('tools.followUpDate')}
              value={formData.followUpDate}
              onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder={t('tools.loggedBy')}
              value={formData.organizer}
              onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* QR Code Section */}
          <Section id="qr" title={t('tools.tenantOnboarding') || 'Tenant Onboarding'} isExpanded={expandedSections.has('qr')} onToggle={toggleSection}>
            <div className="text-sm text-gray-600 mb-3">
              {t('tools.qrCodeHelp') || 'Generate a QR code for this tenant to create their own profile and join the community.'}
            </div>
            {showQRCode && qrUrl ? (
              <div className="text-center space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getQRImageUrl(qrUrl)}
                  alt="Profile creation QR code"
                  className="mx-auto border border-gray-200 rounded-lg"
                />
                <div className="text-xs text-gray-500 break-all max-w-[200px] mx-auto">
                  {qrUrl}
                </div>
                <p className="text-xs text-gray-400">
                  {t('tools.qrScanHelp')}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateQR}
                className="w-full py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {t('tools.generateQR') || 'Generate QR Code'}
              </button>
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-rstu-red-dark transition-colors"
          >
            {t('common.save') || 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
