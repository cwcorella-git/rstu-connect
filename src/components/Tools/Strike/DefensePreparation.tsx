'use client'

import { useState } from 'react'
import type { EnhancedBuilding } from '@/lib/data/getBuildingsData'
import type { StrikePreparation } from '@/lib/storage/strikeStorage'
import { getBuildingCanvass } from '@/lib/storage/canvassStorage'
import {
  assignLegalAid,
  setCourtDate,
  addEvidence,
} from '@/lib/storage/strikeStorage'

interface DefensePreparationProps {
  strikePrep: StrikePreparation
  building: EnhancedBuilding
}

export function DefensePreparation({
  strikePrep,
  building,
}: DefensePreparationProps) {
  const canvass = getBuildingCanvass(building.chatSlug)
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const [evidenceType, setEvidenceType] = useState<'photo' | 'email' | 'repair-request' | 'inspector-report'>('photo')
  const [evidenceDescription, setEvidenceDescription] = useState('')

  const handleAddEvidence = () => {
    if (evidenceDescription) {
      addEvidence(
        strikePrep.id,
        evidenceType,
        evidenceDescription
      )
      setEvidenceDescription('')
      setEvidenceType('photo')
      setShowEvidenceForm(false)
    }
  }

  const commitmentCount = strikePrep.participation.committedUnits.length
  const assignmentCount = strikePrep.defense.legalAidAssignments.length
  const allAssigned = assignmentCount === commitmentCount && commitmentCount > 0

  return (
    <div className="space-y-4">
      {/* Legal Aid Coordination */}
      <div className="border rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Legal Aid Assignments
        </h4>
        <p className="text-xs text-gray-600 mb-3">
          Pre-coordinate with Northern Nevada Legal Aid to assign attorneys BEFORE landlord files evictions
        </p>
        {commitmentCount === 0 ? (
          <div className="p-2 bg-gray-50 rounded text-xs text-gray-500">
            Add committed units to assign attorneys.
          </div>
        ) : (
          <div className="space-y-2">
            {strikePrep.participation.committedUnits.map((unitId) => {
              const unit = canvass?.units[unitId]
              const assignment = strikePrep.defense.legalAidAssignments.find(
                (a) => a.unitId === unitId
              )

              return (
                <div
                  key={unitId}
                  className={`flex items-center justify-between p-2 rounded border ${
                    assignment?.attorneyName
                      ? 'bg-green-50 border-green-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Unit {unit?.unitNumber || unitId}
                    </div>
                    {assignment?.attorneyName && (
                      <div className="text-xs text-green-700 mt-0.5">
                        ✓ {assignment.attorneyName}
                      </div>
                    )}
                  </div>
                  {!assignment?.attorneyName ? (
                    <button
                      onClick={() => {
                        const name = prompt(`Attorney name for Unit ${unit?.unitNumber || unitId}?`)
                        if (name) {
                          assignLegalAid(strikePrep.id, unitId, name)
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Assign
                    </button>
                  ) : (
                    <div className="text-xs text-green-600 font-medium">✓ Assigned</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {allAssigned && (
          <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800 font-medium">
            ✓ All units have attorney assignments
          </div>
        )}
      </div>

      {/* Evidence Archive */}
      <div className="border rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Documentation Hub
        </h4>
        <p className="text-xs text-gray-600 mb-3">
          Archive evidence for court defense: photos, emails, repair requests, inspector reports
        </p>

        {strikePrep.defense.evidenceArchive.length > 0 && (
          <div className="space-y-2 mb-3">
            {strikePrep.defense.evidenceArchive.map((evidence, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-2 bg-gray-50 rounded border border-gray-200 text-xs"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {evidence.type === 'photo' && '📷 Photo'}
                    {evidence.type === 'email' && '📧 Email'}
                    {evidence.type === 'repair-request' && '📋 Repair Request'}
                    {evidence.type === 'inspector-report' && '📄 Inspector Report'}
                  </div>
                  <div className="text-gray-600">{evidence.description}</div>
                  <div className="text-gray-500 mt-1">
                    {new Date(evidence.dateCollected).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showEvidenceForm ? (
          <button
            onClick={() => setShowEvidenceForm(true)}
            className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded border border-blue-200 transition-colors"
          >
            + Add Evidence
          </button>
        ) : (
          <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-200">
            <select
              value={evidenceType}
              onChange={(e) =>
                setEvidenceType(
                  e.target.value as 'photo' | 'email' | 'repair-request' | 'inspector-report'
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="photo">📷 Photo</option>
              <option value="email">📧 Email</option>
              <option value="repair-request">📋 Repair Request</option>
              <option value="inspector-report">📄 Inspector Report</option>
            </select>
            <textarea
              placeholder="Description of evidence (e.g., location, date taken, issue shown)"
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddEvidence}
                disabled={!evidenceDescription}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium rounded transition-colors"
              >
                Save Evidence
              </button>
              <button
                onClick={() => setShowEvidenceForm(false)}
                className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Eviction Defense Checklist */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-red-900 mb-3">
          Eviction Defense Checklist
        </h4>
        <div className="space-y-2">
          <DefenseChecklistItem
            complete={allAssigned}
            label="All tenants have attorney assignments"
          />
          <DefenseChecklistItem
            complete={strikePrep.defense.evidenceArchive.length > 0}
            label="Evidence archive includes: photos, emails, repair requests"
          />
          <DefenseChecklistItem
            complete={strikePrep.legalChecklist.escrowAccount !== null}
            label="Escrow deposit receipts documented (proof rent was paid)"
          />
          <DefenseChecklistItem
            complete={strikePrep.legalChecklist.noticesSent.length > 0}
            label="Proof of service for all notices to landlord"
          />
          <DefenseChecklistItem
            complete={false}
            label="Habitability violations documented (photos, inspector reports)"
          />
        </div>
      </div>

      {/* Court Date Tracker */}
      {strikePrep.defense.legalAidAssignments.some((a) => a.courtDate) && (
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Court Date Tracker
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Track eviction filings and court dates for striking tenants
          </p>
          <div className="space-y-2">
            {strikePrep.defense.legalAidAssignments
              .filter((a) => a.courtDate)
              .map((assignment, idx) => {
                const unit = canvass?.units[assignment.unitId]
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded text-xs"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        Unit {unit?.unitNumber || assignment.unitId}
                      </div>
                      <div className="text-gray-600">
                        Attorney: {assignment.attorneyName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {assignment.courtDate
                          ? new Date(assignment.courtDate).toLocaleDateString()
                          : 'No date set'}
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 underline">
                        Details
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Legal Resources */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Eviction Defense Resources
        </h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p><strong>Northern Nevada Legal Aid:</strong> (775) 284-3491</p>
          <p><strong>Key Defense Strategy:</strong> Challenge validity of strike claim, document legal compliance</p>
          <p><strong>Timeline:</strong> Typically 30-60 days from filing to court date (strategy window)</p>
        </div>
      </div>
    </div>
  )
}

interface DefenseChecklistItemProps {
  complete: boolean
  label: string
}

function DefenseChecklistItem({ complete, label }: DefenseChecklistItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={complete}
        readOnly
        className="w-4 h-4 rounded"
      />
      <span className={complete ? 'text-green-800 font-medium' : 'text-red-800'}>
        {label}
      </span>
    </div>
  )
}
