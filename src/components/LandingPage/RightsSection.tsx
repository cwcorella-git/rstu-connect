'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { EditableText } from '@/components/EditMode'
import { LegislationText } from '@/components/Legislation'

export function RightsSection() {
  const { t } = useLanguage()

  return (
    <section className="py-10 sm:py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <EditableText
          tKey="landing.rights.title"
          as="h2"
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center"
        />
        <EditableText
          tKey="landing.rights.subtitle"
          as="p"
          className="text-center text-gray-700 mb-12 max-w-2xl mx-auto"
          multiline
        />

        {/* Rights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Habitability */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <EditableText
              tKey="landing.rights.habitability.title"
              as="h3"
              className="text-xl font-bold text-rstu-red mb-3"
            />
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <EditableText tKey="landing.rights.habitability.weatherproof" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <EditableText tKey="landing.rights.habitability.plumbing" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <EditableText tKey="landing.rights.habitability.heat" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <EditableText tKey="landing.rights.habitability.pest" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <EditableText tKey="landing.rights.habitability.structure" as="span" />
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4 italic">
              <LegislationText>{t('landing.rights.habitability.nrs')}</LegislationText>
            </p>
          </div>

          {/* Anti-Retaliation */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <EditableText
              tKey="landing.rights.retaliation.title"
              as="h3"
              className="text-xl font-bold text-rstu-red mb-3"
            />
            <EditableText
              tKey="landing.rights.retaliation.description"
              as="p"
              className="text-gray-700 text-sm mb-4"
              multiline
            />
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <EditableText tKey="landing.rights.retaliation.organize" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <EditableText tKey="landing.rights.retaliation.report" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-3 mt-1">•</span>
                <EditableText tKey="landing.rights.retaliation.union" as="span" />
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4 italic">
              <LegislationText>{t('landing.rights.retaliation.nrs')}</LegislationText>
            </p>
          </div>
        </div>

        {/* Remedies Section */}
        <div className="bg-white p-8 rounded-lg border border-gray-200">
          <EditableText
            tKey="landing.rights.remedies.title"
            as="h3"
            className="text-xl font-bold text-rstu-red mb-4"
          />
          <EditableText
            tKey="landing.rights.remedies.intro"
            as="p"
            className="text-gray-700 mb-6"
            multiline
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <EditableText
                tKey="landing.rights.remedies.essential.title"
                as="h4"
                className="font-semibold text-gray-900 mb-2"
              />
              <EditableText
                tKey="landing.rights.remedies.essential.text"
                as="p"
                className="text-gray-700 text-sm"
                multiline
              />
            </div>
            <div>
              <EditableText
                tKey="landing.rights.remedies.non_essential.title"
                as="h4"
                className="font-semibold text-gray-900 mb-2"
              />
              <EditableText
                tKey="landing.rights.remedies.non_essential.text"
                as="p"
                className="text-gray-700 text-sm"
                multiline
              />
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">⚠️ {t('landing.rights.remedies.warning.title')}</span>{' '}
              {t('landing.rights.remedies.warning.text')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
