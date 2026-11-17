import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import CoreCSHeader from '../components/core-cs/CoreCSHeader'
import { CORE_CS_SUBJECTS_LIST } from '../components/core-cs/coreCSData'

export function CoreCSPractice() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  // Read URL query params (?subject=...&topic=...&difficulty=...&mode=mixed)
  const queryParams = new URLSearchParams(window.location.search)
  const initialSubject = queryParams.get('subject') || 'All'
  const initialTopic = queryParams.get('topic') || 'All'
  const initialDifficulty = queryParams.get('difficulty') || 'All'
  const isMixedMode = queryParams.get('mode') === 'mixed'

  const [selectedSubject, setSelectedSubject] = useState(isMixedMode ? 'All' : initialSubject)
  const [selectedTopic, setSelectedTopic] = useState(initialTopic)
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty)

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [submissionResult, setSubmissionResult] = useState(null) // { isCorrect, correctAnswer, explanation }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState(null)

  // Track user solved state in current session
  const [sessionResults, setSessionResults] = useState({}) // { [questionId]: { isCorrect, selectedOption, result } }

  // Fetch questions on filter changes
  useEffect(() => {
    if (isAuthenticated) {
      const fetchQuestions = async () => {
        setIsDataLoading(true)
        setError(null)
        setSubmissionResult(null)
        setSelectedOption(null)
        setCurrentIndex(0)

        try {
          const token = localStorage.getItem('token')
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
          const headers = token ? { Authorization: `Bearer ${token}` } : {}

          const params = new URLSearchParams()
          params.append('limit', '50')
          if (selectedSubject && selectedSubject !== 'All') {
            params.append('subject', selectedSubject)
          }
          if (selectedTopic && selectedTopic !== 'All') {
            params.append('topic', selectedTopic)
          }
          if (selectedDifficulty && selectedDifficulty !== 'All') {
            params.append('difficulty', selectedDifficulty)
          }

          const res = await fetch(`${apiBase}/api/core-cs/questions?${params.toString()}`, { headers })
          const data = await res.json()

          if (data.success) {
            setQuestions(data.questions || [])
          } else {
            setError(data.error || 'Failed to load practice questions.')
          }
        } catch (err) {
          console.error('Failed to fetch questions:', err)
          setError('Failed to reach backend server.')
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchQuestions()
    }
  }, [isAuthenticated, selectedSubject, selectedTopic, selectedDifficulty])

  // Sync state when moving between questions
  const currentQuestion = questions[currentIndex] || null

  useEffect(() => {
    if (currentQuestion) {
      const saved = sessionResults[currentQuestion._id || currentQuestion.id]
      if (saved) {
        setSelectedOption(saved.selectedOption)
        setSubmissionResult(saved.result)
      } else {
        setSelectedOption(null)
        setSubmissionResult(null)
      }
    }
  }, [currentIndex, currentQuestion, sessionResults])

  // Submit Answer to Backend
  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !selectedOption || isSubmitting) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const qId = currentQuestion._id || currentQuestion.id

      const res = await fetch(`${apiBase}/api/core-cs/practice/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: qId,
          selectedAnswer: selectedOption,
        }),
      })

      const data = await res.json()

      if (data.success) {
        const resObj = {
          isCorrect: data.isCorrect,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation,
        }
        setSubmissionResult(resObj)
        setSessionResults((prev) => ({
          ...prev,
          [qId]: {
            selectedOption,
            result: resObj,
          },
        }))
      } else {
        alert(data.error || 'Failed to evaluate answer.')
      }
    } catch (err) {
      console.error('Submit error:', err)
      alert('Error submitting answer. Please check your network.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Available topics for selected subject
  const currentSubjectObj = CORE_CS_SUBJECTS_LIST.find((s) => s.name === selectedSubject)
  const availableTopics = currentSubjectObj ? currentSubjectObj.topics : []

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading Practice Workspace...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <CoreCSHeader user={user} logout={logout} breadcrumb="Practice" activeSection="practice" />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Practice Filter Control Panel */}
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h1 className="text-lg font-bold text-slate-950 tracking-tight">
                {isMixedMode ? 'Mixed Core CS Practice' : 'Topic & Subject Practice'}
              </h1>
              <p className="text-xs text-slate-600">
                Sharpen conceptual knowledge with verified placement multiple-choice questions.
              </p>
            </div>

            {/* Total count badge */}
            <div className="text-xs font-medium text-slate-600">
              {questions.length > 0 ? (
                <span className="rounded bg-white border border-slate-200 px-2.5 py-1 font-semibold text-slate-900 shadow-2xs">
                  {questions.length} Questions Loaded
                </span>
              ) : null}
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Subject Selector */}
            <div>
              <label htmlFor="subject-select" className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Subject
              </label>
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value)
                  setSelectedTopic('All')
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="All">All Subjects (Mixed Practice)</option>
                {CORE_CS_SUBJECTS_LIST.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Selector */}
            <div>
              <label htmlFor="topic-select" className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Topic
              </label>
              <select
                id="topic-select"
                value={selectedTopic}
                disabled={selectedSubject === 'All'}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="All">All Topics</option>
                {availableTopics.map((t, idx) => (
                  <option key={idx} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label htmlFor="diff-select" className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Difficulty
              </label>
              <select
                id="diff-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </section>

        {/* Practice Question Card Workspace */}
        {isDataLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-950 border-r-transparent mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading question set...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-medium text-slate-700">{error}</p>
            <button
              type="button"
              onClick={() => setSelectedSubject('All')}
              className="mt-4 inline-flex items-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : questions.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700 mb-3">
              ?
            </div>
            <h3 className="text-base font-bold text-slate-950">No practice questions are available yet.</h3>
            <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">
              There are currently no published questions matching the selected filters ({selectedSubject}, {selectedTopic}, {selectedDifficulty}).
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSubject('All')
                setSelectedTopic('All')
                setSelectedDifficulty('All')
              }}
              className="mt-5 inline-flex items-center rounded-md bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Show All Core CS Questions
            </button>
          </div>
        ) : (
          /* Active Question Workspace */
          <div className="space-y-6">
            {/* Question Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              {/* Question Metadata Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-950">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                    {currentQuestion.subject}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                    {currentQuestion.topic}
                  </span>
                </div>

                <span
                  className={`rounded px-2 py-0.5 font-semibold text-2xs ${
                    currentQuestion.difficulty === 'Easy'
                      ? 'bg-slate-100 text-slate-700'
                      : currentQuestion.difficulty === 'Medium'
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>

              {/* Question Statement */}
              <div className="text-base sm:text-lg font-medium text-slate-950 leading-relaxed">
                {currentQuestion.question}
              </div>

              {/* Multiple Choice Options (4 Options) */}
              <div className="space-y-2.5" role="radiogroup" aria-label="Answer options">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === option
                  const isSubmitted = Boolean(submissionResult)
                  const isCorrectAnswer = isSubmitted && submissionResult.correctAnswer === option
                  const isWrongSelection = isSubmitted && isSelected && !submissionResult.isCorrect

                  let optionStyle = 'border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50/80'

                  if (isSelected && !isSubmitted) {
                    optionStyle = 'border-slate-950 bg-slate-50 text-slate-950 ring-1 ring-slate-950 font-semibold'
                  } else if (isCorrectAnswer) {
                    optionStyle = 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-700 font-semibold'
                  } else if (isWrongSelection) {
                    optionStyle = 'border-rose-700 bg-rose-50 text-rose-950 ring-1 ring-rose-700 font-semibold'
                  } else if (isSubmitted) {
                    optionStyle = 'border-slate-200 bg-slate-50/50 text-slate-500 opacity-80'
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(option)}
                      className={`w-full rounded-lg border p-4 text-left text-sm transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-400 text-xs font-bold text-slate-800">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {isCorrectAnswer && (
                        <span className="shrink-0 text-xs font-bold text-emerald-800">✓ Correct</span>
                      )}
                      {isWrongSelection && (
                        <span className="shrink-0 text-xs font-bold text-rose-800">✗ Your Choice</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation Card (Revealed after submission) */}
              {submissionResult && (
                <div
                  className={`rounded-lg border p-4 text-sm space-y-2 ${
                    submissionResult.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                      : 'border-slate-300 bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    {submissionResult.isCorrect ? (
                      <span className="text-emerald-800">✓ Correct Answer</span>
                    ) : (
                      <span className="text-rose-800">✗ Incorrect · Correct Answer: {submissionResult.correctAnswer}</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <strong className="font-semibold text-slate-950">Explanation: </strong>
                    {submissionResult.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons & Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!submissionResult ? (
                    <button
                      type="button"
                      disabled={!selectedOption || isSubmitting}
                      onClick={handleSubmitAnswer}
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Verifying...' : 'Submit Answer'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentIndex < questions.length - 1) {
                          setCurrentIndex(currentIndex + 1)
                        } else {
                          alert('You have reached the end of this practice question set!')
                        }
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
                    >
                      {currentIndex < questions.length - 1 ? 'Next Question →' : 'Completed Practice Set'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CoreCSPractice
