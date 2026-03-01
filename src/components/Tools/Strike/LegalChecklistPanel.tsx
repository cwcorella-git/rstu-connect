'use client'

import { useState, ReactNode } from 'react'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import type { StrikePreparation } from '@/lib/storage/strikeStorage'
import { LegislationLink } from '@/components/Legislation'
import {
  getHabitabilityScore,
  getBuildingCanvass,
} from '@/lib/storage/canvassStorage'
import {
  updateLegalChecklist,
  addNoticeSent,
  setEscrowAccount,
  setLegalClinicConsultation,
} from '@/lib/storage/strikeStorage'
import { TemplateLibrary } from './TemplateLibrary'

interface LegalChecklistPanelProps {
  strikePrep: StrikePreparation
  building: EnhancedBuilding
}

export function LegalChecklistPanel({
  strikePrep,
  building,
}: LegalChecklistPanelProps) {
  const habitabilityScore = getHabitabilityScore(building.chatSlug)
  const canvass = getBuildingCanvass(building.chatSlug)

  const [showEscrowForm, setShowEscrowForm] = useState(false)
  const [escrowBank, setEscrowBank] = useState('')
  const [escrowAccount, setEscrowAccountNumber] = useState('')

  const [showClinicForm, setShowClinicForm] = useState(false)
  const [clinicDate, setClinicDate] = useState('')
  const [attorneyName, setAttorneyName] = useState('')
  const [clinicNotes, setClinicNotes] = useState('')

  const handleAddEscrow = () => {
    if (escrowBank && escrowAccount) {
      setEscrowAccount(strikePrep.id, escrowBank, escrowAccount)
      setEscrowBank('')
      setEscrowAccountNumber('')
      setShowEscrowForm(false)
    }
  }

  const handleAddClinicConsultation = () => {
    if (clinicDate) {
      setLegalClinicConsultation(
        strikePrep.id,
        'Northern Nevada Legal Aid',
        clinicDate,
        attorneyName,
        clinicNotes
      )
      setClinicDate('')
      setAttorneyName('')
      setClinicNotes('')
      setShowClinicForm(false)
    }
  }

  const hasHabitabilityDocumentation = !!(habitabilityScore && habitabilityScore.score !== null && habitabilityScore.score < 50)
  const hasNotices = strikePrep.legalChecklist.noticesSent.length > 0
  const hasEscrow = strikePrep.legalChecklist.escrowAccount !== null
  const hasClinicConsult = strikePrep.legalChecklist.legalClinicConsultation !== null

  return (
    <div className="space-y-4">
      {/* 1. Habitability Documentation */}
      <ChecklistItem
        complete={hasHabitabilityDocumentation}
        title="Habitability Issues Documented"
        description="Building condition score must be below 50 (Poor) to justify rent strike"
        tooltip="Nevada law (NRS 118A.355) only allows rent withholding for serious habitability violations. Use the Canvassing Tool to document issues like mold, broken heating, pest infestations, or non-functional plumbing. A score below 50 shows violations serious enough to justify collective action."
      >
        {habitabilityScore && habitabilityScore.score !== null ? (
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Current Score:</span>
              <span
                className={`text-lg font-bold ${
                  (habitabilityScore.score as number) < 50
                    ? 'text-red-600'
                    : (habitabilityScore.score as number) < 75
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`}
              >
                {habitabilityScore.score}/100
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Status: <span className="font-medium capitalize">{habitabilityScore.status}</span>
            </p>
            {habitabilityScore.summary.topIssue && (
              <p className="text-xs text-gray-600 mt-2">
                Top issue: <strong>{habitabilityScore.summary.topIssue.label}</strong> ({' '}
                {habitabilityScore.summary.topIssue.count} units)
              </p>
            )}
          </div>
        ) : (
          <div className="mt-2 p-3 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-red-700">
              ⚠️ No habitability data yet. <a href="#" className="underline font-medium">
              Use Canvassing Tool to document issues
              </a>
            </p>
          </div>
        )}
      </ChecklistItem>

      {/* 2. Landlord Notice */}
      <ChecklistItem
        complete={hasNotices}
        title="Landlord Notice Sent"
        description={<>Nevada law requires 14-day notice for habitability issues (<LegislationLink citation="NRS 118A.355" />) or 48-hour notice for essential services (<LegislationLink citation="NRS 118A.380" />)</>}
        tooltip="Send the notice by certified mail (keep proof). 14-day is for serious issues like broken heat or mold. 48-hour is for emergencies like no water/electricity. The notice must cite specific habitability violations and give the landlord time to respond before rent withholding begins."
      >
        {hasNotices ? (
          <div className="mt-2 space-y-2">
            {strikePrep.legalChecklist.noticesSent.map((notice, idx) => (
              <div key={idx} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-900">{notice.type} Notice</span>
                  <span className="text-xs text-green-600">
                    {notice.dateSent ? new Date(notice.dateSent).toLocaleDateString() : 'No date'}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Recipients: {notice.recipients.join(', ')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2">
            <TemplateLibrary strikePrep={strikePrep} building={building} />
          </div>
        )}
      </ChecklistItem>

      {/* 3. Escrow Account */}
      <ChecklistItem
        complete={hasEscrow}
        title="Escrow Account Established"
        description="Rent must be deposited into escrow account (not withheld entirely) per NRS 118A.355"
        tooltip="Nevada law requires rent to be held in escrow, not withheld. This protects tenants from eviction and shows the landlord you're serious. The escrow account holds rent safely until the landlord makes repairs or a settlement is reached. Your attorney can advise on escrow procedures."
      >
        {hasEscrow ? (
          <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
            <div className="text-sm">
              <p className="font-medium text-green-900 mb-2">✓ Escrow Account Setup</p>
              <div className="space-y-1 text-xs text-green-800">
                <p><span className="font-medium">Bank:</span> {strikePrep.legalChecklist.escrowAccount?.bankName}</p>
                <p><span className="font-medium">Account:</span> ••••{
                  strikePrep.legalChecklist.escrowAccount?.accountNumber?.slice(-4)
                }</p>
                <p><span className="font-medium">Set Up:</span> {
                  strikePrep.legalChecklist.escrowAccount?.setupDate
                    ? new Date(strikePrep.legalChecklist.escrowAccount.setupDate).toLocaleDateString()
                    : 'Unknown'
                }</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            {!showEscrowForm ? (
              <button
                onClick={() => setShowEscrowForm(true)}
                className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded border border-blue-200 transition-colors"
              >
                Record Escrow Account
              </button>
            ) : (
              <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-200">
                <input
                  type="text"
                  placeholder="Bank Name (e.g., Wells Fargo)"
                  value={escrowBank}
                  onChange={(e) => setEscrowBank(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Account Number (will mask last 4 digits)"
                  value={escrowAccount}
                  onChange={(e) => setEscrowAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddEscrow}
                    disabled={!escrowBank || !escrowAccount}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium rounded transition-colors"
                  >
                    Save Account
                  </button>
                  <button
                    onClick={() => setShowEscrowForm(false)}
                    className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </ChecklistItem>

      {/* 4. Legal Clinic Consultation */}
      <ChecklistItem
        complete={hasClinicConsult}
        title="Legal Clinic Consultation"
        description="CRITICAL: Consult with Northern Nevada Legal Aid before authorizing strike"
        critical
        tooltip="Legal aid attorneys will review your notice, advise on timing, help set up escrow, and prepare you for potential eviction. Most importantly, they provide free representation if the landlord retaliates. This is your legal safety net."
      >
        {hasClinicConsult ? (
          <div className="mt-2 p-3 bg-green-50 rounded border border-green-200">
            <div className="text-sm">
              <p className="font-medium text-green-900 mb-2">✓ Consultation Completed</p>
              <div className="space-y-1 text-xs text-green-800">
                <p><span className="font-medium">Clinic:</span> {
                  strikePrep.legalChecklist.legalClinicConsultation?.clinic
                }</p>
                {strikePrep.legalChecklist.legalClinicConsultation?.attorney && (
                  <p><span className="font-medium">Attorney:</span> {
                    strikePrep.legalChecklist.legalClinicConsultation.attorney
                  }</p>
                )}
                <p><span className="font-medium">Date:</span> {
                  strikePrep.legalChecklist.legalClinicConsultation?.consultDate
                    ? new Date(strikePrep.legalChecklist.legalClinicConsultation.consultDate).toLocaleDateString()
                    : 'Unknown'
                }</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-800 font-medium mb-2">Northern Nevada Legal Aid</p>
              <div className="space-y-1 text-xs text-orange-700">
                <p><strong>Phone:</strong> (775) 284-3491</p>
                <p><strong>Eligibility:</strong> 125% of Federal Poverty Guidelines</p>
              </div>
            </div>

            {!showClinicForm ? (
              <button
                onClick={() => setShowClinicForm(true)}
                className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded border border-blue-200 transition-colors"
              >
                Record Clinic Consultation
              </button>
            ) : (
              <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-200">
                <input
                  type="date"
                  value={clinicDate}
                  onChange={(e) => setClinicDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Attorney Name (optional)"
                  value={attorneyName}
                  onChange={(e) => setAttorneyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <textarea
                  placeholder="Notes from consultation (optional)"
                  value={clinicNotes}
                  onChange={(e) => setClinicNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddClinicConsultation}
                    disabled={!clinicDate}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium rounded transition-colors"
                  >
                    Save Consultation
                  </button>
                  <button
                    onClick={() => setShowClinicForm(false)}
                    className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </ChecklistItem>

      {/* Legal Resources */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Nevada Rent Strike Law</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• <strong><LegislationLink citation="NRS 118A.355" />:</strong> Habitability violations (14-day notice, escrow required)</li>
          <li>• <strong><LegislationLink citation="NRS 118A.380" />:</strong> Essential services failures (48-hour notice, no escrow)</li>
          <li>• <strong>Assembly Bill 223:</strong> Escrow protections & expedited relief</li>
        </ul>
      </div>
    </div>
  )
}

interface ChecklistItemProps {
  complete: boolean
  title: string
  description: ReactNode
  critical?: boolean
  tooltip?: string
  children: React.ReactNode
}

function ChecklistItem({
  complete,
  title,
  description,
  critical = false,
  tooltip,
  children,
}: ChecklistItemProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className={`rounded-lg border p-3 ${
        complete
          ? 'bg-green-50 border-green-200'
          : critical
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {complete ? (
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
              <p className="text-xs text-gray-600 mt-0.5">{description}</p>
            </div>
            {tooltip && (
              <div className="relative flex-shrink-0 mt-0.5">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Show more info"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {showTooltip && (
                  <div className="absolute top-6 right-0 z-50 w-48 p-2 text-xs bg-gray-900 text-white rounded-lg shadow-lg">
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
