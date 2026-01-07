'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-3 text-center">
        <p className="text-xs text-gray-500 m-0">
          <a
            href="https://renosparkstenantsunion.org"
            className="text-rstu-red hover:text-rstu-red-dark font-medium"
          >
            {t('footer.mainSite')}
          </a>
          {' · '}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSc4Fgq0sW7BFHfFLDvM8NIUIKLtnkDTC9RwUQ1rLin8ZqyoSQ/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            {t('footer.contact')}
          </a>
          {' · '}
          <span>{t('footer.copyright')}</span>
        </p>
      </div>
    </footer>
  )
}
