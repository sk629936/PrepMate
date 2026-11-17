import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import ResultSummary from '../components/mockInterview/result/ResultSummary'
import ScoreBreakdown from '../components/mockInterview/result/ScoreBreakdown'
import TopicAnalysis from '../components/mockInterview/result/TopicAnalysis'
import QuestionReview from '../components/mockInterview/result/QuestionReview'
import ImprovementPlan from '../components/mockInterview/result/ImprovementPlan'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getSessionIdFromPath() {
  // Matches /mock-interview/session/:id/result
  const parts = window.location.pathname.split('/')
  const sessionIndex = parts.indexOf('session')
  if (sessionIndex !== -1 && parts[sessionIndex + 1]) {
    return parts[sessionIndex + 1]
  }
  return ''
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function formatInterviewType(type) {
  if (!type) return 'Interview'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatDateLong(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ─── Loading skeleton ────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[120, 80, 200, 160].map((h, i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-slate-50" style={{ height: h }} />
      ))}
    </div>
  )
}

// ─── Error / empty state ─────────────────────────────────────────────────────
function StatusScreen({ icon, heading, message, actions }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-sm space-y-4">
        <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
          {icon}
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-950">{heading}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        </div>
        <div className="flex flex-wrap gap-2.5 justify-center pt-1">
          {actions}
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function MockInterviewResult() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const sessionId = getSessionIdFromPath()

  const [result, setResult] = useState(null)
  const [pageState, setPageState] = useState('loading') // 'loading' | 'ready' | 'error' | 'unauthorized' | 'not_found' | 'incomplete'
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!sessionId || isAuthLoading) return
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    let cancelled = false

    const fetchResult = async () => {
      try {
        const res = await fetch(`${API_URL}/api/mock-interviews/${sessionId}/result`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (cancelled) return

        if (res.status === 401) {
          window.location.href = '/login'
          return
        }

        const data = await res.json()

        if (res.status === 403) {
          setPageState('unauthorized')
          setErrorMessage('You do not have permission to view this result.')
          return
        }

        if (res.status === 404) {
          setPageState('not_found')
          setErrorMessage('This interview session could not be found.')
          return
        }

        if (!res.ok || !data.success) {
          const msg = data?.error || ''
          if (msg.toLowerCase().includes('not been completed') || msg.toLowerCase().includes('completed')) {
            setPageState('incomplete')
            setErrorMessage('This interview has not been completed yet.')
            return
          }
          setPageState('error')
          setErrorMessage(msg || 'Unable to load the interview result.')
          return
        }

        setResult(data.result)
        setPageState('ready')
      } catch {
        if (!cancelled) {
          setPageState('error')
          setErrorMessage('Unable to connect to the server. Please check your connection and try again.')
        }
      }
    }

    fetchResult()
    return () => { cancelled = true }
  }, [sessionId, isAuthenticated, isAuthLoading])

  // ── Auth loading ──
  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-xs mb-2.5 animate-pulse">
            P
          </div>
          <p className="text-xs font-medium text-slate-600">Verifying session...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  // ── Non-ready states ──
  const nonReadyStates = {
    unauthorized: {
      heading: 'Access Denied',
      message: errorMessage || 'You do not have permission to view this result.',
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    not_found: {
      heading: 'Session Not Found',
      message: errorMessage || 'This interview session could not be found.',
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    incomplete: {
      heading: 'Interview Not Submitted',
      message: 'Results are only available after the interview is submitted.',
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      heading: 'Unable to Load Result',
      message: errorMessage || 'Something went wrong. Please try again.',
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
  }

  const actionButtons = (
    <>
      <a
        href="/mock-interview"
        className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all duration-150"
      >
        Back to Setup
      </a>
      <a
        href="/mock-interview/history"
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
      >
        View History
      </a>
      {pageState === 'incomplete' && sessionId && (
        <a
          href={`/mock-interview/session/${sessionId}`}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
        >
          Continue Interview
        </a>
      )}
    </>
  )

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased">
        <ResultPageHeader />
        <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-6 sm:px-6">
          <LoadingSkeleton />
        </main>
        <ResultPageFooter />
      </div>
    )
  }

  if (pageState !== 'ready') {
    const state = nonReadyStates[pageState] || nonReadyStates.error
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased">
        <ResultPageHeader />
        <StatusScreen
          heading={state.heading}
          message={state.message}
          icon={state.icon}
          actions={actionButtons}
        />
        <ResultPageFooter />
      </div>
    )
  }

  // ── Ready: render full result ──
  const interviewType = formatInterviewType(result?.interviewType)
  const difficulty = result?.difficulty || ''
  const completionDate = formatDateLong(result?.submittedAt)

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col antialiased">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-xs font-bold text-white shadow-2xs shrink-0"
              aria-hidden="true"
            >
              P
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-950 hidden sm:inline">PrepMate</span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-slate-700">
                {interviewType}
              </span>
              {difficulty && (
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-2xs font-medium text-slate-600 hidden sm:inline">
                  {difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Completion date + quick nav + user avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <a
              href="/mock-interview/history"
              className="hidden sm:inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
            >
              History
            </a>
            <a
              href="/mock-interview/progress"
              className="hidden sm:inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
            >
              Progress
            </a>
            {completionDate && (
              <span className="hidden md:inline text-2xs font-medium text-slate-500">{completionDate}</span>
            )}
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shrink-0"
              title={user?.fullName || 'User'}
            >
              {(user?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        {/* Result title bar */}
        <div className="border-t border-slate-100 bg-slate-50 py-2 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-xs font-bold text-slate-700">Interview Result &amp; Performance Report</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-5 sm:px-6 sm:py-6 space-y-4">
        {/* Summary */}
        <ResultSummary result={result} />

        {/* Score breakdown (technical / HR / difficulty) */}
        <ScoreBreakdown
          technicalScore={result?.technicalScore}
          hrScore={result?.hrScore}
          difficultyStats={result?.difficultyStats}
        />

        {/* Topic analysis */}
        <TopicAnalysis
          topicStats={result?.topicStats}
          strongTopics={result?.strongTopics}
          weakTopics={result?.weakTopics}
        />

        {/* Improvement plan */}
        <ImprovementPlan
          weakTopics={result?.weakTopics}
          answers={result?.answers}
        />

        {/* Question review */}
        <QuestionReview answers={result?.answers} />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="/mock-interview"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all duration-150 active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            New Interview
          </a>
          <a
            href="/mock-interview/history"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all duration-150 active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View History
          </a>
          <a
            href="/mock-interview/progress"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all duration-150 active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            View Progress
          </a>
        </div>
      </main>

      <ResultPageFooter />
    </div>
  )
}

function ResultPageHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-2.5 sm:px-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-xs font-bold text-white shadow-2xs">
          P
        </span>
        <span className="text-sm font-semibold text-slate-950">PrepMate</span>
      </div>
    </header>
  )
}

function ResultPageFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-2.5 px-4 text-center text-2xs text-slate-500">
      PrepMate Placement Preparation Platform · Interview Result
    </footer>
  )
}

export default MockInterviewResult
