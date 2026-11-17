import { useState, useEffect, useRef } from 'react'

export function InterviewTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!startedAt) return

    const startTime = new Date(startedAt).getTime()

    const updateElapsed = () => {
      const now = Date.now()
      const diff = Math.max(0, Math.floor((now - startTime) / 1000))
      setElapsed(diff)
    }

    // Set immediately
    updateElapsed()

    // Update every second
    intervalRef.current = setInterval(updateElapsed, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [startedAt])

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
      <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-xs font-mono font-semibold text-slate-800 tabular-nums">
        {display}
      </span>
    </div>
  )
}

export default InterviewTimer
