'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

// ============================================================================
// Types
// ============================================================================

interface TutorialCandidate {
  id: string
  name: string
  emoji: string
  description: string
}

interface EliminationRound {
  roundNumber: number
  votes: { candidateId: string; count: number }[]
  eliminated: string | null
  transferred: number
}

// ============================================================================
// Constants
// ============================================================================

const TUTORIAL_COMPLETED_KEY = 'rstu_rcv_tutorial_completed'

// Fun, relatable candidates for the mock election
const MOCK_CANDIDATES: TutorialCandidate[] = [
  { id: 'popcorn', name: 'Popcorn', emoji: '🍿', description: 'Classic and buttery' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', description: 'Cheesy crowd-pleaser' },
  { id: 'nachos', name: 'Nachos', emoji: '🧀', description: 'Loaded with toppings' },
  { id: 'ice-cream', name: 'Ice Cream', emoji: '🍨', description: 'Sweet and cold' },
  { id: 'chips', name: 'Chips & Dip', emoji: '🥔', description: 'Crunchy with salsa' },
]

// Pre-set "other voters" ballots to ensure interesting RCV rounds
// These create a scenario where no one wins first round, showing elimination
const SIMULATED_BALLOTS: string[][] = [
  ['pizza', 'nachos', 'popcorn', 'chips', 'ice-cream'],
  ['pizza', 'chips', 'nachos', 'popcorn', 'ice-cream'],
  ['nachos', 'pizza', 'chips', 'popcorn', 'ice-cream'],
  ['nachos', 'chips', 'pizza', 'popcorn', 'ice-cream'],
  ['popcorn', 'pizza', 'nachos', 'chips', 'ice-cream'],
  ['popcorn', 'nachos', 'pizza', 'chips', 'ice-cream'],
  ['chips', 'nachos', 'pizza', 'popcorn', 'ice-cream'],
  ['ice-cream', 'popcorn', 'pizza', 'nachos', 'chips'],
]

// ============================================================================
// Helper Functions
// ============================================================================

function hasTutorialCompleted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true'
}

function markTutorialCompleted(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true')
}

// Instant-runoff voting calculation
function calculateRCVResults(allBallots: string[][]): {
  winner: string
  rounds: EliminationRound[]
} {
  const rounds: EliminationRound[] = []
  let activeCandidates = new Set(MOCK_CANDIDATES.map(c => c.id))
  const ballots = allBallots.map(b => [...b]) // Clone ballots

  while (activeCandidates.size > 1) {
    // Count first-choice votes
    const voteCounts = new Map<string, number>()
    activeCandidates.forEach(c => voteCounts.set(c, 0))

    ballots.forEach(ballot => {
      // Find first active candidate in this ballot
      const firstChoice = ballot.find(c => activeCandidates.has(c))
      if (firstChoice) {
        voteCounts.set(firstChoice, (voteCounts.get(firstChoice) || 0) + 1)
      }
    })

    const totalVotes = Array.from(voteCounts.values()).reduce((a, b) => a + b, 0)
    const votes = Array.from(voteCounts.entries())
      .map(([candidateId, count]) => ({ candidateId, count }))
      .sort((a, b) => b.count - a.count)

    // Check for majority
    const leader = votes[0]
    if (leader.count > totalVotes / 2) {
      rounds.push({
        roundNumber: rounds.length + 1,
        votes,
        eliminated: null,
        transferred: 0,
      })
      return { winner: leader.candidateId, rounds }
    }

    // Find candidate to eliminate (fewest votes)
    const loser = votes[votes.length - 1]
    const transferred = loser.count

    rounds.push({
      roundNumber: rounds.length + 1,
      votes,
      eliminated: loser.candidateId,
      transferred,
    })

    // Remove eliminated candidate from active set
    activeCandidates.delete(loser.candidateId)
  }

  // One candidate remaining
  const winner = Array.from(activeCandidates)[0]
  return { winner, rounds }
}

// ============================================================================
// Component
// ============================================================================

interface TutorialElectionProps {
  onComplete: () => void
  onSkip: () => void
}

export function TutorialElection({ onComplete, onSkip }: TutorialElectionProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const [rankings, setRankings] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [results, setResults] = useState<{ winner: string; rounds: EliminationRound[] } | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [showingResults, setShowingResults] = useState(false)

  // Move candidate up in rankings
  const moveUp = useCallback((candidateId: string) => {
    setRankings(prev => {
      const idx = prev.indexOf(candidateId)
      if (idx <= 0) return prev
      const newRankings = [...prev]
      ;[newRankings[idx - 1], newRankings[idx]] = [newRankings[idx], newRankings[idx - 1]]
      return newRankings
    })
  }, [])

  // Move candidate down in rankings
  const moveDown = useCallback((candidateId: string) => {
    setRankings(prev => {
      const idx = prev.indexOf(candidateId)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const newRankings = [...prev]
      ;[newRankings[idx], newRankings[idx + 1]] = [newRankings[idx + 1], newRankings[idx]]
      return newRankings
    })
  }, [])

  // Initialize rankings when entering ranking step
  useEffect(() => {
    if (step === 2 && rankings.length === 0) {
      setRankings(MOCK_CANDIDATES.map(c => c.id))
    }
  }, [step, rankings.length])

  // Animate through rounds when showing results
  useEffect(() => {
    if (showingResults && results && currentRound < results.rounds.length) {
      const timer = setTimeout(() => {
        setCurrentRound(prev => prev + 1)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [showingResults, currentRound, results])

  // Submit vote and calculate results
  const handleSubmitVote = () => {
    // Combine user's ballot with simulated ballots
    const allBallots = [...SIMULATED_BALLOTS, rankings]
    const calculated = calculateRCVResults(allBallots)
    setResults(calculated)
    setStep(4)
    setShowingResults(true)
  }

  // Complete tutorial
  const handleComplete = () => {
    markTutorialCompleted()
    onComplete()
  }

  // Skip tutorial
  const handleSkip = () => {
    markTutorialCompleted()
    onSkip()
  }

  // Get candidate by ID
  const getCandidate = (id: string) => MOCK_CANDIDATES.find(c => c.id === id)

  // Rank badge colors
  const getRankBadge = (rank: number) => {
    const colors = [
      'bg-yellow-400 text-yellow-900', // 1st - gold
      'bg-gray-300 text-gray-700',     // 2nd - silver
      'bg-amber-600 text-white',       // 3rd - bronze
      'bg-gray-200 text-gray-600',     // 4th
      'bg-gray-100 text-gray-500',     // 5th
    ]
    return colors[rank] || colors[4]
  }

  // Calculate visual offset for drag animation
  const getItemTransform = (candidateId: string, index: number): string => {
    if (!draggedItem || dragOverIndex === null) return 'translateY(0)'
    if (draggedItem === candidateId) return 'translateY(0)' // Dragged item handled separately

    const draggedIndex = rankings.indexOf(draggedItem)
    if (draggedIndex === -1) return 'translateY(0)'

    const itemHeight = 72 // Approximate height of each item in pixels

    // If dragging down (draggedIndex < dragOverIndex)
    if (draggedIndex < dragOverIndex) {
      // Items between dragged and target should move UP
      if (index > draggedIndex && index <= dragOverIndex) {
        return `translateY(-${itemHeight}px)`
      }
    }
    // If dragging up (draggedIndex > dragOverIndex)
    else if (draggedIndex > dragOverIndex) {
      // Items between target and dragged should move DOWN
      if (index >= dragOverIndex && index < draggedIndex) {
        return `translateY(${itemHeight}px)`
      }
    }

    return 'translateY(0)'
  }

  // Get the visual rank badge index during drag preview
  const getVisualRankIndex = (candidateId: string, actualIndex: number): number => {
    if (!draggedItem || dragOverIndex === null) return actualIndex

    const draggedIndex = rankings.indexOf(draggedItem)
    if (draggedIndex === -1) return actualIndex

    // The dragged item shows its target position
    if (candidateId === draggedItem) return dragOverIndex

    // Calculate visual position for other items
    if (draggedIndex < dragOverIndex) {
      // Dragging down
      if (actualIndex > draggedIndex && actualIndex <= dragOverIndex) {
        return actualIndex - 1
      }
    } else if (draggedIndex > dragOverIndex) {
      // Dragging up
      if (actualIndex >= dragOverIndex && actualIndex < draggedIndex) {
        return actualIndex + 1
      }
    }

    return actualIndex
  }

  // ============================================================================
  // Render Steps
  // ============================================================================

  // Step 0: Welcome
  const renderWelcome = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🗳️</div>
      <h2 className="text-2xl font-bold text-gray-900">
        Learn Ranked Choice Voting
      </h2>
      <p className="text-gray-600 max-w-md mx-auto">
        Before you dive into RSTU, let's learn how we make decisions together using
        <strong> Ranked Choice Voting</strong> (RCV).
      </p>
      <p className="text-gray-600 max-w-md mx-auto">
        It's the fairest way to vote — and it only takes 2 minutes to learn!
      </p>
      <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-blue-800">
          <strong>Why RCV?</strong> Traditional voting can split support between similar candidates.
          RCV ensures the winner has genuine majority support.
        </p>
      </div>
      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={handleSkip}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </button>
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 bg-rstu-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Let's Learn!
        </button>
      </div>
    </div>
  )

  // Step 1: Explain the concept
  const renderExplanation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          How Does Ranked Choice Voting Work?
        </h2>
        <p className="text-gray-600">
          Instead of picking just ONE choice, you rank ALL candidates in order of preference.
        </p>
      </div>

      <div className="grid gap-4 max-w-lg mx-auto">
        {[
          { icon: '1️⃣', title: 'Rank Your Choices', desc: 'Put candidates in order: 1st choice, 2nd choice, etc.' },
          { icon: '🔢', title: 'Count First Choices', desc: 'Everyone\'s #1 pick gets counted first.' },
          { icon: '🏆', title: 'Check for Majority', desc: 'If someone has over 50%, they win!' },
          { icon: '🔄', title: 'Eliminate & Transfer', desc: 'If no majority, the last-place candidate is eliminated. Their votes go to those voters\' next choice.' },
          { icon: '🔁', title: 'Repeat Until Winner', desc: 'Keep eliminating until someone has majority support.' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={() => setStep(0)}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Back
        </button>
        <button
          onClick={() => setStep(2)}
          className="px-6 py-3 bg-rstu-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Try It Yourself!
        </button>
      </div>
    </div>
  )

  // Step 2: Interactive ranking
  const renderRanking = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          🍿 Vote: Best Movie Night Snack
        </h2>
        <p className="text-gray-600">
          Drag and drop OR use the arrows to rank these snacks from favorite to least favorite.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-2 relative">
        {rankings.map((candidateId, index) => {
          const candidate = getCandidate(candidateId)
          if (!candidate) return null

          const isDragging = draggedItem === candidateId
          const visualRank = getVisualRankIndex(candidateId, index)
          const transform = getItemTransform(candidateId, index)

          return (
            <div
              key={candidateId}
              draggable
              onDragStart={(e) => {
                setDraggedItem(candidateId)
                // Set drag image opacity
                if (e.dataTransfer) {
                  e.dataTransfer.effectAllowed = 'move'
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (draggedItem && draggedItem !== candidateId) {
                  setDragOverIndex(index)
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault()
                if (draggedItem && draggedItem !== candidateId) {
                  setDragOverIndex(index)
                }
              }}
              onDragEnd={() => {
                // Finalize the reorder on drag end
                if (draggedItem && dragOverIndex !== null) {
                  const fromIdx = rankings.indexOf(draggedItem)
                  if (fromIdx !== dragOverIndex) {
                    const newRankings = [...rankings]
                    newRankings.splice(fromIdx, 1)
                    newRankings.splice(dragOverIndex, 0, draggedItem)
                    setRankings(newRankings)
                  }
                }
                setDraggedItem(null)
                setDragOverIndex(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                // Drop is handled by dragEnd
              }}
              style={{
                transform: isDragging ? 'scale(1.02)' : transform,
                transition: isDragging ? 'none' : 'transform 200ms ease-out',
                zIndex: isDragging ? 10 : 1,
              }}
              className={`flex items-center gap-3 p-3 bg-white border-2 rounded-lg cursor-grab active:cursor-grabbing ${
                isDragging
                  ? 'shadow-lg border-rstu-red opacity-90'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Rank badge - shows visual position during drag */}
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm transition-all duration-200 ${getRankBadge(visualRank)}`}
              >
                {visualRank + 1}
              </span>

              {/* Candidate info */}
              <span className="text-2xl">{candidate.emoji}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{candidate.name}</p>
                <p className="text-xs text-gray-500">{candidate.description}</p>
              </div>

              {/* Arrow buttons */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveUp(candidateId)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  aria-label="Move up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveDown(candidateId)}
                  disabled={index === rankings.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Drag handle */}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )
        })}
      </div>

      <div className="bg-amber-50 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-amber-800">
          <strong>Tip:</strong> Your #1 choice is your favorite. If they can&apos;t win, your vote
          automatically transfers to your #2 choice, and so on.
        </p>
      </div>

      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          className="px-6 py-3 bg-rstu-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Submit My Ballot
        </button>
      </div>
    </div>
  )

  // Step 3: Confirm vote
  const renderConfirm = () => (
    <div className="space-y-6 text-center">
      <div className="text-5xl mb-4">📋</div>
      <h2 className="text-xl font-bold text-gray-900">
        Ready to Submit Your Ballot?
      </h2>
      <p className="text-gray-600 max-w-md mx-auto">
        You've joined 8 other "voters" in this practice election. Let's see how ranked choice voting counts everyone's preferences!
      </p>

      <div className="bg-gray-50 rounded-lg p-4 max-w-sm mx-auto">
        <p className="text-sm font-medium text-gray-700 mb-2">Your rankings:</p>
        <div className="space-y-1">
          {rankings.map((id, i) => {
            const c = getCandidate(id)
            return c ? (
              <div key={id} className="flex items-center gap-2 text-sm">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${getRankBadge(i)}`}>
                  {i + 1}
                </span>
                <span>{c.emoji} {c.name}</span>
              </div>
            ) : null
          })}
        </div>
      </div>

      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={() => setStep(2)}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Change Rankings
        </button>
        <button
          onClick={handleSubmitVote}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Cast My Vote!
        </button>
      </div>
    </div>
  )

  // Step 4: Animated results
  const renderResults = () => {
    if (!results) return null

    const visibleRounds = results.rounds.slice(0, currentRound)
    const winner = getCandidate(results.winner)
    const isComplete = currentRound >= results.rounds.length

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            🔄 Counting the Votes...
          </h2>
          <p className="text-gray-600">
            Watch how ranked choice voting finds the winner!
          </p>
        </div>

        {/* Rounds display */}
        <div className="max-w-lg mx-auto space-y-4">
          {visibleRounds.map((round) => {
            const eliminated = round.eliminated ? getCandidate(round.eliminated) : null
            const totalVotes = round.votes.reduce((sum, v) => sum + v.count, 0)

            return (
              <div
                key={round.roundNumber}
                className="bg-white border border-gray-200 rounded-lg p-4 animate-fade-in"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">Round {round.roundNumber}</h3>
                  <span className="text-sm text-gray-500">{totalVotes} votes total</span>
                </div>

                {/* Vote bars */}
                <div className="space-y-2 mb-3">
                  {round.votes
                    .filter(v => !eliminated || v.candidateId !== eliminated.id || round.eliminated === null)
                    .map(({ candidateId, count }) => {
                      const candidate = getCandidate(candidateId)
                      const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0
                      const isEliminated = candidateId === round.eliminated

                      return candidate ? (
                        <div key={candidateId} className={`${isEliminated ? 'opacity-50' : ''}`}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className={isEliminated ? 'line-through text-gray-400' : ''}>
                              {candidate.emoji} {candidate.name}
                            </span>
                            <span className="font-medium">{count} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct > 50 ? 'bg-green-500' : isEliminated ? 'bg-red-300' : 'bg-blue-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ) : null
                    })}
                </div>

                {/* Elimination notice */}
                {eliminated && (
                  <div className="bg-red-50 rounded-lg p-2 text-sm">
                    <span className="text-red-700">
                      ❌ <strong>{eliminated.emoji} {eliminated.name}</strong> eliminated (fewest votes).
                      {round.transferred > 0 && (
                        <span> {round.transferred} votes transferred to next choices.</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Majority reached */}
                {round.votes[0].count > totalVotes / 2 && (
                  <div className="bg-green-50 rounded-lg p-2 text-sm">
                    <span className="text-green-700">
                      ✅ <strong>{getCandidate(round.votes[0].candidateId)?.name}</strong> has majority ({round.votes[0].count}/{totalVotes} = {((round.votes[0].count / totalVotes) * 100).toFixed(0)}%)
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Loading indicator */}
        {!isComplete && (
          <div className="text-center">
            <div className="inline-block animate-pulse text-gray-500">
              Counting next round...
            </div>
          </div>
        )}

        {/* Winner announcement */}
        {isComplete && winner && (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl p-6 max-w-md mx-auto border-2 border-yellow-300">
              <div className="text-5xl mb-2">{winner.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                🏆 {winner.name} Wins!
              </h3>
              <p className="text-gray-600">
                After {results.rounds.length} round{results.rounds.length > 1 ? 's' : ''} of counting
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto text-left">
              <p className="text-sm text-blue-800">
                <strong>What just happened?</strong><br />
                No snack had majority support at first. So we eliminated the least popular option
                and transferred those votes to each voter's next choice. This continued until
                one option had over 50% support — a true majority winner!
              </p>
            </div>

            <button
              onClick={() => setStep(5)}
              className="px-6 py-3 bg-rstu-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    )
  }

  // Step 5: Completion
  const renderCompletion = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🎓</div>
      <h2 className="text-2xl font-bold text-gray-900">
        You're an RCV Expert Now!
      </h2>
      <p className="text-gray-600 max-w-md mx-auto">
        You just learned how tenants unions make fair, democratic decisions.
        When RSTU holds real elections for officers or votes on important issues,
        you'll use this exact process.
      </p>

      <div className="grid gap-4 max-w-md mx-auto text-left">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>✓ No wasted votes</strong> — Your vote always counts toward your highest-ranked viable candidate.
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>✓ True majority winners</strong> — Winners must earn over 50% support.
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>✓ Vote your conscience</strong> — Rank your true favorite first without fear of "spoiling" the election.
          </p>
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="px-8 py-4 bg-rstu-red text-white font-bold text-lg rounded-lg hover:bg-red-700 transition-colors"
      >
        Start Exploring RSTU
      </button>
    </div>
  )

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Progress indicator */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">RCV Tutorial</span>
            <span className="text-sm text-gray-500">Step {step + 1} of 6</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rstu-red transition-all duration-300 rounded-full"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 0 && renderWelcome()}
          {step === 1 && renderExplanation()}
          {step === 2 && renderRanking()}
          {step === 3 && renderConfirm()}
          {step === 4 && renderResults()}
          {step === 5 && renderCompletion()}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// Export helper
// ============================================================================

export { hasTutorialCompleted, markTutorialCompleted }
