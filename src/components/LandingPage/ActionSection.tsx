'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { EditableText } from '@/components/shared/EditableText'

export function ActionSection() {
  const { t } = useLanguage()

  return (
    <section className="py-10 sm:py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <EditableText
          tKey="landing.action.title"
          as="h2"
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center"
        />
        <EditableText
          tKey="landing.action.subtitle"
          as="p"
          className="text-center text-gray-700 mb-12 max-w-2xl mx-auto"
          multiline
        />

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Legal Help */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <EditableText
              tKey="landing.action.legal.title"
              as="h3"
              className="text-xl font-bold text-rstu-red mb-4"
            />
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <EditableText
                  tKey="landing.action.legal.org1.name"
                  as="p"
                  className="font-semibold text-gray-900"
                />
                <p className="text-xs mt-1">
                  {t('landing.action.legal.org1.phone')}: (775) 284-3491 ext. 316
                </p>
              </div>
              <div>
                <EditableText
                  tKey="landing.action.legal.org2.name"
                  as="p"
                  className="font-semibold text-gray-900"
                />
                <p className="text-xs mt-1">
                  {t('landing.action.legal.org2.phone')}: (775) 329-2727
                </p>
              </div>
              <div>
                <EditableText
                  tKey="landing.action.legal.org3.name"
                  as="p"
                  className="font-semibold text-gray-900"
                />
                <EditableText
                  tKey="landing.action.legal.org3.description"
                  as="p"
                  className="text-xs mt-1"
                />
              </div>
            </div>
          </div>

          {/* Immediate Help */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <EditableText
              tKey="landing.action.emergency.title"
              as="h3"
              className="text-xl font-bold text-rstu-red mb-4"
            />
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <EditableText
                  tKey="landing.action.emergency.eviction.title"
                  as="p"
                  className="font-semibold text-gray-900"
                />
                <p className="text-xs mt-1">
                  {t('landing.action.emergency.eviction.phone')}: (775) 334-3310
                </p>
              </div>
              <div>
                <EditableText
                  tKey="landing.action.emergency.rental.title"
                  as="p"
                  className="font-semibold text-gray-900"
                />
                <EditableText
                  tKey="landing.action.emergency.rental.description"
                  as="p"
                  className="text-xs mt-1"
                />
              </div>
              <div>
                <EditableText
                  tKey="landing.action.emergency.code.title"
                  as="p"
                  className="font-semibold text-gray-900"
                />
                <p className="text-xs mt-1">
                  {t('landing.action.emergency.code.phone')}: (775) 334-4636
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Organize */}
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 mb-12">
          <EditableText
            tKey="landing.action.organize.title"
            as="h3"
            className="text-2xl font-bold text-gray-900 mb-6 text-center"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-rstu-red mb-3">1</div>
              <EditableText
                tKey="landing.action.organize.step1.title"
                as="h4"
                className="font-semibold text-gray-900 mb-2"
              />
              <EditableText
                tKey="landing.action.organize.step1.description"
                as="p"
                className="text-sm text-gray-700"
                multiline
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rstu-red mb-3">2</div>
              <EditableText
                tKey="landing.action.organize.step2.title"
                as="h4"
                className="font-semibold text-gray-900 mb-2"
              />
              <EditableText
                tKey="landing.action.organize.step2.description"
                as="p"
                className="text-sm text-gray-700"
                multiline
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rstu-red mb-3">3</div>
              <EditableText
                tKey="landing.action.organize.step3.title"
                as="h4"
                className="font-semibold text-gray-900 mb-2"
              />
              <EditableText
                tKey="landing.action.organize.step3.description"
                as="p"
                className="text-sm text-gray-700"
                multiline
              />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <EditableText
            tKey="landing.action.cta"
            as="p"
            className="text-lg text-gray-900 mb-6"
            multiline
          />
          <EditableText
            tKey="landing.action.contact_email"
            as="p"
            className="text-sm text-gray-600"
          />
        </div>
      </div>
    </section>
  )
}
