import { useState, useEffect, useRef } from 'react'
import useAuth from '../hooks/useAuth'

function AptitudeTest() {
  const { user, isLoading, isAuthenticated } = useAuth()

  // Test Config state
  const queryParams = new URLSearchParams(window.location.search)
  const initialTestType = queryParams.get('type') || 'placement-test'

  const [testConfig, setTestConfig] = useState({
    testType: initialTestType,
    questionCount: 20,
    difficulty: 'Mixed',
  })

  // Test Session state
  const [testState, setTestState] = useState('config') // 'config' | 'running' | 'result'
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({}) // { questionId: selectedIndex }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}) // { questionId: boolean }
  const [paletteFilter, setPaletteFilter] = useState('all') // 'all' | 'answered' | 'unanswered' | 'flagged'
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(1800) // seconds
  const [testTitle, setTestTitle] = useState('Placement Aptitude Test')

  // Result state
  const [testResult, setTestResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const timerRef = useRef(null)
  const userAnswersRef = useRef(userAnswers)
  const questionsRef = useRef(questions)
  const timeRemainingRef = useRef(timeRemaining)
  const isSubmittingRef = useRef(isSubmitting)

  useEffect(() => {
    userAnswersRef.current = userAnswers
  }, [userAnswers])

  useEffect(() => {
    questionsRef.current = questions
  }, [questions])

  useEffect(() => {
    timeRemainingRef.current = timeRemaining
  }, [timeRemaining])

  useEffect(() => {
    isSubmittingRef.current = isSubmitting
  }, [isSubmitting])

  // Start Test Handler
  const handleStartTest = async () => {
    setIsGenerating(true)
    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const titleMap = {
        'placement-test': 'Placement Aptitude Test',
        'quant-test': 'Quantitative Aptitude Test',
        'logical-test': 'Logical Reasoning Test',
        'verbal-test': 'Verbal Ability Test',
        'mixed-test': 'Mixed Aptitude Test',
      }
      setTestTitle(titleMap[testConfig.testType] || 'Placement Aptitude Test')

      const categoryMap = {
        'quant-test': 'Quantitative Aptitude',
        'logical-test': 'Logical Reasoning',
        'verbal-test': 'Verbal Ability',
      }

      const categoryParam = categoryMap[testConfig.testType] || 'All'

      const params = new URLSearchParams()
      params.append('questionCount', String(testConfig.questionCount))
      params.append('difficulty', testConfig.difficulty)
      params.append('category', categoryParam)

      const res = await fetch(`${apiBase}/api/aptitude/tests/${testConfig.testType}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success && data.test) {
        setQuestions(data.test.questions)
        questionsRef.current = data.test.questions
        setTimeRemaining(data.test.durationSeconds)
        timeRemainingRef.current = data.test.durationSeconds
        setUserAnswers({})
        userAnswersRef.current = {}
        setFlaggedQuestions({})
        setCurrentIndex(0)
        setTestState('running')
      }
    } catch (err) {
      console.error('Failed to start test session:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Submit Test Execution Handler
  const executeSubmit = async () => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setIsSubmitting(true)
    setShowSubmitModal(false)

    if (timerRef.current) clearInterval(timerRef.current)

    try {
      const token = localStorage.getItem('token')
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const currentQs = questionsRef.current
      const currentAns = userAnswersRef.current
      const currentRem = timeRemainingRef.current

      const formattedAnswers = currentQs.map((q) => ({
        questionId: q._id,
        selectedAnswerIndex: currentAns[q._id] !== undefined ? currentAns[q._id] : null,
      }))

      const timeTaken = Math.max((currentQs.length * 90) - currentRem, 1)

      const res = await fetch(`${apiBase}/api/aptitude/tests/${testConfig.testType}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testType: testTitle,
          title: testTitle,
          answers: formattedAnswers,
          timeTakenSeconds: timeTaken,
          totalDurationSeconds: currentQs.length * 90,
          difficultyConfig: testConfig.difficulty,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setTestResult(data.result)
        setTestState('result')
      }
    } catch (err) {
      console.error('Test submission failed:', err)
    } finally {
      setIsSubmitting(false)
      isSubmittingRef.current = false
    }
  }

  const executeSubmitRef = useRef(null)
  executeSubmitRef.current = executeSubmit

  // Timer Countdown Effect
  useEffect(() => {
    if (testState === 'running') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            if (executeSubmitRef.current) executeSubmitRef.current()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [testState])

  // Open confirmation modal
  const handleOpenSubmitModal = () => {
    setShowSubmitModal(true)
  }

  // Toggle flag for current question
  const toggleFlagCurrent = () => {
    if (!questions[currentIndex]) return
    const qId = questions[currentIndex]._id
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }))
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Derived counts used in submit modal
  const answeredCount = Object.keys(userAnswers).length
  const unansweredCount = questions.length - answeredCount
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-base mb-4 animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-600">Loading Test Environment...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a
              href="/aptitude"
              className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight text-slate-950 focus:outline-none rounded-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">
                P
              </span>
              PrepMate
            </a>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800">
              {testState === 'running' ? testTitle : 'Full Aptitude Test'}
            </span>
          </div>

          {testState === 'running' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-slate-950 px-3 py-1.5 font-mono text-xs font-bold text-white shadow-sm">
                <span>Timer:</span>
                <span>{formatTimer(timeRemaining)}</span>
              </div>
              <button
                type="button"
                onClick={handleOpenSubmitModal}
                disabled={isSubmitting}
                className="btn-primary !min-h-9 !py-1.5 !px-4 text-xs"
              >
                Submit Test
              </button>
            </div>
          )}

          {testState !== 'running' && (
            <div className="flex items-center gap-3">
              <a href="/aptitude" className="btn-secondary !min-h-9 !py-1.5 !px-3 text-xs">
                Back to Aptitude Hub
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* 1. CONFIGURATION VIEW */}
        {testState === 'config' && (
          <div className="max-w-2xl mx-auto rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                Aptitude Test Setup
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Configure your timed assessment to simulate real campus placement first-round aptitude exams.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Test Format
                </label>
                <select
                  value={testConfig.testType}
                  onChange={(e) => setTestConfig((p) => ({ ...p, testType: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  <option value="placement-test">Placement Aptitude Test (Combined Quant, Logical & Verbal)</option>
                  <option value="quant-test">Quantitative Aptitude Test</option>
                  <option value="logical-test">Logical Reasoning Test</option>
                  <option value="verbal-test">Verbal Ability Test</option>
                  <option value="mixed-test">Mixed Practice Test</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Number of Questions
                  </label>
                  <select
                    value={testConfig.questionCount}
                    onChange={(e) => setTestConfig((p) => ({ ...p, questionCount: Number(e.target.value) }))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value={10}>10 Questions (15 mins)</option>
                    <option value={20}>20 Questions (30 mins)</option>
                    <option value={30}>30 Questions (45 mins)</option>
                    <option value={50}>50 Questions (75 mins)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Difficulty Profile
                  </label>
                  <select
                    value={testConfig.difficulty}
                    onChange={(e) => setTestConfig((p) => ({ ...p, difficulty: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="Mixed">Mixed Placement Profile (Easy/Medium/Hard)</option>
                    <option value="Easy">Easy Level</option>
                    <option value="Medium">Medium Level</option>
                    <option value="Hard">Hard Level</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Auto-submits when timer expires</span>
              <button
                type="button"
                onClick={handleStartTest}
                disabled={isGenerating}
                className="btn-primary !min-h-10 text-sm font-semibold"
              >
                {isGenerating ? 'Preparing Test...' : 'Start Assessment Now'}
              </button>
            </div>
          </div>
        )}

        {/* 2. RUNNING TEST VIEW */}
        {testState === 'running' && questions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Workspace */}
            <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col divide-y divide-slate-100">
              <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-950">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-medium">{questions[currentIndex].category}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700">{questions[currentIndex].chapter}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFlagCurrent}
                    className={`btn-secondary !min-h-8 !py-1 !px-2.5 text-xs font-semibold flex items-center gap-1 ${
                      flaggedQuestions[questions[currentIndex]._id]
                        ? '!bg-slate-950 !text-white !border-slate-950'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{flaggedQuestions[questions[currentIndex]._id] ? '★ Flagged' : '☆ Flag'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((p) => Math.max(p - 1, 0))}
                    disabled={currentIndex === 0}
                    className="btn-secondary !min-h-8 !py-1 !px-2.5 text-xs disabled:opacity-30"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((p) => Math.min(p + 1, questions.length - 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="btn-secondary !min-h-8 !py-1 !px-2.5 text-xs disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <h2 className="text-base sm:text-lg font-semibold text-slate-950 leading-relaxed">
                  {questions[currentIndex].question}
                </h2>

                <div className="space-y-3">
                  {questions[currentIndex].options.map((optionText, optIdx) => {
                    const qId = questions[currentIndex]._id
                    const isSelected = userAnswers[qId] === optIdx
                    const optionLetter = String.fromCharCode(65 + optIdx)

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() =>
                          setUserAnswers((prev) => ({
                            ...prev,
                            [qId]: optIdx,
                          }))
                        }
                        className={`w-full text-left p-4 rounded-lg border text-sm transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-slate-950 bg-slate-950 text-white font-semibold'
                            : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400'
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${
                            isSelected ? 'bg-white text-slate-950' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <span>{optionText}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Question Palette */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 h-fit">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Question Palette
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">{Object.keys(userAnswers).length}/{questions.length} Saved</span>
              </div>

              {/* Palette Filters */}
              <div className="flex flex-wrap gap-1 text-[11px] font-medium border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setPaletteFilter('all')}
                  className={`px-2 py-0.5 rounded ${paletteFilter === 'all' ? 'bg-slate-950 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteFilter('answered')}
                  className={`px-2 py-0.5 rounded ${paletteFilter === 'answered' ? 'bg-slate-950 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Answered ({Object.keys(userAnswers).length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteFilter('unanswered')}
                  className={`px-2 py-0.5 rounded ${paletteFilter === 'unanswered' ? 'bg-slate-950 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Pending ({questions.length - Object.keys(userAnswers).length})
                </button>
                <button
                  type="button"
                  onClick={() => setPaletteFilter('flagged')}
                  className={`px-2 py-0.5 rounded ${paletteFilter === 'flagged' ? 'bg-slate-950 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Flagged ({Object.values(flaggedQuestions).filter(Boolean).length})
                </button>
              </div>

              {/* Grid Palette */}
              <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-0.5">
                {questions.map((q, idx) => {
                  const isAnswered = userAnswers[q._id] !== undefined
                  const isFlagged = Boolean(flaggedQuestions[q._id])
                  const isCurrent = idx === currentIndex

                  if (paletteFilter === 'answered' && !isAnswered) return null
                  if (paletteFilter === 'unanswered' && isAnswered) return null
                  if (paletteFilter === 'flagged' && !isFlagged) return null

                  let btnStyle = 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                  if (isCurrent) {
                    btnStyle = 'border-2 border-slate-950 bg-slate-100 text-slate-950 font-bold'
                  } else if (isFlagged) {
                    btnStyle = 'border border-slate-900 bg-slate-800 text-white font-bold'
                  } else if (isAnswered) {
                    btnStyle = 'bg-slate-950 text-white font-bold'
                  }

                  return (
                    <button
                      key={q._id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-md text-xs transition-all relative ${btnStyle}`}
                    >
                      {idx + 1}
                      {isFlagged && <span className="absolute top-0 right-0.5 text-[9px] text-amber-300">★</span>}
                    </button>
                  )
                })}
              </div>

              {/* Palette Legend */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-slate-950 inline-block" />
                  <span>Answered ({Object.keys(userAnswers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-slate-200 bg-white inline-block" />
                  <span>Unanswered ({questions.length - Object.keys(userAnswers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-slate-800 border border-slate-900 inline-block" />
                  <span>Flagged ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRE-SUBMIT CONFIRMATION MODAL */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-lg space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-950">Confirm Test Submission</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Are you sure you want to finalize your assessment? Your score and performance breakdown will be generated immediately.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Answered</div>
                  <div className="text-lg font-bold text-slate-950">{answeredCount}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Unanswered</div>
                  <div className="text-lg font-bold text-slate-950">{unansweredCount}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Flagged</div>
                  <div className="text-lg font-bold text-slate-950">{flaggedCount}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="btn-secondary !min-h-9 text-xs"
                >
                  Continue Test
                </button>
                <button
                  type="button"
                  onClick={executeSubmit}
                  disabled={isSubmitting}
                  className="btn-primary !min-h-9 text-xs font-semibold"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. RESULT VIEW */}
        {testState === 'result' && testResult && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    TEST EVALUATION COMPLETED
                  </span>
                  <h1 className="text-2xl font-bold text-slate-950 mt-1">
                    {testResult.title}
                  </h1>
                </div>
                <a href="/aptitude" className="btn-primary !min-h-9 !py-1.5 !px-4 text-xs self-start sm:self-auto">
                  Back to Hub
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Score</div>
                  <div className="text-xl font-bold text-slate-950 mt-1">{testResult.score} / {testResult.totalQuestions}</div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Accuracy</div>
                  <div className="text-xl font-bold text-slate-950 mt-1">{testResult.accuracy}%</div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Attempted</div>
                  <div className="text-xl font-bold text-slate-950 mt-1">{testResult.attemptedCount}</div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Correct</div>
                  <div className="text-xl font-bold text-slate-950 mt-1">{testResult.correctCount}</div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Incorrect</div>
                  <div className="text-xl font-bold text-slate-950 mt-1">{testResult.incorrectCount}</div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Time Taken</div>
                  <div className="text-xl font-bold text-slate-950 mt-1">{formatTimer(testResult.timeTakenSeconds || 0)}</div>
                </div>
              </div>

              {/* Category Breakdown */}
              {testResult.categoryPerformance && Object.keys(testResult.categoryPerformance).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Category Performance</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(testResult.categoryPerformance).map(([cat, perf]) => (
                      <div key={cat} className="p-3.5 rounded-lg border border-slate-200 bg-white shadow-xs">
                        <div className="text-xs font-semibold text-slate-700 truncate">{cat}</div>
                        <div className="text-lg font-bold text-slate-950 mt-1">{perf.accuracy}%</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{perf.correct} of {perf.total} correct</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic Performance Breakdown Table */}
              {testResult.topicPerformance && Object.keys(testResult.topicPerformance).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Topic Performance Breakdown</h3>
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="p-2.5">Topic / Chapter</th>
                          <th className="p-2.5">Attempted</th>
                          <th className="p-2.5">Correct</th>
                          <th className="p-2.5 text-right">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(testResult.topicPerformance).map(([tName, tPerf]) => (
                          <tr key={tName} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-medium text-slate-900">{tName}</td>
                            <td className="p-2.5 text-slate-600">{tPerf.attempted} / {tPerf.total}</td>
                            <td className="p-2.5 text-slate-600">{tPerf.correct}</td>
                            <td className="p-2.5 text-right font-bold text-slate-950">{tPerf.accuracy}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Strong Topics */}
              {testResult.strongTopics && testResult.strongTopics.length > 0 && (
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span>★ Strong Topics (High Accuracy)</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {testResult.strongTopics.map((top) => (
                      <span
                        key={top}
                        className="inline-flex items-center rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800"
                      >
                        ✓ {top}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Topics & Practice Shortcuts */}
              {testResult.weakTopics && testResult.weakTopics.length > 0 && (
                <div className="p-4 rounded-lg border border-slate-300 bg-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                    <span>⚠️ Recommended Topic Practice</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Based on your test response analysis, focusing on these topics will boost your accuracy:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {testResult.weakTopics.map((top) => (
                      <a
                        key={top}
                        href={`/aptitude/practice?chapter=${encodeURIComponent(top)}`}
                        className="inline-flex items-center gap-1.5 rounded bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                      >
                        <span>Practice {top}</span>
                        <span>→</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Performance Analysis & Solutions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-950">
                Detailed Solutions & Step-by-Step Explanations
              </h3>

              <div className="divide-y divide-slate-100 space-y-4 pt-2">
                {testResult.questionsWithExplanations?.map((q, idx) => (
                  <div key={q.id} className="pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Q{idx + 1}.</span>
                      <span className="text-xs font-semibold text-slate-700 rounded bg-slate-100 px-2 py-0.5">{q.chapter}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">{q.question}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded border ${
                            oIdx === q.correctAnswerIndex
                              ? 'border-slate-950 bg-slate-950 text-white font-semibold'
                              : 'border-slate-200 bg-slate-50 text-slate-700'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                      <strong className="text-slate-950">Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AptitudeTest
