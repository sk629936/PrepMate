import { useState, useEffect, useCallback } from 'react'
import useAuth from '../hooks/useAuth'
import DSAAdminSection from '../components/admin/DSAAdminSection'

// ─── Navigation Items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',        label: 'Overview',        icon: '⊞', available: true  },
  { id: 'aptitude',        label: 'Aptitude',         icon: '✦', available: true  },
  { id: 'core-cs',         label: 'Core CS',          icon: '◈', available: true  },
  { id: 'dsa',             label: 'DSA',              icon: '◎', available: true  },
  { id: 'mock-interviews', label: 'Mock Interviews',  icon: '◧', available: false },
  { id: 'users',           label: 'Users',            icon: '◉', available: false },
  { id: 'settings',        label: 'Settings',         icon: '⚙', available: false },
]

function getSectionFromPath() {
  const path = window.location.pathname
  if (path.startsWith('/admin/core-cs'))        return 'core-cs'
  if (path.startsWith('/admin/aptitude'))        return 'aptitude'
  if (path.startsWith('/admin/dsa'))             return 'dsa'
  if (path.startsWith('/admin/mock-interviews')) return 'mock-interviews'
  if (path.startsWith('/admin/users'))           return 'users'
  if (path.startsWith('/admin/settings'))        return 'settings'
  return 'overview'
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
          P
        </div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  )
}

// ─── Placeholder Section ──────────────────────────────────────────────────────
function PlaceholderSection({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-10 py-14 max-w-md shadow-sm">
        <div className="text-5xl mb-5 opacity-30">🚧</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        <div className="mt-6 inline-block rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Coming Soon
        </div>
      </div>
    </div>
  )
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token')
      const base  = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      try {
        const results = await Promise.allSettled([
          fetch(`${base}/api/admin/core-cs/questions?limit=1`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/admin/core-cs/theory?limit=1`,    { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/admin/aptitude/questions?limit=1`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/admin/dsa/problems?limit=1`,      { headers: { Authorization: `Bearer ${token}` } }),
        ])

        let totalCoreCSQ = 0, publishedCoreCSQ = 0, totalTheory = 0, totalApt = 0, totalDSA = 0, publishedDSA = 0

        if (results[0].status === 'fulfilled' && results[0].value.ok) {
          const d = await results[0].value.json()
          totalCoreCSQ     = d.total ?? 0
          publishedCoreCSQ = d.published ?? 0
        }
        if (results[1].status === 'fulfilled' && results[1].value.ok) {
          const d = await results[1].value.json()
          totalTheory = d.total ?? 0
        }
        if (results[2].status === 'fulfilled' && results[2].value.ok) {
          const d = await results[2].value.json()
          totalApt = d.total ?? (d.questions?.length ?? 0)
        }
        if (results[3].status === 'fulfilled' && results[3].value.ok) {
          const d = await results[3].value.json()
          totalDSA     = d.stats?.total ?? (d.problems?.length ?? 0)
          publishedDSA = d.stats?.published ?? 0
        }

        setStats({ totalCoreCSQ, publishedCoreCSQ, totalTheory, totalApt, totalDSA, publishedDSA })
      } catch {
        setStats({ totalCoreCSQ: 0, publishedCoreCSQ: 0, totalTheory: 0, totalApt: 0, totalDSA: 0, publishedDSA: 0 })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Spinner label="Loading platform stats..." />

  const metricCards = [
    { label: 'DSA Problems',         value: stats.totalDSA,       sub: `${stats.publishedDSA} published`,            href: '/admin/dsa' },
    { label: 'Aptitude Questions',   value: stats.totalApt,       sub: 'In question bank',           href: '/admin/aptitude' },
    { label: 'Core CS Questions',    value: stats.totalCoreCSQ,   sub: `${stats.publishedCoreCSQ} published`, href: '/admin/core-cs' },
    { label: 'Theory & Materials',   value: stats.totalTheory,    sub: 'Study materials uploaded',   href: '/admin/core-cs' },
  ]

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">PREPMATE ADMIN PANEL</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">Platform Overview</h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Manage all PrepMate content from this central panel. Monitor question banks, study materials, and platform metrics.
        </p>
      </div>

      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="text-base font-semibold text-slate-950 mb-4">Platform Metrics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</div>
                <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{card.value}</div>
                <div className="mt-1 text-xs text-slate-500">{card.sub}</div>
              </div>
              {card.href && (
                <a href={card.href} className="mt-4 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors">
                  Manage →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="modules-status-heading">
        <h2 id="modules-status-heading" className="text-base font-semibold text-slate-950 mb-4">Module Administration Status</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'DSA',             href: '/admin/dsa',      active: true,  desc: 'LeetCode problem catalog, metadata, topic classification, and visibility.' },
            { name: 'Aptitude',        href: '/admin/aptitude', active: true,  desc: 'Question bank management, PDF import, publish/unpublish controls.' },
            { name: 'Core CS',         href: '/admin/core-cs',  active: true,  desc: 'Questions, theory notes, study materials (PDF/PPT) management.' },
            { name: 'Mock Interviews', href: null,              active: false, desc: 'AI interview session management — planned feature.' },
            { name: 'Users',           href: null,              active: false, desc: 'User account management and role assignment.' },
            { name: 'Settings',        href: null,              active: false, desc: 'Platform configuration, feature flags, and environment settings.' },
          ].map((mod) => (
            <div key={mod.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">{mod.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mod.active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {mod.active ? 'Active' : 'Soon'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
              </div>
              {mod.href ? (
                <a href={mod.href} className="mt-4 btn-secondary !min-h-8 !py-1.5 !px-3 text-xs inline-flex w-fit">Open →</a>
              ) : (
                <span className="mt-4 inline-block text-xs text-slate-400 font-medium">Not yet available</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Aptitude Admin Content (embedded, no outer shell) ────────────────────────
function AptitudeAdminContent() {
  const [activeTab, setActiveTab]           = useState('manage')
  const [questions, setQuestions]           = useState([])
  const [filterCategory, setFilterCategory] = useState('')
  const [filterNeedsReview, setFilterNeedsReview] = useState(false)
  const [searchTerm, setSearchTerm]         = useState('')
  const [isLoading, setIsLoading]           = useState(false)
  const [saveMsg, setSaveMsg]               = useState('')

  const [formData, setFormData] = useState({
    id: null, question: '', options: ['', '', '', ''],
    correctAnswerIndex: 0, explanation: '',
    category: 'Quantitative Aptitude', chapter: 'Percentages',
    topic: '', difficulty: 'Medium', isPublished: true,
  })

  const [pdfFile, setPdfFile]                     = useState(null)
  const [isExtractingPdf, setIsExtractingPdf]     = useState(false)
  const [candidateQuestions, setCandidateQuestions] = useState([])
  const [pdfMessage, setPdfMessage]               = useState('')
  const [bulkCategory, setBulkCategory]           = useState('Quantitative Aptitude')
  const [bulkChapter, setBulkChapter]             = useState('General Aptitude')

  const CATEGORIES = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability']
  const API_BASE   = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  const fetchAdminQuestions = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory)    params.append('category', filterCategory)
      if (filterNeedsReview) params.append('needsReview', 'true')
      if (searchTerm)        params.append('search', searchTerm)
      params.append('limit', '100')
      const res  = await fetch(`${API_BASE}/api/admin/aptitude/questions?${params}`, { headers: authHeader() })
      const data = await res.json()
      if (data.success) setQuestions(data.questions || [])
    } catch (err) { console.error(err) } finally { setIsLoading(false) }
  }, [filterCategory, filterNeedsReview, searchTerm])

  useEffect(() => { fetchAdminQuestions() }, [fetchAdminQuestions])

  const resetForm = () => setFormData({ id: null, question: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '', category: 'Quantitative Aptitude', chapter: 'Percentages', topic: '', difficulty: 'Medium', isPublished: true })

  const handleSaveQuestion = async (e) => {
    e.preventDefault()
    setSaveMsg('')
    try {
      const payload = {
        question: formData.question.trim(),
        options: formData.options.map((o) => o.trim()),
        correctAnswer: formData.options[formData.correctAnswerIndex].trim(),
        explanation: formData.explanation.trim(),
        category: formData.category, chapter: formData.chapter.trim(),
        topic: formData.topic.trim(), difficulty: formData.difficulty,
        isPublished: formData.isPublished,
      }
      const url    = formData.id ? `${API_BASE}/api/admin/aptitude/questions/${formData.id}` : `${API_BASE}/api/admin/aptitude/questions`
      const method = formData.id ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
      const data   = await res.json()
      if (data.success) {
        setSaveMsg(formData.id ? 'Question updated!' : 'Question added!')
        resetForm()
        fetchAdminQuestions()
        setActiveTab('manage')
      } else { setSaveMsg('Error: ' + (data.message || 'Unknown error')) }
    } catch { setSaveMsg('Save failed.') }
  }

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question permanently?')) return
    try {
      const res  = await fetch(`${API_BASE}/api/admin/aptitude/questions/${id}`, { method: 'DELETE', headers: authHeader() })
      const data = await res.json()
      if (data.success) fetchAdminQuestions()
    } catch (err) { console.error(err) }
  }

  const handleTogglePublish = async (q) => {
    try {
      const endpoint = q.isPublished ? 'unpublish' : 'publish'
      await fetch(`${API_BASE}/api/admin/aptitude/questions/${q._id}/${endpoint}`, { method: 'PATCH', headers: authHeader() })
      fetchAdminQuestions()
    } catch (err) { console.error(err) }
  }

  const handlePdfUpload = async (e) => {
    e.preventDefault()
    if (!pdfFile) return
    setIsExtractingPdf(true); setPdfMessage('')
    try {
      const fd = new FormData(); fd.append('pdf', pdfFile)
      const res  = await fetch(`${API_BASE}/api/admin/aptitude/import-pdf`, { method: 'POST', headers: authHeader(), body: fd })
      const data = await res.json()
      if (data.success) { setCandidateQuestions(data.questions || []); setPdfMessage(`Extracted ${data.questions?.length || 0} candidate questions. Review and save below.`) }
      else setPdfMessage(data.message || 'PDF processing failed.')
    } catch { setPdfMessage('Error processing PDF.') } finally { setIsExtractingPdf(false) }
  }

  const handleBatchSave = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/admin/aptitude/batch-save`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ questions: candidateQuestions }) })
      const data = await res.json()
      if (data.success) { setCandidateQuestions([]); setPdfMessage(`Imported ${data.questions.length} questions!`); fetchAdminQuestions() }
    } catch (err) { console.error(err) }
  }

  const handleApplyBulkTags = () => setCandidateQuestions((prev) => prev.map((q) => ({ ...q, category: bulkCategory, chapter: bulkChapter.trim() || 'General Aptitude' })))

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admin · Aptitude</p>
        <h1 className="mt-1 text-xl font-bold text-slate-950">Aptitude Question Bank</h1>
        <p className="mt-1 text-sm text-slate-500">Manage questions, add new entries, or import from PDF.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-0 overflow-x-auto">
        {[
          { id: 'manage', label: `Manage (${questions.length})` },
          { id: 'add',    label: formData.id ? 'Edit Question' : '+ Add Question' },
          { id: 'pdf',    label: 'PDF Upload & Review' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            id={`aptitude-admin-tab-${t.id}`}
            onClick={() => { if (t.id === 'add' && activeTab !== 'add') resetForm(); setActiveTab(t.id) }}
            className={`whitespace-nowrap py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${activeTab === t.id ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MANAGE TAB */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap gap-3 items-center">
            <input
              id="aptitude-q-search"
              type="text" placeholder="Search questions..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[160px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <select id="aptitude-q-category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={filterNeedsReview} onChange={(e) => setFilterNeedsReview(e.target.checked)} className="rounded" />
              Needs Review
            </label>
            <button type="button" onClick={fetchAdminQuestions} className="btn-secondary !min-h-9 !py-2 !px-4 text-xs">
              Apply
            </button>
          </div>

          {isLoading ? (
            <Spinner label="Loading questions..." />
          ) : questions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No questions found. Add your first question using the tab above.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">{q.question}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 font-medium">{q.category}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{q.chapter}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{q.difficulty}</span>
                        <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${q.isPublished ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {q.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => { setFormData({ id: q._id, question: q.question, options: [...q.options], correctAnswerIndex: q.options.indexOf(q.correctAnswer), explanation: q.explanation || '', category: q.category, chapter: q.chapter, topic: q.topic || '', difficulty: q.difficulty, isPublished: q.isPublished }); setActiveTab('add') }}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >Edit</button>
                      <button type="button" onClick={() => handleTogglePublish(q)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        {q.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button type="button" onClick={() => handleDeleteQuestion(q._id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT TAB */}
      {activeTab === 'add' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-2xl">
          <h2 className="text-base font-bold text-slate-950 mb-5">{formData.id ? 'Edit Question' : 'Add New Question'}</h2>
          {saveMsg && (
            <p className={`mb-4 text-sm font-medium rounded-md px-3 py-2 ${saveMsg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-800'}`}>{saveMsg}</p>
          )}
          <form onSubmit={handleSaveQuestion} className="space-y-5">
            <div>
              <label htmlFor="apt-q-text" className="block text-xs font-bold text-slate-700 mb-1.5">Question *</label>
              <textarea id="apt-q-text" required rows={3} value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>

            {formData.options.map((opt, i) => (
              <div key={i}>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Option {String.fromCharCode(65 + i)}
                  <span className="ml-2 inline-flex items-center gap-1 font-normal text-slate-500">
                    <input type="radio" name="correct-answer" checked={formData.correctAnswerIndex === i} onChange={() => setFormData({ ...formData, correctAnswerIndex: i })} />
                    mark correct
                  </span>
                </label>
                <input required type="text" value={opt} onChange={(e) => { const o = [...formData.options]; o[i] = e.target.value; setFormData({ ...formData, options: o }) }} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
            ))}

            <div>
              <label htmlFor="apt-q-explanation" className="block text-xs font-bold text-slate-700 mb-1.5">Explanation</label>
              <textarea id="apt-q-explanation" rows={2} value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="apt-q-category" className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                <select id="apt-q-category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="apt-q-difficulty" className="block text-xs font-bold text-slate-700 mb-1.5">Difficulty</label>
                <select id="apt-q-difficulty" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                  {['Easy', 'Medium', 'Hard'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="apt-q-chapter" className="block text-xs font-bold text-slate-700 mb-1.5">Chapter / Topic Area</label>
              <input id="apt-q-chapter" type="text" value={formData.chapter} onChange={(e) => setFormData({ ...formData, chapter: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} className="rounded" />
              <span className="text-xs font-bold text-slate-700">Publish immediately</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary !min-h-9 !py-2 !px-5 text-sm">{formData.id ? 'Update' : 'Save Question'}</button>
              <button type="button" onClick={() => { setActiveTab('manage'); setSaveMsg('') }} className="btn-secondary !min-h-9 !py-2 !px-4 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* PDF TAB */}
      {activeTab === 'pdf' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-xl">
            <h2 className="text-base font-bold text-slate-950 mb-4">Upload PDF for Extraction</h2>
            <form onSubmit={handlePdfUpload} className="space-y-4">
              <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Category</label>
                  <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Chapter</label>
                  <input type="text" value={bulkChapter} onChange={(e) => setBulkChapter(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <button type="submit" disabled={!pdfFile || isExtractingPdf} className="btn-primary !min-h-9 !py-2 !px-5 text-sm disabled:opacity-50">
                {isExtractingPdf ? 'Extracting...' : 'Extract from PDF'}
              </button>
            </form>
            {pdfMessage && <p className="mt-3 text-sm text-slate-700 font-medium">{pdfMessage}</p>}
          </div>

          {candidateQuestions.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-bold text-slate-900">Review {candidateQuestions.length} Extracted Questions</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={handleApplyBulkTags} className="btn-secondary !min-h-8 !py-1.5 !px-3 text-xs">Apply Bulk Tags</button>
                  <button type="button" onClick={handleBatchSave} className="btn-primary !min-h-8 !py-1.5 !px-4 text-xs">Save All</button>
                </div>
              </div>
              {candidateQuestions.map((cq, idx) => (
                <div key={idx} className="rounded-lg border border-slate-200 p-4 space-y-3">
                  <textarea rows={2} value={cq.question} onChange={(e) => { const u = [...candidateQuestions]; u[idx].question = e.target.value; setCandidateQuestions(u) }} className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
                  {(cq.options || []).map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`cq-correct-${idx}`} checked={cq.correctAnswer === opt} onChange={() => { const u = [...candidateQuestions]; u[idx].correctAnswer = opt; setCandidateQuestions(u) }} />
                      <input type="text" value={opt} onChange={(e) => { const u = [...candidateQuestions]; u[idx].options[oi] = e.target.value; setCandidateQuestions(u) }} className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <select value={cq.category} onChange={(e) => { const u = [...candidateQuestions]; u[idx].category = e.target.value; setCandidateQuestions(u) }} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={cq.difficulty || 'Medium'} onChange={(e) => { const u = [...candidateQuestions]; u[idx].difficulty = e.target.value; setCandidateQuestions(u) }} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
                      {['Easy', 'Medium', 'Hard'].map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={Boolean(cq.isPublished)} onChange={(e) => { const u = [...candidateQuestions]; u[idx].isPublished = e.target.checked; setCandidateQuestions(u) }} />
                    Publish on save
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Core CS Admin Section (navigates to existing page) ──────────────────────
function CoreCSAdminSection() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admin · Core CS</p>
        <h1 className="mt-1 text-xl font-bold text-slate-950">Core CS Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage Core CS questions, theory notes, and study materials (PDF/PPT) across 8 subjects.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '📝', title: 'Question Bank',         desc: 'Add, edit, publish, and manage all Core CS MCQ questions across DBMS, OS, CN, OOP, and more.' },
          { icon: '📚', title: 'Theory & Notes',        desc: 'Add markdown theory content, upload PDFs and PPT study materials for students to access.' },
          { icon: '📊', title: 'Subject Overview',      desc: 'View per-subject question counts, published/draft breakdown, and material upload status.' },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl mb-3" aria-hidden="true">{card.icon}</div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">{card.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-2">Open Full Core CS Admin Portal</h2>
        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          The full Core CS admin portal provides a rich interface with both Questions and Theory management tabs,
          advanced filtering, Markdown preview, file uploads, and bulk publish controls. It is available at{' '}
          <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">/core-cs-admin</code>.
        </p>
        <a
          id="open-core-cs-admin-btn"
          href="/core-cs-admin"
          className="btn-primary !min-h-10 !py-2.5 !px-6 text-sm inline-flex"
        >
          Open Core CS Admin →
        </a>
      </div>
    </div>
  )
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
function AdminPanel() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [activeSection, setActiveSection] = useState(getSectionFromPath)
  const [sidebarOpen, setSidebarOpen]     = useState(false)

  const navigate = (sectionId) => {
    setActiveSection(sectionId)
    setSidebarOpen(false)
    const path = sectionId === 'overview' ? '/admin' : `/admin/${sectionId}`
    window.history.pushState({}, '', path)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">P</div>
          <p className="text-sm font-medium text-slate-600">Verifying Admin Permissions...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  if (user.role !== 'admin') {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 max-w-sm shadow-sm">
          <div className="text-4xl mb-4" aria-hidden="true">🔒</div>
          <h2 className="text-xl font-bold text-slate-950 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-6">Admin privileges are required to access this panel.</p>
          <a href="/dashboard" className="btn-primary">Back to Dashboard</a>
        </div>
      </main>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':        return <OverviewSection />
      case 'aptitude':        return <AptitudeAdminContent />
      case 'core-cs':         return <CoreCSAdminSection />
      case 'dsa':             return <DSAAdminSection />
      case 'mock-interviews': return <PlaceholderSection title="Mock Interview Management" description="Configure AI mock interview sessions, question sets, evaluation rubrics, and user session analytics." />
      case 'users':           return <PlaceholderSection title="User Management" description="Manage user accounts, assign admin roles, review activity logs, and handle account actions." />
      case 'settings':        return <PlaceholderSection title="Platform Settings" description="Configure platform-wide settings, feature flags, and system preferences." />
      default:                return <OverviewSection />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md" role="banner">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Toggle admin navigation"
              id="admin-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden rounded-md p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a href="/dashboard" id="admin-home-link" className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white" aria-hidden="true">P</span>
              PrepMate
            </a>
            <span className="hidden sm:inline-block rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-900 truncate max-w-[160px]">{user.fullName || 'Admin'}</span>
              <span className="text-xs text-slate-500 truncate max-w-[160px]">{user.email}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 border border-slate-800 text-sm font-bold text-white" title={user.fullName} aria-hidden="true">
              {(user.fullName || 'A').charAt(0).toUpperCase()}
            </div>
            <a href="/dashboard" id="admin-to-dashboard-btn" className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs hidden sm:inline-flex">Dashboard</a>
            <button type="button" id="admin-signout-btn" onClick={logout} className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs text-slate-600">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-[57px] left-0 bottom-0 z-30 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:top-auto lg:h-auto ${sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}
          aria-label="Admin navigation"
          role="navigation"
        >
          <nav className="flex-1 p-4 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2 mt-1">Admin Modules</p>
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`admin-nav-${item.id}`}
                  disabled={!item.available}
                  onClick={() => item.available && navigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-slate-950 text-white'
                      : item.available
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                      : 'text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="text-base leading-none" aria-hidden="true">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {!item.available && (
                    <span className="text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-slate-100">
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Logged in as</p>
              <p className="text-xs font-semibold text-slate-800 truncate">{user.fullName}</p>
              <span className="inline-block mt-1 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5">Admin</span>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main id="admin-main-content" className="flex-1 min-w-0 px-4 py-8 sm:px-6 lg:px-8" role="main">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default AdminPanel
