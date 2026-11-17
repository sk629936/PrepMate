import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import MockInterviewHeader from '../components/mockInterview/MockInterviewHeader'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}m`
  return `${m}m ${s}s`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MockInterviewHistory() {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth()

  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/mock-interviews/history`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401) {
        window.location.href = '/login'
        return
      }

      if (res.status === 403) {
        setError('You do not have permission to view this interview history.')
        return
      }

      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to load interview history.')
        return
      }

      setHistory(Array.isArray(data.sessions) ? data.sessions : [])
    } catch {
      setError('Network error. Unable to fetch your interview history. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return
    fetchHistory()
  }, [isAuthenticated, isAuthLoading])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center animate-pulse">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-xs mb-2.5">
            P
          </div>
          <p className="text-xs font-medium text-slate-600">Loading interview history...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  // Filter sessions (client-side filtering without pretending server pagination exists)
  const filteredSessions = history.filter((session) => {
    if (filterType !== 'all' && session.interviewType?.toLowerCase() !== filterType.toLowerCase()) {
      return false
    }
    if (filterStatus !== 'all' && session.status?.toLowerCase() !== filterStatus.toLowerCase()) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900 flex flex-col antialiased">
      <MockInterviewHeader user={user} logout={logout} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6 sm:px-6 space-y-6">
        {/* Page Heading & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
                Interview History
              </h1>
              {!isLoading && (
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-2xs font-semibold text-slate-700">
                  {history.length} Attempt{history.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Review your complete mock interview logs, scores, and evaluations over time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/mock-interview/progress"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Progress Dashboard
            </a>
            <a
              href="/mock-interview"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Interview
            </a>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-slate-300 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-slate-900"
          >
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-bold text-slate-950">Notice</p>
                <p className="text-slate-600">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchHistory}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-2xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filter Controls (Available when history exists) */}
        {!isLoading && history.length > 0 && !error && (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">Filter:</span>
              
              {/* Type Filter */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {[
                  { id: 'all', label: 'All Tracks' },
                  { id: 'technical', label: 'Technical' },
                  { id: 'hr', label: 'HR' },
                  { id: 'comprehensive', label: 'Comprehensive' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFilterType(t.id)}
                    className={`rounded-md px-2.5 py-1 text-2xs font-semibold transition-all cursor-pointer ${
                      filterType === t.id
                        ? 'bg-white text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {[
                  { id: 'all', label: 'All Statuses' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'in_progress', label: 'In Progress' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFilterStatus(s.id)}
                    className={`rounded-md px-2.5 py-1 text-2xs font-semibold transition-all cursor-pointer ${
                      filterStatus === s.id
                        ? 'bg-white text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-2xs font-medium text-slate-500">
              Showing {filteredSessions.length} of {history.length} interview{history.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="space-y-3 animate-pulse" aria-busy="true">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {/* Empty History State */}
        {!isLoading && history.length === 0 && !error && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h2 className="text-sm font-bold text-slate-950">No Interview History Yet</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                You haven&apos;t attempted any mock interviews yet. Start your first session to track performance and practice real placement questions.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="/mock-interview"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition-all duration-150 active:scale-95"
              >
                Start First Mock Interview
              </a>
            </div>
          </div>
        )}

        {/* Filtered Empty State */}
        {!isLoading && history.length > 0 && filteredSessions.length === 0 && !error && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3">
            <p className="text-xs font-medium text-slate-600">
              No interview sessions match your current filter settings.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterType('all')
                setFilterStatus('all')
              }}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Main Content: Render both responsive mobile cards and desktop table */}
        {!isLoading && filteredSessions.length > 0 && (
          <div className="space-y-4">
            {/* Desktop / Tablet Table View (hidden on small mobile < 640px) */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
                <thead className="border-b border-slate-200 bg-slate-50 text-2xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Track</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3 text-center">Questions</th>
                    <th className="px-4 py-3 text-center">Score &amp; %</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSessions.map((session) => {
                    const isCompleted = session.status === 'completed'
                    const isInProgress = session.status === 'in_progress'
                    const questionsAnswered = session.answeredQuestions || 0
                    const totalQuestions = session.totalQuestions || session.questionCount || 0
                    const dateFormatted = formatDate(session.createdAt)
                    const timeFormatted = formatTime(session.createdAt)

                    return (
                      <tr key={session._id} className="hover:bg-slate-50/80 transition-colors duration-100">
                        {/* Date & Time */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900">{dateFormatted}</div>
                          {timeFormatted && (
                            <div className="text-2xs text-slate-400 font-normal">{timeFormatted}</div>
                          )}
                        </td>

                        {/* Track / Interview Type */}
                        <td className="px-4 py-3.5">
                          <span className="capitalize font-bold text-slate-900">
                            {session.interviewType}
                          </span>
                        </td>

                        {/* Difficulty */}
                        <td className="px-4 py-3.5">
                          <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-2xs font-medium text-slate-700">
                            {session.difficulty}
                          </span>
                        </td>

                        {/* Number of Questions */}
                        <td className="px-4 py-3.5 text-center text-slate-600">
                          <span className="font-semibold text-slate-900">{questionsAnswered}</span>
                          <span className="text-slate-400 text-2xs"> / {totalQuestions}</span>
                        </td>

                        {/* Score and Percentage */}
                        <td className="px-4 py-3.5 text-center">
                          {isCompleted ? (
                            <div>
                              <span className="font-black text-slate-950 text-sm">
                                {session.percentage}%
                              </span>
                              {session.maxScore > 0 && (
                                <div className="text-2xs text-slate-500 font-normal">
                                  {session.score} / {session.maxScore} pts
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal text-xs">—</span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3.5 text-slate-600">
                          {formatDuration(session.duration)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-semibold capitalize ${
                              isCompleted
                                ? 'bg-slate-950 text-white'
                                : isInProgress
                                ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isCompleted ? 'bg-white' : 'bg-slate-400'
                              }`}
                            />
                            {session.status?.replace('_', ' ')}
                          </span>
                        </td>

                        {/* View Result Action */}
                        <td className="px-4 py-3.5 text-right">
                          {isCompleted ? (
                            <a
                              href={`/mock-interview/session/${session._id}/result`}
                              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400"
                            >
                              View Result
                            </a>
                          ) : isInProgress ? (
                            <a
                              href={`/mock-interview/session/${session._id}`}
                              className="inline-flex items-center justify-center rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400"
                            >
                              Resume
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Stack (Optimized for 375px mobile screens) */}
            <div className="sm:hidden space-y-3">
              {filteredSessions.map((session) => {
                const isCompleted = session.status === 'completed'
                const isInProgress = session.status === 'in_progress'
                const questionsAnswered = session.answeredQuestions || 0
                const totalQuestions = session.totalQuestions || session.questionCount || 0
                const dateFormatted = formatDate(session.createdAt)

                return (
                  <div
                    key={session._id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3 transition-colors"
                  >
                    {/* Top Row: Track & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="capitalize font-bold text-slate-950 text-sm">
                          {session.interviewType}
                        </span>
                        <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-2xs font-medium text-slate-700">
                          {session.difficulty}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold capitalize ${
                          isCompleted
                            ? 'bg-slate-950 text-white'
                            : isInProgress
                            ? 'bg-slate-100 text-slate-800 border border-slate-300'
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-white' : 'bg-slate-400'}`} />
                        {session.status?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 text-center">
                      <div>
                        <div className="text-2xs font-medium text-slate-500 uppercase">Score</div>
                        <div className="text-xs font-black text-slate-950">
                          {isCompleted ? `${session.percentage}%` : '—'}
                        </div>
                        {isCompleted && session.maxScore > 0 && (
                          <div className="text-2xs text-slate-500">
                            {session.score}/{session.maxScore}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-2xs font-medium text-slate-500 uppercase">Questions</div>
                        <div className="text-xs font-bold text-slate-900">
                          {questionsAnswered}/{totalQuestions}
                        </div>
                        <div className="text-2xs text-slate-400">answered</div>
                      </div>

                      <div>
                        <div className="text-2xs font-medium text-slate-500 uppercase">Duration</div>
                        <div className="text-xs font-bold text-slate-900">
                          {formatDuration(session.duration)}
                        </div>
                        <div className="text-2xs text-slate-400">{dateFormatted}</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isCompleted ? (
                        <a
                          href={`/mock-interview/session/${session._id}/result`}
                          className="w-full inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          View Result Report
                        </a>
                      ) : isInProgress ? (
                        <a
                          href={`/mock-interview/session/${session._id}`}
                          className="w-full inline-flex items-center justify-center rounded-lg bg-slate-950 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                        >
                          Resume Interview
                        </a>
                      ) : (
                        <div className="text-center text-2xs text-slate-400 py-1">
                          No actions available
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-3 px-4 text-center text-2xs text-slate-500">
        PrepMate Placement Preparation Platform · Interview History
      </footer>
    </div>
  )
}

export default MockInterviewHistory
