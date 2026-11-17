import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import CoreCSHeader from '../components/core-cs/CoreCSHeader'
import MarkdownContent from '../components/core-cs/MarkdownContent'

export function CoreCSTheoryDetail() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  // Extract ID from pathname: /core-cs/theory/:id
  const pathParts = window.location.pathname.split('/')
  const theoryId = pathParts[3] || pathParts[2] || ''

  const [theory, setTheory] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && theoryId) {
      const fetchTheory = async () => {
        try {
          const token = localStorage.getItem('token')
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          const headers = token ? { Authorization: `Bearer ${token}` } : {}

          const res = await fetch(`${apiBase}/api/core-cs/theory/${theoryId}`, { headers })
          const data = await res.json()

          if (data.success && data.material) {
            setTheory(data.material)
          } else {
            setError(data.error || 'Study material not found or is unpublished.')
          }
        } catch (err) {
          console.error('Failed to load theory item:', err)
          setError('Failed to load study notes from server.')
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchTheory()
    }
  }, [isAuthenticated, theoryId])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading Educational Notes...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const fileDownloadUrl = theory ? `${apiBase}/api/core-cs/theory/${theory.id || theory._id}/file` : ''

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <CoreCSHeader
        user={user}
        logout={logout}
        breadcrumb={theory ? `${theory.subject} / ${theory.topic}` : 'Theory Notes'}
        activeSection="subjects"
      />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {isDataLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-950 border-r-transparent mb-3" />
            <p className="text-sm font-medium text-slate-600">Fetching notes content...</p>
          </div>
        ) : error || !theory ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-8 text-center max-w-lg mx-auto my-12">
            <h2 className="text-lg font-bold text-slate-950">Study Material Unavailable</h2>
            <p className="mt-2 text-sm text-slate-600">{error || 'This material may have been unpublished or removed.'}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href="/core-cs"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
              >
                Back to Core CS
              </a>
            </div>
          </div>
        ) : (
          <article className="space-y-6">
            {/* Header Navigation & Subject Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <a
                  href={`/core-cs/${encodeURIComponent(theory.subject)}`}
                  className="font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  ← Back to {theory.subject}
                </a>
                <span className="text-slate-300">·</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-800">
                  {theory.topic}
                </span>
                <span className="rounded bg-slate-950 text-white px-2 py-0.5 font-bold uppercase tracking-wider text-2xs">
                  {theory.type}
                </span>
              </div>

              {/* Action: Practice this Topic */}
              <a
                href={`/core-cs/practice?subject=${encodeURIComponent(theory.subject)}&topic=${encodeURIComponent(theory.topic)}`}
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Practice Questions on {theory.topic} →
              </a>
            </div>

            {/* Title & Summary */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                {theory.title}
              </h1>
              {theory.summary && (
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-3">
                  {theory.summary}
                </p>
              )}
            </div>

            {/* Type Specific Rendering */}
            {theory.type === 'text' ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <MarkdownContent content={theory.content} />
              </div>
            ) : theory.type === 'pdf' ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-sm font-bold text-slate-950">PDF Document Reference</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">
                      {theory.originalFileName || 'Study_Document.pdf'} {theory.fileSize ? `(${Math.round(theory.fileSize / 1024)} KB)` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={fileDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                      Open in New Tab
                    </a>
                    <a
                      href={fileDownloadUrl}
                      download
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>

                {/* Embedded PDF iframe preview */}
                <div className="w-full h-[600px] border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                  <iframe
                    src={fileDownloadUrl}
                    title={theory.title}
                    className="w-full h-full"
                  />
                </div>
              </div>
            ) : (
              /* PPT / PPTX Material View */
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-900 mb-3">
                  📊
                </div>
                <h3 className="text-lg font-bold text-slate-950">Presentation Slide Deck</h3>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  {theory.originalFileName || 'Presentation_Slides.pptx'}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href={fileDownloadUrl}
                    download
                    className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    Download Slide Deck (.pptx)
                  </a>
                  <a
                    href={`/core-cs/${encodeURIComponent(theory.subject)}`}
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    Back to Subject
                  </a>
                </div>
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-200">
              <a
                href={`/core-cs/${encodeURIComponent(theory.subject)}`}
                className="text-xs font-semibold text-slate-600 hover:text-slate-950"
              >
                ← Return to {theory.subject} Hub
              </a>
              <a
                href={`/core-cs/practice?subject=${encodeURIComponent(theory.subject)}&topic=${encodeURIComponent(theory.topic)}`}
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Start Practice on {theory.topic}
              </a>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}

export default CoreCSTheoryDetail
