'use client';

import { useState, useRef, useCallback } from 'react';
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

  // Use ref to avoid stale closure issues with formData
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Update parent when values change
  const updateParent = useCallback((updates: Partial<OnboardingFormData>) => {
    onFormDataChange({
      ...formDataRef.current,
      ...updates,
    });
  }, [onFormDataChange]);

  const handleRentChange = (value: string) => {
    setRentAmount(value);
    updateParent({ rentAmount: value ? parseInt(value, 10) : undefined });
  };

  const handleOccupantsChange = (value: string) => {
    setOccupants(value);
    updateParent({ occupants: value ? parseInt(value, 10) : undefined });
  };

  const handleChildrenChange = (value: boolean) => {
    setHasChildren(value);
    updateParent({ hasChildren: value || undefined });
  };

  const handlePetsChange = (value: boolean) => {
    setHasPets(value);
    updateParent({ hasPets: value || undefined });
  };

  const handleMoveInChange = (value: string) => {
    setMoveInDate(value);
    updateParent({ moveInDate: value || undefined });
  };

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
            onChange={(e) => handleRentChange(e.target.value)}
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
          onChange={(e) => handleOccupantsChange(e.target.value)}
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
              onClick={() => handleChildrenChange(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                hasChildren
                  ? 'bg-rstu-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleChildrenChange(false)}
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
              onClick={() => handlePetsChange(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                hasPets
                  ? 'bg-rstu-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handlePetsChange(false)}
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
          onChange={(e) => handleMoveInChange(e.target.value)}
          placeholder="e.g., January 2023 or 1/15/2023"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-rstu-red focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">Any format works - we&apos;re flexible!</p>
      </div>

      {/* Info section */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800 leading-relaxed">
          <strong>Shared with organizers only:</strong> This data helps us understand housing conditions and
          advocate for better policies. Your household information is visible only to verified organizers,
          never to landlords, property managers, or third parties.
        </p>
      </div>
    </div>
  );
}
