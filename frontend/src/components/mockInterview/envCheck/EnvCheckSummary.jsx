export function EnvCheckSummary({
  cameraReady,
  micReady,
  screenReady,
  onStartInterview,
}) {
  const allReady = cameraReady && micReady && screenReady

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-150">
      <div className="space-y-1.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Interview Requirements Checklist
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-4 w-4 rounded-full flex items-center justify-center text-2xs font-bold ${
                cameraReady
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {cameraReady ? '✓' : '•'}
            </span>
            <span className={cameraReady ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              Camera
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`h-4 w-4 rounded-full flex items-center justify-center text-2xs font-bold ${
                micReady
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {micReady ? '✓' : '•'}
            </span>
            <span className={micReady ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              Microphone
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`h-4 w-4 rounded-full flex items-center justify-center text-2xs font-bold ${
                screenReady
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {screenReady ? '✓' : '•'}
            </span>
            <span className={screenReady ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              Screen sharing
            </span>
          </div>
        </div>

        <p className="text-2xs text-slate-500">
          {allReady
            ? 'All device checks passed. Ready to begin interview.'
            : 'Complete all 3 checks to unlock the interview room.'}
        </p>
      </div>

      <button
        type="button"
        disabled={!allReady}
        onClick={onStartInterview}
        className="w-full sm:w-auto inline-flex items-center justify-center min-w-[160px] rounded-lg bg-slate-950 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1"
      >
        Start Interview
      </button>
    </div>
  )
}

export default EnvCheckSummary
