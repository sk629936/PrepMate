import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import MockInterviewHeader from '../components/mockInterview/MockInterviewHeader'
import InterviewTypeSelector from '../components/mockInterview/InterviewTypeSelector'
import DifficultySelector from '../components/mockInterview/DifficultySelector'
import QuestionCountSelector from '../components/mockInterview/QuestionCountSelector'
import InterviewHistoryPreview from '../components/mockInterview/InterviewHistoryPreview'

const DURATION_ESTIMATES = {
  5: '~10–15 minutes',
  10: '~20–30 minutes',
  15: '~35–45 minutes',
  20: '~50–60 minutes',
}

export function MockInterview() {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth()

  // Configuration state
  const [interviewType, setInterviewType] = useState('technical')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questionCount, setQuestionCount] = useState(10)

  // Status states
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // History state
  const [history, setHistory] = useState([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)

  // Fetch past interview attempts
  useEffect(() => {
    if (isAuthenticated) {
      const fetchHistory = async () => {
        try {
          const token = localStorage.getItem('token')
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          const res = await fetch(`${apiBase}/api/mock-interviews/history`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const data = await res.json()
          if (data.success && Array.isArray(data.sessions)) {
            setHistory(data.sessions)
          }
        } catch (err) {
          console.error('Failed to load interview history:', err)
        } finally {
          setIsHistoryLoading(false)
        }
      }

      fetchHistory()
    }
  }, [isAuthenticated])

  // Auth loading guard
  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-xs mb-2.5 animate-pulse">
            P
          </div>
          <p className="text-xs font-medium text-slate-600">Loading Mock Interview...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  // Handle Start Interview generation
  const handleStartInterview = async (e) => {
    e.preventDefault()
    if (isGenerating) return

    setIsGenerating(true)
    setErrorMessage(null)

    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const response = await fetch(`${apiBase}/api/mock-interviews/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interviewType,
          difficulty,
          questionCount: Number(questionCount),
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      if (response.ok && data.success && data.session) {
        const sessionId = data.session._id || data.session.id
        try {
          sessionStorage.setItem('currentMockInterviewSession', JSON.stringify(data.session))
        } catch (storageErr) {
          console.warn('Storage quota warning:', storageErr)
        }

        window.location.href = `/mock-interview/session/${sessionId}/check`
      } else {
        if (response.status === 404 || data.error?.toLowerCase().includes('no published questions')) {
          setErrorMessage('Not enough questions are currently available for this interview configuration.')
        } else {
          setErrorMessage(data.error || 'Unable to start the interview right now. Please try again.')
        }
      }
    } catch (err) {
      console.error('Mock interview generation error:', err)
      setErrorMessage('Unable to start the interview right now. Please check your network connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const formattedType = interviewType.charAt(0).toUpperCase() + interviewType.slice(1)
  const durationText = DURATION_ESTIMATES[questionCount] || '~20–30 minutes'

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased">
      {/* Header */}
      <MockInterviewHeader user={user} logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-6 sm:px-6 space-y-6">
        {/* Clean Page Title & Quick Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
              Mock Interview
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Practice a realistic placement interview and identify your strengths and weak areas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/mock-interview/history"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              History
            </a>
            <a
              href="/mock-interview/progress"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              Progress
            </a>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-slate-300 bg-slate-50 p-3.5 flex items-start justify-between gap-2.5 text-xs font-medium text-slate-900"
          >
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-950 shrink-0">Notice:</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-slate-500 hover:text-slate-900 text-xs font-bold shrink-0 p-0.5"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Compact Setup Form */}
        <form onSubmit={handleStartInterview} className="space-y-5">
          {/* 1. Interview Type */}
          <InterviewTypeSelector
            selectedType={interviewType}
            onSelect={(type) => setInterviewType(type)}
          />

          {/* 2. Difficulty Level */}
          <DifficultySelector
            selectedDifficulty={difficulty}
            onSelect={(diff) => setDifficulty(diff)}
          />

          {/* 3. Question Count */}
          <QuestionCountSelector
            selectedCount={questionCount}
            onSelect={(count) => setQuestionCount(count)}
          />

          {/* 4. Compact Summary Card & Action Button */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 transition-all duration-150">
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-bold text-slate-950">
                {formattedType} · {difficulty} · {questionCount} Questions
              </div>
              <p className="text-2xs text-slate-500 font-medium">
                Estimated duration: {durationText}
              </p>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center min-w-[160px] rounded-lg bg-slate-950 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1"
            >
              {isGenerating ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Preparing Interview...
                </span>
              ) : (
                'Start Interview'
              )}
            </button>
          </div>
        </form>

        {/* 5. Previous History */}
        <InterviewHistoryPreview
          history={history}
          isLoading={isHistoryLoading}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-3 px-4 text-center text-2xs text-slate-500">
        PrepMate Placement Preparation Platform · Mock Interview Setup
      </footer>
    </div>
  )
}

export default MockInterview
