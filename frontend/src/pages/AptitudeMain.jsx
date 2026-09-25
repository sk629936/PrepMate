import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'

function AptitudeMain() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('quant') // 'quant' | 'logical' | 'verbal' | 'tests' | 'progress'
  const [progress, setProgress] = useState(null)
  const [categories, setCategories] = useState([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token')
          const headers = { Authorization: `Bearer ${token}` }
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

          const [catRes, progRes] = await Promise.all([
            fetch(`${apiBase}/api/aptitude/categories`, { headers }),
            fetch(`${apiBase}/api/aptitude/progress`, { headers }),
          ])

          const catData = await catRes.json()
          const progData = await progRes.json()

          if (catData.success) setCategories(catData.categories)
          if (progData.success) setProgress(progData.progress)
        } catch (err) {
          console.error('Failed to load aptitude main data:', err)
        } finally {
          setIsDataLoading(false)
        }
      }
      fetchData()
    }
  }, [isAuthenticated])

  if (isLoading || isDataLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading Aptitude Preparation Hub...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  const currentCategoryObj = categories.find((c) => c.id === activeTab)

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col">
      {/* Header Shell */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 rounded-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">
                P
              </span>
              PrepMate
            </a>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800">Aptitude Preparation</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs"
            >
              Dashboard
            </a>
            {user.role === 'admin' && (
              <a
                href="/aptitude/admin"
                className="btn-primary !min-h-9 !py-1.5 !px-3 text-xs bg-slate-900 text-white hover:bg-slate-800"
              >
                Admin Question Bank
              </a>
            )}
            <button
              type="button"
              onClick={logout}
              className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs text-slate-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-3">
                <span>Placement Pattern Bank</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">
                Aptitude Preparation
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 max-w-3xl">
                Master placement aptitude questions designed around common patterns seen across IT, product, and enterprise placement assessments.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/aptitude/practice"
                className="btn-primary !min-h-10 text-xs sm:text-sm"
              >
                Practice Questions
              </a>
              <a
                href="/aptitude/test"
                className="btn-secondary !min-h-10 text-xs sm:text-sm"
              >
                Full Aptitude Test
              </a>
            </div>
          </div>
        </section>

        {/* Real User Progress Cards */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Progress Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Questions Attempted
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950">
                  {progress?.totalAttempted || 0}
                </span>
                <span className="text-xs text-slate-500">questions</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Overall Accuracy
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950">
                  {progress?.accuracy || 0}%
                </span>
                <span className="text-xs text-slate-500">correct rate</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tests Completed
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950">
                  {progress?.testsCompleted || 0}
                </span>
                <span className="text-xs text-slate-500">full tests</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Best Test Score
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-950">
                  {progress?.bestTestScore || 0}
                </span>
                <span className="text-xs text-slate-500">marks</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section Navigation Tabs */}
        <section aria-labelledby="sections-heading" className="space-y-6">
          <div className="border-b border-slate-200">
            <nav className="flex flex-wrap gap-2 -mb-px" aria-label="Aptitude Categories">
              <button
                type="button"
                onClick={() => setActiveTab('quant')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'quant'
                    ? 'border-slate-950 text-slate-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Quantitative Aptitude ({categories.find((c) => c.id === 'quant')?.chaptersCount || 30})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logical')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'logical'
                    ? 'border-slate-950 text-slate-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Logical Reasoning ({categories.find((c) => c.id === 'logical')?.chaptersCount || 21})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('verbal')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'verbal'
                    ? 'border-slate-950 text-slate-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Verbal Ability ({categories.find((c) => c.id === 'verbal')?.chaptersCount || 22})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tests')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'tests'
                    ? 'border-slate-950 text-slate-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Full Aptitude Tests
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'progress'
                    ? 'border-slate-950 text-slate-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                My Progress
              </button>
            </nav>
          </div>

          {/* Tab Content: Category Chapters */}
          {(activeTab === 'quant' || activeTab === 'logical' || activeTab === 'verbal') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {currentCategoryObj?.name || 'Aptitude Category'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {currentCategoryObj?.description}
                  </p>
                </div>
                <a
                  href={`/aptitude/practice?category=${encodeURIComponent(currentCategoryObj?.name || '')}`}
                  className="btn-primary !min-h-9 !py-1.5 !px-4 text-xs shrink-0 self-start sm:self-auto"
                >
                  Practice This Category
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {currentCategoryObj?.chapters.map((chapterName, idx) => (
                  <a
                    key={chapterName}
                    href={`/aptitude/practice?category=${encodeURIComponent(currentCategoryObj.name)}&chapter=${encodeURIComponent(chapterName)}`}
                    className="group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-400 hover:shadow-sm flex items-start justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        CH {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-slate-950 mt-1">
                        {chapterName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Placement pattern questions
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:translate-x-0.5 transition-transform mt-1">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Full Aptitude Tests */}
          {activeTab === 'tests' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
                    Recommended
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">
                    Placement Aptitude Test
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Real combined first-round assessment simulation combining Quantitative, Logical, and Verbal reasoning questions based on common placement test patterns.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="rounded bg-slate-100 px-2.5 py-1">10–50 Questions</span>
                    <span className="rounded bg-slate-100 px-2.5 py-1">Timed Session</span>
                    <span className="rounded bg-slate-100 px-2.5 py-1">Detailed Analysis</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Auto-evaluates weak topics</span>
                  <a
                    href="/aptitude/test?type=placement-test"
                    className="btn-primary !min-h-9 !py-1.5 !px-4 text-xs"
                  >
                    Start Placement Test
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                    Sectional Test
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">
                    Quantitative Aptitude Test
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Speed and accuracy drill covering numerical system, percentages, time & work, algebra, and data interpretation.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Timed 15–45 mins</span>
                  <a
                    href="/aptitude/test?type=quant-test"
                    className="btn-secondary !min-h-9 !py-1.5 !px-4 text-xs"
                  >
                    Start Quant Test
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                    Sectional Test
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">
                    Logical Reasoning Test
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Analytical problem-solving covering number series, coding-decoding, blood relations, and seating arrangement.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Timed 15–45 mins</span>
                  <a
                    href="/aptitude/test?type=logical-test"
                    className="btn-secondary !min-h-9 !py-1.5 !px-4 text-xs"
                  >
                    Start Logical Test
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                    Sectional Test
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">
                    Verbal Ability Test
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Grammar, reading comprehension, sentence correction, and vocabulary assessment.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Timed 15–45 mins</span>
                  <a
                    href="/aptitude/test?type=verbal-test"
                    className="btn-secondary !min-h-9 !py-1.5 !px-4 text-xs"
                  >
                    Start Verbal Test
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: My Progress */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Category Breakdown */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-950 mb-4">
                  Category Performance Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(progress?.categoryStats || {}).map(([catName, stats]) => (
                    <div key={catName} className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {catName}
                      </h4>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-slate-950">{stats.accuracy}%</span>
                        <span className="text-xs text-slate-500">{stats.correct} / {stats.attempted} correct</span>
                      </div>
                      <div className="mt-3 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-500"
                          style={{ width: `${stats.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak & Strong Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-950 mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
                    Focus Topics (Accuracy &lt; 50%)
                  </h3>
                  {progress?.weakTopics && progress.weakTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {progress.weakTopics.map((top) => (
                        <a
                          key={top}
                          href={`/aptitude/practice?chapter=${encodeURIComponent(top)}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-950 hover:text-white transition-colors"
                        >
                          <span>Practice {top}</span>
                          <span>→</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No weak topics detected yet. Complete practice sessions or tests to identify weak areas.</p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-950 mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-950" aria-hidden="true" />
                    Strong Topics (Accuracy ≥ 75%)
                  </h3>
                  {progress?.strongTopics && progress.strongTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {progress.strongTopics.map((top) => (
                        <span key={top} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-800">
                          {top}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Keep practicing to build strong topic mastery.</p>
                  )}
                </div>
              </div>

              {/* Test Attempt History */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-950 mb-4">
                  Recent Test Attempts
                </h3>
                {progress?.testAttempts && progress.testAttempts.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {progress.testAttempts.map((test) => (
                      <div key={test.id} className="py-3 flex items-center justify-between text-sm">
                        <div>
                          <div className="font-semibold text-slate-900">{test.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {new Date(test.createdAt).toLocaleDateString()} · {test.totalQuestions} Questions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-950">{test.score} marks ({test.accuracy}%)</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No full test attempts recorded yet. Take a Placement Aptitude Test to track history.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AptitudeMain
