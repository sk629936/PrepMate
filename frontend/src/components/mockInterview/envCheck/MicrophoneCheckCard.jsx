import { useEffect, useState, useRef } from 'react'

export function MicrophoneCheckCard({
  status, // 'idle' | 'checking' | 'ready' | 'blocked' | 'failed'
  stream,
  errorMessage,
  onStartCheck,
}) {
  const [audioLevel, setAudioLevel] = useState(0) // 0 to 5
  const audioContextRef = useRef(null)
  const animFrameRef = useRef(null)

  useEffect(() => {
    if (status === 'ready' && stream) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return

        const audioCtx = new AudioContext()
        audioContextRef.current = audioCtx

        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const sampleAudio = () => {
          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const avg = sum / dataArray.length
          // Normalize to level 0 - 5
          const normalizedLevel = Math.min(Math.floor(avg / 15), 5)
          setAudioLevel(normalizedLevel)

          animFrameRef.current = requestAnimationFrame(sampleAudio)
        }

        sampleAudio()
      } catch (err) {
        console.warn('Audio level monitoring initialization:', err)
      }
    } else {
      setAudioLevel(0)
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {})
      }
    }
  }, [status, stream])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950">Microphone</h3>
            <p className="text-2xs text-slate-500">Audio input &amp; level check</p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {status === 'ready' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-2xs font-semibold text-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
              Microphone Ready
            </span>
          )}
          {status === 'checking' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-700 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              Checking...
            </span>
          )}
          {(status === 'blocked' || status === 'failed') && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-2xs font-semibold text-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              Access Required
            </span>
          )}
          {status === 'idle' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-2xs font-medium text-slate-500">
              Not checked
            </span>
          )}
        </div>
      </div>

      {/* Audio Visualizer Level Meter */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-col items-center justify-center space-y-2.5">
        <div className="flex items-center gap-1.5 h-6">
          {[1, 2, 3, 4, 5, 6].map((barIndex) => {
            const isActive = status === 'ready' && audioLevel >= (barIndex - 1)
            return (
              <div
                key={barIndex}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  isActive ? 'bg-slate-950 h-5' : 'bg-slate-300 h-2'
                }`}
              />
            )
          })}
        </div>

        <p className="text-2xs text-slate-600 text-center font-medium">
          {status === 'ready'
            ? 'Speak to test your input level'
            : status === 'checking'
            ? 'Connecting audio source...'
            : status === 'blocked' || status === 'failed'
            ? errorMessage || 'Microphone access is required for the interview.'
            : 'Click enable to verify your microphone.'}
        </p>
      </div>

      {/* Action / Retry Button */}
      <div className="pt-1 flex items-center justify-between">
        <span className="text-2xs text-slate-500">
          {status === 'ready' ? 'Live input active' : 'Prompted via browser'}
        </span>

        {status !== 'ready' && (
          <button
            type="button"
            onClick={onStartCheck}
            disabled={status === 'checking'}
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50 transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          >
            {status === 'checking' ? 'Connecting...' : status === 'blocked' || status === 'failed' ? 'Try Again' : 'Enable Microphone'}
          </button>
        )}
      </div>
    </div>
  )
}

export default MicrophoneCheckCard
