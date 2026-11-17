import { useState, useEffect, useCallback } from 'react'
import useAuth from '../hooks/useAuth'
import { CORE_CS_SUBJECTS_LIST } from '../components/core-cs/coreCSData'
import MarkdownContent from '../components/core-cs/MarkdownContent'

export function CoreCSAdmin() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  // Determine active tab from URL path
  const path = window.location.pathname
  const initialTab = path.includes('/questions')
    ? 'questions'
    : path.includes('/theory')
    ? 'theory'
    : 'overview'

  const [activeTab, setActiveTab] = useState(initialTab) // 'overview' | 'questions' | 'theory'

  // --- Questions State ---
  const [questions, setQuestions] = useState([])
  const [qSearch, setQSearch] = useState('')
  const [qSubject, setQSubject] = useState('')
  const [qDifficulty, setQDifficulty] = useState('')
  const [qPublished, setQPublished] = useState('')
  const [isQLoading, setIsQLoading] = useState(false)
  const [qError, setQError] = useState(null)

  // Question Modal & Form
  const [showQModal, setShowQModal] = useState(false)
  const [qFormData, setQFormData] = useState({
    id: null,
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    subject: 'DBMS',
    topic: '',
    difficulty: 'Medium',
    source: '',
    isPublished: false,
  })
  const [qFormErrors, setQFormErrors] = useState([])
  const [isQSaving, setIsQSaving] = useState(false)

  // --- Theory & Study Materials State ---
  const [theories, setTheories] = useState([])
  const [tSearch, setTSearch] = useState('')
  const [tSubject, setTSubject] = useState('')
  const [tType, setTType] = useState('')
  const [tPublished, setTPublished] = useState('')
  const [isTLoading, setIsTLoading] = useState(false)
  const [tError, setTError] = useState(null)

  // Theory Modal & Form
  const [showTModal, setShowTModal] = useState(false)
  const [tFormData, setTFormData] = useState({
    id: null,
    title: '',
    subject: 'DBMS',
    topic: '',
    type: 'text',
    content: '',
    summary: '',
    order: 0,
    isPublished: false,
  })
  const [tUploadFile, setTUploadFile] = useState(null)
  const [tFormErrors, setTFormErrors] = useState([])
  const [isTSaving, setIsTSaving] = useState(false)
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    setIsQLoading(true)
    setQError(null)
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const params = new URLSearchParams()
      params.append('limit', '100')
      if (qSearch) params.append('search', qSearch)
      if (qSubject) params.append('subject', qSubject)
      if (qDifficulty) params.append('difficulty', qDifficulty)
      if (qPublished !== '') params.append('isPublished', qPublished)

      const res = await fetch(`${apiBase}/api/admin/core-cs/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.success) {
        setQuestions(data.questions || [])
      } else {
        setQError(data.error || 'Failed to fetch question bank.')
      }
    } catch (err) {
      console.error('Questions fetch error:', err)
      setQError('Network error connecting to question bank.')
    } finally {
      setIsQLoading(false)
    }
  }, [qSearch, qSubject, qDifficulty, qPublished])

  // Fetch Theory & Study Materials
  const fetchTheories = useCallback(async () => {
    setIsTLoading(true)
    setTError(null)
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const params = new URLSearchParams()
      params.append('limit', '100')
      if (tSearch) params.append('search', tSearch)
      if (tSubject) params.append('subject', tSubject)
      if (tType) params.append('type', tType)
      if (tPublished !== '') params.append('isPublished', tPublished)

      const res = await fetch(`${apiBase}/api/admin/core-cs/theory?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.success) {
        setTheories(data.materials || [])
      } else {
        setTError(data.error || 'Failed to fetch theory notes.')
      }
    } catch (err) {
      console.error('Theory fetch error:', err)
      setTError('Network error connecting to study material server.')
    } finally {
      setIsTLoading(false)
    }
  }, [tSearch, tSubject, tType, tPublished])

  // Load data when authenticated admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchQuestions()
      fetchTheories()
    }
  }, [isAuthenticated, user, fetchQuestions, fetchTheories])

  // Sync tab change with browser history URL if desired
  const switchTab = (tab) => {
    setActiveTab(tab)
    const newPath = tab === 'overview' ? '/admin/core-cs' : `/admin/core-cs/${tab}`
    window.history.pushState(null, '', newPath)
  }

  // --- QUESTION HANDLERS ---
  const handleOpenCreateQuestion = () => {
    setQFormData({
      id: null,
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      subject: 'DBMS',
      topic: '',
      difficulty: 'Medium',
      source: '',
      isPublished: false,
    })
    setQFormErrors([])
    setShowQModal(true)
  }

  const handleOpenEditQuestion = (q) => {
    const optIdx = q.options?.indexOf(q.correctAnswer)
    setQFormData({
      id: q._id || q.id,
      question: q.question,
      options: q.options || ['', '', '', ''],
      correctAnswerIndex: optIdx !== -1 ? optIdx : 0,
      explanation: q.explanation || '',
      subject: q.subject || 'DBMS',
      topic: q.topic || '',
      difficulty: q.difficulty || 'Medium',
      source: q.source || '',
      isPublished: Boolean(q.isPublished),
    })
    setQFormErrors([])
    setShowQModal(true)
  }

  const handleSaveQuestion = async (e) => {
    e.preventDefault()
    setQFormErrors([])

    // Client-side quick validation
    const errs = []
    if (!qFormData.question.trim() || qFormData.question.trim().length < 5) {
      errs.push('Question text must be at least 5 characters.')
    }
    if (qFormData.options.some((opt) => !opt.trim())) {
      errs.push('All 4 options must be non-empty.')
    }
    if (new Set(qFormData.options.map((o) => o.trim())).size !== 4) {
      errs.push('All 4 options must be distinct.')
    }
    if (!qFormData.explanation.trim()) {
      errs.push('Explanation is required.')
    }
    if (!qFormData.topic.trim()) {
      errs.push('Topic is required.')
    }

    if (errs.length > 0) {
      setQFormErrors(errs)
      return
    }

    setIsQSaving(true)
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const isEdit = Boolean(qFormData.id)

      const payload = {
        question: qFormData.question.trim(),
        options: qFormData.options.map((o) => o.trim()),
        correctAnswer: qFormData.options[qFormData.correctAnswerIndex]?.trim() || '',
        explanation: qFormData.explanation.trim(),
        subject: qFormData.subject,
        topic: qFormData.topic.trim(),
        difficulty: qFormData.difficulty,
        source: qFormData.source.trim(),
        isPublished: qFormData.isPublished,
      }

      const url = isEdit
        ? `${apiBase}/api/admin/core-cs/questions/${qFormData.id}`
        : `${apiBase}/api/admin/core-cs/questions`

      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        setShowQModal(false)
        fetchQuestions()
      } else {
        setQFormErrors([data.error || 'Failed to save question.'])
      }
    } catch (err) {
      console.error('Save question error:', err)
      setQFormErrors(['Network error saving question.'])
    } finally {
      setIsQSaving(false)
    }
  }

  const handleTogglePublishQuestion = async (q) => {
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const qId = q._id || q.id
      const action = q.isPublished ? 'unpublish' : 'publish'

      const res = await fetch(`${apiBase}/api/admin/core-cs/questions/${qId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchQuestions()
      } else {
        alert(data.error || `Failed to ${action} question.`)
      }
    } catch (err) {
      console.error('Publish toggle error:', err)
      alert('Error updating publication status.')
    }
  }

  const handleDeleteQuestion = async (q) => {
    if (!window.confirm(`Are you sure you want to permanently delete this question:\n"${q.question}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const qId = q._id || q.id

      const res = await fetch(`${apiBase}/api/admin/core-cs/questions/${qId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchQuestions()
      } else {
        alert(data.error || 'Failed to delete question.')
      }
    } catch (err) {
      console.error('Delete question error:', err)
      alert('Error deleting question.')
    }
  }

  // --- THEORY & STUDY MATERIAL HANDLERS ---
  const handleOpenCreateTheory = () => {
    setTFormData({
      id: null,
      title: '',
      subject: 'DBMS',
      topic: '',
      type: 'text',
      content: '',
      summary: '',
      order: 0,
      isPublished: false,
    })
    setTUploadFile(null)
    setTFormErrors([])
    setShowMarkdownPreview(false)
    setShowTModal(true)
  }

  const handleOpenEditTheory = (t) => {
    setTFormData({
      id: t._id || t.id,
      title: t.title || '',
      subject: t.subject || 'DBMS',
      topic: t.topic || '',
      type: t.type || 'text',
      content: t.content || '',
      summary: t.summary || '',
      order: t.order || 0,
      isPublished: Boolean(t.isPublished),
    })
    setTUploadFile(null)
    setTFormErrors([])
    setShowMarkdownPreview(false)
    setShowTModal(true)
  }

  const handleSaveTheory = async (e) => {
    e.preventDefault()
    setTFormErrors([])

    const errs = []
    if (!tFormData.title.trim() || tFormData.title.trim().length < 3) {
      errs.push('Title must be at least 3 characters.')
    }
    if (!tFormData.topic.trim()) {
      errs.push('Topic is required.')
    }
    if (tFormData.type === 'text' && !tFormData.content.trim()) {
      errs.push('Markdown content is required for text theory notes.')
    }
    if ((tFormData.type === 'pdf' || tFormData.type === 'ppt') && !tFormData.id && !tUploadFile) {
      errs.push(`Please select a ${tFormData.type.toUpperCase()} file to upload.`)
    }

    if (errs.length > 0) {
      setTFormErrors(errs)
      return
    }

    setIsTSaving(true)
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const isEdit = Boolean(tFormData.id)

      const form = new FormData()
      form.append('title', tFormData.title.trim())
      form.append('subject', tFormData.subject)
      form.append('topic', tFormData.topic.trim())
      form.append('type', tFormData.type)
      form.append('content', tFormData.content.trim())
      form.append('summary', tFormData.summary.trim())
      form.append('order', String(tFormData.order || 0))
      form.append('isPublished', String(tFormData.isPublished))

      if (tUploadFile) {
        form.append('file', tUploadFile)
      }

      const url = isEdit
        ? `${apiBase}/api/admin/core-cs/theory/${tFormData.id}`
        : `${apiBase}/api/admin/core-cs/theory`

      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      const data = await res.json()

      if (data.success) {
        setShowTModal(false)
        fetchTheories()
      } else {
        setTFormErrors([data.error || 'Failed to save study material.'])
      }
    } catch (err) {
      console.error('Save theory error:', err)
      setTFormErrors(['Network error saving study material.'])
    } finally {
      setIsTSaving(false)
    }
  }

  const handleTogglePublishTheory = async (t) => {
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const tId = t._id || t.id
      const action = t.isPublished ? 'unpublish' : 'publish'

      const res = await fetch(`${apiBase}/api/admin/core-cs/theory/${tId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchTheories()
      } else {
        alert(data.error || `Failed to ${action} material.`)
      }
    } catch (err) {
      console.error('Publish toggle error:', err)
      alert('Error updating publication status.')
    }
  }

  const handleDeleteTheory = async (t) => {
    if (!window.confirm(`Are you sure you want to permanently delete:\n"${t.title}"?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const tId = t._id || t.id

      const res = await fetch(`${apiBase}/api/admin/core-cs/theory/${tId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        fetchTheories()
      } else {
        alert(data.error || 'Failed to delete material.')
      }
    } catch (err) {
      console.error('Delete theory error:', err)
      alert('Error deleting material.')
    }
  }

  // --- GUARDS ---
  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Verifying Admin Access...</p>
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
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-800 mb-4">
          ⛔
        </div>
        <h1 className="text-xl font-bold text-slate-950">403 — Forbidden</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-sm">
          Administrator privileges are required to access the Core CS Management Portal.
        </p>
        <a
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Return to Dashboard
        </a>
      </main>
    )
  }

  // Derived real counts
  const publishedQuestionsCount = questions.filter((q) => q.isPublished).length
  const unpublishedQuestionsCount = questions.filter((q) => !q.isPublished).length
  const textCount = theories.filter((t) => t.type === 'text').length
  const pdfCount = theories.filter((t) => t.type === 'pdf').length
  const pptCount = theories.filter((t) => t.type === 'ppt').length
  const publishedTheoryCount = theories.filter((t) => t.isPublished).length

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-slate-950"
            >
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-slate-950 text-xs sm:text-sm font-bold text-white">
                P
              </span>
              PrepMate
            </a>
            <span className="text-slate-300">/</span>
            <span className="rounded bg-slate-950 text-white px-2 py-0.5 text-2xs font-bold uppercase tracking-wider">
              Admin
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 hidden sm:inline">
              Core CS Management
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/core-cs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors"
            >
              Open User View ↗
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors"
            >
              Dashboard
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'overview', label: 'Dashboard Overview' },
              { id: 'questions', label: `Questions Bank (${questions.length})` },
              { id: 'theory', label: `Theory & Materials (${theories.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'questions' && (
              <button
                type="button"
                onClick={handleOpenCreateQuestion}
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                + New Question
              </button>
            )}
            {activeTab === 'theory' && (
              <button
                type="button"
                onClick={handleOpenCreateTheory}
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                + Add Study Material
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Overview Banner */}
            <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Core Computer Science Administration
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                Manage curriculum questions, educational Markdown notes, and presentation slides across the 8 Core CS disciplines. Materials created by admins default to unpublished until reviewed and published.
              </p>
            </section>

            {/* Metrics Grid */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="text-2xs font-bold uppercase tracking-wider text-slate-500">Total Questions</div>
                <div className="mt-1.5 text-2xl font-black text-slate-950">{questions.length}</div>
                <div className="mt-0.5 text-2xs text-slate-500">Question Bank</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="text-2xs font-bold uppercase tracking-wider text-slate-500">Published Questions</div>
                <div className="mt-1.5 text-2xl font-black text-slate-950">{publishedQuestionsCount}</div>
                <div className="mt-0.5 text-2xs text-slate-500">Live for users</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="text-2xs font-bold uppercase tracking-wider text-slate-500">Draft / Unpublished</div>
                <div className="mt-1.5 text-2xl font-black text-slate-950">{unpublishedQuestionsCount}</div>
                <div className="mt-0.5 text-2xs text-slate-500">Pending Review</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="text-2xs font-bold uppercase tracking-wider text-slate-500">Markdown Notes</div>
                <div className="mt-1.5 text-2xl font-black text-slate-950">{textCount}</div>
                <div className="mt-0.5 text-2xs text-slate-500">Theory documents</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="text-2xs font-bold uppercase tracking-wider text-slate-500">PDF Materials</div>
                <div className="mt-1.5 text-2xl font-black text-slate-950">{pdfCount}</div>
                <div className="mt-0.5 text-2xs text-slate-500">PDF documents</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="text-2xs font-bold uppercase tracking-wider text-slate-500">PPT Presentations</div>
                <div className="mt-1.5 text-2xl font-black text-slate-950">{pptCount}</div>
                <div className="mt-0.5 text-2xs text-slate-500">Slide decks</div>
              </div>
            </section>

            {/* Quick Action Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-slate-700">
                    Questions Management
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-950">Core CS Multiple Choice Bank</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Create, edit, filter, publish, and delete placement MCQs covering DBMS, OS, Networks, OOP, SE, SQL, COA, and Data Structures.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{questions.length} questions registered</span>
                  <button
                    type="button"
                    onClick={() => switchTab('questions')}
                    className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    Open Question Bank →
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-slate-700">
                    Curriculum Content
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-950">Theory Notes & Study Materials</h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Author Markdown educational notes, upload reference PDF notes, and attach PowerPoint presentation slide decks for campus placement drives.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{theories.length} items ({publishedTheoryCount} published)</span>
                  <button
                    type="button"
                    onClick={() => switchTab('theory')}
                    className="inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    Manage Materials →
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: QUESTIONS MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Search */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Search Question / Topic
                  </label>
                  <input
                    type="text"
                    value={qSearch}
                    onChange={(e) => setQSearch(e.target.value)}
                    placeholder="e.g. Normalization, Deadlock..."
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Subject Filter
                  </label>
                  <select
                    value={qSubject}
                    onChange={(e) => setQSubject(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">All 8 Subjects</option>
                    {CORE_CS_SUBJECTS_LIST.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={qPublished}
                    onChange={(e) => setQPublished(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Published</option>
                    <option value="false">Draft / Unpublished</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions Table / List */}
            {isQLoading ? (
              <div className="py-16 text-center text-xs text-slate-500">Loading questions...</div>
            ) : qError ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-700">
                {qError}
                <button
                  type="button"
                  onClick={fetchQuestions}
                  className="mt-2 block mx-auto underline font-bold"
                >
                  Retry
                </button>
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <p className="text-sm font-bold text-slate-950">No Core CS questions found.</p>
                <p className="mt-1 text-xs text-slate-500">Try adjusting filters or create a new question.</p>
                <button
                  type="button"
                  onClick={handleOpenCreateQuestion}
                  className="mt-4 inline-flex items-center rounded-md bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  + Add First Question
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-900 uppercase tracking-wider text-2xs">
                    <tr>
                      <th className="px-4 py-3">Question</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Difficulty</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map((q) => (
                      <tr key={q._id || q.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-950 max-w-sm">
                          <div className="line-clamp-2">{q.question}</div>
                          <div className="text-2xs text-slate-500 mt-0.5">
                            Correct: <span className="font-semibold text-slate-800">{q.correctAnswer}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-medium">{q.subject}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{q.topic}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs font-medium text-slate-700">
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`rounded px-2 py-0.5 text-2xs font-bold ${
                              q.isPublished
                                ? 'bg-slate-950 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {q.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePublishQuestion(q)}
                              className="rounded border border-slate-200 px-2 py-1 text-2xs font-semibold text-slate-800 hover:bg-slate-100"
                            >
                              {q.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditQuestion(q)}
                              className="rounded border border-slate-200 px-2 py-1 text-2xs font-semibold text-slate-800 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q)}
                              className="rounded border border-slate-200 px-2 py-1 text-2xs font-semibold text-rose-800 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: THEORY & STUDY MATERIALS MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'theory' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Search */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Search Title / Topic
                  </label>
                  <input
                    type="text"
                    value={tSearch}
                    onChange={(e) => setTSearch(e.target.value)}
                    placeholder="e.g. Normalization, Virtual Memory..."
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Subject Filter
                  </label>
                  <select
                    value={tSubject}
                    onChange={(e) => setTSubject(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">All 8 Subjects</option>
                    {CORE_CS_SUBJECTS_LIST.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Material Type
                  </label>
                  <select
                    value={tType}
                    onChange={(e) => setTType(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">All Types</option>
                    <option value="text">Markdown Notes</option>
                    <option value="pdf">PDF Document</option>
                    <option value="ppt">PPT / PPTX Presentation</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={tPublished}
                    onChange={(e) => setTPublished(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Published</option>
                    <option value="false">Draft / Unpublished</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Theory Materials Table */}
            {isTLoading ? (
              <div className="py-16 text-center text-xs text-slate-500">Loading study materials...</div>
            ) : tError ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-700">
                {tError}
                <button
                  type="button"
                  onClick={fetchTheories}
                  className="mt-2 block mx-auto underline font-bold"
                >
                  Retry
                </button>
              </div>
            ) : theories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <p className="text-sm font-bold text-slate-950">No theory materials found.</p>
                <p className="mt-1 text-xs text-slate-500">Add Markdown theory notes or upload PDF/PPT decks.</p>
                <button
                  type="button"
                  onClick={handleOpenCreateTheory}
                  className="mt-4 inline-flex items-center rounded-md bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  + Add First Material
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-900 uppercase tracking-wider text-2xs">
                    <tr>
                      <th className="px-4 py-3">Title & Overview</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">File / Content</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {theories.map((t) => (
                      <tr key={t._id || t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-950 max-w-sm">
                          <div className="font-bold line-clamp-1">{t.title}</div>
                          {t.summary && <div className="text-2xs text-slate-500 line-clamp-1">{t.summary}</div>}
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-medium">{t.subject}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.topic}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="rounded bg-slate-950 text-white px-2 py-0.5 text-2xs font-bold uppercase tracking-wider">
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-mono text-2xs">
                          {t.type === 'text' ? (
                            <span>Markdown Notes ({t.content?.length || 0} chars)</span>
                          ) : (
                            <span className="truncate max-w-[140px] block">
                              📄 {t.originalFileName || 'Uploaded file'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`rounded px-2 py-0.5 text-2xs font-bold ${
                              t.isPublished
                                ? 'bg-slate-950 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {t.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePublishTheory(t)}
                              className="rounded border border-slate-200 px-2 py-1 text-2xs font-semibold text-slate-800 hover:bg-slate-100"
                            >
                              {t.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditTheory(t)}
                              className="rounded border border-slate-200 px-2 py-1 text-2xs font-semibold text-slate-800 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTheory(t)}
                              className="rounded border border-slate-200 px-2 py-1 text-2xs font-semibold text-rose-800 hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* MODAL: CREATE / EDIT QUESTION */}
      {/* ============================================================ */}
      {showQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950">
                {qFormData.id ? 'Edit Question' : 'Create New Core CS Question'}
              </h3>
              <button
                type="button"
                onClick={() => setShowQModal(false)}
                className="text-slate-400 hover:text-slate-950 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {qFormErrors.length > 0 && (
              <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 space-y-1">
                {qFormErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              {/* Question Statement */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Statement *</label>
                <textarea
                  rows={3}
                  required
                  value={qFormData.question}
                  onChange={(e) => setQFormData({ ...qFormData, question: e.target.value })}
                  placeholder="Enter multiple-choice question text..."
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map((letter, idx) => (
                  <div key={letter}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Option {letter} *</label>
                      <label className="inline-flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="correctAnswerRadio"
                          checked={qFormData.correctAnswerIndex === idx}
                          onChange={() => setQFormData({ ...qFormData, correctAnswerIndex: idx })}
                          className="accent-slate-950"
                        />
                        <span className="text-2xs font-bold text-slate-950">Correct Answer</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={qFormData.options[idx] || ''}
                      onChange={(e) => {
                        const newOpts = [...qFormData.options]
                        newOpts[idx] = e.target.value
                        setQFormData({ ...qFormData, options: newOpts })
                      }}
                      placeholder={`Option ${letter} value`}
                      className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation *</label>
                <textarea
                  rows={2}
                  required
                  value={qFormData.explanation}
                  onChange={(e) => setQFormData({ ...qFormData, explanation: e.target.value })}
                  placeholder="Detailed rationale explaining why the correct answer is right..."
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Subject, Topic, Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={qFormData.subject}
                    onChange={(e) => setQFormData({ ...qFormData, subject: e.target.value })}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  >
                    {CORE_CS_SUBJECTS_LIST.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Topic *</label>
                  <input
                    type="text"
                    required
                    value={qFormData.topic}
                    onChange={(e) => setQFormData({ ...qFormData, topic: e.target.value })}
                    placeholder="e.g. Normalization, Deadlocks"
                    className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty *</label>
                  <select
                    value={qFormData.difficulty}
                    onChange={(e) => setQFormData({ ...qFormData, difficulty: e.target.value })}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Source & Publication */}
              <div className="flex items-center justify-between pt-2">
                <div className="w-1/2 pr-2">
                  <label className="block font-bold text-slate-700 mb-1">Source / Attribution (Optional)</label>
                  <input
                    type="text"
                    value={qFormData.source}
                    onChange={(e) => setQFormData({ ...qFormData, source: e.target.value })}
                    placeholder="e.g. Standard Core CS Pattern"
                    className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div className="w-1/2 pl-2 flex items-center justify-end gap-2 pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={qFormData.isPublished}
                      onChange={(e) => setQFormData({ ...qFormData, isPublished: e.target.checked })}
                      className="accent-slate-950 h-4 w-4"
                    />
                    <span className="font-bold text-slate-900">Publish immediately</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQModal(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isQSaving}
                  className="rounded-md bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isQSaving ? 'Saving...' : qFormData.id ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CREATE / EDIT THEORY OR STUDY MATERIAL */}
      {/* ============================================================ */}
      {showTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950">
                {tFormData.id ? 'Edit Study Material' : 'Add New Study Material'}
              </h3>
              <button
                type="button"
                onClick={() => setShowTModal(false)}
                className="text-slate-400 hover:text-slate-950 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {tFormErrors.length > 0 && (
              <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 space-y-1">
                {tFormErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveTheory} className="space-y-4 text-xs">
              {/* Material Type Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Material Format *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'text', label: 'Markdown Theory Notes' },
                    { id: 'pdf', label: 'PDF Document (.pdf)' },
                    { id: 'ppt', label: 'Slide Deck (.ppt, .pptx)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setTFormData({ ...tFormData, type: fmt.id })}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                        tFormData.type === fmt.id
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={tFormData.title}
                    onChange={(e) => setTFormData({ ...tFormData, title: e.target.value })}
                    placeholder="e.g. DBMS Normalization Guide"
                    className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={tFormData.subject}
                    onChange={(e) => setTFormData({ ...tFormData, subject: e.target.value })}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  >
                    {CORE_CS_SUBJECTS_LIST.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Topic *</label>
                  <input
                    type="text"
                    required
                    value={tFormData.topic}
                    onChange={(e) => setTFormData({ ...tFormData, topic: e.target.value })}
                    placeholder="e.g. Normalization, Virtual Memory"
                    className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order (Sorting)</label>
                  <input
                    type="number"
                    value={tFormData.order}
                    onChange={(e) => setTFormData({ ...tFormData, order: Number(e.target.value) || 0 })}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Overview / Summary</label>
                <input
                  type="text"
                  value={tFormData.summary}
                  onChange={(e) => setTFormData({ ...tFormData, summary: e.target.value })}
                  placeholder="Key concepts covered in this note..."
                  className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* If Type is TEXT: Markdown Editor with Live Preview */}
              {tFormData.type === 'text' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Educational Markdown Notes *</label>
                    <button
                      type="button"
                      onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                      className="text-2xs font-bold text-slate-700 hover:text-slate-950 underline"
                    >
                      {showMarkdownPreview ? 'Edit Raw Content' : 'Live Preview'}
                    </button>
                  </div>

                  {showMarkdownPreview ? (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-4 max-h-72 overflow-y-auto">
                      <MarkdownContent content={tFormData.content} />
                    </div>
                  ) : (
                    <textarea
                      rows={8}
                      required
                      value={tFormData.content}
                      onChange={(e) => setTFormData({ ...tFormData, content: e.target.value })}
                      placeholder="# Concept Title&#10;&#10;## 1. Overview&#10;Explain concept here...&#10;&#10;| Term | Definition |&#10;|---|---|&#10;| ACID | Atomicity, Consistency... |"
                      className="w-full rounded-md border border-slate-300 p-2.5 font-mono text-xs text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  )}
                </div>
              )}

              {/* If Type is PDF or PPT: File Upload Input */}
              {(tFormData.type === 'pdf' || tFormData.type === 'ppt') && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center space-y-2">
                  <div className="text-xs font-bold text-slate-900">
                    Upload {tFormData.type.toUpperCase()} File (Max 30MB)
                  </div>
                  <input
                    type="file"
                    accept={tFormData.type === 'pdf' ? '.pdf,application/pdf' : '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'}
                    onChange={(e) => setTUploadFile(e.target.files[0] || null)}
                    className="text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-950 file:text-white hover:file:bg-slate-800"
                  />
                  {tUploadFile && (
                    <div className="text-2xs text-slate-600 font-mono">
                      Selected: {tUploadFile.name} ({Math.round(tUploadFile.size / 1024)} KB)
                    </div>
                  )}
                </div>
              )}

              {/* Publication Checkbox */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tFormData.isPublished}
                    onChange={(e) => setTFormData({ ...tFormData, isPublished: e.target.checked })}
                    className="accent-slate-950 h-4 w-4"
                  />
                  <span className="font-bold text-slate-900 text-xs">Publish immediately for students</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTModal(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTSaving}
                  className="rounded-md bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isTSaving ? 'Uploading & Saving...' : tFormData.id ? 'Update Material' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoreCSAdmin
