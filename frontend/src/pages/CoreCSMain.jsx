import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import CoreCSHeader from '../components/core-cs/CoreCSHeader'
import { CORE_CS_SUBJECTS_LIST } from '../components/core-cs/coreCSData'

export function CoreCSMain() {
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
          }
        } catch (err) {
          console.error('Failed to load Core CS progress:', err)
          setError('Unable to load progress. You can still practice subjects and take tests.')
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
          <p className="text-sm font-medium text-slate-600">Loading Core CS Workspace...</p>
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
  const hasActivity = overall.totalAttempts > 0

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <CoreCSHeader user={user} logout={logout} activeSection="subjects" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {error && (
          <div className="rounded-md border border-slate-300 bg-slate-50 p-4 text-xs font-medium text-slate-800">
            {error}
          </div>
        )}

        {/* Banner Section */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 mb-3">
                <span>Placement Core Curriculum</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                Core Computer Science Preparation
              </h1>
              <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-slate-600">
                Master the fundamental engineering subjects tested in technical interviews and campus placement drives. Study verified theory notes, review slides, practice topic-wise questions, and simulate full sectional timed tests.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <a
                href="/core-cs/practice?mode=mixed"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors text-center"
              >
                Mixed Practice
              </a>
              <a
                href="/core-cs/test"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-center"
              >
                Full Test
              </a>
              <a
                href="/core-cs/progress"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-center"
              >
                My Progress
              </a>
            </div>
          </div>
        </section>

        {/* Readiness / Overall Progress Snapshot */}
        <section aria-labelledby="overview-heading">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="overview-heading" className="text-sm font-semibold uppercase tracking-wider text-slate-600">
                Your Core CS Readiness
              </h2>
              {hasActivity && (
                <a href="/core-cs/progress" className="text-xs font-semibold text-slate-900 hover:underline">
                  View Detailed Analytics →
                </a>
              )}
            </div>

            {isDataLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">Calculating your performance metrics...</div>
            ) : hasActivity ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Total Questions Attempted</div>
                  <div className="mt-1 text-2xl font-bold text-slate-950">{overall.totalAttempts || 0}</div>
                  <div className="mt-1 text-xs text-slate-500">{overall.uniqueSolved || 0} solved correctly</div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Overall Accuracy</div>
                  <div className="mt-1 text-2xl font-bold text-slate-950">{overall.accuracy || 0}%</div>
                  <div className="mt-1 text-xs text-slate-500">{overall.totalCorrect || 0} correct out of {overall.totalAttempts || 0}</div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Subjects Active</div>
                  <div className="mt-1 text-2xl font-bold text-slate-950">
                    {Object.values(subjectStats).filter((s) => s.attempted > 0).length} / 8
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Subjects practiced</div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="text-xs text-slate-500 font-medium">Unique Solved</div>
                  <div className="mt-1 text-2xl font-bold text-slate-950">{overall.uniqueSolved || 0}</div>
                  <div className="mt-1 text-xs text-slate-500">Distinct questions</div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm font-medium text-slate-700">
                  Start practicing to build your Core CS progress.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your accuracy and subject readiness will be tracked automatically as you solve questions.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 8 Subjects Grid */}
        <section aria-labelledby="subjects-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="subjects-heading" className="text-xl font-bold tracking-tight text-slate-950">
                Core CS Subjects (8 Modules)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Select a subject to review educational theory, access study notes, and practice topic-specific questions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_CS_SUBJECTS_LIST.map((subject, idx) => {
              const stat = subjectStats[subject.name] || {}
              const attempted = stat.attempted || 0
              const accuracy = stat.accuracy || 0

              return (
                <div
                  key={subject.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold uppercase tracking-wider text-slate-500">Module 0{idx + 1}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-700">
                        {subject.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-950 tracking-tight">
                      {subject.name}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {subject.description}
                    </p>

                    {/* Key Topics tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {subject.topics.slice(0, 3).map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                      {subject.topics.length > 3 && (
                        <span className="rounded bg-slate-50 px-1.5 py-0.5 text-2xs text-slate-500">
                          +{subject.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress & Card Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-slate-500">
                        {attempted > 0 ? `${attempted} attempted · ${accuracy}% accuracy` : 'No attempts yet'}
                      </span>
                      {attempted > 0 && (
                        <span className="font-semibold text-slate-900">{stat.uniqueSolved || 0} solved</span>
                      )}
                    </div>

                    {attempted > 0 && (
                      <div className="mb-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-950 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(accuracy, 100)}%` }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <a
                        href={`/core-cs/${encodeURIComponent(subject.name)}`}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors text-center"
                      >
                        Study & Practice
                      </a>
                      <a
                        href={`/core-cs/practice?subject=${encodeURIComponent(subject.name)}`}
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors text-center"
                        title="Practice questions directly"
                      >
                        Practice
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default CoreCSMain
