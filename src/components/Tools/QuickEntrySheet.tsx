'use client'

import { useState, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  updateUnit,
  type UnitRecord,
  type ContactStatus,
  HABITABILITY_ISSUES,
} from '@/lib/storage/canvassStorage'

interface QuickEntrySheetProps {
  buildingId: string
  buildingAddress: string
  unit: UnitRecord
  onClose: () => void
  onSave: () => void
  onNext?: () => void
}

// Quick status options matching Google Form
const QUICK_STATUSES: { status: ContactStatus; label: string; icon: string; color: string }[] = [
  { status: 'NO_ANSWER', label: 'No Answer', icon: '!', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { status: 'INTERESTED', label: 'Interested', icon: '✓', color: 'bg-green-100 text-green-700 border-green-200' },
  { status: 'NOT_INTERESTED', label: 'Not Int.', icon: '✗', color: 'bg-red-100 text-red-700 border-red-200' },
  { status: 'FOLLOW_UP', label: 'Come Back', icon: '?', color: 'bg-orange-100 text-orange-700 border-orange-200' },
]

// Common languages
const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'tagalog', label: 'Tagalog' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'other', label: 'Other' },
]

// Quick issues (subset of full habitability list)
const QUICK_ISSUES = [
  { key: 'rent_increase', label: 'Rent' },
  { key: 'pests_roaches', label: 'Pests' },
  { key: 'heat_inadequate', label: 'HVAC' },
  { key: 'plumbing_leaks', label: 'Repairs' },
  { key: 'mold', label: 'Mold' },
  { key: 'security_locks', label: 'Security' },
]

export function QuickEntrySheet({
  buildingId,
  buildingAddress,
  unit,
  onClose,
  onSave,
  onNext,
}: QuickEntrySheetProps) {
  const { t } = useLanguage()

  // Local state for form
  const [status, setStatus] = useState<ContactStatus>(unit.status)
  const [language, setLanguage] = useState(unit.language || 'english')
  const [enthusiasm, setEnthusiasm] = useState<1 | 2 | 3 | 4 | 5>(unit.enthusiasm || 3)
  const [issues, setIssues] = useState<string[]>(unit.habitabilityIssues || [])
  const [showContact, setShowContact] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [name, setName] = useState(unit.name || '')
  const [phone, setPhone] = useState(unit.phone || '')
  const [email, setEmail] = useState(unit.email || '')
  const [notes, setNotes] = useState(unit.notes || '')

  // Toggle issue
  const toggleIssue = useCallback((key: string) => {
    setIssues(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }, [])

  // Handle status tap - auto-save for quick updates
  const handleStatusTap = useCallback((newStatus: ContactStatus) => {
    setStatus(newStatus)
  }, [])

  // Handle save
  const handleSave = useCallback(() => {
    updateUnit(buildingId, unit.unitNumber, {
      status,
      language,
      enthusiasm,
      habitabilityIssues: issues.length > 0 ? issues : undefined,
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      contactDate: status !== 'NOT_CONTACTED' ? Date.now() : undefined,
    })
    onSave()
  }, [buildingId, unit.unitNumber, status, language, enthusiasm, issues, name, phone, email, notes, onSave])

  // Handle save and next
  const handleSaveAndNext = useCallback(() => {
    updateUnit(buildingId, unit.unitNumber, {
      status,
      language,
      enthusiasm,
      habitabilityIssues: issues.length > 0 ? issues : undefined,
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      contactDate: status !== 'NOT_CONTACTED' ? Date.now() : undefined,
    })
    if (onNext) {
      onNext()
    } else {
      onSave()
    }
  }, [buildingId, unit.unitNumber, status, language, enthusiasm, issues, name, phone, email, notes, onSave, onNext])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div
        className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up"
        style={{ animationDuration: '200ms' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <h3 className="font-semibold text-gray-900">
            {t('fieldMode.unit')} {unit.unitNumber}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status buttons */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              {t('fieldMode.response')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_STATUSES.map(({ status: s, label, icon, color }) => (
                <button
                  key={s}
                  onClick={() => handleStatusTap(s)}
                  className={`py-3 px-2 rounded-lg border-2 text-center transition-all ${
                    status === s
                      ? `${color} border-current ring-2 ring-offset-1 ring-current`
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl block mb-1">{icon}</span>
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language and Enthusiasm row */}
          <div className="flex gap-4">
            {/* Language */}
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('fieldMode.language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              >
                {LANGUAGES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Enthusiasm */}
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                {t('fieldMode.enthusiasm')}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnthusiasm(level as 1 | 2 | 3 | 4 | 5)}
                    className={`flex-1 py-2 text-lg transition-all ${
                      level <= enthusiasm
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-1">
                {enthusiasm === 1 && t('fieldMode.enthusiasmLeader')}
                {enthusiasm === 2 && t('fieldMode.enthusiasmVeryInterested')}
                {enthusiasm === 3 && t('fieldMode.enthusiasmModerate')}
                {enthusiasm === 4 && t('fieldMode.enthusiasmLow')}
                {enthusiasm === 5 && t('fieldMode.enthusiasmUnlikely')}
              </p>
            </div>
          </div>

          {/* Issues */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              {t('fieldMode.issues')}
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_ISSUES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleIssue(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    issues.includes(key)
                      ? 'bg-rstu-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Expandable sections */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowContact(!showContact)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                showContact || name || phone || email
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              + {t('fieldMode.contactInfo')}
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                showNotes || notes
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              + {t('fieldMode.notes')}
            </button>
          </div>

          {/* Contact info (expandable) */}
          {showContact && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('fieldMode.namePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('fieldMode.phonePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('fieldMode.emailPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red"
              />
            </div>
          )}

          {/* Notes (expandable) */}
          {showNotes && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('fieldMode.notesPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rstu-red resize-none"
            />
          )}
        </div>

        {/* Footer with save buttons */}
        <div className="flex gap-2 p-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={handleSave}
            className="flex-1 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {t('common.save')}
          </button>
          <button
            onClick={handleSaveAndNext}
            className="flex-1 py-3 text-sm font-medium text-white bg-rstu-red rounded-lg hover:bg-red-700"
          >
            {t('fieldMode.saveAndNext')} →
          </button>
        </div>
      </div>
    </div>
  )
}
