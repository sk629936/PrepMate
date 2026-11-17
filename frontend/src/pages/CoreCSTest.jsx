import { useState, useEffect, useCallback } from 'react'
import useAuth from '../hooks/useAuth'
import CoreCSHeader from '../components/core-cs/CoreCSHeader'
import { CORE_CS_SUBJECTS_LIST } from '../components/core-cs/coreCSData'

export function CoreCSTest() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  // Read URL query params (?subject=...)
  const queryParams = new URLSearchParams(window.location.search)
  const initialSubject = queryParams.get('subject') || 'Mixed'

  // Test setup form state
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState('Mixed')
  const [subject, setSubject] = useState(initialSubject)
  const [isGenerating, setIsGenerating] = useState(false)
  const [setupError, setSetupError] = useState(null)

  // Active test session state
  const [activeTest, setActiveTest] = useState(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [userAnswers, setUserAnswers] = useState({}) // { [questionId]: selectedOption }
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Submit Test via POST /api/core-cs/tests/:id/submit
  const handleFinalSubmit = useCallback(async () => {
    if (!activeTest || isSubmitting) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const testId = activeTest.id || activeTest._id

      // Calculate total duration spent
      const totalAllocated = activeTest.duration || activeTest.totalQuestions * 60
      const timeSpent = Math.max(totalAllocated - timeRemaining, 1)

      const formattedAnswers = Object.entries(userAnswers).map(([qId, selectedAnswer]) => ({
        questionId: qId,
        selectedAnswer,
      }))

      const res = await fetch(`${apiBase}/api/core-cs/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          duration: timeSpent,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Navigate to result view
        window.location.href = `/core-cs/test/${testId}/result`
      } else {
        alert(data.error || 'Failed to submit test session.')
      }
    } catch (err) {
      console.error('Test submit error:', err)
      alert('Error submitting test. Please try again.')
    } finally {
      setIsSubmitting(false)
      setShowSubmitModal(false)
    }
  }, [activeTest, isSubmitting, timeRemaining, userAnswers])

  // Timer effect for active test
  useEffect(() => {
    if (!activeTest || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Auto-submit on time expiry
          handleFinalSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTest, timeRemaining, handleFinalSubmit])

  // Generate Test via POST /api/core-cs/tests/generate
  const handleGenerateTest = async (e) => {
    e.preventDefault()
    setIsGenerating(true)
    setSetupError(null)

    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const res = await fetch(`${apiBase}/api/core-cs/tests/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionCount,
          difficulty,
          subject: subject === 'Mixed' || subject === 'All' ? 'Mixed' : subject,
        }),
      })

      const data = await res.json()

      if (data.success && data.test) {
        setActiveTest(data.test)
        setCurrentQuestionIdx(0)
        setUserAnswers({})
        setTimeRemaining(data.test.duration || data.test.totalQuestions * 60)
      } else {
        setSetupError(data.error || 'Failed to generate test. Please try different filters.')
      }
    } catch (err) {
      console.error('Test generation error:', err)
      setSetupError('Network error connecting to backend.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading Test Environment...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // If no test is running: Show Test Setup Screen
  if (!activeTest) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col">
        <CoreCSHeader user={user} logout={logout} breadcrumb="Full Test Simulator" activeSection="test" />

        <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-800 mb-2">
                <span>Placement Assessment Simulator</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Generate Core CS Timed Test
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Configure a timed examination session simulating technical rounds in placement assessments. Results include detailed analytics across subjects and weak topics.
              </p>
            </div>

            {setupError && (
              <div className="rounded-md border border-slate-300 bg-slate-50 p-4 text-xs font-medium text-slate-900">
                {setupError}
              </div>
            )}

            <form onSubmit={handleGenerateTest} className="space-y-5">
              {/* Question Count Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Number of Questions
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[10, 20, 30, 50].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`py-2.5 px-3 text-center text-xs font-bold rounded-lg border transition-all ${
                        questionCount === count
                          ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {count} Qs ({count} Mins)
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Scope */}
              <div>
                <label htmlFor="test-subject" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Subject Scope
                </label>
                <select
                  id="test-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Mixed">Mixed (All Core CS Subjects)</option>
                  {CORE_CS_SUBJECTS_LIST.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['Mixed', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2.5 px-3 text-center text-xs font-bold rounded-lg border transition-all ${
                        difficulty === diff
                          ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Guidelines */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <div className="font-bold text-slate-900">Test Rules:</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Each question has exactly 4 options with 1 correct answer (+1 mark).</li>
                  <li>Questions can be navigated freely and reviewed before submission.</li>
                  <li>Answers are evaluated by the backend upon test submission.</li>
                  <li>The test will auto-submit when the countdown timer reaches 00:00.</li>
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full inline-flex items-center justify-center rounded-md bg-slate-950 py-3 px-4 text-sm font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? 'Generating Test...' : 'Start Timed Test Now →'}
              </button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  // Active Timed Test Screen
  const currentQ = activeTest.questions[currentQuestionIdx]
  const currentQId = currentQ?._id || currentQ?.id
  const selectedForCurrent = userAnswers[currentQId] || null
  const answeredCount = Object.keys(userAnswers).length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Test Navigation Bar with Timer */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-950 text-sm sm:text-base">
              Core CS Test: {activeTest.subject}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-700">
              {answeredCount} / {activeTest.totalQuestions} Answered
            </span>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-4">
            <div
              className={`font-mono text-sm sm:text-base font-bold px-3 py-1 rounded-md border ${
                timeRemaining <= 60
                  ? 'border-rose-300 bg-rose-50 text-rose-800 animate-pulse'
                  : 'border-slate-200 bg-slate-100 text-slate-900'
              }`}
            >
              ⏱ {formatTimer(timeRemaining)}
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center rounded-md bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              Submit Test
            </button>
          </div>
        </div>
      </header>

      {/* Main Test Workspace */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Card (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-950 text-sm">
                  Question {currentQuestionIdx + 1} of {activeTest.totalQuestions}
                </span>
                <span className="text-slate-300">·</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                  {currentQ?.subject}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                  {currentQ?.topic}
                </span>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-2xs text-slate-700">
                {currentQ?.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-medium text-slate-950 leading-relaxed">
              {currentQ?.question}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3" role="radiogroup">
              {currentQ?.options?.map((option, idx) => {
                const isSelected = selectedForCurrent === option
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setUserAnswers((prev) => ({
                        ...prev,
                        [currentQId]: option,
                      }))
                    }
                    className={`w-full rounded-lg border p-4 text-left text-sm transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-slate-950 bg-slate-50 text-slate-950 ring-1 ring-slate-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50/70'
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-400 text-xs font-bold text-slate-800">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{option}</span>
                  </button>
                )
              })}
            </div>

            {/* Navigation & Clear Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(p - 1, 0))}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  disabled={currentQuestionIdx === activeTest.totalQuestions - 1}
                  onClick={() => setCurrentQuestionIdx((p) => Math.min(p + 1, activeTest.totalQuestions - 1))}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>

              {selectedForCurrent && (
                <button
                  type="button"
                  onClick={() => {
                    const copy = { ...userAnswers }
                    delete copy[currentQId]
                    setUserAnswers(copy)
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 underline"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Question Palette Navigator (1 col) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Question Palette
            </h2>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2">
              {activeTest.questions.map((q, idx) => {
                const qId = q._id || q.id
                const isAnswered = Boolean(userAnswers[qId])
                const isCurrent = currentQuestionIdx === idx

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-9 w-full rounded-md text-xs font-bold transition-all ${
                      isCurrent
                        ? 'ring-2 ring-slate-950 bg-slate-950 text-white'
                        : isAnswered
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 text-2xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-slate-800" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-slate-100 border border-slate-300" />
                <span>Unanswered ({activeTest.totalQuestions - answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-slate-950 ring-1 ring-slate-950" />
                <span>Current Question</span>
              </div>
            </div>

            {/* Final Submit Prompt */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="w-full mt-2 inline-flex items-center justify-center rounded-md bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              Submit Examination
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-slate-950">Confirm Test Submission</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You have answered <strong className="text-slate-950">{answeredCount}</strong> out of{' '}
              <strong className="text-slate-950">{activeTest.totalQuestions}</strong> questions.
              {activeTest.totalQuestions - answeredCount > 0 && (
                <span className="block mt-1 text-rose-700 font-medium">
                  Warning: {activeTest.totalQuestions - answeredCount} questions will be marked as unattempted.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Continue Test
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoreCSTest
