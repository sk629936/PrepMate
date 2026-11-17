import { useEffect, useRef } from 'react'

export function CameraCheckCard({
  status, // 'idle' | 'checking' | 'ready' | 'blocked' | 'failed'
  stream,
  errorMessage,
  onStartCheck,
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream && status === 'ready') {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {
        // Autoplay handled
      })
    }
  }, [stream, status])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950">Camera</h3>
            <p className="text-2xs text-slate-500">Live video verification</p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {status === 'ready' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-2xs font-semibold text-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
              Camera Ready
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

      {/* Video Preview or Placeholder Box */}
      <div className="relative aspect-video w-full rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
        {status === 'ready' && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <div className="text-center p-4 space-y-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xs text-slate-400 max-w-[200px] mx-auto">
              {status === 'checking'
                ? 'Requesting camera access...'
                : status === 'blocked' || status === 'failed'
                ? errorMessage || 'Camera access is required for the interview.'
                : 'Camera preview will appear here once connected.'}
            </p>
          </div>
        )}
      </div>

      {/* Action / Retry Button */}
      <div className="pt-1 flex items-center justify-between">
        <span className="text-2xs text-slate-500">
          {status === 'ready' ? 'Video stream active' : 'Prompted via browser'}
        </span>

        {status !== 'ready' && (
          <button
            type="button"
            onClick={onStartCheck}
            disabled={status === 'checking'}
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50 transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          >
            {status === 'checking' ? 'Connecting...' : status === 'blocked' || status === 'failed' ? 'Try Again' : 'Enable Camera'}
          </button>
        )}
      </div>
    </div>
  )
}

export default CameraCheckCard
