'use client';

import type { EnhancedBuilding } from '@/lib/data/getBuildingsData';
import { useLanguage } from '@/contexts/LanguageContext';
import type { OnboardingFormData } from '../types';

interface StepReviewProps {
  formData: OnboardingFormData;
  onFormDataChange: (data: OnboardingFormData) => void;
  buildings: EnhancedBuilding[];
  onCreateProfile: () => void;
  isLoading: boolean;
  profileCreated: boolean;
}

export function StepReview({
  formData,
  buildings,
  onCreateProfile,
  isLoading,
  profileCreated,
}: StepReviewProps) {
  const { t } = useLanguage();
  // Find selected building
  const selectedBuilding = buildings.find((b) => b.chatSlug === formData.buildingId);

  function formatDate(dateString?: string): string {
    if (!dateString) return t('onboarding.notProvided');
    return dateString;
  }

  function formatCurrency(amount?: number): string {
    if (!amount) return t('onboarding.notProvided');
    return `$${amount.toLocaleString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('onboarding.reviewTitle')}</h2>
        <p className="text-sm sm:text-base text-gray-600">
          {t('onboarding.reviewDesc')}
        </p>
      </div>

      {/* Review sections */}
      <div className="space-y-4">
        {/* Identity Section */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('onboarding.yourIdentity')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('onboarding.nicknameLabel')}</span>
              <span className="font-medium text-gray-900">{formData.nickname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('onboarding.emailLabel')}</span>
              <span className="font-medium text-gray-900">{formData.email}</span>
            </div>
          </div>
        </div>

        {/* Invite Code Section - if provided */}
        {formData.inviteCode && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('onboarding.inviteCode')}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('onboarding.inviteCodeLabel')}</span>
              <span className="font-medium text-gray-900">{formData.inviteCode}</span>
            </div>
          </div>
        )}

        {/* Building Section - if selected */}
        {selectedBuilding && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('onboarding.yourBuilding')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('onboarding.addressLabel')}</span>
                <span className="font-medium text-gray-900">{selectedBuilding.address}</span>
              </div>
              {formData.unitNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('onboarding.unitLabel')}</span>
                  <span className="font-medium text-gray-900">{formData.unitNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">{t('onboarding.ownerLabel')}</span>
                <span className="font-medium text-gray-900 text-right">{selectedBuilding.owner}</span>
              </div>
            </div>
          </div>
        )}

        {/* Household Section - if any data provided */}
        {(formData.rentAmount || formData.occupants || formData.hasChildren || formData.hasPets || formData.moveInDate) && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">{t('onboarding.yourHousehold')}</h3>
            <div className="space-y-2 text-sm">
              {formData.rentAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('onboarding.monthlyRentLabel')}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(formData.rentAmount)}</span>
                </div>
              )}
              {formData.occupants && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('onboarding.occupantsLabel')}</span>
                  <span className="font-medium text-gray-900">{formData.occupants} {t('onboarding.people')}</span>
                </div>
              )}
              {formData.hasChildren !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('onboarding.childrenLabel')}</span>
                  <span className="font-medium text-gray-900">{formData.hasChildren ? t('onboarding.yes') : t('onboarding.no')}</span>
                </div>
              )}
              {formData.hasPets !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('onboarding.petsLabel')}</span>
                  <span className="font-medium text-gray-900">{formData.hasPets ? t('onboarding.yes') : t('onboarding.no')}</span>
                </div>
              )}
              {formData.moveInDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('onboarding.moveInDateLabel')}</span>
                  <span className="font-medium text-gray-900">{formatDate(formData.moveInDate)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 text-sm mb-2">{t('onboarding.sharedWithOrganizersOnlyTitle')}</h3>
          <ul className="text-xs sm:text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>{t('onboarding.privacyBullet1')}</li>
            <li>{t('onboarding.privacyBullet2')}</li>
            <li>{t('onboarding.privacyBullet3')}</li>
            <li>{t('onboarding.privacyBullet4')}</li>
          </ul>
        </div>

        {/* Terms Agreement */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
            {t('onboarding.termsAgreement')}
          </p>
        </div>
      </div>

      {/* Ready to create message */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <p className="text-sm font-medium text-green-800">
          {t('onboarding.allSet')}
        </p>
      </div>

      {/* Note about next steps */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          <strong>{t('onboarding.whatsNext')}</strong>
        </p>
        <ul className="text-xs sm:text-sm text-gray-700 list-disc list-inside mt-2 space-y-1">
          <li>{t('onboarding.nextStep1')}</li>
          <li>{t('onboarding.nextStep2')}</li>
          <li>{t('onboarding.nextStep3')}</li>
          <li>{t('onboarding.nextStep4')}</li>
        </ul>
      </div>
    </div>
  );
}
