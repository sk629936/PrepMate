import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import CoreCSHeader from '../components/core-cs/CoreCSHeader'

export function CoreCSTestResult() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  // Extract ID from pathname: /core-cs/test/:id/result
  const pathParts = window.location.pathname.split('/')
  const testId = pathParts[3] || ''

  const [result, setResult] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'correct' | 'wrong' | 'unattempted'

  useEffect(() => {
    if (isAuthenticated && testId) {
      const fetchResult = async () => {
        try {
          const token = localStorage.getItem('token')
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          const res = await fetch(`${apiBase}/api/core-cs/tests/${testId}/result`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          if (data.success && data.result) {
            setResult(data.result)
          } else {
            setError(data.error || 'Unable to retrieve test result.')
          }
        } catch (err) {
          console.error('Failed to load test result:', err)
          setError('Failed to connect to backend server.')
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchResult()
    }
  }, [isAuthenticated, testId])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading Test Evaluation...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  const accuracy = result && result.totalQuestions > 0 ? Math.round((result.correct / result.totalQuestions) * 100) : 0
  const answers = result?.answers || []

  const filteredAnswers = answers.filter((ans) => {
    if (filterMode === 'correct') return ans.isCorrect
    if (filterMode === 'wrong') return !ans.isCorrect && ans.selectedAnswer !== null
    if (filterMode === 'unattempted') return ans.selectedAnswer === null
    return true
  })

  // Subject Stats map
  const subjectStats = result?.subjectStats || {}
  const topicStats = result?.topicStats || {}

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <CoreCSHeader user={user} logout={logout} breadcrumb="Test Result & Analysis" activeSection="test" />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {isDataLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-950 border-r-transparent mb-3" />
            <p className="text-sm font-medium text-slate-600">Evaluating test responses...</p>
          </div>
        ) : error || !result ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center max-w-md mx-auto my-12">
            <h2 className="text-base font-bold text-slate-950">Result Not Found</h2>
            <p className="mt-1 text-xs text-slate-600">{error || 'This test session could not be found.'}</p>
            <a
              href="/core-cs/test"
              className="mt-4 inline-flex items-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
            >
              Back to Tests
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Score Summary Banner */}
            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                    <span className="rounded bg-slate-200 px-2 py-0.5 font-bold uppercase tracking-wider text-slate-800">
                      Completed
                    </span>
                    <span>Scope: {result.subject}</span>
                    <span>·</span>
                    <span>Difficulty: {result.difficulty}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                    Examination Evaluation Report
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                    Review your score, accuracy, topic breakdown, and comprehensive question explanations below.
                  </p>
                </div>

                {/* Score Card */}
                <div className="flex items-center gap-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                      {result.score} <span className="text-lg font-normal text-slate-400">/ {result.totalQuestions}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                      Score ({accuracy}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Metrics Strip */}
              <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="rounded-lg bg-white border border-slate-200 p-3 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Correct Answers</div>
                  <div className="text-xl font-bold text-emerald-800 mt-1">✓ {result.correct}</div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-3 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Wrong Answers</div>
                  <div className="text-xl font-bold text-rose-800 mt-1">✗ {result.wrong}</div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-3 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Unattempted</div>
                  <div className="text-xl font-bold text-slate-600 mt-1">○ {result.unattempted}</div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-3 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Time Taken</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {Math.floor(result.duration / 60)}m {result.duration % 60}s
                  </div>
                </div>
              </div>
            </section>

            {/* Analytics Breakdown: Subject & Topic Performance */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject Breakdown */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider">
                  Subject Performance Breakdown
                </h2>
                <div className="space-y-3">
                  {Object.entries(subjectStats).map(([subj, stats]) => (
                    <div key={subj} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">{subj}</span>
                        <span className="text-slate-500">
                          {stats.correct} / {stats.total} correct ({stats.accuracy || 0}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-950 rounded-full"
                          style={{ width: `${Math.min(stats.accuracy || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Breakdown */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider">
                  Topic Analysis
                </h2>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {Object.entries(topicStats).map(([top, stats]) => (
                    <div key={top} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800 truncate max-w-[200px]">{top}</span>
                        <span className="text-slate-500">
                          {stats.correct}/{stats.total} ({stats.accuracy || 0}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stats.accuracy >= 70
                              ? 'bg-emerald-700'
                              : stats.accuracy >= 40
                              ? 'bg-slate-700'
                              : 'bg-rose-700'
                          }`}
                          style={{ width: `${Math.min(stats.accuracy || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Question-by-Question Detailed Review */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Detailed Question Review</h2>
                  <p className="text-xs text-slate-600">Inspect verified correct answers and step-by-step solutions.</p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {[
                    { id: 'all', label: `All (${answers.length})` },
                    { id: 'correct', label: `Correct (${result.correct})` },
                    { id: 'wrong', label: `Wrong (${result.wrong})` },
                    { id: 'unattempted', label: `Skipped (${result.unattempted})` },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setFilterMode(btn.id)}
                      className={`px-2.5 py-1 font-semibold rounded-md transition-colors whitespace-nowrap ${
                        filterMode === btn.id
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtered questions list */}
              <div className="space-y-4">
                {filteredAnswers.map((ans, idx) => {
                  const isSkipped = ans.selectedAnswer === null
                  const isCorrect = ans.isCorrect

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-5 sm:p-6 space-y-4 ${
                        isCorrect
                          ? 'border-emerald-200 bg-white'
                          : isSkipped
                          ? 'border-slate-200 bg-slate-50/50'
                          : 'border-rose-200 bg-white'
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-950">Question #{idx + 1}</span>
                          <span className="text-slate-300">·</span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
                            {ans.subject}
                          </span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
                            {ans.topic}
                          </span>
                        </div>

                        <span
                          className={`rounded px-2 py-0.5 font-bold text-2xs uppercase tracking-wider ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-900'
                              : isSkipped
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {isCorrect ? '✓ Correct' : isSkipped ? '○ Unattempted' : '✗ Incorrect'}
                        </span>
                      </div>

                      {/* Question Text */}
                      <div className="text-sm sm:text-base font-semibold text-slate-950 leading-relaxed">
                        {ans.questionText}
                      </div>

                      {/* Options Review */}
                      <div className="space-y-1.5">
                        {ans.options?.map((opt, oIdx) => {
                          const isSelectedByUser = ans.selectedAnswer === opt
                          const isTheCorrectOption = ans.correctAnswer === opt

                          let optClass = 'border-slate-200 bg-white text-slate-700'
                          if (isTheCorrectOption) {
                            optClass = 'border-emerald-700 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-700'
                          } else if (isSelectedByUser && !isCorrect) {
                            optClass = 'border-rose-700 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-700'
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`rounded-md border px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between ${optClass}`}
                            >
                              <span>
                                <strong className="mr-2 font-bold">{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                              </span>
                              {isTheCorrectOption && (
                                <span className="text-xs font-bold text-emerald-800">Correct Answer</span>
                              )}
                              {isSelectedByUser && !isCorrect && (
                                <span className="text-xs font-bold text-rose-800">Your Selection</span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Explanation */}
                      {ans.explanation && (
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs sm:text-sm text-slate-700 space-y-1">
                          <strong className="font-semibold text-slate-950">Explanation: </strong>
                          <span>{ans.explanation}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-slate-200">
              <a
                href="/core-cs"
                className="text-xs font-semibold text-slate-600 hover:text-slate-950"
              >
                ← Back to Core CS Main
              </a>
              <div className="flex items-center gap-3">
                <a
                  href="/core-cs/test"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Take Another Test
                </a>
                <a
                  href="/core-cs/practice?mode=mixed"
                  className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Practice Weak Topics →
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CoreCSTestResult
