import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import CoreCSHeader from '../components/core-cs/CoreCSHeader'
import { CORE_CS_SUBJECTS_LIST } from '../components/core-cs/coreCSData'

export function CoreCSProgress() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [progressData, setProgressData] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      const fetchProgress = async () => {
        try {
          const token = localStorage.getItem('token')
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          const res = await fetch(`${apiBase}/api/core-cs/progress`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()
          if (data.success && data.progress) {
            setProgressData(data.progress)
          } else {
            setError(data.error || 'Unable to load progress data.')
          }
        } catch (err) {
          console.error('Failed to load progress:', err)
          setError('Failed to reach backend server.')
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchProgress()
    }
  }, [isAuthenticated])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading Progress Analytics...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  const overall = progressData?.overall || {}
  const subjectStats = progressData?.subjectStats || {}
  const recentAttempts = progressData?.recentAttempts || []
  const hasActivity = overall.totalAttempts > 0

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <CoreCSHeader user={user} logout={logout} breadcrumb="Progress Analytics" activeSection="progress" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 mb-2">
                <span>Personal Performance Record</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                Core CS Progress & Mastery
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Live performance tracking aggregated from your actual multiple-choice attempts and examinations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/core-cs/practice?mode=mixed"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
              >
                Continue Practice
              </a>
              <a
                href="/core-cs/test"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Take Test
              </a>
            </div>
          </div>
        </section>

        {isDataLoading ? (
          <div className="py-20 text-center text-sm text-slate-500">
            Calculating analytics from your attempt records...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-medium text-slate-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : !hasActivity ? (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center max-w-lg mx-auto my-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-700 mb-3">
              📊
            </div>
            <h3 className="text-base font-bold text-slate-950">
              Start practicing to build your Core CS progress.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              You have not attempted any questions yet. Choose a subject or launch a practice drill to see your accuracy and weak topics here.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href="/core-cs"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Browse Subjects
              </a>
              <a
                href="/core-cs/practice?mode=mixed"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              >
                Quick Mixed Drill
              </a>
            </div>
          </div>
        ) : (
          /* Active Progress Analytics View */
          <div className="space-y-8">
            {/* Overall Analytics Grid */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Attempts
                </div>
                <div className="mt-2 text-3xl font-black text-slate-950">{overall.totalAttempts || 0}</div>
                <div className="mt-1 text-xs text-slate-500">{overall.uniqueAttempted || 0} unique questions</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall Accuracy
                </div>
                <div className="mt-2 text-3xl font-black text-slate-950">{overall.accuracy || 0}%</div>
                <div className="mt-1 text-xs text-slate-500">
                  {overall.totalCorrect || 0} correct / {overall.totalWrong || 0} wrong
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Unique Questions Solved
                </div>
                <div className="mt-2 text-3xl font-black text-slate-950">{overall.uniqueSolved || 0}</div>
                <div className="mt-1 text-xs text-slate-500">Distinct concepts mastered</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Subjects
                </div>
                <div className="mt-2 text-3xl font-black text-slate-950">
                  {Object.values(subjectStats).filter((s) => s.attempted > 0).length} / 8
                </div>
                <div className="mt-1 text-xs text-slate-500">Curriculum coverage</div>
              </div>
            </section>

            {/* Subject Mastery Breakdown (8 Subjects) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                  Subject-Wise Performance (All 8 Subjects)
                </h2>
                <span className="text-xs text-slate-500">Real-time statistics</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CORE_CS_SUBJECTS_LIST.map((subj) => {
                  const stat = subjectStats[subj.name] || {}
                  const attempted = stat.attempted || 0
                  const correct = stat.correct || 0
                  const accuracy = stat.accuracy || 0

                  return (
                    <div
                      key={subj.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-2xs text-slate-500 mb-1">
                          <span className="font-semibold uppercase tracking-wider">{subj.tag}</span>
                          {attempted > 0 && <span className="font-bold text-slate-950">{accuracy}% Accuracy</span>}
                        </div>
                        <h3 className="text-sm font-bold text-slate-950">{subj.name}</h3>

                        <div className="mt-3 text-xs text-slate-600">
                          {attempted > 0 ? (
                            <span>
                              {correct} correct / {attempted} attempts
                            </span>
                          ) : (
                            <span className="text-slate-400">No attempts recorded</span>
                          )}
                        </div>
                      </div>

                      <div>
                        {attempted > 0 && (
                          <div className="mb-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-950 rounded-full"
                              style={{ width: `${Math.min(accuracy, 100)}%` }}
                            />
                          </div>
                        )}

                        <a
                          href={`/core-cs/practice?subject=${encodeURIComponent(subj.name)}`}
                          className="w-full inline-flex items-center justify-center rounded-md border border-slate-300 bg-white py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          {attempted > 0 ? 'Practice More' : 'Start Subject'}
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Recent Attempt History Table */}
            {recentAttempts.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                  Recent Practice Activity
                </h2>

                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-900 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Topic</th>
                        <th className="px-4 py-3">Question Snippet</th>
                        <th className="px-4 py-3">Your Answer</th>
                        <th className="px-4 py-3 text-center">Result</th>
                        <th className="px-4 py-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentAttempts.map((att, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-950">{att.subject}</td>
                          <td className="px-4 py-3 text-slate-600">{att.topic}</td>
                          <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                            {att.question?.question || 'Question reference'}
                          </td>
                          <td className="px-4 py-3 font-mono text-2xs text-slate-600 truncate max-w-[120px]">
                            {att.selectedAnswer}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`rounded px-2 py-0.5 font-bold text-2xs uppercase tracking-wider ${
                                att.isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              {att.isCorrect ? '✓ Correct' : '✗ Wrong'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500 text-xs">
                            {new Date(att.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default CoreCSProgress
