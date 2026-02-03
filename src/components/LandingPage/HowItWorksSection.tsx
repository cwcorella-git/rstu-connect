'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useEditMode } from '@/contexts/EditModeContext'

interface Step {
  icon: string
  title: string
  description: string
}

interface HowItWorksSectionProps {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const DEFAULT_STEPS: Step[] = [
  {
    icon: '🏢',
    title: 'Find Your Building',
    description: 'Search 16,000+ rental properties in Washoe County. See who owns your building, how many units there are, and whether neighbors are organizing.',
  },
  {
    icon: '💬',
    title: 'Join the Conversation',
    description: 'Every building has a chat room. Introduce yourself, share concerns, coordinate with neighbors, and plan actions together.',
  },
  {
    icon: '📚',
    title: 'Learn from the Library',
    description: 'Access thousands of resources on tenant rights, organizing tactics, labor history, and housing theory. Build knowledge together.',
  },
  {
    icon: '🤝',
    title: 'Give & Receive Mutual Aid',
    description: 'Post needs or offers. Share skills with neighbors. Build a support network that makes your community resilient.',
  },
  {
    icon: '🗺️',
    title: 'Use Organizer Tools',
    description: 'Track outreach with canvassing tools. Map building power structures. Run campaigns and coordinate collective action.',
  },
  {
    icon: '📊',
    title: 'Track Your Impact',
    description: 'Create a profile to compare your rent, qualify as a building delegate, and see your organizing activity over time.',
  },
]

export function HowItWorksSection({ config }: HowItWorksSectionProps) {
  const { t } = useLanguage()
  const { isEditMode } = useEditMode()

  const heading = (config.heading as string) || t('landing.howItWorks.heading')
  const subtitle = (config.subtitle as string) || t('landing.howItWorks.subtitle')
  const steps = (config.steps as Step[]) || DEFAULT_STEPS

  return (
    <section className="py-12 sm:py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className={`text-3xl sm:text-4xl font-bold text-gray-900 mb-4 ${
              isEditMode ? 'outline-dashed outline-2 outline-blue-300 outline-offset-2' : ''
            }`}
          >
            {heading}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-rstu-red text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="text-4xl mb-4">{step.icon}</div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
