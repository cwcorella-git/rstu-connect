'use client';

import { useState, useEffect } from 'react';
import type { OnboardingFormData } from '../types';

interface StepHouseholdProps {
  formData: OnboardingFormData;
  onFormDataChange: (data: OnboardingFormData) => void;
}

export function StepHousehold({ formData, onFormDataChange }: StepHouseholdProps) {
  const [rentAmount, setRentAmount] = useState(formData.rentAmount?.toString() || '');
  const [occupants, setOccupants] = useState(formData.occupants?.toString() || '');
  const [hasChildren, setHasChildren] = useState(formData.hasChildren ?? false);
  const [hasPets, setHasPets] = useState(formData.hasPets ?? false);
  const [moveInDate, setMoveInDate] = useState(formData.moveInDate || '');

  // Update form data whenever fields change
  useEffect(() => {
    onFormDataChange({
      ...formData,
      rentAmount: rentAmount ? parseInt(rentAmount, 10) : undefined,
      occupants: occupants ? parseInt(occupants, 10) : undefined,
      hasChildren: hasChildren || undefined,
      hasPets: hasPets || undefined,
      moveInDate: moveInDate || undefined,
    });
  }, [rentAmount, occupants, hasChildren, hasPets, moveInDate, formData, onFormDataChange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Tell us about your household (Optional)</h2>
        <p className="text-sm sm:text-base text-gray-600">
          This helps us understand the needs of your community and advocate more effectively.
        </p>
      </div>

      {/* Monthly Rent */}
      <div>
        <label htmlFor="rent-amount" className="block text-sm font-medium text-gray-700 mb-2">
          Monthly Rent
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
          <input
            id="rent-amount"
            type="number"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            placeholder="1200"
            min="0"
            step="50"
            className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Help us track market rents and share this data with other tenants.</p>
      </div>

      {/* Number of Occupants */}
      <div>
        <label htmlFor="occupants" className="block text-sm font-medium text-gray-700 mb-2">
          Number of People in Your Unit
        </label>
        <input
          id="occupants"
          type="number"
          value={occupants}
          onChange={(e) => setOccupants(e.target.value)}
          placeholder="2"
          min="1"
          max="20"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">Include yourself and any roommates or family members.</p>
      </div>

      {/* Children and Pets - Toggle options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Do you have children living with you?</label>
          <div className="flex gap-3">
            <button
              onClick={() => setHasChildren(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                hasChildren
                  ? 'bg-rstu-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setHasChildren(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                !hasChildren
                  ? 'bg-rstu-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Do you have pets?</label>
          <div className="flex gap-3">
            <button
              onClick={() => setHasPets(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                hasPets
                  ? 'bg-rstu-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setHasPets(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                !hasPets
                  ? 'bg-rstu-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* Move-in Date */}
      <div>
        <label htmlFor="move-in-date" className="block text-sm font-medium text-gray-700 mb-2">
          When did you move in? (Optional)
        </label>
        <input
          id="move-in-date"
          type="text"
          value={moveInDate}
          onChange={(e) => setMoveInDate(e.target.value)}
          placeholder="e.g., January 2023 or 1/15/2023"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">Any format works - we're flexible!</p>
      </div>

      {/* Info section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Your data is private:</strong> We use this information to understand housing conditions and advocate
          for better policies. Your information is never shared with landlords or third parties.
        </p>
      </div>
    </div>
  );
}
