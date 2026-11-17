import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'

function Dashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [isDashboardLoading, setIsDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      const fetchDashboard = async () => {
        try {
          const token = localStorage.getItem('token')
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          const data = await res.json()
          if (data.success) {
            setDashboardData(data)
          } else {
            setDashboardError('Failed to load dashboard data.')
          }
        } catch {
          setDashboardError('Failed to load dashboard data.')
        } finally {
          setIsDashboardLoading(false)
        }
      }
      fetchDashboard()
    }
  }, [isAuthenticated])

  // 1. Guard check while resolving session
  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading your preparation space...</p>
        </div>
      </main>
    )
  }

  // 2. Unauthenticated state guard
  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  // 3. Dashboard Data Loading Guard
  if (isDashboardLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading your dashboard...</p>
        </div>
      </main>
    )
  }

  // 4. Dashboard Data Error Guard
  if (dashboardError) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Unable to load your dashboard.</h2>
        <p className="text-sm text-slate-600 mb-6">Please try again.</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Try Again
        </button>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col">
      {/* Top Header / App Shell */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 rounded-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">
                P
              </span>
              PrepMate
            </a>
            <span className="hidden sm:inline-block rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">
                {user.fullName || 'Candidate'}
              </span>
              <span className="text-xs text-slate-500 truncate max-w-[180px]">
                {user.email}
              </span>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-sm font-bold text-slate-800" title={user.fullName}>
              {(user.fullName || 'U').charAt(0).toUpperCase()}
            </div>

            {user.role === 'admin' && (
              <a
                href="/admin"
                id="dashboard-admin-panel-link"
                className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs hidden sm:inline-flex"
                aria-label="Open Admin Panel"
              >
                Admin Panel
              </a>
            )}

            <button
              type="button"
              onClick={logout}
              className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs"
              aria-label="Sign out of account"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                PLACEMENT PREPARATION WORKSPACE
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">
                Welcome back, {user.fullName || 'Candidate'}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 max-w-2xl">
                Track your consistent progress across technical problem solving, aptitude assessments, and interview prep.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-700">Account Status: Active</span>
            </div>
          </div>
        </section>

        {/* Readiness Overview Metrics */}
        <section aria-labelledby="readiness-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="readiness-heading" className="text-lg font-semibold text-slate-950">
              Readiness Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1 */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Readiness Score
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950">{dashboardData?.progress?.overall || 0}%</span>
                {(!dashboardData?.progress?.overall || dashboardData.progress.overall === 0) && (
                  <span className="text-xs text-slate-500">No activity yet</span>
                )}
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full transition-all duration-500" style={{ width: `${dashboardData?.progress?.overall || 0}%` }} />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                DSA Problems
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950">{dashboardData?.progress?.dsa?.solved || 0}</span>
                <span className="text-xs text-slate-500">
                  / {dashboardData?.progress?.dsa?.total || 45} Solved ({dashboardData?.progress?.dsa?.percent || 0}%)
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full transition-all duration-500" style={{ width: `${Math.min(dashboardData?.progress?.dsa?.percent || 0, 100)}%` }} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Aptitude Assessment
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950">
                  {dashboardData?.progress?.aptitude?.attempted || 0}
                </span>
                {(!dashboardData?.progress?.aptitude?.attempted || dashboardData.progress.aptitude.attempted === 0) ? (
                  <span className="text-xs text-slate-500">0% Accuracy · No activity yet</span>
                ) : (
                  <span className="text-xs text-slate-500">
                    Attempted · {dashboardData?.progress?.aptitude?.accuracy || 0}% Accuracy
                  </span>
                )}
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(dashboardData?.progress?.aptitude?.accuracy || 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mock Interviews
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950">{dashboardData?.progress?.interview?.completed || 0}</span>
                {(!dashboardData?.progress?.interview?.completed || dashboardData.progress.interview.completed === 0) ? (
                  <span className="text-xs text-slate-500">No activity yet</span>
                ) : (
                  <span className="text-xs text-slate-500">/ 10 Completed</span>
                )}
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(((dashboardData?.progress?.interview?.completed || 0) / 10) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Core Preparation Categories */}
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="text-lg font-semibold text-slate-950 mb-4">
            Preparation Modules
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Category 1: DSA */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Module 01
                  </span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
                    Core CS
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  Data Structures & Algorithms
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Topic-wise curated problems covering Arrays, Trees, Dynamic Programming, Graphs, and System Design concepts.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded bg-slate-100 px-2.5 py-1">Arrays & Strings</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1">Trees & Graphs</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1">Dynamic Programming</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Active Module</span>
                <a
                  href="/dsa"
                  className="btn-secondary !min-h-9 !py-1.5 !px-4 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  Start Practice
                </a>
              </div>
            </div>

            {/* Category 2: Aptitude */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Module 02
                  </span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
                    Evaluations
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  Quantitative & Logical Aptitude
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Timed practice drills for Numerical Ability, Logical Reasoning, Verbal Comprehension, and Company Test patterns.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded bg-slate-100 px-2.5 py-1">Quantitative</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1">Logical Reasoning</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1">Verbal Ability</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Active Module</span>
                <a
                  href="/aptitude"
                  className="btn-secondary !min-h-9 !py-1.5 !px-4 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors inline-flex items-center justify-center"
                >
                  Start Practice
                </a>
              </div>
            </div>

            {/* Category 3: Core CS */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Module 03
                  </span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
                    Fundamentals
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  Core CS Subjects
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Essential placement revision for Operating Systems, DBMS, Computer Networks, and Object-Oriented Programming.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded bg-slate-100 px-2.5 py-1">OS</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1">DBMS</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1">Networks</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1">OOPs</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Start your Core CS preparation</span>
                <a
                  href="/core-cs"
                  className="btn-secondary !min-h-9 !py-1.5 !px-4 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors inline-flex items-center justify-center"
                >
                  Start Core CS
                </a>
              </div>
            </div>

            {/* Category 4: Mock Interview */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Module 04
                  </span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
                    Interviews
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  Mock Interviews
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Structured technical and HR interview rounds with difficulty customization, objective rubric evaluation, and detailed analytics.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded bg-slate-100 px-2.5 py-1">Technical</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1">HR &amp; Behavioral</span>
                  <span className="rounded bg-slate-100 px-2.5 py-1">Mixed Rounds</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Practice &amp; Calibration</span>
                <a
                  href="/mock-interview"
                  className="btn-secondary !min-h-9 !py-1.5 !px-4 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors inline-flex items-center justify-center"
                >
                  Start Mock Interview
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Aptitude Activity Section */}
        <section aria-labelledby="recent-activity-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="recent-activity-heading" className="text-base font-semibold text-slate-950">
                Recent Aptitude Activity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of your practice drills and full placement assessment evaluations.
              </p>
            </div>
            <a href="/aptitude/practice" className="btn-secondary !min-h-8 !py-1 !px-3 text-xs font-semibold">
              Practice Now →
            </a>
          </div>

          {(!dashboardData?.progress?.aptitude?.recentActivity || dashboardData.progress.aptitude.recentActivity.length === 0) ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <p className="text-xs text-slate-500 font-medium">
                No aptitude assessments completed yet. Take your first practice drill or timed test to view results here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {dashboardData.progress.aptitude.recentActivity.map((act, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900 truncate">{act.title || 'Aptitude Assessment'}</div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-slate-950">Score: {act.score} / {act.totalQuestions}</span>
                    <span className="font-bold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">{act.accuracy}% Acc</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(act.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Next Suggested Action / Empty State */}
        <section className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 sm:p-8 text-center" aria-label="Suggested next activity">
          <h3 className="text-base font-semibold text-slate-950">
            Next Up: Placement Diagnostic Assessment
          </h3>
          <p className="mt-1 text-sm text-slate-600 max-w-lg mx-auto">
            Your personalized preparation path will be calibrated based on your initial diagnostic assessment in the upcoming modules.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        PrepMate Placement Preparation Platform · Authenticated Session
      </footer>
    </div>
  )
}

export default Dashboard
