import { useState, useRef, useCallback, useEffect } from 'react'

export function QuestionPanel({ question, questionIndex, onListenSupported }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const utteranceRef = useRef(null)

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
    setSpeechSupported(supported)
    if (onListenSupported) {
      onListenSupported(supported)
    }
  }, [onListenSupported])

  // Stop speech when question changes
  useEffect(() => {
    if (speechSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [questionIndex, speechSupported])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSupported && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [speechSupported])

  const handleListen = useCallback(() => {
    if (!speechSupported || !question?.question) return

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(question.question)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    utterance.pitch = 1

    // Attempt to pick a natural English voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')
    )
    const english = voices.find((v) => v.lang.startsWith('en'))
    if (preferred) {
      utterance.voice = preferred
    } else if (english) {
      utterance.voice = english
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [question, speechSupported])

  if (!question) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <p className="text-sm text-slate-500">No question data available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
      {/* Question metadata */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-slate-700">
          {question.type || 'General'}
        </span>
        {question.topic && (
          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-2xs font-medium text-slate-600">
            {question.topic}
          </span>
        )}
        {question.difficulty && (
          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-2xs font-medium text-slate-600">
            {question.difficulty}
          </span>
        )}
      </div>

      {/* Question Text */}
      <p className="text-sm sm:text-base font-medium text-slate-950 leading-relaxed">
        {question.question}
      </p>

      {/* Listen Button */}
      {speechSupported && (
        <button
          type="button"
          onClick={handleListen}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 active:scale-95 cursor-pointer"
        >
          {isSpeaking ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10h6v4H9z" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Listen to Question
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default QuestionPanel
