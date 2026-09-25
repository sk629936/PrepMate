import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'

function AptitudeAdmin() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  const [activeTab, setActiveTab] = useState('manage') // 'manage' | 'add' | 'pdf-import'
  const [questions, setQuestions] = useState([])
  const [filterCategory, setFilterCategory] = useState('')
  const [filterNeedsReview, setFilterNeedsReview] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state for creating/editing manual question
  const [formData, setFormData] = useState({
    id: null,
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    category: 'Quantitative Aptitude',
    chapter: 'Percentages',
    topic: '',
    difficulty: 'Medium',
    isPublished: true,
  })

  // PDF import state
  const [pdfFile, setPdfFile] = useState(null)
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)
  const [candidateQuestions, setCandidateQuestions] = useState([])
  const [pdfMessage, setPdfMessage] = useState('')
  const [bulkCategory, setBulkCategory] = useState('Quantitative Aptitude')
  const [bulkChapter, setBulkChapter] = useState('General Aptitude')

  // Fetch admin question bank
  const fetchAdminQuestions = async () => {
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const params = new URLSearchParams()
      if (filterCategory) params.append('category', filterCategory)
      if (filterNeedsReview) params.append('needsReview', 'true')
      if (searchTerm) params.append('search', searchTerm)
      params.append('limit', '50')

      const res = await fetch(`${apiBase}/api/admin/aptitude/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.success) {
        setQuestions(data.questions || [])
      }
    } catch (err) {
      console.error('Failed to fetch admin questions:', err)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchAdminQuestions()
    }
  }, [isAuthenticated, user, filterCategory, filterNeedsReview, searchTerm])

  // Bulk Apply Category and Chapter to all extracted PDF items
  const handleApplyBulkTags = () => {
    setCandidateQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        category: bulkCategory,
        chapter: bulkChapter.trim() || 'General Aptitude',
      }))
    )
  }

  // Save / Update question
  const handleSaveQuestion = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const isEdit = Boolean(formData.id)
      const url = isEdit
        ? `${apiBase}/api/admin/aptitude/questions/${formData.id}`
        : `${apiBase}/api/admin/aptitude/questions`

      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        setFormData({
          id: null,
          question: '',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          explanation: '',
          category: 'Quantitative Aptitude',
          chapter: 'Percentages',
          topic: '',
          difficulty: 'Medium',
          isPublished: true,
        })
        setActiveTab('manage')
        fetchAdminQuestions()
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  // Toggle publish
  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      await fetch(`${apiBase}/api/admin/aptitude/questions/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })
      fetchAdminQuestions()
    } catch (err) {
      console.error('Publish toggle failed:', err)
    }
  }

  // Delete question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      await fetch(`${apiBase}/api/admin/aptitude/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchAdminQuestions()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Edit question click
  const handleEditClick = (q) => {
    setFormData({
      id: q._id,
      question: q.question,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      category: q.category,
      chapter: q.chapter,
      topic: q.topic || '',
      difficulty: q.difficulty,
      isPublished: q.isPublished,
    })
    setActiveTab('add')
  }

  // PDF Upload handler
  const handlePdfSubmit = async (e) => {
    e.preventDefault()
    if (!pdfFile) return

    setIsExtractingPdf(true)
    setPdfMessage('')
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const fd = new FormData()
      fd.append('file', pdfFile)

      const res = await fetch(`${apiBase}/api/admin/aptitude/pdf-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })

      const data = await res.json()
      if (data.success) {
        setCandidateQuestions(data.extractedQuestions || [])
        setPdfMessage(data.message)
      } else {
        setPdfMessage(data.message || 'PDF processing failed.')
      }
    } catch (err) {
      console.error('PDF Upload Error:', err)
      setPdfMessage('Error processing PDF file.')
    } finally {
      setIsExtractingPdf(false)
    }
  }

  // Batch Save Candidate PDF Questions after Admin Review
  const handleBatchPublishPdfQuestions = async () => {
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const res = await fetch(`${apiBase}/api/admin/aptitude/batch-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions: candidateQuestions }),
      })

      const data = await res.json()
      if (data.success) {
        setCandidateQuestions([])
        setPdfMessage(`Successfully imported ${data.questions.length} verified questions!`)
        fetchAdminQuestions()
      }
    } catch (err) {
      console.error('Batch save failed:', err)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Verifying Admin Permissions...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-950 mb-2">Access Denied (403 Forbidden)</h2>
        <p className="text-sm text-slate-600 mb-6">Admin privileges are required to access this portal.</p>
        <a href="/aptitude" className="btn-primary">Back to Aptitude Preparation</a>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a href="/aptitude" className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">P</span>
              PrepMate
            </a>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-800">Admin Question Bank Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/aptitude" className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs">Aptitude Hub</a>
            <button type="button" onClick={logout} className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs text-slate-600">Sign Out</button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`py-2.5 px-4 text-sm font-semibold border-b-2 ${activeTab === 'manage' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500'}`}
          >
            Manage Question Bank ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                id: null,
                question: '',
                options: ['', '', '', ''],
                correctAnswerIndex: 0,
                explanation: '',
                category: 'Quantitative Aptitude',
                chapter: 'Percentages',
                topic: '',
                difficulty: 'Medium',
                isPublished: true,
              })
              setActiveTab('add')
            }}
            className={`py-2.5 px-4 text-sm font-semibold border-b-2 ${activeTab === 'add' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500'}`}
          >
            {formData.id ? 'Edit Question' : '+ Add Question'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pdf-import')}
            className={`py-2.5 px-4 text-sm font-semibold border-b-2 ${activeTab === 'pdf-import' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-500'}`}
          >
            PDF Upload & Review
          </button>
        </div>

        {/* 1. MANAGE QUESTION BANK */}
        {activeTab === 'manage' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search questions or chapters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 w-64 focus:border-slate-950 focus:outline-none"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-slate-950 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Verbal Ability">Verbal Ability</option>
                </select>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterNeedsReview}
                    onChange={(e) => setFilterNeedsReview(e.target.checked)}
                    className="rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                  <span>Show Items Needing Review</span>
                </label>
              </div>
            </div>

            {/* Question List Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                    <th className="p-3.5">Question</th>
                    <th className="p-3.5">Category & Chapter</th>
                    <th className="p-3.5">Difficulty</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questions.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/60">
                      <td className="p-3.5 font-medium text-slate-900 max-w-md truncate">{q.question}</td>
                      <td className="p-3.5 text-slate-600">{q.category} · {q.chapter}</td>
                      <td className="p-3.5 font-medium">{q.difficulty}</td>
                      <td className="p-3.5 space-x-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${q.isPublished ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {q.isPublished ? 'Published' : 'Draft'}
                        </span>
                        {q.needsReview && (
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                            Review Required
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button type="button" onClick={() => handleEditClick(q)} className="text-slate-950 hover:underline font-bold">Edit</button>
                        <button type="button" onClick={() => handleTogglePublish(q._id, q.isPublished)} className="text-slate-600 hover:underline">
                          {q.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button type="button" onClick={() => handleDeleteQuestion(q._id)} className="text-slate-400 hover:text-slate-950">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. ADD / EDIT QUESTION FORM */}
        {activeTab === 'add' && (
          <form onSubmit={handleSaveQuestion} className="max-w-2xl mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-950">{formData.id ? 'Edit Question' : 'Add New Question'}</h2>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Question Text</label>
              <textarea
                required
                rows={3}
                value={formData.question}
                onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))}
                className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-slate-950 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {formData.options.map((opt, i) => (
                <div key={i}>
                  <label className="block font-semibold text-slate-700 mb-1">Option {String.fromCharCode(65 + i)}</label>
                  <input
                    required
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...formData.options]
                      updated[i] = e.target.value
                      setFormData((p) => ({ ...p, options: updated }))
                    }}
                    className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-slate-950 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correct Option</label>
                <select
                  value={formData.correctAnswerIndex}
                  onChange={(e) => setFormData((p) => ({ ...p, correctAnswerIndex: Number(e.target.value) }))}
                  className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-slate-950 focus:outline-none"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-slate-950 focus:outline-none"
                >
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Verbal Ability">Verbal Ability</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData((p) => ({ ...p, difficulty: e.target.value }))}
                  className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-slate-950 focus:outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chapter Name</label>
              <input
                required
                type="text"
                value={formData.chapter}
                onChange={(e) => setFormData((p) => ({ ...p, chapter: e.target.value }))}
                className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-slate-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Explanation</label>
              <textarea
                required
                rows={3}
                value={formData.explanation}
                onChange={(e) => setFormData((p) => ({ ...p, explanation: e.target.value }))}
                className="w-full rounded border border-slate-300 p-2 text-slate-900 focus:border-slate-950 focus:outline-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button type="button" onClick={() => setActiveTab('manage')} className="btn-secondary !min-h-9">Cancel</button>
              <button type="submit" className="btn-primary !min-h-9">Save Question</button>
            </div>
          </form>
        )}

        {/* 3. PDF UPLOAD & REVIEW SCREEN */}
        {activeTab === 'pdf-import' && (
          <div className="space-y-6">
            <form onSubmit={handlePdfSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider">PDF Question Bank Import</h2>
              <p className="text-xs text-slate-600">
                Upload aptitude PDFs. Extracted questions remain unpublished drafts with <code className="bg-slate-100 px-1 py-0.5 rounded">needsReview: true</code> until verified by an admin.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className="text-xs text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-950 file:text-white hover:file:bg-slate-800"
                />
                <button type="submit" disabled={isExtractingPdf || !pdfFile} className="btn-primary !min-h-9 text-xs">
                  {isExtractingPdf ? 'Extracting...' : 'Upload & Extract'}
                </button>
              </div>
              {pdfMessage && <p className="text-xs font-semibold text-slate-900">{pdfMessage}</p>}
            </form>

            {/* Review Screen for Extracted Questions */}
            {candidateQuestions.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-950">Admin Review Screen ({candidateQuestions.length} Extracted Items)</h3>
                    <p className="text-xs text-slate-500">Verify question text, option choices, correct answers, and explanations before publishing.</p>
                  </div>
                  <button type="button" onClick={handleBatchPublishPdfQuestions} className="btn-primary !min-h-9 text-xs">
                    Approve & Save All Items
                  </button>
                </div>

                {/* Bulk Tagging Toolbar */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Bulk Tag All Extracted Items
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="rounded border border-slate-300 p-1.5 text-xs text-slate-900 bg-white"
                    >
                      <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                      <option value="Logical Reasoning">Logical Reasoning</option>
                      <option value="Verbal Ability">Verbal Ability</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Chapter (e.g. Percentages)"
                      value={bulkChapter}
                      onChange={(e) => setBulkChapter(e.target.value)}
                      className="rounded border border-slate-300 p-1.5 text-xs text-slate-900 bg-white w-48"
                    />
                    <button
                      type="button"
                      onClick={handleApplyBulkTags}
                      className="btn-secondary !min-h-8 !py-1 text-xs font-semibold"
                    >
                      Apply Category & Chapter to All Items
                    </button>
                  </div>
                </div>

                <div className="space-y-6 divide-y divide-slate-100">
                  {candidateQuestions.map((cq, idx) => (
                    <div key={idx} className="pt-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-950">Item #{idx + 1}</span>
                          {cq.isPossibleDuplicate && (
                            <span className="bg-slate-200 border border-slate-300 text-slate-900 px-2 py-0.5 rounded text-[10px] font-bold">
                              ⚠️ Possible Duplicate Detected
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCandidateQuestions((prev) => prev.filter((_, i) => i !== idx))
                          }}
                          className="text-slate-500 hover:text-slate-950 font-semibold text-xs border border-slate-300 rounded px-2 py-0.5"
                        >
                          Discard Item
                        </button>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Question Text</label>
                        <textarea
                          rows={2}
                          value={cq.question}
                          onChange={(e) => {
                            const updated = [...candidateQuestions]
                            updated[idx].question = e.target.value
                            setCandidateQuestions(updated)
                          }}
                          className="w-full rounded border border-slate-300 p-2 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {cq.options.map((opt, oIdx) => (
                          <div key={oIdx}>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Option {String.fromCharCode(65 + oIdx)}</label>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...candidateQuestions]
                                updated[idx].options[oIdx] = e.target.value
                                setCandidateQuestions(updated)
                              }}
                              className="w-full rounded border border-slate-300 p-1.5"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center pt-1">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Correct Option</label>
                          <select
                            value={cq.correctAnswerIndex}
                            onChange={(e) => {
                              const updated = [...candidateQuestions]
                              updated[idx].correctAnswerIndex = Number(e.target.value)
                              setCandidateQuestions(updated)
                            }}
                            className="w-full rounded border border-slate-300 p-1.5"
                          >
                            <option value={0}>Option A</option>
                            <option value={1}>Option B</option>
                            <option value={2}>Option C</option>
                            <option value={3}>Option D</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Category</label>
                          <select
                            value={cq.category || 'Quantitative Aptitude'}
                            onChange={(e) => {
                              const updated = [...candidateQuestions]
                              updated[idx].category = e.target.value
                              setCandidateQuestions(updated)
                            }}
                            className="w-full rounded border border-slate-300 p-1.5"
                          >
                            <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                            <option value="Logical Reasoning">Logical Reasoning</option>
                            <option value="Verbal Ability">Verbal Ability</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Chapter</label>
                          <input
                            type="text"
                            value={cq.chapter || ''}
                            onChange={(e) => {
                              const updated = [...candidateQuestions]
                              updated[idx].chapter = e.target.value
                              setCandidateQuestions(updated)
                            }}
                            className="w-full rounded border border-slate-300 p-1.5"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                          <select
                            value={cq.difficulty || 'Medium'}
                            onChange={(e) => {
                              const updated = [...candidateQuestions]
                              updated[idx].difficulty = e.target.value
                              setCandidateQuestions(updated)
                            }}
                            className="w-full rounded border border-slate-300 p-1.5"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Verified Step-by-Step Explanation</label>
                        <textarea
                          rows={2}
                          value={cq.explanation || ''}
                          onChange={(e) => {
                            const updated = [...candidateQuestions]
                            updated[idx].explanation = e.target.value
                            setCandidateQuestions(updated)
                          }}
                          className="w-full rounded border border-slate-300 p-2 text-slate-800 font-sans"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`publish-${idx}`}
                          checked={Boolean(cq.isPublished)}
                          onChange={(e) => {
                            const updated = [...candidateQuestions]
                            updated[idx].isPublished = e.target.checked
                            setCandidateQuestions(updated)
                          }}
                          className="rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                        />
                        <label htmlFor={`publish-${idx}`} className="font-semibold text-slate-800 cursor-pointer">
                          Publish immediately upon saving
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default AptitudeAdmin


