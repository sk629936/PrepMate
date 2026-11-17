import InterviewTimer from './InterviewTimer'

export function InterviewHeader({
  user,
  interviewType,
  currentIndex,
  totalQuestions,
  answeredCount,
  startedAt,
}) {
  const formattedType = interviewType
    ? interviewType.charAt(0).toUpperCase() + interviewType.slice(1)
    : 'Interview'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        {/* Left: Brand + Type */}
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-xs font-bold text-white shadow-2xs shrink-0"
            aria-hidden="true"
          >
            P
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-950 hidden sm:inline">
              PrepMate
            </span>
            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-slate-700">
              {formattedType}
            </span>
          </div>
        </div>

        {/* Center: Progress */}
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm font-bold text-slate-950">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-2xs text-slate-500">
            {answeredCount} answered
          </span>
        </div>

        {/* Right: Timer + User */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <InterviewTimer startedAt={startedAt} />
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shrink-0"
            title={user?.fullName || 'User'}
          >
            {(user?.fullName || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-0.5 w-full bg-slate-100">
        <div
          className="h-full bg-slate-950 transition-all duration-300 ease-out"
          style={{
            width: `${totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0}%`,
          }}
        />
      </div>
    </header>
  )
}

export default InterviewHeader
