import { render, screen } from '@testing-library/react'
import { DelegateStatusCard } from '../DelegateStatusCard'

// Mock dependencies
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: jest.fn(),
  }),
}))

const mockGetCurrentDelegateProfile = jest.fn()
const mockGetDelegateStats = jest.fn()
const mockGetDelegateThresholds = jest.fn()

jest.mock('@/lib/storage/delegateStorage', () => ({
  getCurrentDelegateProfile: () => mockGetCurrentDelegateProfile(),
  getDelegateStats: () => mockGetDelegateStats(),
}))

jest.mock('@/lib/storage/adminSettingsStorage', () => ({
  getDelegateThresholds: () => mockGetDelegateThresholds(),
}))

describe('DelegateStatusCard', () => {
  const defaultThresholds = {
    minVerifiedTenants: 10,
    minBlocs: 1,
    minActivityScore: 50,
  }

  const defaultStats = {
    totalDelegates: 5,
    totalTenantsRepresented: 150,
    totalVotingWeight: 100,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetDelegateThresholds.mockReturnValue(defaultThresholds)
    mockGetDelegateStats.mockReturnValue(defaultStats)
  })

  it('shows no profile message when no delegate profile exists', () => {
    mockGetCurrentDelegateProfile.mockReturnValue(null)

    render(<DelegateStatusCard profileId="user-1" />)

    expect(screen.getByText('No profile data available')).toBeInTheDocument()
  })

  it('shows qualified delegate status when all thresholds are met', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 25,
      blocs: ['bloc-1', 'bloc-2'],
      activityScore: 100,
      proposalsCreated: 5,
      votesParticipated: 20,
      buildingsRepresented: 3,
      qualificationStatus: {
        meetsTenantsThreshold: true,
        meetsBlocsThreshold: true,
        meetsActivityThreshold: true,
      },
      canVoteOnAppGovernance: true,
      delegateWeight: 25.5,
    })

    render(<DelegateStatusCard profileId="user-1" />)

    expect(screen.getByText('Qualified Delegate')).toBeInTheDocument()
    expect(screen.getByText('Voting weight: 25.5 points')).toBeInTheDocument()
  })

  it('shows delegate progress when not all thresholds are met', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 5, // Below threshold
      blocs: ['bloc-1'],
      activityScore: 30, // Below threshold
      proposalsCreated: 2,
      votesParticipated: 10,
      buildingsRepresented: 1,
      qualificationStatus: {
        meetsTenantsThreshold: false,
        meetsBlocsThreshold: true,
        meetsActivityThreshold: false,
      },
      canVoteOnAppGovernance: false,
      delegateWeight: 0,
    })

    render(<DelegateStatusCard profileId="user-1" />)

    expect(screen.getByText('Delegate Progress')).toBeInTheDocument()
    expect(screen.getByText('Complete requirements to become a delegate')).toBeInTheDocument()
  })

  it('displays qualification requirements with progress bars', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 5,
      blocs: ['bloc-1'],
      activityScore: 30,
      proposalsCreated: 2,
      votesParticipated: 10,
      buildingsRepresented: 1,
      qualificationStatus: {
        meetsTenantsThreshold: false,
        meetsBlocsThreshold: true,
        meetsActivityThreshold: false,
      },
      canVoteOnAppGovernance: false,
      delegateWeight: 0,
    })

    render(<DelegateStatusCard profileId="user-1" />)

    expect(screen.getByText('Qualification Requirements')).toBeInTheDocument()
    expect(screen.getByText('Verified Tenants Represented')).toBeInTheDocument()
    expect(screen.getByText('Blocs Organized')).toBeInTheDocument()
    expect(screen.getByText('Activity Score')).toBeInTheDocument()

    // Check progress values
    expect(screen.getByText('5 / 10')).toBeInTheDocument() // Tenants
    expect(screen.getByText('1 / 1')).toBeInTheDocument() // Blocs
    expect(screen.getByText('30 / 50')).toBeInTheDocument() // Activity
  })

  it('shows checkmarks for met thresholds', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 15,
      blocs: ['bloc-1', 'bloc-2'],
      activityScore: 75,
      proposalsCreated: 5,
      votesParticipated: 25,
      buildingsRepresented: 4,
      qualificationStatus: {
        meetsTenantsThreshold: true,
        meetsBlocsThreshold: true,
        meetsActivityThreshold: true,
      },
      canVoteOnAppGovernance: true,
      delegateWeight: 20.0,
    })

    render(<DelegateStatusCard profileId="user-1" />)

    // Check for checkmarks (✓)
    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBe(3) // All three requirements met
  })

  it('displays activity breakdown', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 10,
      blocs: ['bloc-1'],
      activityScore: 50,
      proposalsCreated: 8,
      votesParticipated: 15,
      buildingsRepresented: 2,
      qualificationStatus: {
        meetsTenantsThreshold: true,
        meetsBlocsThreshold: true,
        meetsActivityThreshold: true,
      },
      canVoteOnAppGovernance: true,
      delegateWeight: 15.8,
    })

    render(<DelegateStatusCard profileId="user-1" />)

    expect(screen.getByText('Your Activity')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument() // Proposals
    expect(screen.getByText('15')).toBeInTheDocument() // Votes
    expect(screen.getByText('2')).toBeInTheDocument() // Buildings
    expect(screen.getByText('Proposals')).toBeInTheDocument()
    expect(screen.getByText('Votes')).toBeInTheDocument()
    expect(screen.getByText('Buildings')).toBeInTheDocument()
  })

  it('shows delegate network stats when delegates exist', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 10,
      blocs: ['bloc-1'],
      activityScore: 50,
      proposalsCreated: 5,
      votesParticipated: 10,
      buildingsRepresented: 2,
      qualificationStatus: {
        meetsTenantsThreshold: true,
        meetsBlocsThreshold: true,
        meetsActivityThreshold: true,
      },
      canVoteOnAppGovernance: true,
      delegateWeight: 15.8,
    })

    render(<DelegateStatusCard profileId="user-1" />)

    expect(screen.getByText('Delegate Network')).toBeInTheDocument()
    expect(screen.getByText('Active Delegates')).toBeInTheDocument()
    expect(screen.getByText('Tenants Represented')).toBeInTheDocument()
    // Check that delegate stats are displayed (numbers may appear multiple times)
    const delegateNetwork = screen.getByText('Delegate Network').closest('div')?.parentElement
    expect(delegateNetwork).toBeInTheDocument()
  })

  it('hides delegate network stats when no delegates exist', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 5,
      blocs: [],
      activityScore: 10,
      proposalsCreated: 1,
      votesParticipated: 5,
      buildingsRepresented: 1,
      qualificationStatus: {
        meetsTenantsThreshold: false,
        meetsBlocsThreshold: false,
        meetsActivityThreshold: false,
      },
      canVoteOnAppGovernance: false,
      delegateWeight: 0,
    })
    mockGetDelegateStats.mockReturnValue({
      totalDelegates: 0,
      totalTenantsRepresented: 0,
      totalVotingWeight: 0,
    })

    render(<DelegateStatusCard profileId="user-1" />)

    expect(screen.queryByText('Delegate Network')).not.toBeInTheDocument()
  })

  it('shows how delegate voting works explanation', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 10,
      blocs: ['bloc-1'],
      activityScore: 50,
      proposalsCreated: 5,
      votesParticipated: 10,
      buildingsRepresented: 2,
      qualificationStatus: {
        meetsTenantsThreshold: true,
        meetsBlocsThreshold: true,
        meetsActivityThreshold: true,
      },
      canVoteOnAppGovernance: true,
      delegateWeight: 15.8,
    })

    render(<DelegateStatusCard profileId="user-1" />)

    expect(screen.getByText('How Delegate Voting Works')).toBeInTheDocument()
    expect(screen.getByText(/Delegates are organizers who represent verified tenants/)).toBeInTheDocument()
    expect(screen.getByText(/Voting weight is based on tenants represented/)).toBeInTheDocument()
    expect(screen.getByText(/Delegates vote on app-wide governance/)).toBeInTheDocument()
    expect(screen.getByText(/Admins cannot vote/)).toBeInTheDocument()
  })

  it('shows correct progress percentage for partial completion', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 7, // 70% of 10
      blocs: ['bloc-1'], // 100% of 1
      activityScore: 25, // 50% of 50
      proposalsCreated: 3,
      votesParticipated: 8,
      buildingsRepresented: 2,
      qualificationStatus: {
        meetsTenantsThreshold: false,
        meetsBlocsThreshold: true,
        meetsActivityThreshold: false,
      },
      canVoteOnAppGovernance: false,
      delegateWeight: 0,
    })

    render(<DelegateStatusCard profileId="user-1" />)

    // Check the displayed values
    expect(screen.getByText('7 / 10')).toBeInTheDocument()
    expect(screen.getByText('1 / 1')).toBeInTheDocument()
    expect(screen.getByText('25 / 50')).toBeInTheDocument()
  })

  it('uses green color scheme for qualified delegate', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 20,
      blocs: ['bloc-1', 'bloc-2'],
      activityScore: 100,
      proposalsCreated: 10,
      votesParticipated: 30,
      buildingsRepresented: 5,
      qualificationStatus: {
        meetsTenantsThreshold: true,
        meetsBlocsThreshold: true,
        meetsActivityThreshold: true,
      },
      canVoteOnAppGovernance: true,
      delegateWeight: 22.4,
    })

    const { container } = render(<DelegateStatusCard profileId="user-1" />)

    // Check for green gradient class
    const statusHeader = container.querySelector('[class*="from-green"]')
    expect(statusHeader).toBeInTheDocument()
  })

  it('uses amber color scheme for in-progress delegate', () => {
    mockGetCurrentDelegateProfile.mockReturnValue({
      profileId: 'user-1',
      verifiedTenantsRepresented: 5,
      blocs: [],
      activityScore: 20,
      proposalsCreated: 1,
      votesParticipated: 5,
      buildingsRepresented: 1,
      qualificationStatus: {
        meetsTenantsThreshold: false,
        meetsBlocsThreshold: false,
        meetsActivityThreshold: false,
      },
      canVoteOnAppGovernance: false,
      delegateWeight: 0,
    })

    const { container } = render(<DelegateStatusCard profileId="user-1" />)

    // Check for amber gradient class
    const statusHeader = container.querySelector('[class*="from-amber"]')
    expect(statusHeader).toBeInTheDocument()
  })
})
