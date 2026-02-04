'use client'

import React, { useState, useMemo } from 'react'
import { getNevadaGuidance, getAllNevadaGuidance, type NevadaNoticeGuidance } from '@/lib/storage/evictionDefenseStorage'

interface NevadaEvictionPlaybookProps {
  selectedNoticeType?: '3-day' | '5-day' | '7-day' | '30-day'
  onClose?: () => void
}

export function NevadaEvictionPlaybook({ selectedNoticeType, onClose }: NevadaEvictionPlaybookProps) {
  const [noticeType, setNoticeType] = useState<'3-day' | '5-day' | '7-day' | '30-day'>(selectedNoticeType || '3-day')
  const [expandedSection, setExpandedSection] = useState<string>('overview')

  const guidance = useMemo(() => getNevadaGuidance(noticeType), [noticeType])

  if (!guidance) {
    return <div className="p-4 text-gray-500">Notice type not found</div>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nevada Eviction Playbook</h2>
            <p className="text-sm text-gray-600 mt-1">Know your rights. Understand the legal process.</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Notice Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">Notice Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['3-day', '5-day', '7-day', '30-day'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setNoticeType(type)}
                className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                  noticeType === type
                    ? 'bg-rstu-red text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type} Notice
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{guidance.title}</h3>
          <p className="text-xs text-gray-600 mb-2">{guidance.statute}</p>
          <p className="text-sm text-gray-700">{guidance.description}</p>
        </div>

        {/* Requirements */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'requirements' ? '' : 'requirements')}
            className="w-full p-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 flex items-center justify-between"
          >
            <h4 className="font-semibold text-gray-900 text-sm">Notice Requirements</h4>
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${expandedSection === 'requirements' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedSection === 'requirements' && (
            <div className="p-4 space-y-3">
              <div>
                <h5 className="text-xs font-semibold text-gray-900 mb-2">Must Include:</h5>
                <ul className="space-y-1">
                  {guidance.requirements.mustInclude.map((item, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="text-rstu-red mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-gray-900 mb-2">Service Methods:</h5>
                <ul className="space-y-1">
                  {guidance.requirements.serviceMethod.map((item, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <p className="text-xs text-yellow-800">
                  <strong>Timeline:</strong> {guidance.requirements.timeline}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Common Defects */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'defects' ? '' : 'defects')}
            className="w-full p-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 flex items-center justify-between"
          >
            <h4 className="font-semibold text-gray-900 text-sm">Common Defects & How to Challenge</h4>
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${expandedSection === 'defects' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedSection === 'defects' && (
            <div className="p-4 space-y-3">
              {guidance.commonDefects.map((defect, i) => (
                <div key={i} className="bg-red-50 border border-red-200 rounded p-3">
                  <h5 className="text-sm font-semibold text-red-900 mb-1">{defect.defect}</h5>
                  <p className="text-xs text-red-700">{defect.howToChallenge}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tenant Options */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'options' ? '' : 'options')}
            className="w-full p-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 flex items-center justify-between"
          >
            <h4 className="font-semibold text-gray-900 text-sm">Your Options as a Tenant</h4>
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${expandedSection === 'options' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedSection === 'options' && (
            <div className="p-4 space-y-3">
              {guidance.tenantOptions.map((option, i) => (
                <div key={i} className="bg-green-50 border border-green-200 rounded p-3">
                  <h5 className="text-sm font-semibold text-green-900 mb-1">{option.option}</h5>
                  <div className="text-xs text-green-700 mb-2">
                    <strong>Deadline:</strong> {option.deadline}
                  </div>
                  <p className="text-xs text-green-700">{option.procedure}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Court Process */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'court' ? '' : 'court')}
            className="w-full p-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 flex items-center justify-between"
          >
            <h4 className="font-semibold text-gray-900 text-sm">Court Process & Your Rights</h4>
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${expandedSection === 'court' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedSection === 'court' && (
            <div className="p-4 space-y-3">
              {guidance.courtProcess.map((stage, i) => (
                <div key={i} className="bg-purple-50 border border-purple-200 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <h5 className="font-semibold text-purple-900 text-sm">{stage.stage}</h5>
                  </div>
                  <div className="text-xs text-purple-700 mb-2">
                    <strong>Timeline:</strong> {stage.timeline}
                  </div>
                  <div className="text-xs text-purple-700">
                    <strong>Your Rights:</strong>
                    <ul className="mt-1 space-y-1 ml-2">
                      {stage.tenantRights.map((right, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-0.5">✓</span>
                          <span>{right}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resources */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'resources' ? '' : 'resources')}
            className="w-full p-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 flex items-center justify-between"
          >
            <h4 className="font-semibold text-gray-900 text-sm">Legal Resources</h4>
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${expandedSection === 'resources' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          {expandedSection === 'resources' && (
            <div className="p-4 space-y-3">
              {guidance.resources.map((resource, i) => (
                <div key={i} className="bg-teal-50 border border-teal-200 rounded p-3">
                  <h5 className="text-sm font-semibold text-teal-900 mb-1">{resource.name}</h5>
                  <p className="text-xs text-teal-700 mb-1">
                    <strong>Contact:</strong> {resource.contact}
                  </p>
                  <p className="text-xs text-teal-700">
                    <strong>Services:</strong> {resource.services}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-100 rounded p-3 text-xs text-gray-600 italic">
          <p>
            This is educational material about Nevada tenant rights. It is not legal advice. For legal representation, contact Northern Nevada Legal Aid at (775) 321-1511 or visit lacsn.org.
          </p>
        </div>
      </div>
    </div>
  )
}
