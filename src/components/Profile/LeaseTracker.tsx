'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  getLeaseData,
  saveLeaseData,
  addRentHistoryEntry,
  removeRentHistoryEntry,
  getLeaseSummary,
  getImportantDates,
  generateLeaseEndICS,
  formatCurrency,
  formatDate,
  daysUntil,
  calculateRentIncreasePercent,
  NEVADA_RENT_NOTICE_DAYS,
  NEVADA_LATE_FEE_MAX_PERCENT,
  NEVADA_SECURITY_DEPOSIT_MAX_MONTHS,
  type LeaseData,
  type RentHistoryEntry,
} from '@/lib/leaseStorage'

interface LeaseTrackerProps {
  userRent?: number // Optional - pre-fill from profile
  onUpdateRent?: (rent: number) => void // Callback to sync rent to profile
}

export function LeaseTracker({ userRent, onUpdateRent }: LeaseTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [leaseData, setLeaseData] = useState<LeaseData | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showAddRent, setShowAddRent] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    isMonthToMonth: false,
    monthlyRent: '',
    securityDeposit: '',
    landlordName: '',
    notes: '',
  })

  // New rent entry
  const [newRentEntry, setNewRentEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: '',
  })

  // Load lease data
  useEffect(() => {
    const data = getLeaseData()
    setLeaseData(data)
    if (data) {
      setFormData({
        startDate: data.startDate,
        endDate: data.endDate,
        isMonthToMonth: data.isMonthToMonth,
        monthlyRent: data.monthlyRent.toString(),
        securityDeposit: data.securityDeposit.toString(),
        landlordName: data.landlordName || '',
        notes: data.notes || '',
      })
    } else if (userRent) {
      // Pre-fill from profile
      setFormData(prev => ({ ...prev, monthlyRent: userRent.toString() }))
    }
  }, [userRent])

  const summary = useMemo(() => getLeaseSummary(), [leaseData])
  const importantDates = useMemo(() => getImportantDates(), [leaseData])

  const handleSave = () => {
    const rent = parseFloat(formData.monthlyRent) || 0
    const deposit = parseFloat(formData.securityDeposit) || 0

    const saved = saveLeaseData({
      startDate: formData.startDate,
      endDate: formData.isMonthToMonth ? '' : formData.endDate,
      isMonthToMonth: formData.isMonthToMonth,
      monthlyRent: rent,
      securityDeposit: deposit,
      landlordName: formData.landlordName || undefined,
      notes: formData.notes || undefined,
    })

    setLeaseData(saved)
    setShowEditForm(false)

    // Sync rent to profile if callback provided
    if (onUpdateRent && rent > 0) {
      onUpdateRent(rent)
    }
  }

  const handleAddRentEntry = () => {
    const amount = parseFloat(newRentEntry.amount)
    if (!amount || !newRentEntry.date) return

    const entry: RentHistoryEntry = {
      date: newRentEntry.date,
      amount,
      notes: newRentEntry.notes || undefined,
    }

    const updated = addRentHistoryEntry(entry)
    if (updated) {
      setLeaseData(updated)
      setNewRentEntry({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        notes: '',
      })
      setShowAddRent(false)

      // Sync to profile
      if (onUpdateRent) {
        onUpdateRent(updated.monthlyRent)
      }
    }
  }

  const handleRemoveRentEntry = (date: string) => {
    const updated = removeRentHistoryEntry(date)
    if (updated) {
      setLeaseData(updated)
    }
  }

  const handleDownloadCalendar = () => {
    if (!leaseData) return

    const ics = generateLeaseEndICS(leaseData)
    if (!ics) return

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lease-reminder.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Warning level color
  const getWarningColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'expired': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Lease Tracker</h3>
            {summary.hasLease ? (
              <p className="text-sm text-gray-500">
                {summary.monthlyRent > 0 && `${formatCurrency(summary.monthlyRent)}/mo`}
                {summary.daysUntilEnd >= 0 && ` - ${summary.daysUntilEnd} days remaining`}
                {summary.warningLevel === 'none' && ' - Month-to-month'}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Track your lease dates and rent history</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          {!leaseData && !showEditForm ? (
            /* No lease data - prompt to add */
            <div className="text-center py-6">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-4">No lease information saved yet</p>
              <button
                onClick={() => setShowEditForm(true)}
                className="px-4 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Add Lease Details
              </button>
            </div>
          ) : showEditForm ? (
            /* Edit Form */
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Lease Details</h4>

              {/* Month-to-month toggle */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isMonthToMonth}
                  onChange={(e) => setFormData({ ...formData, isMonthToMonth: e.target.checked })}
                  className="rounded border-gray-300 text-rstu-red focus:ring-rstu-red"
                />
                <span className="text-sm text-gray-700">Month-to-month lease</span>
              </label>

              {/* Date fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Lease Start</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                {!formData.isMonthToMonth && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lease End</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Financial fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Monthly Rent</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={formData.monthlyRent}
                      onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Security Deposit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={formData.securityDeposit}
                      onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Landlord */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Landlord / Management</label>
                <input
                  type="text"
                  value={formData.landlordName}
                  onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                  placeholder="Property manager or landlord name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any important lease terms or notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 bg-rstu-red text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Lease Summary View */
            <div className="space-y-4">
              {/* Important Dates Alert */}
              {importantDates.length > 0 && (
                <div className="space-y-2">
                  {importantDates.map((date, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-md border ${getWarningColor(date.warning ? 'warning' : 'ok')}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{date.label}</span>
                          <span className="text-sm ml-2">{formatDate(date.date)}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {date.daysUntil === 0 ? 'Today' : `${date.daysUntil} days`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lease Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Monthly Rent</span>
                  <p className="font-medium text-gray-900">{formatCurrency(leaseData!.monthlyRent)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Security Deposit</span>
                  <p className="font-medium text-gray-900">{formatCurrency(leaseData!.securityDeposit)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Lease Type</span>
                  <p className="font-medium text-gray-900">
                    {leaseData!.isMonthToMonth ? 'Month-to-month' : 'Fixed term'}
                  </p>
                </div>
                {leaseData!.landlordName && (
                  <div>
                    <span className="text-xs text-gray-500">Landlord</span>
                    <p className="font-medium text-gray-900">{leaseData!.landlordName}</p>
                  </div>
                )}
              </div>

              {/* Rent History */}
              {leaseData!.rentHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Rent History</h4>
                    <button
                      onClick={() => setShowAddRent(true)}
                      className="text-xs text-rstu-red hover:underline"
                    >
                      + Add Entry
                    </button>
                  </div>
                  <div className="space-y-1">
                    {leaseData!.rentHistory.map((entry, i) => {
                      const prev = i > 0 ? leaseData!.rentHistory[i - 1].amount : null
                      const increase = prev ? calculateRentIncreasePercent(prev, entry.amount) : null
                      return (
                        <div
                          key={entry.date}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="text-sm font-medium">{formatCurrency(entry.amount)}</span>
                            <span className="text-xs text-gray-500 ml-2">{formatDate(entry.date)}</span>
                            {entry.notes && (
                              <span className="text-xs text-gray-400 ml-2">({entry.notes})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {increase !== null && increase > 0 && (
                              <span className="text-xs text-red-600">+{increase}%</span>
                            )}
                            <button
                              onClick={() => handleRemoveRentEntry(entry.date)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Add Rent Entry Form */}
              {showAddRent && (
                <div className="p-3 bg-gray-50 rounded-md space-y-3">
                  <h5 className="text-sm font-medium text-gray-700">Add Rent Entry</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={newRentEntry.date}
                      onChange={(e) => setNewRentEntry({ ...newRentEntry, date: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={newRentEntry.amount}
                        onChange={(e) => setNewRentEntry({ ...newRentEntry, amount: e.target.value })}
                        placeholder="Amount"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newRentEntry.notes}
                    onChange={(e) => setNewRentEntry({ ...newRentEntry, notes: e.target.value })}
                    placeholder="Notes (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddRentEntry}
                      className="flex-1 py-2 bg-rstu-red text-white rounded-md text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddRent(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Nevada Law Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                <h5 className="text-sm font-medium text-blue-800 mb-2">Nevada Tenant Rights</h5>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>{NEVADA_RENT_NOTICE_DAYS} days written notice required for rent increases</li>
                  <li>Late fees capped at {NEVADA_LATE_FEE_MAX_PERCENT}% of monthly rent</li>
                  <li>Security deposit max: {NEVADA_SECURITY_DEPOSIT_MAX_MONTHS} months rent</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="flex-1 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  Edit Details
                </button>
                {!leaseData!.isMonthToMonth && leaseData!.endDate && (
                  <button
                    onClick={handleDownloadCalendar}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Calendar
                  </button>
                )}
                {!showAddRent && leaseData!.rentHistory.length === 0 && (
                  <button
                    onClick={() => setShowAddRent(true)}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Rent History
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
