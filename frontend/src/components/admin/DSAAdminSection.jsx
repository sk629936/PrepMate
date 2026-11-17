import { useState, useEffect, useCallback } from 'react'

const TOPICS = [
  { id: 'arrays', name: 'Arrays' },
  { id: 'strings', name: 'Strings' },
  { id: 'linkedlist', name: 'Linked List' },
  { id: 'stackqueue', name: 'Stack & Queue' },
  { id: 'recursion', name: 'Recursion' },
  { id: 'searching', name: 'Searching' },
  { id: 'sorting', name: 'Sorting' },
  { id: 'trees', name: 'Trees' },
  { id: 'graphs', name: 'Graphs' },
  { id: 'dp', name: 'Dynamic Programming' },
]

const LEETCODE_REGEX = /^https?:\/\/(www\.)?leetcode\.com\/problems\/[a-z0-9-]+\/?.*$/i

export default function DSAAdminSection() {
  const [problems, setProblems] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTopic, setFilterTopic] = useState('All')
  const [filterDifficulty, setFilterDifficulty] = useState('All')
  const [filterPublished, setFilterPublished] = useState('All')
  const [filterActive, setFilterActive] = useState('All')
  const [sortOption, setSortOption] = useState('order')

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    topic: 'arrays',
    difficulty: 'Easy',
    leetcodeUrl: '',
    order: 1,
    isPublished: true,
    isActive: true,
    statement: '',
  })
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type })
    setTimeout(() => setToastMessage(null), 4500)
  }

  // Fetch problems list from backend
  const fetchProblems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append('search', searchTerm.trim())
      if (filterTopic !== 'All') params.append('topic', filterTopic)
      if (filterDifficulty !== 'All') params.append('difficulty', filterDifficulty)
      if (filterPublished !== 'All') params.append('isPublished', filterPublished === 'Published')
      if (filterActive !== 'All') params.append('isActive', filterActive === 'Active')
      if (sortOption) params.append('sort', sortOption)

      const res = await fetch(`${API_BASE}/api/admin/dsa/problems?${params.toString()}`, {
        headers: authHeader(),
      })
      const data = await res.json()
      if (data.success) {
        setProblems(data.problems || [])
        setStats(data.stats || null)
      } else {
        showToast(data.error || 'Failed to fetch DSA problems', 'error')
      }
    } catch {
      showToast('Network error while loading DSA problems', 'error')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterTopic, filterDifficulty, filterPublished, filterActive, sortOption, API_BASE])

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextOrder = problems.length > 0 ? Math.max(...problems.map((p) => p.order || 0)) + 1 : 1
    setEditingProblem(null)
    setFormData({
      title: '',
      topic: filterTopic !== 'All' ? filterTopic : 'arrays',
      difficulty: 'Easy',
      leetcodeUrl: '',
      order: nextOrder,
      isPublished: true,
      isActive: true,
      statement: '',
    })
    setFormError('')
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (problem) => {
    setEditingProblem(problem)
    setFormData({
      title: problem.title || '',
      topic: problem.topic || 'arrays',
      difficulty: problem.difficulty || 'Easy',
      leetcodeUrl: problem.leetcodeUrl || '',
      order: problem.order ?? 1,
      isPublished: problem.isPublished ?? true,
      isActive: problem.isActive ?? true,
      statement: problem.statement || '',
    })
    setFormError('')
    setIsModalOpen(true)
  }

  // Form Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Client-side validations
    if (!formData.title.trim()) {
      setFormError('Problem title is required.')
      return
    }

    if (!formData.leetcodeUrl.trim()) {
      setFormError('LeetCode URL is required.')
      return
    }

    if (!LEETCODE_REGEX.test(formData.leetcodeUrl.trim())) {
      setFormError('Please enter a valid LeetCode problem URL (e.g., https://leetcode.com/problems/two-sum/).')
      return
    }

    setIsSubmitting(true)

    try {
      const isEdit = Boolean(editingProblem)
      const url = isEdit
        ? `${API_BASE}/api/admin/dsa/problems/${editingProblem.id}`
        : `${API_BASE}/api/admin/dsa/problems`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader(),
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          topic: formData.topic,
          difficulty: formData.difficulty,
          leetcodeUrl: formData.leetcodeUrl.trim(),
          order: Number(formData.order) || 1,
          isPublished: formData.isPublished,
          isActive: formData.isActive,
          statement: formData.statement.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        showToast(isEdit ? 'Problem updated successfully!' : 'Problem added successfully!')
        setIsModalOpen(false)
        fetchProblems()
      } else {
        setFormError(data.error || 'Failed to save problem.')
      }
    } catch {
      setFormError('Network error while saving problem.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle Publish
  const handleTogglePublish = async (problem) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/dsa/problems/${problem.id}/publish`, {
        method: 'PATCH',
        headers: authHeader(),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast(`Problem "${problem.title}" is now ${data.isPublished ? 'Published' : 'Draft'}.`)
        setProblems((prev) =>
          prev.map((p) => (p.id === problem.id ? { ...p, isPublished: data.isPublished } : p))
        )
        if (stats) {
          setStats((prev) => ({
            ...prev,
            published: data.isPublished ? prev.published + 1 : prev.published - 1,
            unpublished: data.isPublished ? prev.unpublished - 1 : prev.unpublished + 1,
          }))
        }
      } else {
        showToast(data.error || 'Failed to toggle publish status.', 'error')
      }
    } catch {
      showToast('Network error while updating publish status.', 'error')
    }
  }

  // Toggle Active
  const handleToggleActive = async (problem) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/dsa/problems/${problem.id}/active`, {
        method: 'PATCH',
        headers: authHeader(),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast(`Problem "${problem.title}" is now ${data.isActive ? 'Active' : 'Inactive'}.`)
        setProblems((prev) =>
          prev.map((p) => (p.id === problem.id ? { ...p, isActive: data.isActive } : p))
        )
        if (stats) {
          setStats((prev) => ({
            ...prev,
            active: data.isActive ? prev.active + 1 : prev.active - 1,
            inactive: data.isActive ? prev.inactive - 1 : prev.inactive + 1,
          }))
        }
      } else {
        showToast(data.error || 'Failed to toggle active status.', 'error')
      }
    } catch {
      showToast('Network error while updating active status.', 'error')
    }
  }

  // Safe Delete
  const handleDelete = async (problem) => {
    const confirmed = window.confirm(
      `Delete problem "${problem.title}" (${problem.id})?\n\nIf any users have solved this problem, it will be safely deactivated/unpublished rather than permanently removed to preserve user progress history.`
    )
    if (!confirmed) return

    try {
      const res = await fetch(`${API_BASE}/api/admin/dsa/problems/${problem.id}`, {
        method: 'DELETE',
        headers: authHeader(),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        showToast(data.message || 'Problem removed successfully.')
        fetchProblems()
      } else {
        showToast(data.error || 'Failed to delete problem.', 'error')
      }
    } catch {
      showToast('Network error while deleting problem.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="alert"
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
            toastMessage.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-slate-300 bg-slate-900 text-white shadow-sm'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-3 text-xs opacity-70 hover:opacity-100 focus:outline-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admin · DSA Module</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
              LeetCode Catalog
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            DSA Problem Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl leading-relaxed">
            Manage PrepMate&apos;s curated DSA problem set, official LeetCode URLs, topic categories, difficulty ratings, and catalog visibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProblems}
            title="Refresh problems"
            className="btn-secondary !min-h-10 !px-3 text-xs"
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            id="add-dsa-problem-btn"
            onClick={handleOpenCreate}
            className="btn-primary !min-h-10 !py-2 !px-4 text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <span>+</span> Add Problem
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total</div>
            <div className="mt-1 text-2xl font-bold text-slate-950">{stats.total}</div>
            <div className="text-[11px] text-slate-400">Problems</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Published</div>
            <div className="mt-1 text-2xl font-bold text-slate-950">{stats.published}</div>
            <div className="text-[11px] text-slate-400">In catalog</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active</div>
            <div className="mt-1 text-2xl font-bold text-slate-950">{stats.active}</div>
            <div className="text-[11px] text-slate-400">Enabled</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Easy</div>
            <div className="mt-1 text-2xl font-bold text-slate-800">{stats.byDifficulty?.Easy || 0}</div>
            <div className="text-[11px] text-slate-400">Weight 1 pt</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Medium</div>
            <div className="mt-1 text-2xl font-bold text-slate-800">{stats.byDifficulty?.Medium || 0}</div>
            <div className="text-[11px] text-slate-400">Weight 2 pts</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Hard</div>
            <div className="mt-1 text-2xl font-bold text-slate-800">{stats.byDifficulty?.Hard || 0}</div>
            <div className="text-[11px] text-slate-400">Weight 3 pts</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label htmlFor="dsa-search" className="block text-xs font-semibold text-slate-600 mb-1">Search Problem</label>
            <input
              id="dsa-search"
              type="text"
              placeholder="Search by title, ID, or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          {/* Topic Filter */}
          <div>
            <label htmlFor="dsa-topic-filter" className="block text-xs font-semibold text-slate-600 mb-1">Topic</label>
            <select
              id="dsa-topic-filter"
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="All">All Topics</option>
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label htmlFor="dsa-diff-filter" className="block text-xs font-semibold text-slate-600 mb-1">Difficulty</label>
            <select
              id="dsa-diff-filter"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Published Filter */}
          <div>
            <label htmlFor="dsa-pub-filter" className="block text-xs font-semibold text-slate-600 mb-1">Publish Status</label>
            <select
              id="dsa-pub-filter"
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft (Unpublished)</option>
            </select>
          </div>

          {/* Active Filter */}
          <div>
            <label htmlFor="dsa-active-filter" className="block text-xs font-semibold text-slate-600 mb-1">Active State</label>
            <select
              id="dsa-active-filter"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="All">All States</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        {(searchTerm || filterTopic !== 'All' || filterDifficulty !== 'All' || filterPublished !== 'All' || filterActive !== 'All') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Showing {problems.length} filtered problems</span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setFilterTopic('All')
                setFilterDifficulty('All')
                setFilterPublished('All')
                setFilterActive('All')
              }}
              className="font-semibold text-slate-800 hover:text-slate-950 underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Problems Table / List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-center text-slate-500 text-sm">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-xs mb-2 animate-pulse">P</div>
            <p className="ml-3 font-medium">Loading DSA Problem Catalog...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <p className="text-base font-semibold text-slate-800 mb-1">No problems match your filters.</p>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or add a new problem.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 w-16 text-center">Order</th>
                  <th scope="col" className="px-4 py-3">Problem Title</th>
                  <th scope="col" className="px-4 py-3">Topic</th>
                  <th scope="col" className="px-4 py-3">Difficulty</th>
                  <th scope="col" className="px-4 py-3">LeetCode Link</th>
                  <th scope="col" className="px-4 py-3 text-center">Visibility</th>
                  <th scope="col" className="px-4 py-3 text-center">State</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {problems.map((problem) => {
                  const topicName = TOPICS.find((t) => t.id === problem.topic)?.name || problem.topic
                  const diffColor =
                    problem.difficulty === 'Easy'
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : problem.difficulty === 'Medium'
                      ? 'bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-900 text-white border-slate-900'

                  return (
                    <tr
                      key={problem.id || problem._id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Order */}
                      <td className="px-4 py-3 text-center font-mono font-semibold text-slate-500">
                        {problem.order ?? '—'}
                      </td>

                      {/* Problem Title & ID */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 text-sm leading-snug">{problem.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">ID: {problem.id}</div>
                      </td>

                      {/* Topic */}
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                          {topicName}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${diffColor}`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>

                      {/* LeetCode URL */}
                      <td className="px-4 py-3 max-w-xs">
                        <a
                          href={problem.leetcodeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs text-slate-600 hover:text-slate-950 underline truncate max-w-[220px]"
                          title={problem.leetcodeUrl}
                        >
                          <span>{problem.leetcodeUrl.replace(/^https?:\/\/(www\.)?leetcode\.com\/problems\//, '').replace(/\/$/, '')}</span>
                          <span className="text-[10px] opacity-70">↗</span>
                        </a>
                      </td>

                      {/* Visibility / Published */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(problem)}
                          title={`Click to ${problem.isPublished ? 'unpublish' : 'publish'}`}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                            problem.isPublished
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {problem.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      {/* Active State */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(problem)}
                          title={`Click to ${problem.isActive ? 'deactivate' : 'activate'}`}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                            problem.isActive
                              ? 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
                              : 'bg-slate-100 text-slate-400 border border-dashed border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {problem.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(problem)}
                            className="rounded px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-950 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(problem)}
                            className="rounded px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Problem Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dsa-modal-title"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 id="dsa-modal-title" className="text-lg font-bold text-slate-950">
                  {editingProblem ? 'Edit DSA Problem' : 'Add New DSA Problem'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure LeetCode URL, metadata, topic, and difficulty rating.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Problem Title */}
              <div>
                <label htmlFor="problem-title" className="block text-xs font-bold text-slate-800 mb-1">
                  Problem Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="problem-title"
                  type="text"
                  required
                  placeholder="e.g., Two Sum, Valid Parentheses"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              {/* LeetCode URL */}
              <div>
                <label htmlFor="problem-url" className="block text-xs font-bold text-slate-800 mb-1">
                  Official LeetCode URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="problem-url"
                  type="url"
                  required
                  placeholder="https://leetcode.com/problems/two-sum/"
                  value={formData.leetcodeUrl}
                  onChange={(e) => setFormData({ ...formData, leetcodeUrl: e.target.value })}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Must be an official LeetCode problem URL. Users will solve directly on LeetCode.
                </p>
              </div>

              {/* Topic & Difficulty Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="problem-topic" className="block text-xs font-bold text-slate-800 mb-1">
                    Topic Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="problem-topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    {TOPICS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="problem-diff" className="block text-xs font-bold text-slate-800 mb-1">
                    Difficulty Tier <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="problem-diff"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="Easy">Easy (1 pt)</option>
                    <option value="Medium">Medium (2 pts)</option>
                    <option value="Hard">Hard (3 pts)</option>
                  </select>
                </div>
              </div>

              {/* Order & ID */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="problem-order" className="block text-xs font-bold text-slate-800 mb-1">
                    Display Order (#)
                  </label>
                  <input
                    id="problem-order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Problem ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingProblem ? editingProblem.id : 'Auto-generated on save'}
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 h-4 w-4"
                  />
                  <span>Published (visible in student DSA preparation catalog)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-500 h-4 w-4"
                  />
                  <span>Active (problem is operational and available for practice)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="btn-secondary !min-h-10 !px-4 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-dsa-problem-btn"
                  disabled={isSubmitting}
                  className="btn-primary !min-h-10 !px-5 text-xs font-semibold"
                >
                  {isSubmitting ? 'Saving...' : editingProblem ? 'Save Changes' : 'Add Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
