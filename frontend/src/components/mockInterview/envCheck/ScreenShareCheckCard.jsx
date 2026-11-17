export function ScreenShareCheckCard({
  status, // 'idle' | 'checking' | 'ready' | 'blocked' | 'failed' | 'stopped'
  errorMessage,
  onStartCheck,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950">Screen Sharing</h3>
            <p className="text-2xs text-slate-500">Workspace &amp; proctoring verification</p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {status === 'ready' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-2xs font-semibold text-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
              Screen Share Ready
            </span>
          )}
          {status === 'checking' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-700 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              Requesting...
            </span>
          )}
          {status === 'stopped' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-2xs font-semibold text-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              Screen Share Stopped
            </span>
          )}
          {(status === 'blocked' || status === 'failed') && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-2xs font-semibold text-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              Sharing Required
            </span>
          )}
          {status === 'idle' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-2xs font-medium text-slate-500">
              Not checked
            </span>
          )}
        </div>
      </div>

      {/* Screen Share Status Description Card */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
        <p className="text-xs text-slate-800 font-semibold">
          {status === 'ready'
            ? 'Screen stream active and verified.'
            : status === 'stopped'
            ? 'Screen sharing was stopped. Please re-share your screen to proceed.'
            : 'Your screen will be visible during the mock interview.'}
        </p>
        <p className="text-2xs text-slate-500 leading-normal">
          {status === 'blocked' || status === 'failed'
            ? errorMessage || 'Screen sharing is required to start this interview.'
            : 'Select your entire screen or active application window when prompted.'}
        </p>
      </div>

      {/* Action / Re-share Button */}
      <div className="pt-1 flex items-center justify-between">
        <span className="text-2xs text-slate-500">
          {status === 'ready' ? 'Display capture active' : 'User authorization required'}
        </span>

        {status !== 'ready' && (
          <button
            type="button"
            onClick={onStartCheck}
            disabled={status === 'checking'}
            className="inline-flex items-center justify-center rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50 transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          >
            {status === 'checking'
              ? 'Requesting...'
              : status === 'ready'
              ? 'Ready'
              : status === 'stopped' || status === 'blocked' || status === 'failed'
              ? 'Share Screen Again'
              : 'Share Screen'}
          </button>
        )}
      </div>
    </div>
  )
}

export default ScreenShareCheckCard
