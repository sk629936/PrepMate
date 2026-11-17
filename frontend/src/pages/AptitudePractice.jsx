import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'

const CHAPTERS_BY_CATEGORY = {
  'Quantitative Aptitude': [
    'Number System', 'HCF and LCM', 'Simplification', 'Divisibility', 'Averages',
    'Percentages', 'Ratio and Proportion', 'Partnership', 'Profit and Loss', 'Discount',
    'Simple Interest', 'Compound Interest', 'Problems on Ages', 'Mixture and Allegation',
    'Time and Work', 'Pipes and Cisterns', 'Time, Speed and Distance', 'Boats and Streams',
    'Problems on Trains', 'Linear Equations', 'Quadratic Equations', 'Algebraic Expressions',
    'Progressions', 'Geometry', 'Mensuration 2D', 'Mensuration 3D', 'Permutation and Combination',
    'Probability', 'Data Interpretation', 'Data Sufficiency'
  ],
  'Logical Reasoning': [
    'Number Series', 'Alphabet Series', 'Alphanumeric Series', 'Coding-Decoding',
    'Blood Relations', 'Direction Sense', 'Analogy', 'Classification', 'Ranking and Order',
    'Syllogism', 'Statement and Conclusion', 'Statement and Assumption', 'Statement and Argument',
    'Logical Deduction', 'Seating Arrangement', 'Puzzles', 'Venn Diagrams', 'Data Sufficiency',
    'Clocks', 'Calendars', 'Non-Verbal Reasoning'
  ],
  'Verbal Ability': [
    'Reading Comprehension', 'Vocabulary', 'Synonyms', 'Antonyms', 'One Word Substitution',
    'Sentence Completion', 'Fill in the Blanks', 'Error Detection', 'Sentence Correction',
    'Sentence Improvement', 'Para Jumbles', 'Para Completion', 'Sentence Rearrangement',
    'Grammar', 'Tenses', 'Articles', 'Prepositions', 'Subject-Verb Agreement',
    'Active and Passive Voice', 'Direct and Indirect Speech', 'Idioms and Phrases', 'Word Usage'
  ]
}

function AptitudePractice() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  // Filters state initialized from URL query params if present
  const queryParams = new URLSearchParams(window.location.search)
  const queryChapter = queryParams.get('chapter') || ''
  const queryCategory = queryParams.get('category')
  const queryDifficulty = queryParams.get('difficulty') || ''

  // Automatically resolve category if only chapter is provided (e.g. from Practice Weak Topic)
  let initialCategory = queryCategory || 'Quantitative Aptitude'
  if (!queryCategory && queryChapter) {
    if (CHAPTERS_BY_CATEGORY['Logical Reasoning'].includes(queryChapter)) {
      initialCategory = 'Logical Reasoning'
    } else if (CHAPTERS_BY_CATEGORY['Verbal Ability'].includes(queryChapter)) {
      initialCategory = 'Verbal Ability'
    } else if (CHAPTERS_BY_CATEGORY['Quantitative Aptitude'].includes(queryChapter)) {
      initialCategory = 'Quantitative Aptitude'
    }
  }

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedChapter, setSelectedChapter] = useState(queryChapter)
  const [selectedDifficulty, setSelectedDifficulty] = useState(queryDifficulty)

  // Questions stream & active question
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFetching, setIsFetching] = useState(true)

  // Interactive question state
  const [selectedOption, setSelectedOption] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flaggedQuestions, setFlaggedQuestions] = useState({}) // { questionId: boolean }

  // Local session stats
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    correct: 0,
    incorrect: 0,
  })

  // Fetch questions whenever filters change
  useEffect(() => {
    if (isAuthenticated) {
      const fetchQuestions = async () => {
        setIsFetching(true)
        setSelectedOption(null)
        setIsSubmitted(false)
        setSubmissionResult(null)
        setCurrentIndex(0)

        try {
          const token = localStorage.getItem('token')
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

          const params = new URLSearchParams()
          if (selectedCategory) params.append('category', selectedCategory)
          if (selectedChapter) params.append('chapter', selectedChapter)
          if (selectedDifficulty) params.append('difficulty', selectedDifficulty)
          params.append('limit', '50')

          const res = await fetch(`${apiBase}/api/aptitude/questions?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await res.json()

          if (data.success) {
            setQuestions(data.questions || [])
          }
        } catch (err) {
          console.error('Failed to load questions:', err)
        } finally {
          setIsFetching(false)
        }
      }

      fetchQuestions()
    }
  }, [isAuthenticated, selectedCategory, selectedChapter, selectedDifficulty])

  const currentQuestion = questions[currentIndex]

  // Submit Answer handler
  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQuestion || isSubmitting || isSubmitted) return

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const res = await fetch(`${apiBase}/api/aptitude/questions/${currentQuestion._id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedAnswerIndex: selectedOption,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setIsSubmitted(true)
        setSubmissionResult(data)

        setSessionStats((prev) => ({
          attempted: prev.attempted + 1,
          correct: data.isCorrect ? prev.correct + 1 : prev.correct,
          incorrect: !data.isCorrect ? prev.incorrect + 1 : prev.incorrect,
        }))
      }
    } catch (err) {
      console.error('Answer submission failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle flag for current question
  const toggleFlag = (qId) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }))
  }

  // Next Question handler
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsSubmitted(false)
      setSubmissionResult(null)
    }
  }

  // Previous Question handler
  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setSelectedOption(null)
      setIsSubmitted(false)
      setSubmissionResult(null)
    }
  }

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

  const sessionAccuracy = sessionStats.attempted > 0 ? Math.round((sessionStats.correct / sessionStats.attempted) * 100) : 0
  const availableChapters = CHAPTERS_BY_CATEGORY[selectedCategory] || []

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="/aptitude"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 rounded-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">
                P
              </span>
              PrepMate
            </a>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800">Aptitude Practice</span>
          </div>

          <div className="flex items-center gap-3">
            <a href="/aptitude" className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs">
              Back to Aptitude Hub
            </a>
            <button type="button" onClick={logout} className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs text-slate-600">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Filters Toolbar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label htmlFor="category-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Category
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setSelectedChapter('')
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Verbal Ability">Verbal Ability</option>
                </select>
              </div>

              <div>
                <label htmlFor="chapter-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Chapter
                </label>
                <select
                  id="chapter-select"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="">All Chapters ({availableChapters.length})</option>
                  {availableChapters.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Difficulty
                </label>
                <select
                  id="difficulty-select"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Session Stats Bar */}
            <div className="flex items-center gap-4 text-xs font-medium border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-5">
              <div>
                <span className="text-slate-500">Attempted:</span>{' '}
                <span className="font-bold text-slate-950">{sessionStats.attempted}</span>
              </div>
              <div>
                <span className="text-slate-500">Correct:</span>{' '}
                <span className="font-bold text-slate-950">{sessionStats.correct}</span>
              </div>
              <div>
                <span className="text-slate-500">Accuracy:</span>{' '}
                <span className="font-bold text-slate-950">{sessionAccuracy}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        {isFetching ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-950 border-t-transparent mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading placement pattern questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <h3 className="text-base font-semibold text-slate-950 mb-1">No questions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Try adjusting your filter selection or select a different chapter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedChapter('')
                setSelectedDifficulty('')
              }}
              className="btn-secondary !min-h-9 text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col divide-y divide-slate-100">
            {/* Question Header Meta */}
            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-800 rounded bg-slate-200/70 px-2 py-0.5">
                  {currentQuestion.chapter}
                </span>
                <span className="text-xs font-medium text-slate-700 rounded border border-slate-200 bg-white px-2 py-0.5">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFlag(currentQuestion._id)}
                  className={`btn-secondary !min-h-8 !py-1 !px-2.5 text-xs font-semibold flex items-center gap-1.5 ${
                    flaggedQuestions[currentQuestion._id]
                      ? '!bg-slate-950 !text-white !border-slate-950'
                      : 'text-slate-700'
                  }`}
                >
                  <span>{flaggedQuestions[currentQuestion._id] ? '★ Bookmarked' : '☆ Bookmark'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={currentIndex === 0}
                  className="btn-secondary !min-h-8 !py-1 !px-2.5 text-xs disabled:opacity-30"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={currentIndex === questions.length - 1}
                  className="btn-secondary !min-h-8 !py-1 !px-2.5 text-xs disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-950 leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Options (A-D) */}
              <div className="space-y-3">
                {currentQuestion.options.map((optionText, optIdx) => {
                  const optionLetter = String.fromCharCode(65 + optIdx)
                  const isSelected = selectedOption === optIdx

                  let optionStyle = 'border-slate-200 bg-white hover:border-slate-400 text-slate-900'

                  if (isSubmitted && submissionResult) {
                    const isCorrectAnswer = optIdx === submissionResult.correctAnswerIndex
                    const isUserSelection = isSelected

                    if (isCorrectAnswer) {
                      // Correct option badge — primary black fill
                      optionStyle = 'border-slate-950 bg-slate-950 text-white font-semibold'
                    } else if (isUserSelection && !isCorrectAnswer) {
                      // User wrong selection — subtle gray highlight
                      optionStyle = 'border-slate-400 bg-slate-100 text-slate-900 font-medium'
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-slate-950 bg-slate-100 text-slate-950 font-semibold ring-1 ring-slate-950'
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(optIdx)}
                      className={`w-full text-left p-4 rounded-lg border text-sm transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                            isSubmitted && optIdx === submissionResult?.correctAnswerIndex
                              ? 'bg-white text-slate-950'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <span>{optionText}</span>
                      </div>

                      {isSubmitted && optIdx === submissionResult?.correctAnswerIndex && (
                        <span className="text-xs font-bold uppercase tracking-wider text-white bg-slate-800 px-2 py-0.5 rounded">
                          Correct Answer
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit & Explanation Section */}
            <div className="p-6 bg-slate-50/50 space-y-4">
              {!isSubmitted ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Select an option above and click submit to verify your answer.
                  </span>
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null || isSubmitting}
                    className="btn-primary !min-h-10 text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Verifying...' : 'Submit Answer'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Feedback Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          submissionResult?.isCorrect
                            ? 'bg-slate-950 text-white'
                            : 'bg-slate-200 text-slate-900 border border-slate-300'
                        }`}
                      >
                        {submissionResult?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                      <span className="text-xs text-slate-700">
                        {submissionResult?.isCorrect
                          ? 'Well done! Your solution is correct.'
                          : `The correct option is ${String.fromCharCode(65 + (submissionResult?.correctAnswerIndex ?? 0))}.`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={currentIndex === questions.length - 1}
                      className="btn-primary !min-h-9 !py-1.5 !px-4 text-xs"
                    >
                      Next Question →
                    </button>
                  </div>

                  {/* Verified Explanation */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step-by-Step Verified Explanation
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                      {submissionResult?.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AptitudePractice

