'use client'

import { useState, useMemo } from 'react'
import { type Victory, getVictoryTypeLabel } from '@/lib/victoryStorage'

interface VictoryAnnouncementProps {
  victory: Victory
  onClose: () => void
}

type TemplateType = 'social' | 'newsletter' | 'press'

export function VictoryAnnouncement({ victory, onClose }: VictoryAnnouncementProps) {
  const [templateType, setTemplateType] = useState<TemplateType>('social')
  const [copied, setCopied] = useState(false)

  // Generate templates
  const templates = useMemo(() => {
    const typeLabel = getVictoryTypeLabel(victory.type)
    const date = new Date(victory.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    // Format impact for display
    const impactLine = victory.quantifiedImpact
      ? `Impact: ${victory.quantifiedImpact}`
      : victory.monthlyRentReduction
        ? `$${victory.monthlyRentReduction.toLocaleString()}/month in rent savings`
        : victory.unitsAffected
          ? `${victory.unitsAffected} units affected`
          : null

    // Social media template (short, ~280 chars)
    const social = [
      `VICTORY! ${victory.title}`,
      '',
      impactLine || `A win for ${victory.landlordName ? `tenants vs ${victory.landlordName}` : 'tenants'}!`,
      '',
      victory.tactics?.length
        ? `Tactics: ${victory.tactics.slice(0, 3).join(', ')}`
        : null,
      '',
      '#TenantPower #HousingJustice #RentStrike',
    ].filter(Boolean).join('\n')

    // Newsletter template (medium)
    const newsletter = [
      `**${victory.title}**`,
      `*${typeLabel} - ${date}*`,
      '',
      victory.description,
      '',
      impactLine ? `**${impactLine}**` : null,
      '',
      victory.tactics?.length
        ? `**Tactics Used:**\n${victory.tactics.map(t => `- ${t}`).join('\n')}`
        : null,
      '',
      victory.memberQuote
        ? `> "${victory.memberQuote}"${victory.memberName ? `\n> \u2014 ${victory.memberName}` : ''}`
        : null,
      '',
      '---',
      '*This victory was documented by RSTU Connect*',
    ].filter(Boolean).join('\n')

    // Press release template (formal)
    const press = [
      'FOR IMMEDIATE RELEASE',
      '',
      `**${victory.title}**`,
      '',
      `${date} - Reno, NV`,
      '',
      victory.landlordName
        ? `Tenants organizing against ${victory.landlordName} have achieved a significant victory.`
        : 'Local tenants have achieved a significant organizing victory.',
      '',
      victory.description,
      '',
      '**Key Details:**',
      victory.unitsAffected ? `- Units Affected: ${victory.unitsAffected}` : null,
      victory.monthlyRentReduction ? `- Monthly Rent Savings: $${victory.monthlyRentReduction.toLocaleString()}` : null,
      victory.quantifiedImpact ? `- Impact: ${victory.quantifiedImpact}` : null,
      victory.duration ? `- Duration: ${victory.duration}` : null,
      '',
      victory.tactics?.length
        ? `**Organizing Tactics:**\n${victory.tactics.map(t => `- ${t}`).join('\n')}`
        : null,
      '',
      victory.memberQuote
        ? [
            '**Tenant Statement:**',
            `"${victory.memberQuote}"`,
            victory.memberName ? `\u2014 ${victory.memberName}, tenant organizer` : null,
          ].filter(Boolean).join('\n')
        : null,
      '',
      '**About Reno-Sparks Tenants Union:**',
      "RSTU is Nevada's first tenants union, organizing for housing justice and tenant power in the Reno-Sparks area.",
      '',
      '**Media Contact:**',
      'Reno-Sparks Tenants Union',
      'info@rstuconnect.org',
      '',
      '###',
    ].filter(Boolean).join('\n')

    return { social, newsletter, press }
  }, [victory])

  const currentTemplate = templates[templateType]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentTemplate)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Share Victory</h2>
              <p className="text-sm text-gray-500 mt-1">
                Generate shareable announcements
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Template selector */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setTemplateType('social')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                templateType === 'social'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Social Media
            </button>
            <button
              onClick={() => setTemplateType('newsletter')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                templateType === 'newsletter'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Newsletter
            </button>
            <button
              onClick={() => setTemplateType('press')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                templateType === 'press'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Press Release
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border border-gray-200">
            {currentTemplate}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy to Clipboard
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Tip: Edit the copied text as needed before posting
          </p>
        </div>
      </div>
    </div>
  )
}
