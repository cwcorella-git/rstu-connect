'use client'

import { useState } from 'react'
import {
  HomeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  BanknotesIcon,
  ScaleIcon,
  KeyIcon,
  CurrencyDollarIcon,
  BoltIcon,
  LockClosedIcon,
  EllipsisHorizontalCircleIcon,
} from '@heroicons/react/24/outline'
import {
  type IssueCategory,
  type IssueSeverity,
  createCase,
} from '@/lib/escalationStorage'
import { getCurrentProfile } from '@/lib/profileStorage'

interface EscalationFormProps {
  buildingId: string
  buildingAddress: string
  onSuccess: () => void
  onCancel: () => void
}

const categoryOptions: { value: IssueCategory; label: string; icon: React.ComponentType<{ className?: string }>; examples: string }[] = [
  {
    value: 'habitability',
    label: 'Habitability',
    icon: HomeIcon,
    examples: 'Broken heating, plumbing, pests, mold, safety hazards',
  },
  {
    value: 'lease',
    label: 'Lease Violation',
    icon: DocumentTextIcon,
    examples: 'Landlord violating lease terms, illegal entry, service cuts',
  },
  {
    value: 'harassment',
    label: 'Harassment',
    icon: ExclamationTriangleIcon,
    examples: 'Threats, intimidation, discrimination, privacy violations',
  },
  {
    value: 'retaliation',
    label: 'Retaliation',
    icon: ShieldExclamationIcon,
    examples: 'Eviction threats after complaints, rent increases after organizing',
  },
  {
    value: 'rent',
    label: 'Rent Issues',
    icon: BanknotesIcon,
    examples: 'Unfair increases, illegal fees, sudden changes',
  },
  {
    value: 'discrimination',
    label: 'Discrimination',
    icon: ScaleIcon,
    examples: 'Protected class discrimination, refusal to rent, different lease terms',
  },
  {
    value: 'illegal_entry',
    label: 'Illegal Entry',
    icon: KeyIcon,
    examples: 'Entering without 24-hour notice, entering without permission',
  },
  {
    value: 'security_deposit',
    label: 'Security Deposit',
    icon: CurrencyDollarIcon,
    examples: 'Failure to return deposit, wrongful deductions, no itemized list',
  },
  {
    value: 'utilities',
    label: 'Utility Issues',
    icon: BoltIcon,
    examples: 'Illegal shutoffs, failure to maintain landlord-controlled utilities',
  },
  {
    value: 'eviction',
    label: 'Eviction / Lockout',
    icon: LockClosedIcon,
    examples: 'Illegal lockout, self-help eviction, improper eviction notice',
  },
  {
    value: 'other',
    label: 'Other',
    icon: EllipsisHorizontalCircleIcon,
    examples: 'Any other issue affecting tenants',
  },
]

const severityOptions: { value: IssueSeverity; label: string; description: string; color: string }[] = [
  {
    value: 'emergency',
    label: 'Emergency',
    description: 'Immediate danger to health/safety - no heat in winter, gas leak, flooding',
    color: 'text-red-600',
  },
  {
    value: 'serious',
    label: 'Serious',
    description: 'Significant impact on daily life - broken appliances, pest infestation',
    color: 'text-orange-600',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Ongoing problem - slow repairs, minor lease issues',
    color: 'text-yellow-600',
  },
  {
    value: 'minor',
    label: 'Minor',
    description: 'Inconvenience - cosmetic issues, small maintenance needs',
    color: 'text-gray-600',
  },
]

export function EscalationForm({
  buildingId,
  buildingAddress,
  onSuccess,
  onCancel,
}: EscalationFormProps) {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<IssueCategory>('habitability')
  const [severity, setSeverity] = useState<IssueSeverity>('moderate')
  const [affectedUnits, setAffectedUnits] = useState('')
  const [isBuildingWide, setIsBuildingWide] = useState(false)

  const profile = getCurrentProfile()

  const handleSubmit = () => {
    if (!profile) return

    const units = isBuildingWide
      ? ['building-wide']
      : affectedUnits.split(',').map(u => u.trim()).filter(Boolean)

    if (!title.trim() || !description.trim() || units.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    createCase({
      buildingId,
      buildingAddress,
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      affectedUnits: units,
      reportedBy: profile.id,
    })

    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Report an Issue</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{buildingAddress}</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Step {step} of 3</p>
        </div>

        {/* Step 1: Category */}
        {step === 1 && (
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">What type of issue is this?</h3>
            <div className="space-y-2">
              {categoryOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    category === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={opt.value}
                    checked={category === opt.value}
                    onChange={(e) => setCategory(e.target.value as IssueCategory)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium flex items-center gap-2">
                      <opt.icon className="w-5 h-5" />
                      {opt.label}
                    </p>
                    <p className="text-sm text-gray-500">{opt.examples}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Describe the issue</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Broken heating in north wing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the issue in detail. When did it start? How does it affect you?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How severe is this issue?
                </label>
                <div className="space-y-2">
                  {severityOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-2 border rounded-lg cursor-pointer ${
                        severity === opt.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={opt.value}
                        checked={severity === opt.value}
                        onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                        className="mt-1"
                      />
                      <div>
                        <p className={`font-medium ${opt.color}`}>{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!title.trim() || !description.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Affected Units */}
        {step === 3 && (
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Who is affected?</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBuildingWide}
                  onChange={(e) => setIsBuildingWide(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <p className="font-medium">Building-wide issue</p>
                  <p className="text-sm text-gray-500">This affects all tenants in the building</p>
                </div>
              </label>

              {!isBuildingWide && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Affected Unit Numbers <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={affectedUnits}
                    onChange={(e) => setAffectedUnits(e.target.value)}
                    placeholder="e.g., 4A, 4B, 5A, 5B"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple units with commas
                  </p>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Category:</span> {categoryOptions.find(c => c.value === category)?.label}</p>
                  <p><span className="text-gray-500">Severity:</span> <span className={severityOptions.find(s => s.value === severity)?.color}>{severity}</span></p>
                  <p><span className="text-gray-500">Title:</span> {title}</p>
                  <p><span className="text-gray-500">Affected:</span> {isBuildingWide ? 'Building-wide' : affectedUnits || '(not specified)'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isBuildingWide && !affectedUnits.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Report Issue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
