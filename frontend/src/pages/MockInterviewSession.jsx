import { useState, useEffect, useRef, useCallback } from 'react'
import useAuth from '../hooks/useAuth'
import InterviewHeader from '../components/mockInterview/session/InterviewHeader'
import QuestionPanel from '../components/mockInterview/session/QuestionPanel'
import AnswerEditor from '../components/mockInterview/session/AnswerEditor'
import InterviewMonitor from '../components/mockInterview/session/InterviewMonitor'
import SubmitInterviewModal from '../components/mockInterview/session/SubmitInterviewModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getSessionIdFromPath() {
  const pathname = window.location.pathname
  const parts = pathname.split('/')
  const sessionIndex = parts.indexOf('session')
  if (
    sessionIndex !== -1 &&
    parts[sessionIndex + 1] &&
    parts[sessionIndex + 1] !== 'check' &&
    parts[sessionIndex + 1] !== 'result'
  ) {
    return parts[sessionIndex + 1]
  }
  return ''
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export function MockInterviewSession() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()

  const sessionId = getSessionIdFromPath()

  // Session state
  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { [questionId]: answerText }
  const [answeredSet, setAnsweredSet] = useState(new Set())

  // Loading / error
  const [pageState, setPageState] = useState('loading') // 'loading' | 'ready' | 'error' | 'completed' | 'abandoned'
  const [errorMessage, setErrorMessage] = useState('')

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const savingRef = useRef(false)

  // Submit state
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submittedRef = useRef(false)

  // Media streams
  const [cameraStream, setCameraStream] = useState(null)
  const [micStream, setMicStream] = useState(null)
  const [screenStream, setScreenStream] = useState(null)

  // Start API guard
  const startCalledRef = useRef(false)

  // Beforeunload warning
  useEffect(() => {
    if (pageState !== 'ready') return

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = 'Your interview is still in progress. Are you sure you want to leave?'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pageState])

  // Media streams setup
  useEffect(() => {
    let mounted = true

    const acquireStreams = async () => {
      // Camera
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const cam = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          })
          if (mounted) {
            setCameraStream(cam)
          } else {
            cam.getTracks().forEach((t) => t.stop())
          }
        }
      } catch {
        // Camera unavailable
      }

      // Microphone
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
          if (mounted) {
            setMicStream(mic)
          } else {
            mic.getTracks().forEach((t) => t.stop())
          }
        }
      } catch {
        // Mic unavailable
      }
    }

    acquireStreams()

    return () => {
      mounted = false
    }
  }, [])

  // Clean up media streams
  const cleanupStreams = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop())
      setCameraStream(null)
    }
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop())
      setMicStream(null)
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop())
      setScreenStream(null)
    }
  }, [cameraStream, micStream, screenStream])

  // Start the session
  useEffect(() => {
    if (!sessionId || !isAuthenticated || isAuthLoading || startCalledRef.current) return

    startCalledRef.current = true

    const startSession = async () => {
      try {
        const res = await fetch(`${API_URL}/api/mock-interviews/${sessionId}/start`, {
          method: 'POST',
          headers: getAuthHeaders(),
        })

        const data = await res.json()

        if (res.status === 401) {
          window.location.href = '/login'
          return
        }

        if (res.status === 403) {
          setPageState('error')
          setErrorMessage('You do not have permission to access this interview session.')
          return
        }

        if (!res.ok || !data.success) {
          const errMsg = data.error || ''
          if (errMsg.toLowerCase().includes('completed')) {
            setPageState('completed')
            setErrorMessage('This interview has already been completed.')
            return
          }
          if (errMsg.toLowerCase().includes('abandoned')) {
            setPageState('abandoned')
            setErrorMessage('This interview session was abandoned.')
            return
          }
          setPageState('error')
          setErrorMessage(errMsg || 'Unable to start this interview session.')
          return
        }

        const sessionData = data.session
        setSession(sessionData)

        const qs = sessionData.questions || []
        setQuestions(qs)

        // Populate existing answers from session
        const existingAnswers = {}
        const existingAnswered = new Set()
        for (const q of qs) {
          const qId = q._id || q.id
          if (q.userAnswer && q.userAnswer.trim()) {
            existingAnswers[qId] = q.userAnswer
            existingAnswered.add(qId)
          } else {
            existingAnswers[qId] = ''
          }
        }
        setAnswers(existingAnswers)
        setAnsweredSet(existingAnswered)
        setPageState('ready')
      } catch {
        setPageState('error')
        setErrorMessage('Unable to connect to the server. Please check your connection and try again.')
      }
    }

    startSession()
  }, [sessionId, isAuthenticated, isAuthLoading])

  // Save answer to backend
  const saveAnswer = useCallback(
    async (questionId, answerText) => {
      if (!sessionId || !questionId || savingRef.current) return

      savingRef.current = true
      setIsSaving(true)
      setSaveStatus('')

      try {
        const res = await fetch(`${API_URL}/api/mock-interviews/${sessionId}/answer`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ questionId, userAnswer: answerText }),
        })

        const data = await res.json()

        if (res.ok && data.success) {
          setSaveStatus('Answer saved')
        } else {
          setSaveStatus('Could not save')
        }
      } catch {
        setSaveStatus('Could not save')
      } finally {
        savingRef.current = false
        setIsSaving(false)

        setTimeout(() => setSaveStatus(''), 2500)
      }
    },
    [sessionId]
  )

  // Update local answer state on typing
  const handleChangeAnswer = useCallback((newAnswer) => {
    const q = questions[currentIndex]
    if (!q) return
    const qId = q._id || q.id

    setAnswers((prev) => ({ ...prev, [qId]: newAnswer }))

    if (newAnswer.trim()) {
      setAnsweredSet((prev) => new Set(prev).add(qId))
    } else {
      setAnsweredSet((prev) => {
        const next = new Set(prev)
        next.delete(qId)
        return next
      })
    }
  }, [questions, currentIndex])

  // Navigation: save current before moving
  const handleNavigate = useCallback(
    async (direction) => {
      const q = questions[currentIndex]
      if (q) {
        const qId = q._id || q.id
        const currentAns = answers[qId] || ''
        await saveAnswer(qId, currentAns)
      }

      if (direction === 'prev' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1)
      } else if (direction === 'next' && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1)
      }
    },
    [currentIndex, questions, answers, saveAnswer]
  )

  // Direct question dot jump: save current before jumping
  const handleSelectQuestion = useCallback(
    async (targetIndex) => {
      if (targetIndex === currentIndex) return
      const q = questions[currentIndex]
      if (q) {
        const qId = q._id || q.id
        const currentAns = answers[qId] || ''
        await saveAnswer(qId, currentAns)
      }
      setCurrentIndex(targetIndex)
    },
    [currentIndex, questions, answers, saveAnswer]
  )

  // Manual screen share request inside interview
  const handleStartScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) return
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const track = stream.getVideoTracks()[0]
      if (track) {
        track.onended = () => {
          setScreenStream(null)
        }
      }
      setScreenStream(stream)
    } catch {
      // User cancelled screen share prompt
    }
  }, [])

  // Submit interview
  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || isSubmitting) return
    submittedRef.current = true
    setIsSubmitting(true)

    try {
      // Save current question answer first
      const q = questions[currentIndex]
      if (q) {
        const qId = q._id || q.id
        const currentAns = answers[qId] || ''
        await saveAnswer(qId, currentAns)
      }

      // Calculate duration
      const startTime = session?.startedAt
        ? new Date(session.startedAt).getTime()
        : Date.now()
      const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000))

      // Build answers batch
      const answersBatch = questions.map((que) => {
        const qId = que._id || que.id
        return {
          questionId: qId,
          userAnswer: answers[qId] || '',
        }
      })

      const res = await fetch(`${API_URL}/api/mock-interviews/${sessionId}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answers: answersBatch, duration }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        cleanupStreams()
        window.onbeforeunload = null
        window.location.href = `/mock-interview/session/${sessionId}/result`
      } else {
        submittedRef.current = false
        setIsSubmitting(false)
        setShowSubmitModal(false)
        setErrorMessage(data.error || 'Unable to submit the interview. Please try again.')
      }
    } catch {
      submittedRef.current = false
      setIsSubmitting(false)
      setShowSubmitModal(false)
      setErrorMessage('Unable to submit. Please check your connection and try again.')
    }
  }, [questions, currentIndex, answers, session, sessionId, isSubmitting, saveAnswer, cleanupStreams])

  // Current question references
  const currentQuestion = questions[currentIndex] || null
  const currentQuestionId = currentQuestion ? currentQuestion._id || currentQuestion.id : ''
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === questions.length - 1

  // Auth loading
  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6" aria-busy="true">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-xs mb-2.5 animate-pulse">
            P
          </div>
          <p className="text-xs font-medium text-slate-600">Verifying session...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    window.location.href = '/login'
    return null
  }

  // Loading state
  if (pageState === 'loading') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white font-bold text-xs animate-pulse">
            P
          </div>
          <p className="text-sm font-medium text-slate-700">Loading interview...</p>
          <p className="text-xs text-slate-500 font-medium">Preparing your session</p>
        </div>
      </main>
    )
  }

  // Error / completed / abandoned states
  if (pageState === 'error' || pageState === 'completed' || pageState === 'abandoned') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {pageState === 'completed' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              )}
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-950">
            {pageState === 'completed'
              ? 'Interview Completed'
              : pageState === 'abandoned'
              ? 'Session Unavailable'
              : 'Unable to Load Interview'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">{errorMessage}</p>
          <div className="flex gap-2.5 justify-center pt-2">
            {pageState === 'completed' && (
              <a
                href={`/mock-interview/session/${sessionId}/result`}
                className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all duration-150"
              >
                View Results
              </a>
            )}
            <a
              href="/mock-interview"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
            >
              Back to Setup
            </a>
          </div>
        </div>
      </main>
    )
  }

  // Ready state — main interview UI
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col antialiased">
      {/* Header */}
      <InterviewHeader
        user={user}
        interviewType={session?.interviewType}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        answeredCount={answeredSet.size}
        startedAt={session?.startedAt}
      />

      {/* Error Banner */}
      {errorMessage && pageState === 'ready' && (
        <div className="mx-auto max-w-5xl w-full px-4 pt-3 sm:px-6">
          <div
            role="alert"
            className="rounded-lg border border-slate-300 bg-slate-50 p-3 flex items-start justify-between gap-2 text-xs font-medium text-slate-900"
          >
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-950 shrink-0">Notice:</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-slate-500 hover:text-slate-900 text-xs font-bold shrink-0 p-0.5 cursor-pointer focus:outline-none"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
          {/* Left: Question + Answer */}
          <div className="flex-1 min-w-0 space-y-4">
            <QuestionPanel
              question={currentQuestion}
              questionIndex={currentIndex}
            />

            <AnswerEditor
              questionId={currentQuestionId}
              answer={answers[currentQuestionId] || ''}
              onChangeAnswer={handleChangeAnswer}
              onSave={(qId, text) => saveAnswer(qId, text)}
              isSaving={isSaving}
              saveStatus={saveStatus}
            />

            {/* Navigation Bar */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleNavigate('prev')}
                disabled={isFirstQuestion || isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {/* Question dots (compact) */}
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-center max-w-[200px]">
                {questions.map((q, i) => {
                  const qId = q._id || q.id
                  const isActive = i === currentIndex
                  const isAnswered = answeredSet.has(qId)
                  return (
                    <button
                      key={qId}
                      type="button"
                      onClick={() => handleSelectQuestion(i)}
                      className={`h-2.5 w-2.5 rounded-full transition-all duration-150 cursor-pointer focus:outline-none ${
                        isActive
                          ? 'bg-slate-950 scale-125'
                          : isAnswered
                          ? 'bg-slate-600'
                          : 'bg-slate-300'
                      }`}
                      title={`Question ${i + 1}${isAnswered ? ' (answered)' : ''}`}
                      aria-label={`Go to question ${i + 1}`}
                    />
                  )
                })}
              </div>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] cursor-pointer"
                >
                  Submit Interview
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNavigate('next')}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] cursor-pointer"
                >
                  Next
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Right: Monitoring Panel */}
          <div className="w-full lg:w-64 xl:w-72 shrink-0">
            <div className="lg:sticky lg:top-[60px]">
              <InterviewMonitor
                cameraStream={cameraStream}
                micStream={micStream}
                screenStream={screenStream}
                onCameraLost={() => setCameraStream(null)}
                onMicLost={() => setMicStream(null)}
                onScreenLost={() => setScreenStream(null)}
                onStartScreenShare={handleStartScreenShare}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-2.5 px-4 text-center text-2xs text-slate-500">
        PrepMate Placement Preparation Platform · Interview in Progress
      </footer>

      {/* Submit Modal */}
      <SubmitInterviewModal
        isOpen={showSubmitModal}
        isSubmitting={isSubmitting}
        onCancel={() => {
          if (!isSubmitting) setShowSubmitModal(false)
        }}
        onConfirm={handleSubmit}
      />
    </div>
  )
}

export default MockInterviewSession

