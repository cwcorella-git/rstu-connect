'use client'

import { useState } from 'react'
import {
  updateProfile,
  type UserProfile,
  canAccessTools,
} from '@/lib/profileStorage'
import { COMPLAINT_CATEGORIES, INTEREST_LEVELS } from '@/lib/canvassStorage'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'

interface ProfileEditorProps {
  profile: UserProfile
  buildings: EnhancedBuilding[]
  onSave: (updated: UserProfile) => void
  onCancel: () => void
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function ProfileEditor({ profile, buildings, onSave, onCancel }: ProfileEditorProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    nickname: profile.nickname,
    buildingId: profile.buildingId || '',
    buildingAddress: profile.buildingAddress || '',
    unitNumber: profile.unitNumber || '',
    phone: profile.phone || '',
    email: profile.email || '',
    preferredContact: profile.preferredContact,
    language: profile.language || 'English',
    occupants: profile.occupants,
    hasChildren: profile.hasChildren,
    hasPets: profile.hasPets,
    petTypes: profile.petTypes || '',
    accessibilityNeeds: profile.accessibilityNeeds || '',
    rentAmount: profile.rentAmount,
    moveInDate: profile.moveInDate || '',
    leaseType: profile.leaseType,
    leaseExpires: profile.leaseExpires || '',
    securityDeposit: profile.securityDeposit,
    workHours: profile.workHours || '',
    bestTimeToReach: profile.bestTimeToReach || '',
    bestDays: profile.bestDays || [],
    complaints: profile.complaints || [],
    complaintDetails: profile.complaintDetails || '',
    maintenanceRating: profile.maintenanceRating,
    outstandingRepairs: profile.outstandingRepairs || '',
    knowsNeighbors: profile.knowsNeighbors,
    hasOrganizingExperience: profile.hasOrganizingExperience,
    interestLevel: profile.interestLevel || [],
    suggestions: profile.suggestions || '',
  })

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['basic', 'contact'])
  )

  const isOrganizer = canAccessTools()

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
    updateProfile(formData)
    onSave({ ...profile, ...formData } as UserProfile)
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
        type="button"
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500">Update your information</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto">
        {/* Basic Info */}
        <Section id="basic" title="Basic Info">
          <input
            type="text"
            placeholder="Your name / nickname"
            value={formData.nickname}
            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
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

        {/* Your Building */}
        <Section id="building" title="Your Building">
          <select
            value={formData.buildingId || ''}
            onChange={(e) => {
              const selectedBuilding = buildings.find(b => b.chatSlug === e.target.value)
              setFormData(prev => ({
                ...prev,
                buildingId: e.target.value || undefined,
                buildingAddress: selectedBuilding?.address || undefined,
              }))
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Select your building...</option>
            {buildings.map((building) => (
              <option key={building.apn} value={building.chatSlug}>
                {building.address.split(',')[0]}
              </option>
            ))}
          </select>
          {formData.buildingId && (
            <input
              type="text"
              placeholder="Unit number (e.g., 101, A2)"
              value={formData.unitNumber || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          )}
          <p className="text-xs text-gray-400">
            Link your profile to see building-specific info and connect with organizers.
          </p>
        </Section>

        {/* Contact Info - Only organizers can see contact details */}
        <Section id="contact" title="Contact Info">
          {isOrganizer ? (
            <>
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
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Contact info is only visible to organizers
            </p>
          )}
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Preferred:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="preferredContact"
                checked={formData.preferredContact === 'phone'}
                onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'phone' }))}
              />
              Phone
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="preferredContact"
                checked={formData.preferredContact === 'text'}
                onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'text' }))}
              />
              Text
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="preferredContact"
                checked={formData.preferredContact === 'email'}
                onChange={() => setFormData(prev => ({ ...prev, preferredContact: 'email' }))}
              />
              Email
            </label>
          </div>
        </Section>

        {/* Household */}
        <Section id="household" title="Household">
          <input
            type="number"
            placeholder="Number of occupants"
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
        </Section>

        {/* Schedule */}
        <Section id="schedule" title="Availability">
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

        {/* Issues */}
        <Section id="issues" title="Issues & Complaints">
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
            placeholder="Details about your issues..."
            value={formData.complaintDetails}
            onChange={(e) => setFormData(prev => ({ ...prev, complaintDetails: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Maintenance:</span>
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
            type="text"
            placeholder="Outstanding repair requests"
            value={formData.outstandingRepairs}
            onChange={(e) => setFormData(prev => ({ ...prev, outstandingRepairs: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Section>

        {/* Interest */}
        <Section id="interest" title="Community & Interest">
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Know neighbors:</span>
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
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Organizing experience:</span>
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
            <span className="text-sm text-gray-600 mb-2 block">Interested in:</span>
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
          <textarea
            placeholder="What would you like to see changed?"
            value={formData.suggestions}
            onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </Section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
