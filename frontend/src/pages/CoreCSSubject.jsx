import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import CoreCSHeader from '../components/core-cs/CoreCSHeader'
import { getSubjectMeta } from '../components/core-cs/coreCSData'

export function CoreCSSubject() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  
  // Extract subject from URL pathname: /core-cs/:subject
  const pathParts = window.location.pathname.split('/')
  const rawSubject = pathParts[2] || ''
  const subjectName = decodeURIComponent(rawSubject).trim()

  const subjectMeta = getSubjectMeta(subjectName)

  const [theories, setTheories] = useState([])
  const [questions, setQuestions] = useState([])
  const [progress, setProgress] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'theory' | 'materials' | 'topics'

  useEffect(() => {
    if (isAuthenticated && subjectName) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token')
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          const headers = token ? { Authorization: `Bearer ${token}` } : {}

          const [theoryRes, qRes, progRes] = await Promise.all([
            fetch(`${apiBase}/api/core-cs/theory?subject=${encodeURIComponent(subjectName)}`, { headers }),
            fetch(`${apiBase}/api/core-cs/questions?subject=${encodeURIComponent(subjectName)}&limit=100`, { headers }),
            token ? fetch(`${apiBase}/api/core-cs/progress`, { headers }) : Promise.resolve({ json: () => ({ success: false }) }),
          ])

          const theoryData = await theoryRes.json()
          const qData = await qRes.json()
          const progData = await progRes.json()

          if (theoryData.success) {
            setTheories(theoryData.materials || [])
          }
          if (qData.success) {
            setQuestions(qData.questions || [])
          }
          if (progData.success && progData.progress) {
            setProgress(progData.progress.subjectStats?.[subjectName] || null)
          }
        } catch (err) {
          console.error('Failed to load subject materials:', err)
          setError('Failed to fetch study materials for this subject.')
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchData()
    }
  }, [isAuthenticated, subjectName])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading {subjectName} Content...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  const textTheories = theories.filter((t) => t.type === 'text')
  const studyMaterials = theories.filter((t) => t.type === 'pdf' || t.type === 'ppt')

  // Derive unique topics from backend questions and theories
  const backendTopics = Array.from(
    new Set([
      ...theories.map((t) => t.topic),
      ...questions.map((q) => q.topic),
      ...(subjectMeta?.topics || []),
    ].filter(Boolean))
  )

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <CoreCSHeader user={user} logout={logout} breadcrumb={subjectName} activeSection="subjects" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Subject Header Banner */}
        <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2 text-xs">
                <a href="/core-cs" className="font-semibold text-slate-600 hover:text-slate-950">
                  ← All Subjects
                </a>
                <span className="text-slate-300">·</span>
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 font-medium text-slate-800">
                  {subjectMeta?.tag || 'Core CS'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                {subjectMeta?.fullName || subjectName}
              </h1>

              <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
                {subjectMeta?.description || 'Study educational concepts, review notes, and practice placement questions for this subject.'}
              </p>

              {/* Subject Metrics Bar */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                <div className="rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                  <span className="text-slate-500">Theory Notes: </span>
                  <span className="font-bold text-slate-950">{textTheories.length}</span>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                  <span className="text-slate-500">Slides & PDFs: </span>
                  <span className="font-bold text-slate-950">{studyMaterials.length}</span>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                  <span className="text-slate-500">Questions: </span>
                  <span className="font-bold text-slate-950">{questions.length}</span>
                </div>
                {progress && progress.attempted > 0 && (
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
                    <span className="text-slate-500">Your Accuracy: </span>
                    <span className="font-bold text-slate-950">{progress.accuracy}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[200px]">
              <a
                href={`/core-cs/practice?subject=${encodeURIComponent(subjectName)}`}
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors text-center"
              >
                Practice All {subjectName}
              </a>
              <a
                href={`/core-cs/test?subject=${encodeURIComponent(subjectName)}`}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-center"
              >
                Take {subjectName} Test
              </a>
            </div>
          </div>
        </section>

        {/* Section Navigation Filter Tabs */}
        <section className="border-b border-slate-200 pb-3 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'theory', label: `Theory & Notes (${textTheories.length})` },
            { id: 'materials', label: `Study Materials (${studyMaterials.length})` },
            { id: 'topics', label: `Practice Topics (${backendTopics.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Content Area */}
        {isDataLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading resources...</div>
        ) : error ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-700 font-medium">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 1. Theory & Notes Section */}
            {(activeTab === 'all' || activeTab === 'theory') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                    Theory & Educational Notes
                  </h2>
                  <span className="text-xs text-slate-500">{textTheories.length} notes available</span>
                </div>

                {textTheories.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                    <p className="text-sm font-medium text-slate-700">No published theory notes available yet for this subject.</p>
                    <p className="mt-1 text-xs text-slate-500">You can practice topic-wise questions directly below.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {textTheories.map((theory) => (
                      <div
                        key={theory.id || theory._id}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between text-2xs text-slate-500 mb-2">
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                              {theory.topic}
                            </span>
                            <span>Notes #{theory.order || 1}</span>
                          </div>

                          <h3 className="text-base font-bold text-slate-950 line-clamp-2">
                            {theory.title}
                          </h3>

                          {theory.summary && (
                            <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                              {theory.summary}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <a
                            href={`/core-cs/practice?subject=${encodeURIComponent(subjectName)}&topic=${encodeURIComponent(theory.topic)}`}
                            className="text-xs font-medium text-slate-600 hover:text-slate-950"
                          >
                            Practice Topic →
                          </a>
                          <a
                            href={`/core-cs/theory/${theory.id || theory._id}`}
                            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                          >
                            Read Notes
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 2. Study Materials (PDF / PPT) Section */}
            {(activeTab === 'all' || activeTab === 'materials') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                    Slide Decks & Document Materials
                  </h2>
                  <span className="text-xs text-slate-500">{studyMaterials.length} materials</span>
                </div>

                {studyMaterials.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                    <p className="text-sm font-medium text-slate-700">No PDF or PPT study documents uploaded yet for this subject.</p>
                    <p className="mt-1 text-xs text-slate-500">Admins can upload presentation slides and complete notes from the portal.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studyMaterials.map((mat) => (
                      <div
                        key={mat.id || mat._id}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between text-2xs mb-2">
                            <span className="rounded bg-slate-950 text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                              {mat.type.toUpperCase()}
                            </span>
                            <span className="text-slate-500">{mat.topic}</span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-950 line-clamp-2">
                            {mat.title}
                          </h3>

                          {mat.summary && (
                            <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">
                              {mat.summary}
                            </p>
                          )}

                          <div className="mt-3 text-2xs text-slate-500 truncate font-mono">
                            📄 {mat.originalFileName || 'Study document'}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <a
                            href={`/core-cs/theory/${mat.id || mat._id}`}
                            className="text-xs font-medium text-slate-600 hover:text-slate-950"
                          >
                            Details
                          </a>
                          <a
                            href={`${apiBase}/api/core-cs/theory/${mat.id || mat._id}/file`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            Open / Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 3. Practice by Topic Section */}
            {(activeTab === 'all' || activeTab === 'topics') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                    Practice by Topic
                  </h2>
                  <span className="text-xs text-slate-500">{backendTopics.length} topics</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {backendTopics.map((topic, tIdx) => {
                    const topicQuestions = questions.filter((q) => q.topic === topic)
                    return (
                      <div
                        key={tIdx}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between hover:border-slate-400 transition-all"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-950">{topic}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {topicQuestions.length > 0 ? `${topicQuestions.length} questions` : 'Practice available'}
                          </div>
                        </div>
                        <a
                          href={`/core-cs/practice?subject=${encodeURIComponent(subjectName)}&topic=${encodeURIComponent(topic)}`}
                          className="inline-flex items-center justify-center rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                        >
                          Practice
                        </a>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default CoreCSSubject
