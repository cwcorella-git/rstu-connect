'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getCurrentProfile, UserProfile } from '@/lib/storage/profileStorage'
import {
  SkillProfile,
  SkillCategory,
  SkillEntry,
  SKILL_LABELS,
  getSkillProfiles,
  getSkillProfile,
  saveSkillProfile,
  deleteSkillProfile,
} from '@/lib/storage/mutualAidStorage'

const SKILL_CATEGORIES = Object.keys(SKILL_LABELS) as SkillCategory[]

interface SkillsTabProps {
  onSelectSkill?: (skill: SkillProfile) => void
}

export function SkillsTab({ onSelectSkill }: SkillsTabProps) {
  const { t } = useLanguage()
  const [skills, setSkills] = useState<SkillProfile[]>([])
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mySkillProfile, setMySkillProfile] = useState<SkillProfile | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Translated skill labels
  const getSkillLabel = (category: SkillCategory): string => {
    const labels: Record<SkillCategory, string> = {
      translation: t('skills.translation'),
      legal: t('skills.legalKnowledge'),
      tech: t('skills.techSupport'),
      transportation: t('skills.transportation'),
      labor: t('skills.physicalLabor'),
      childcare: t('skills.childcare'),
      cooking: t('skills.cookingFood'),
      media: t('skills.mediaPR'),
      other: t('skills.other'),
    }
    return labels[category]
  }

  // Form state
  const [selectedSkills, setSelectedSkills] = useState<SkillEntry[]>([])
  const [availability, setAvailability] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [languageInput, setLanguageInput] = useState('')

  // Load data
  useEffect(() => {
    const currentProfile = getCurrentProfile()
    setProfile(currentProfile)
    setSkills(getSkillProfiles())

    if (currentProfile) {
      const myProfile = getSkillProfile(currentProfile.id)
      setMySkillProfile(myProfile)

      // Pre-populate form if we have existing skills
      if (myProfile) {
        setSelectedSkills(myProfile.skills)
        setAvailability(myProfile.availability)
        setLanguages(myProfile.languages || [])
      }
    }
  }, [])

  // Filter skills by category
  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'all') return skills
    return skills.filter(s => s.skills.some(skill => skill.category === selectedCategory))
  }, [skills, selectedCategory])

  // Toggle skill selection
  const handleToggleSkill = (category: SkillCategory) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.category === category)
      if (exists) {
        return prev.filter(s => s.category !== category)
      }
      return [...prev, { category, description: '' }]
    })
  }

  // Update skill description
  const handleSkillDescription = (category: SkillCategory, description: string) => {
    setSelectedSkills(prev =>
      prev.map(s =>
        s.category === category ? { ...s, description } : s
      )
    )
  }

  // Add language
  const handleAddLanguage = () => {
    const lang = languageInput.trim()
    if (lang && !languages.includes(lang)) {
      setLanguages(prev => [...prev, lang])
    }
    setLanguageInput('')
  }

  // Remove language
  const handleRemoveLanguage = (lang: string) => {
    setLanguages(prev => prev.filter(l => l !== lang))
  }

  // Save skill profile
  const handleSaveSkills = () => {
    if (!profile || selectedSkills.length === 0) return

    const skillProfile: SkillProfile = {
      memberId: profile.id,
      memberName: profile.nickname,
      buildingApn: profile.buildingId || undefined,
      buildingAddress: undefined, // Would need to look up from buildings
      skills: selectedSkills,
      availability: availability || 'Contact for availability',
      contactPreference: 'chat',
      languages: languages.length > 0 ? languages : undefined,
    }

    saveSkillProfile(skillProfile)
    setMySkillProfile(skillProfile)
    setSkills(getSkillProfiles())
    setShowForm(false)
  }

  // Delete skill profile
  const handleDeleteSkills = () => {
    if (!profile) return
    deleteSkillProfile(profile.id)
    setMySkillProfile(null)
    setSelectedSkills([])
    setAvailability('')
    setLanguages([])
    setSkills(getSkillProfiles())
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with filters */}
      <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-gray-900">{t('mutualAid.skills') || 'Skills'}</h2>
          {profile && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1 text-xs font-medium bg-rstu-red text-white rounded hover:bg-red-700 transition-colors"
            >
              {mySkillProfile ? t('mutualAid.editYourSkills') || 'Edit Your Skills' : t('mutualAid.registerYourSkills') || 'Register Your Skills'}
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('mutualAid.all') || 'All'}
          </button>
          {SKILL_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getSkillLabel(category)}
            </button>
          ))}
        </div>
      </div>

      {/* Skills list */}
      <div className="flex-1 overflow-y-auto">
        {filteredSkills.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-gray-600 font-medium mb-1">{t('mutualAid.noSkillsRegistered') || 'No skills registered yet'}</p>
            <p className="text-sm text-gray-500 mb-4">
              {t('mutualAid.beTheFirst') || 'Be the first to share your skills with the community!'}
            </p>
            {profile && !mySkillProfile && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 text-sm font-medium bg-rstu-red text-white rounded-lg hover:bg-red-700"
              >
                {t('mutualAid.registerYourSkills') || 'Register Your Skills'}
              </button>
            )}
            {!profile && (
              <p className="text-xs text-gray-400">{t('mutualAid.createProfileToRegisterSkills') || 'Create a profile to register your skills'}</p>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredSkills.map(skillProfile => (
              <button
                key={skillProfile.memberId}
                onClick={() => onSelectSkill?.(skillProfile)}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">
                      {skillProfile.memberName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{skillProfile.memberName}</h3>
                      {skillProfile.memberId === profile?.id && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                          {t('status.you').replace(/[()]/g, '')}
                        </span>
                      )}
                    </div>

                    {/* Skills badges */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {skillProfile.skills.map(skill => (
                        <span
                          key={skill.category}
                          className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
                        >
                          {getSkillLabel(skill.category)}
                        </span>
                      ))}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {skillProfile.availability && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {skillProfile.availability}
                        </span>
                      )}
                      {skillProfile.languages && skillProfile.languages.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          {skillProfile.languages.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Skills Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {mySkillProfile ? t('mutualAid.editYourSkills') : t('mutualAid.registerYourSkills')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {/* Skill Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('mutualAid.whatSkillsOffer')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SKILL_CATEGORIES.map(category => {
                    const isSelected = selectedSkills.some(s => s.category === category)
                    return (
                      <button
                        key={category}
                        onClick={() => handleToggleSkill(category)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-purple-300 bg-purple-50 text-purple-700 font-medium'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {getSkillLabel(category)}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Skill Descriptions */}
              {selectedSkills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('mutualAid.describeSkills')}
                  </label>
                  {selectedSkills.map(skill => (
                    <div key={skill.category} className="mb-2">
                      <label className="block text-xs text-gray-500 mb-1">
                        {getSkillLabel(skill.category)}
                      </label>
                      <input
                        type="text"
                        value={skill.description || ''}
                        onChange={(e) => handleSkillDescription(skill.category, e.target.value)}
                        placeholder={t('mutualAid.briefDescription')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Weekends, Evenings after 6pm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages spoken
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage()}
                    placeholder="Add a language..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rstu-red focus:border-transparent"
                  />
                  <button
                    onClick={handleAddLanguage}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                {languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {lang}
                        <button
                          onClick={() => handleRemoveLanguage(lang)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              {mySkillProfile && (
                <button
                  onClick={handleDeleteSkills}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSkills}
                disabled={selectedSkills.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  selectedSkills.length > 0
                    ? 'bg-rstu-red hover:bg-red-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {t('mutualAid.saveSkills') || 'Save Skills'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
