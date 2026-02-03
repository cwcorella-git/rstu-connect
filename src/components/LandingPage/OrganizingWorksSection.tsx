'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { EditableText } from '@/components/EditMode'
import { CitationLink } from '@/components/Citations'

export function OrganizingWorksSection() {
  const { t } = useLanguage()

  return (
    <section className="py-10 sm:py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <EditableText
          tKey="landing.organizing.title"
          as="h2"
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center"
        />
        <EditableText
          tKey="landing.organizing.subtitle"
          as="p"
          className="text-center text-gray-700 mb-12 max-w-2xl mx-auto"
          multiline
        />

        {/* Victories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* KC Tenants */}
          <div className="border-l-4 border-rstu-red p-6 bg-gray-50 rounded">
            <EditableText
              tKey="landing.organizing.kc.title"
              as="h3"
              className="text-2xl font-bold text-gray-900 mb-2"
            />
            <p className="text-sm text-rstu-red font-semibold mb-3">
              <EditableText tKey="landing.organizing.kc.stat" as="span" />
              <CitationLink id="kc-tenants-strike" number={1} />
            </p>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.kc.win1" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.kc.win2" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.kc.win3" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.kc.win4" as="span" />
              </li>
            </ul>
          </div>

          {/* New York */}
          <div className="border-l-4 border-rstu-red p-6 bg-gray-50 rounded">
            <EditableText
              tKey="landing.organizing.ny.title"
              as="h3"
              className="text-2xl font-bold text-gray-900 mb-2"
            />
            <p className="text-sm text-rstu-red font-semibold mb-3">
              <EditableText tKey="landing.organizing.ny.stat" as="span" />
              <CitationLink id="ny-good-cause-eviction" number={2} />
            </p>
            <EditableText
              tKey="landing.organizing.ny.description"
              as="p"
              className="text-gray-700 text-sm mb-3"
              multiline
            />
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.ny.win1" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.ny.win2" as="span" />
              </li>
            </ul>
          </div>

          {/* California */}
          <div className="border-l-4 border-rstu-red p-6 bg-gray-50 rounded">
            <EditableText
              tKey="landing.organizing.ca.title"
              as="h3"
              className="text-2xl font-bold text-gray-900 mb-2"
            />
            <p className="text-sm text-rstu-red font-semibold mb-3">
              <EditableText tKey="landing.organizing.ca.stat" as="span" />
              <CitationLink id="california-ab-1482" number={3} />
            </p>
            <EditableText
              tKey="landing.organizing.ca.description"
              as="p"
              className="text-gray-700 text-sm mb-3"
              multiline
            />
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.ca.win1" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.ca.win2" as="span" />
              </li>
            </ul>
          </div>

          {/* Oregon */}
          <div className="border-l-4 border-rstu-red p-6 bg-gray-50 rounded">
            <EditableText
              tKey="landing.organizing.or.title"
              as="h3"
              className="text-2xl font-bold text-gray-900 mb-2"
            />
            <p className="text-sm text-rstu-red font-semibold mb-3">
              <EditableText tKey="landing.organizing.or.stat" as="span" />
              <CitationLink id="oregon-rent-control" number={4} />
            </p>
            <EditableText
              tKey="landing.organizing.or.description"
              as="p"
              className="text-gray-700 text-sm mb-3"
              multiline
            />
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.or.win1" as="span" />
              </li>
              <li className="flex items-start">
                <span className="text-rstu-red mr-2">✓</span>
                <EditableText tKey="landing.organizing.or.win2" as="span" />
              </li>
            </ul>
          </div>
        </div>

        {/* Key Message */}
        <div className="bg-rstu-red text-white p-8 rounded-lg text-center">
          <EditableText
            tKey="landing.organizing.message"
            as="p"
            className="text-lg sm:text-xl"
            multiline
          />
        </div>
      </div>
    </section>
  )
}
