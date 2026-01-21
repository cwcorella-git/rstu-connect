'use client';

import type { EnhancedBuilding } from '@/lib/getBuildingsData';
import type { OnboardingFormData } from '../types';

interface StepReviewProps {
  formData: OnboardingFormData;
  onFormDataChange: (data: OnboardingFormData) => void;
  buildings: EnhancedBuilding[];
  onCreateProfile: () => void;
  isLoading: boolean;
  profileCreated: boolean;
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Not provided';
  return dateString;
}

function formatCurrency(amount?: number): string {
  if (!amount) return 'Not provided';
  return `$${amount.toLocaleString()}`;
}

export function StepReview({
  formData,
  buildings,
  onCreateProfile,
  isLoading,
  profileCreated,
}: StepReviewProps) {
  // Find selected building
  const selectedBuilding = buildings.find((b) => b.chatSlug === formData.buildingId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Review Your Profile</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Make sure everything looks good before we create your account.
        </p>
      </div>

      {/* Review sections */}
      <div className="space-y-4">
        {/* Identity Section */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Your Identity</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nickname:</span>
              <span className="font-medium text-gray-900">{formData.nickname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{formData.email}</span>
            </div>
          </div>
        </div>

        {/* Invite Code Section - if provided */}
        {formData.inviteCode && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Invite Code</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Code:</span>
              <span className="font-medium text-gray-900">{formData.inviteCode}</span>
            </div>
          </div>
        )}

        {/* Building Section - if selected */}
        {selectedBuilding && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Your Building</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-gray-900">{selectedBuilding.address}</span>
              </div>
              {formData.unitNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit:</span>
                  <span className="font-medium text-gray-900">{formData.unitNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Owner:</span>
                <span className="font-medium text-gray-900 text-right">{selectedBuilding.owner}</span>
              </div>
            </div>
          </div>
        )}

        {/* Household Section - if any data provided */}
        {(formData.rentAmount || formData.occupants || formData.hasChildren || formData.hasPets || formData.moveInDate) && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Your Household</h3>
            <div className="space-y-2 text-sm">
              {formData.rentAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(formData.rentAmount)}</span>
                </div>
              )}
              {formData.occupants && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupants:</span>
                  <span className="font-medium text-gray-900">{formData.occupants} people</span>
                </div>
              )}
              {formData.hasChildren !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Children:</span>
                  <span className="font-medium text-gray-900">{formData.hasChildren ? 'Yes' : 'No'}</span>
                </div>
              )}
              {formData.hasPets !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pets:</span>
                  <span className="font-medium text-gray-900">{formData.hasPets ? 'Yes' : 'No'}</span>
                </div>
              )}
              {formData.moveInDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Move-in Date:</span>
                  <span className="font-medium text-gray-900">{formatDate(formData.moveInDate)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 text-sm mb-2">Shared With Organizers Only</h3>
          <ul className="text-xs sm:text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>Your profile is visible only to verified organizers and neighbors in your building</li>
            <li>We never share your information with landlords, property managers, or third parties</li>
            <li>Aggregate rent data (without names) helps us advocate for better policies</li>
            <li>You can edit or delete your profile anytime from the Profile tab</li>
          </ul>
        </div>

        {/* Terms Agreement */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
            By creating this profile, you agree to RSTU's community guidelines and privacy policy. We're committed
            to protecting tenant privacy and building power for housing justice.
          </p>
        </div>
      </div>

      {/* Ready to create message */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <p className="text-sm font-medium text-green-800">
          ✓ You're all set! Click the button below to create your profile and join your community.
        </p>
      </div>

      {/* Note about next steps */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          <strong>What's next?</strong> After creating your profile, you'll be able to:
        </p>
        <ul className="text-xs sm:text-sm text-gray-700 list-disc list-inside mt-2 space-y-1">
          <li>Chat with neighbors in your building</li>
          <li>Join organizing blocs and campaigns</li>
          <li>Track and report maintenance issues</li>
          <li>Access organizing resources and guides</li>
        </ul>
      </div>
    </div>
  );
}
