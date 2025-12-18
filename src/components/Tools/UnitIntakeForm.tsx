'use client'

import { useState, useEffect } from 'react'
import {
  updateUnit,
  COMPLAINT_CATEGORIES,
  INTEREST_LEVELS,
  getStatusLabel,
  type UnitRecord,
  type ContactStatus,
} from '@/lib/canvassStorage'
import { buildProfileQRUrl, createInvite, canAccessTools } from '@/lib/profileStorage'

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

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function UnitIntakeForm({ buildingId, buildingAddress, unit, onClose, onSave }: UnitIntakeFormProps) {
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
  })

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['status', 'contact']))
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

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

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-200">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.has(id) ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expandedSections.has(id) && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Unit {unit.unitNumber}</h2>
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
          <Section id="status" title="Status">
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
          <Section id="contact" title="Contact Info">
            <input
              type="text"
              placeholder="Name / Nickname"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="email"
              placeholder="Email"
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
                Phone
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="preferredContact"
                  checked={formData.preferredContact === 'text'}
                  onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'text' }))}
                />
                Text
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="preferredContact"
                  checked={formData.preferredContact === 'email'}
                  onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'email' }))}
                />
                Email
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
          <Section id="household" title="Household">
            <input
              type="number"
              placeholder="# of occupants"
              value={formData.occupants || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, occupants: parseInt(e.target.value) || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Children:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasChildren"
                  checked={formData.hasChildren === true}
                  onChange={() => setFormData(prev => ({ ...prev, hasChildren: true }))}
                />
                Yes
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasChildren"
                  checked={formData.hasChildren === false}
                  onChange={() => setFormData(prev => ({ ...prev, hasChildren: false }))}
                />
                No
              </label>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Pets:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasPets"
                  checked={formData.hasPets === true}
                  onChange={() => setFormData(prev => ({ ...prev, hasPets: true }))}
                />
                Yes
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasPets"
                  checked={formData.hasPets === false}
                  onChange={() => setFormData(prev => ({ ...prev, hasPets: false }))}
                />
                No
              </label>
            </div>
            {formData.hasPets && (
              <input
                type="text"
                placeholder="Pet types"
                value={formData.petTypes}
                onChange={(e) => setFormData(prev => ({ ...prev, petTypes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            )}
            <input
              type="text"
              placeholder="Accessibility needs"
              value={formData.accessibilityNeeds}
              onChange={(e) => setFormData(prev => ({ ...prev, accessibilityNeeds: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* Lease & Rent */}
          <Section id="lease" title="Lease & Rent">
            <div className="flex gap-2">
              <span className="text-gray-600 text-sm pt-2">$</span>
              <input
                type="number"
                placeholder="Rent amount"
                value={formData.rentAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: parseInt(e.target.value) || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <span className="text-gray-600 text-sm pt-2">/month</span>
            </div>
            <input
              type="text"
              placeholder="Move-in date (e.g., 2019 or Jan 2020)"
              value={formData.moveInDate}
              onChange={(e) => setFormData(prev => ({ ...prev, moveInDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Lease:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="leaseType"
                  checked={formData.leaseType === 'fixed'}
                  onChange={() => setFormData(prev => ({ ...prev, leaseType: 'fixed' }))}
                />
                Fixed-term
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="leaseType"
                  checked={formData.leaseType === 'month-to-month'}
                  onChange={() => setFormData(prev => ({ ...prev, leaseType: 'month-to-month' }))}
                />
                Month-to-month
              </label>
            </div>
            {formData.leaseType === 'fixed' && (
              <input
                type="text"
                placeholder="Lease expires (e.g., March 2025)"
                value={formData.leaseExpires}
                onChange={(e) => setFormData(prev => ({ ...prev, leaseExpires: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            )}
            <div className="flex gap-2">
              <span className="text-gray-600 text-sm pt-2">Deposit: $</span>
              <input
                type="number"
                placeholder="Security deposit"
                value={formData.securityDeposit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: parseInt(e.target.value) || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="Deposit issues (if any)"
              value={formData.depositIssues}
              onChange={(e) => setFormData(prev => ({ ...prev, depositIssues: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* Schedule */}
          <Section id="schedule" title="Schedule & Availability">
            <input
              type="text"
              placeholder="Work hours (e.g., 9-5 M-F)"
              value={formData.workHours}
              onChange={(e) => setFormData(prev => ({ ...prev, workHours: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Best time to reach"
              value={formData.bestTimeToReach}
              onChange={(e) => setFormData(prev => ({ ...prev, bestTimeToReach: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <div>
              <span className="text-sm text-gray-600 mb-2 block">Best days:</span>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.bestDays?.includes(day)
                        ? 'bg-rstu-red text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Complaints */}
          <Section id="complaints" title="Complaints">
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
              placeholder="Complaint details..."
              value={formData.complaintDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, complaintDetails: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* Maintenance */}
          <Section id="maintenance" title="Maintenance Experience">
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Reliability:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="maintenanceRating"
                  checked={formData.maintenanceRating === 'good'}
                  onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'good' }))}
                />
                Good
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="maintenanceRating"
                  checked={formData.maintenanceRating === 'ok'}
                  onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'ok' }))}
                />
                OK
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="maintenanceRating"
                  checked={formData.maintenanceRating === 'bad'}
                  onChange={() => setFormData(prev => ({ ...prev, maintenanceRating: 'bad' }))}
                />
                Bad
              </label>
            </div>
            <input
              type="number"
              placeholder="Avg response time (days)"
              value={formData.avgResponseDays || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, avgResponseDays: parseInt(e.target.value) || undefined }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Outstanding repair requests"
              value={formData.outstandingRepairs}
              onChange={(e) => setFormData(prev => ({ ...prev, outstandingRepairs: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* Community & Interest */}
          <Section id="interest" title="Community & Interest">
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Knows neighbors:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="knowsNeighbors"
                  checked={formData.knowsNeighbors === 'yes'}
                  onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'yes' }))}
                />
                Yes
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="knowsNeighbors"
                  checked={formData.knowsNeighbors === 'somewhat'}
                  onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'somewhat' }))}
                />
                Some
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="knowsNeighbors"
                  checked={formData.knowsNeighbors === 'no'}
                  onChange={() => setFormData(prev => ({ ...prev, knowsNeighbors: 'no' }))}
                />
                No
              </label>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600 text-sm pt-2">Ideal rent: $</span>
              <input
                type="number"
                placeholder="Ideal rent"
                value={formData.idealRent || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, idealRent: parseInt(e.target.value) || undefined }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">Prior organizing experience:</span>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasOrganizingExperience"
                  checked={formData.hasOrganizingExperience === true}
                  onChange={() => setFormData(prev => ({ ...prev, hasOrganizingExperience: true }))}
                />
                Yes
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="hasOrganizingExperience"
                  checked={formData.hasOrganizingExperience === false}
                  onChange={() => setFormData(prev => ({ ...prev, hasOrganizingExperience: false }))}
                />
                No
              </label>
            </div>

            <div className="mt-3">
              <span className="text-sm text-gray-600 mb-2 block">Interest level:</span>
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
          <Section id="notes" title="Suggestions & Notes">
            <textarea
              placeholder="What would you like to see changed?"
              value={formData.suggestions}
              onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <textarea
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Follow-up date (e.g., Jan 15, 2025)"
              value={formData.followUpDate}
              onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Logged by (organizer name)"
              value={formData.organizer}
              onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Section>

          {/* QR Code Section */}
          <Section id="qr" title="Tenant Onboarding">
            <div className="text-sm text-gray-600 mb-3">
              Generate a QR code for this tenant to create their own profile and join the community.
            </div>
            {showQRCode && qrUrl ? (
              <div className="text-center space-y-3">
                <img
                  src={getQRImageUrl(qrUrl)}
                  alt="Profile creation QR code"
                  className="mx-auto border border-gray-200 rounded-lg"
                />
                <div className="text-xs text-gray-500 break-all max-w-[200px] mx-auto">
                  {qrUrl}
                </div>
                <p className="text-xs text-gray-400">
                  Tenant scans this to create their profile with unit pre-filled
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
                Generate QR Code
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
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-rstu-red-dark transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
