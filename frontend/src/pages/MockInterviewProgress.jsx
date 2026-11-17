import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import MockInterviewHeader from '../components/mockInterview/MockInterviewHeader'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function MiniBar({ value, height = 'h-1.5' }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100)
  return (
    <div className={`${height} w-full rounded-full bg-slate-100 overflow-hidden`}>
      <div
        className="h-full bg-slate-900 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function MockInterviewProgress() {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgress = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/mock-interviews/progress`, {
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
        setError('You do not have permission to view interview progress.')
        return
      }

      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error || 'Failed to load progress analytics.')
        return
      }

      setData(json.progress || {})
    } catch {
      setError('Network error. Unable to fetch progress analytics. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return
    fetchProgress()
  }, [isAuthenticated, isAuthLoading])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center animate-pulse">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-xs mb-2.5">
            P
          </div>
          <p className="text-xs font-medium text-slate-600">Loading progress dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  const p = data || {}
  const totalInterviews = p.totalInterviews || 0
  const completedInterviews = p.completedInterviews || 0
  const completionRate = totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0
  const averagePercentage = p.overallAveragePercentage || 0
  const totalAnswered = p.totalAnsweredQuestions || 0
  const totalQuestions = p.totalQuestionsCount || 0

  // Topic Breakdown entries
  let topicEntries = []
  if (p.topicBreakdown && typeof p.topicBreakdown === 'object') {
    topicEntries = Object.entries(p.topicBreakdown)
    topicEntries.sort((a, b) => (b[1].percentage || 0) - (a[1].percentage || 0))
  }

  const strongTopics = Array.isArray(p.strongTopics) ? p.strongTopics : []
  const weakTopics = Array.isArray(p.weakTopics) ? p.weakTopics : []
  const recentInterviews = Array.isArray(p.recentInterviews) ? p.recentInterviews : []

  // Derive improvement over time if >= 2 completed interviews exist
  let trajectoryDelta = null
  let trajectoryDirection = 'neutral'
  if (recentInterviews.length >= 2) {
    const latestScore = Number(recentInterviews[0].percentage) || 0
    const priorScore = Number(recentInterviews[1].percentage) || 0
    trajectoryDelta = latestScore - priorScore
    if (trajectoryDelta > 0) trajectoryDirection = 'up'
    else if (trajectoryDelta < 0) trajectoryDirection = 'down'
  }

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900 flex flex-col antialiased">
      <MockInterviewHeader user={user} logout={logout} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6 sm:px-6 space-y-6">
        {/* Header & Quick Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
              Progress Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Track your cumulative mock interview performance, track competencies, and topic mastery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/mock-interview/history"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View History
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
              onClick={fetchProgress}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-2xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4 animate-pulse" aria-busy="true">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 rounded-xl border border-slate-200 bg-white" />
              <div className="h-64 rounded-xl border border-slate-200 bg-white" />
            </div>
          </div>
        )}

        {/* Empty State: No Completed Interviews Yet */}
        {!isLoading && (!data || completedInterviews === 0) && !error && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h2 className="text-sm font-bold text-slate-950">No Completed Interviews Yet</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {totalInterviews > 0
                  ? 'You have started an interview, but have not submitted any completed sessions yet. Submit an interview to populate analytics.'
                  : 'Complete your first mock interview to view comprehensive analytics, track scores, and topic recommendations.'}
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

        {/* Populated Dashboard Content */}
        {!isLoading && data && completedInterviews > 0 && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* 1. Completed Interviews */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-1">
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
                  Interviews Completed
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums">
                    {completedInterviews}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    / {totalInterviews} started
                  </span>
                </div>
                <div className="pt-1">
                  <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-2xs font-semibold text-slate-700">
                    {completionRate}% completion rate
                  </span>
                </div>
              </div>

              {/* 2. Average Score */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-1">
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall Average
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums">
                    {averagePercentage}
                  </span>
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
                <p className="text-2xs text-slate-500 pt-1 font-medium">
                  Across all completed rounds
                </p>
              </div>

              {/* 3. Questions Answered */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-1">
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
                  Questions Answered
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums">
                    {totalAnswered}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    / {totalQuestions}
                  </span>
                </div>
                <p className="text-2xs text-slate-500 pt-1 font-medium">
                  {totalQuestions > 0 ? `${Math.round((totalAnswered / totalQuestions) * 100)}% answered` : '0%'}
                </p>
              </div>

              {/* 4. Recent Trajectory */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-1">
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
                  Recent Trend
                </p>
                <div className="flex items-baseline gap-1.5">
                  {trajectoryDelta !== null ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-black text-slate-950 tabular-nums">
                        {trajectoryDelta > 0 ? `+${trajectoryDelta}` : trajectoryDelta}%
                      </span>
                      <span className="text-2xs font-bold text-slate-600">
                        vs prior session
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-slate-700 py-1">
                      Baseline established
                    </span>
                  )}
                </div>
                <p className="text-2xs text-slate-500 pt-1 font-medium">
                  {trajectoryDirection === 'up'
                    ? 'Performance improving'
                    : trajectoryDirection === 'down'
                    ? 'Review weak areas below'
                    : '1 completed round'}
                </p>
              </div>
            </div>

            {/* Performance Breakdown: Track Performance & Topic Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Technical vs HR Performance */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-slate-950">Track Competency</h2>
                  <p className="text-2xs text-slate-500">
                    Cumulative score comparison between Technical and Behavioural / HR interview tracks.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Technical */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">Technical Track</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs text-slate-500 font-medium">
                          {p.technicalPerformance?.score || 0} / {p.technicalPerformance?.maxScore || 0} pts
                        </span>
                        <span className="font-bold text-slate-950">
                          {p.technicalPerformance?.percentage || 0}%
                        </span>
                      </div>
                    </div>
                    <MiniBar value={p.technicalPerformance?.percentage || 0} height="h-2" />
                  </div>

                  {/* HR / Behavioural */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">Behavioural / HR Track</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs text-slate-500 font-medium">
                          {p.hrPerformance?.score || 0} / {p.hrPerformance?.maxScore || 0} pts
                        </span>
                        <span className="font-bold text-slate-950">
                          {p.hrPerformance?.percentage || 0}%
                        </span>
                      </div>
                    </div>
                    <MiniBar value={p.hrPerformance?.percentage || 0} height="h-2" />
                  </div>
                </div>

                {/* Insight Note */}
                <div className="rounded-lg bg-slate-50 border border-slate-200/60 p-3 text-2xs text-slate-600 leading-relaxed">
                  {p.technicalPerformance?.percentage > p.hrPerformance?.percentage ? (
                    <span>
                      <strong className="text-slate-900 font-semibold">Track Insight: </strong>
                      Technical proficiency is leading HR performance by{' '}
                      {p.technicalPerformance.percentage - p.hrPerformance.percentage}%. Consider practicing more behavioral questions.
                    </span>
                  ) : p.hrPerformance?.percentage > p.technicalPerformance?.percentage ? (
                    <span>
                      <strong className="text-slate-900 font-semibold">Track Insight: </strong>
                      Behavioural responses are leading Technical responses by{' '}
                      {p.hrPerformance.percentage - p.technicalPerformance.percentage}%. Focus practice on core technical algorithms and concepts.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-slate-900 font-semibold">Track Insight: </strong>
                      Balanced performance across both technical and behavioral interview formats.
                    </span>
                  )}
                </div>
              </div>

              {/* Strengths & Weak Areas */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-slate-950">Topic Mastery</h2>
                  <p className="text-2xs text-slate-500">
                    Topics categorized by evaluation benchmark (&ge;70% strong, &lt;70% needs practice).
                  </p>
                </div>

                {/* Strong Topics */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                    Strong Topics (&ge;70%)
                  </div>
                  {strongTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {strongTopics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center rounded-md bg-slate-950 px-2.5 py-1 text-2xs font-semibold text-white"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-2xs text-slate-400 italic">
                      No topics have reached &ge;70% score yet.
                    </p>
                  )}
                </div>

                {/* Weak Topics */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Focus Areas (&lt;70%)
                  </div>
                  {weakTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {weakTopics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-2xs font-semibold text-slate-800"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-2xs text-slate-400 italic">
                      No weak topics identified yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Performance & Timeline */}
            {recentInterviews.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-slate-950">Recent Completed Interviews</h2>
                    <p className="text-2xs text-slate-500">
                      Performance history from your latest {recentInterviews.length} completed session{recentInterviews.length !== 1 ? 's' : ''}.
                    </p>
                  </div>
                  <a
                    href="/mock-interview/history"
                    className="text-xs font-semibold text-slate-800 hover:text-slate-950 inline-flex items-center gap-1 self-start sm:self-center"
                  >
                    View All History &rarr;
                  </a>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentInterviews.map((session, index) => {
                    const sessionId = session.id || session._id
                    const dateStr = formatDate(session.submittedAt || session.createdAt)
                    const pct = Number(session.percentage) || 0

                    return (
                      <div
                        key={sessionId || index}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-2xs text-slate-700 shrink-0">
                            #{index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="capitalize font-bold text-slate-900">
                                {session.interviewType} Interview
                              </span>
                              <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-2xs font-medium text-slate-700">
                                {session.difficulty}
                              </span>
                            </div>
                            <span className="text-2xs text-slate-400 font-medium">
                              {dateStr} · {session.answeredQuestions || 0} / {session.totalQuestions || 0} questions
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right sm:w-28">
                            <span className="font-black text-slate-950 text-sm">
                              {pct}%
                            </span>
                            <MiniBar value={pct} height="h-1" />
                          </div>
                          {sessionId && (
                            <a
                              href={`/mock-interview/session/${sessionId}/result`}
                              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-2xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors shrink-0"
                            >
                              View Result
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Detailed Topic Breakdown */}
            {topicEntries.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-slate-950">Detailed Topic Breakdown</h2>
                  <p className="text-2xs text-slate-500">
                    Granular performance statistics across every evaluated interview topic.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                  {topicEntries.map(([topic, stats]) => {
                    const pct = stats.percentage || 0
                    const answered = stats.answered || 0
                    const total = stats.total || 0
                    const score = stats.score || 0
                    const maxScore = stats.maxScore || 0

                    return (
                      <div
                        key={topic}
                        className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 space-y-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-xs font-semibold text-slate-900 block">
                              {topic}
                            </span>
                            <span className="text-2xs text-slate-500 font-medium">
                              {answered} / {total} answered · {score} / {maxScore} pts
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-950 tabular-nums">
                            {pct}%
                          </span>
                        </div>
                        <MiniBar value={pct} height="h-1.5" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-3 px-4 text-center text-2xs text-slate-500">
        PrepMate Placement Preparation Platform · Progress Dashboard
      </footer>
    </div>
  )
}

export default MockInterviewProgress
