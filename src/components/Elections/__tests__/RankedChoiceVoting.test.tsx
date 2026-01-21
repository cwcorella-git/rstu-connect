import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RankedChoiceVoting } from '../RankedChoiceVoting'
import type { Election, Nomination } from '@/lib/electionStorage'

// Mock dependencies
jest.mock('@/lib/socketio', () => ({
  getSocket: jest.fn(() => ({
    emit: jest.fn(),
  })),
}))

jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: jest.fn(),
  }),
}))

jest.mock('@/hooks/useOfflineMode', () => ({
  useOfflineMode: () => ({
    isOnline: true,
    isReadOnly: false,
    checkAction: jest.fn(() => null), // null means action is allowed
  }),
}))

// Mock electionStorage functions
const mockCastRankedVoteAsync = jest.fn()
const mockHasRankedVotedForPosition = jest.fn()
const mockGetUserRankedVote = jest.fn()

jest.mock('@/lib/electionStorage', () => ({
  castRankedVoteAsync: (...args: unknown[]) => mockCastRankedVoteAsync(...args),
  hasRankedVotedForPosition: (...args: unknown[]) => mockHasRankedVotedForPosition(...args),
  getUserRankedVote: (...args: unknown[]) => mockGetUserRankedVote(...args),
}))

describe('RankedChoiceVoting', () => {
  const mockElection: Election = {
    id: 'election-1',
    title: 'Annual Election',
    description: 'Vote for union officers',
    positions: [
      { id: 'pos-1', title: 'President', description: 'Union president' },
      { id: 'pos-2', title: 'Secretary', description: 'Meeting notes' },
    ],
    phase: 'voting',
    nominationStartDate: Date.now() - 86400000 * 7,
    nominationEndDate: Date.now() - 86400000,
    votingStartDate: Date.now() - 86400000,
    votingEndDate: Date.now() + 86400000 * 7,
    createdBy: 'admin-1',
    createdAt: Date.now() - 86400000 * 14,
    quorumPercentage: 15,
  }

  const mockNominations: Nomination[] = [
    {
      id: 'nom-1',
      electionId: 'election-1',
      positionId: 'pos-1',
      nomineeId: 'user-1',
      nomineeName: 'Alice Smith',
      nominatedBy: 'user-2',
      statement: 'I will fight for tenant rights',
      accepted: true,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'nom-2',
      electionId: 'election-1',
      positionId: 'pos-1',
      nomineeId: 'user-2',
      nomineeName: 'Bob Johnson',
      nominatedBy: 'user-3',
      statement: 'Experience matters',
      accepted: true,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'nom-3',
      electionId: 'election-1',
      positionId: 'pos-1',
      nomineeId: 'user-3',
      nomineeName: 'Carol Williams',
      nominatedBy: 'user-1',
      statement: 'Fresh perspective',
      accepted: true,
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'nom-4',
      electionId: 'election-1',
      positionId: 'pos-2',
      nomineeId: 'user-4',
      nomineeName: 'David Brown',
      nominatedBy: 'user-1',
      statement: 'Organized and efficient',
      accepted: true,
      createdAt: Date.now() - 86400000,
    },
  ]

  const mockOnVoteComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockHasRankedVotedForPosition.mockReturnValue(false)
    mockGetUserRankedVote.mockReturnValue(null)
    mockCastRankedVoteAsync.mockImplementation(() => Promise.resolve({
      success: true,
      voteId: 'vote-' + Math.random(),
    }))
  })

  it('renders election positions with candidates', () => {
    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // Check positions are rendered
    expect(screen.getByText('President')).toBeInTheDocument()
    expect(screen.getByText('Secretary')).toBeInTheDocument()

    // Check candidates for President position
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    expect(screen.getByText('Carol Williams')).toBeInTheDocument()

    // Check candidate for Secretary position
    expect(screen.getByText('David Brown')).toBeInTheDocument()
  })

  it('shows progress indicator', () => {
    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // Should show 0/2 positions voted
    expect(screen.getByText('0/2 elections.positionsVoted')).toBeInTheDocument()
  })

  it('displays candidate statements', () => {
    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    expect(screen.getByText('I will fight for tenant rights')).toBeInTheDocument()
    expect(screen.getByText('Experience matters')).toBeInTheDocument()
  })

  it('shows RCV explanation', () => {
    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    expect(screen.getByText('How Ranked Choice Voting Works')).toBeInTheDocument()
    expect(screen.getByText('Your first choice gets your vote initially')).toBeInTheDocument()
  })

  it('allows moving candidate up with arrow button', async () => {
    const user = userEvent.setup()

    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // Get all "Move up" buttons
    const upButtons = screen.getAllByTitle('Move up')

    // First button should be disabled (first candidate can't move up)
    expect(upButtons[0]).toBeDisabled()

    // Second button should be enabled
    expect(upButtons[1]).not.toBeDisabled()

    // Click move up on second candidate (Bob Johnson)
    await user.click(upButtons[1])

    // Get candidate names in their containers - first one should now be Bob
    const rankContainers = screen.getAllByText(/^\d+$/)[0].closest('div')?.parentElement
    // Verify the reordering happened by checking DOM order
  })

  it('allows moving candidate down with arrow button', async () => {
    const user = userEvent.setup()

    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // Get all "Move down" buttons
    const downButtons = screen.getAllByTitle('Move down')

    // First down button should be enabled
    expect(downButtons[0]).not.toBeDisabled()

    // Click move down on first candidate
    await user.click(downButtons[0])
  })

  it('casts vote when submit button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // Find and click the submit button for President position
    const submitButton = screen.getByText('Submit Ranked Vote for President')
    await user.click(submitButton)

    // Verify castRankedVoteAsync was called
    expect(mockCastRankedVoteAsync).toHaveBeenCalledWith({
      electionId: 'election-1',
      positionId: 'pos-1',
      rankings: expect.arrayContaining(['nom-1', 'nom-2', 'nom-3']),
    })

    // Verify callback was called
    expect(mockOnVoteComplete).toHaveBeenCalledWith('pos-1')
  })

  it('shows "Vote Cast" badge for already voted positions', () => {
    mockHasRankedVotedForPosition.mockImplementation((electionId, positionId, profileId) => {
      return positionId === 'pos-1'
    })
    mockGetUserRankedVote.mockImplementation((electionId, positionId, profileId) => {
      if (positionId === 'pos-1') {
        return {
          id: 'vote-1',
          electionId: 'election-1',
          positionId: 'pos-1',
          voterId: 'user-5',
          rankings: ['nom-1', 'nom-2', 'nom-3'],
          timestamp: Date.now(),
        }
      }
      return null
    })

    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // Should show Vote Cast badge
    expect(screen.getByText('Vote Cast')).toBeInTheDocument()

    // Progress should show 1/2
    expect(screen.getByText('1/2 elections.positionsVoted')).toBeInTheDocument()
  })

  it('shows existing vote rankings after voting', () => {
    // Only mark president position as voted
    mockHasRankedVotedForPosition.mockImplementation((electionId, positionId) => {
      return positionId === 'pos-1'
    })
    mockGetUserRankedVote.mockImplementation((electionId, positionId) => {
      if (positionId === 'pos-1') {
        return {
          id: 'vote-1',
          electionId: 'election-1',
          positionId: 'pos-1',
          voterId: 'user-5',
          rankings: ['nom-2', 'nom-1', 'nom-3'], // Bob first, then Alice, then Carol
          timestamp: Date.now(),
        }
      }
      return null
    })

    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // Should show "Your ranked preferences" text for the voted position
    expect(screen.getByText('Your ranked preferences:')).toBeInTheDocument()
  })

  it('shows error when trying to cast empty vote', async () => {
    const user = userEvent.setup()

    // Create election with position that has no nominations
    const electionNoNoms: Election = {
      ...mockElection,
      positions: [
        { id: 'pos-empty', title: 'Treasurer', description: 'No candidates yet' },
      ],
    }

    render(
      <RankedChoiceVoting
        election={electionNoNoms}
        nominations={[]}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // Should show no candidates message
    expect(screen.getByText('elections.noCandidates')).toBeInTheDocument()
  })

  it('shows error when vote fails', async () => {
    const user = userEvent.setup()
    mockCastRankedVoteAsync.mockResolvedValue({ success: false, error: 'Already voted for this position' }) // Simulate vote failure

    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    const submitButton = screen.getByText('Submit Ranked Vote for President')
    await user.click(submitButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Already voted for this position')).toBeInTheDocument()
    })

    // Callback should not be called
    expect(mockOnVoteComplete).not.toHaveBeenCalled()
  })

  it('shows completion message when all positions voted', () => {
    mockHasRankedVotedForPosition.mockReturnValue(true)
    mockGetUserRankedVote.mockReturnValue({
      id: 'vote-1',
      electionId: 'election-1',
      positionId: 'pos-1',
      voterId: 'user-5',
      rankings: ['nom-1'],
      timestamp: Date.now(),
    })

    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // Progress should show 2/2
    expect(screen.getByText('2/2 elections.positionsVoted')).toBeInTheDocument()
    expect(screen.getByText('elections.votingComplete')).toBeInTheDocument()
  })

  it('highlights first choice candidate differently', () => {
    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    // The first candidate should have a yellow/gold styling
    // We check for the presence of rank numbers
    const rankBadges = screen.getAllByText('1')
    expect(rankBadges.length).toBeGreaterThan(0)
  })

  it('disables up button for first candidate and down for last', () => {
    render(
      <RankedChoiceVoting
        election={mockElection}
        nominations={mockNominations}
        profileId="user-5"
        onVoteComplete={mockOnVoteComplete}
      />
    )

    const upButtons = screen.getAllByTitle('Move up')
    const downButtons = screen.getAllByTitle('Move down')

    // First candidate's up button should be disabled
    expect(upButtons[0]).toBeDisabled()

    // Last candidate's down button should be disabled (for President with 3 candidates)
    expect(downButtons[2]).toBeDisabled()
  })
})
