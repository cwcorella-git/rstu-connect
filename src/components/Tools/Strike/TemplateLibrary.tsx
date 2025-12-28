'use client'

import { useState } from 'react'
import type { EnhancedBuilding } from '@/lib/getBuildingsData'
import type { StrikePreparation } from '@/lib/strikeStorage'
import {
  getHabitabilityScore,
  getBuildingCanvass,
} from '@/lib/canvassStorage'
import {
  downloadStrikeNoticePDF,
  getNoticeFilename,
} from '@/lib/strikeNoticePDF'
import { addNoticeSent } from '@/lib/strikeStorage'

interface TemplateLibraryProps {
  strikePrep: StrikePreparation
  building: EnhancedBuilding
}

export function TemplateLibrary({
  strikePrep,
  building,
}: TemplateLibraryProps) {
  const habitabilityScore = getHabitabilityScore(building.chatSlug)
  const canvass = getBuildingCanvass(building.chatSlug)

  const [selectedNoticeType, setSelectedNoticeType] = useState<'14-day' | '48-hour' | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Get issues for the notice
  const issues = habitabilityScore?.issueBreakdown.slice(0, 5) || []

  const handleGenerateNotice = () => {
    if (!selectedNoticeType || !habitabilityScore) return

    const pdf = generateNoticeData()
    if (pdf) {
      downloadStrikeNoticePDF(pdf, getNoticeFilename(selectedNoticeType, building.address))

      // Record notice as sent
      addNoticeSent(
        strikePrep.id,
        selectedNoticeType,
        [building.owner],
        new Date().toISOString()
      )

      // Reset
      setSelectedNoticeType(null)
      setShowForm(false)
    }
  }

  const generateNoticeData = () => {
    if (!selectedNoticeType || !habitabilityScore) return null

    const tenantNames = strikePrep.participation.committedUnits
      .map(unitId => {
        const unit = canvass?.units[unitId]
        return unit?.name || `Unit ${unit?.unitNumber || unitId}`
      })
      .filter(Boolean)

    return {
      noticeType: selectedNoticeType,
      recipientName: building.owner,
      propertyAddress: building.address,
      tenantNames,
      habitabilityIssues: issues,
      escrowBankName: strikePrep.legalChecklist.escrowAccount?.bankName || 'Bank Name',
      escrowAccountInfo: `••••${strikePrep.legalChecklist.escrowAccount?.accountNumber?.slice(-4) || '0000'}`,
      generatedDate: new Date(),
      organizationName: 'Reno-Sparks Tenants Union',
      organizationPhone: '(775) 555-UNION',
    }
  }

  return (
    <div className="space-y-4">
      {/* Notice Type Selection */}
      <div className="border rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Generate Legal Notices
        </h4>
        <p className="text-xs text-gray-600 mb-3">
          Select the notice type required by Nevada law for your situation:
        </p>

        <div className="space-y-2">
          {/* 14-Day Notice */}
          <NoticeOption
            type="14-day"
            title="14-Day Habitability Notice"
            subtitle="NRS 118A.355"
            description="Use when landlord violates habitability standards (mold, roaches, heat, etc.). Gives landlord 14 days to respond."
            icon="⚠️"
            selected={selectedNoticeType === '14-day'}
            onSelect={() => setSelectedNoticeType('14-day')}
            active={habitabilityScore && habitabilityScore.score < 50}
          />

          {/* 48-Hour Notice */}
          <NoticeOption
            type="48-hour"
            title="48-Hour Essential Services Notice"
            subtitle="NRS 118A.380"
            description="Use for critical failures (no water, gas, electricity). Gives landlord only 48 hours to respond."
            icon="🚨"
            selected={selectedNoticeType === '48-hour'}
            onSelect={() => setSelectedNoticeType('48-hour')}
            active={true}
          />
        </div>
      </div>

      {/* Selected Notice Preview */}
      {selectedNoticeType && (
        <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            {selectedNoticeType === '14-day' ? '14-Day Habitability Notice' : '48-Hour Essential Services Notice'}
          </h4>
          <div className="space-y-2 text-xs text-blue-800">
            <p><strong>To:</strong> {building.owner}</p>
            <p><strong>Property:</strong> {building.address}</p>
            <p><strong>Signed by:</strong> {strikePrep.participation.committedUnits.length} tenant(s)</p>
            <p><strong>Issues:</strong> {issues.map((i) => i.label).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Generate Notice */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          disabled={!selectedNoticeType}
          className={`w-full px-4 py-2 rounded font-medium transition-colors ${
            selectedNoticeType
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500'
          }`}
        >
          Generate & Download {selectedNoticeType === '14-day' ? '14-Day' : selectedNoticeType === '48-hour' ? '48-Hour' : ''} Notice
        </button>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleGenerateNotice}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors"
          >
            ✓ Download PDF & Record as Sent
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Sent Notices */}
      {strikePrep.legalChecklist.noticesSent.length > 0 && (
        <div className="border rounded-lg p-3 bg-green-50 border-green-200">
          <h4 className="text-sm font-semibold text-green-900 mb-2">
            Notices Sent ({strikePrep.legalChecklist.noticesSent.length})
          </h4>
          <div className="space-y-2">
            {strikePrep.legalChecklist.noticesSent.map((notice, idx) => (
              <div key={idx} className="text-xs text-green-800 p-2 bg-white rounded border border-green-200">
                <div className="font-medium">
                  {notice.type === '14-day' ? '📋 14-Day Habitability Notice' : '🚨 48-Hour Essential Services Notice'}
                </div>
                <div className="text-green-700 mt-1">
                  ✓ Sent {notice.dateSent ? new Date(notice.dateSent).toLocaleDateString() : 'Unknown date'}
                </div>
                <div className="text-green-600 mt-1">
                  To: {notice.recipients.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-orange-900 mb-2">
          ⚠️ Legal Requirements
        </h4>
        <ul className="text-xs text-orange-800 space-y-1">
          <li>
            <strong>NRS 118A.355 (14-day):</strong> For habitability violations. Rent must go to escrow.
          </li>
          <li>
            <strong>NRS 118A.380 (48-hour):</strong> For essential services failures. Escrow not required.
          </li>
          <li>
            <strong>Proof of Service:</strong> Keep copies of sent notices (certified mail recommended).
          </li>
          <li>
            <strong>Legal Review:</strong> Call Northern Nevada Legal Aid (775) 284-3491 before sending.
          </li>
        </ul>
      </div>

      {/* Notice Template Options (Hidden) */}
      <details className="text-xs text-gray-600">
        <summary className="cursor-pointer font-medium">View Template Details</summary>
        <div className="mt-2 space-y-2 p-2 bg-gray-50 rounded">
          <p><strong>What the 14-Day Notice includes:</strong></p>
          <ul className="list-disc list-inside text-gray-600 mb-2">
            <li>Legal citation (NRS 118A.355)</li>
            <li>List of documented habitability issues</li>
            <li>Escrow account information</li>
            <li>14-day deadline for response</li>
            <li>Tenant signatures</li>
          </ul>

          <p><strong>What the 48-Hour Notice includes:</strong></p>
          <ul className="list-disc list-inside text-gray-600">
            <li>Legal citation (NRS 118A.380)</li>
            <li>Essential services failure description</li>
            <li>48-hour deadline for response</li>
            <li>Tenant signatures</li>
          </ul>
        </div>
      </details>
    </div>
  )
}

interface NoticeOptionProps {
  type: '14-day' | '48-hour'
  title: string
  subtitle: string
  description: string
  icon: string
  selected: boolean
  onSelect: () => void
  active: boolean
}

function NoticeOption({
  type,
  title,
  subtitle,
  description,
  icon,
  selected,
  onSelect,
  active,
}: NoticeOptionProps) {
  return (
    <button
      onClick={onSelect}
      disabled={!active}
      className={`w-full text-left p-3 rounded border-2 transition-colors ${
        selected
          ? 'bg-blue-50 border-blue-500'
          : active
            ? 'bg-white border-gray-200 hover:bg-gray-50'
            : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
          <div className="text-xs text-gray-600 mt-1">{description}</div>
        </div>
        {selected && (
          <div className="flex-shrink-0 text-blue-600">
            <span className="font-bold">✓</span>
          </div>
        )}
      </div>
    </button>
  )
}
