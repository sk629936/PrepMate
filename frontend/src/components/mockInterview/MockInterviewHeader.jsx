export function MockInterviewHeader({ user, logout }) {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const isSetup = currentPath === '/mock-interview'
  const isHistory = currentPath === '/mock-interview/history'
  const isProgress = currentPath === '/mock-interview/progress'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm transition-all duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 rounded-md transition-transform duration-150 active:scale-95"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-xs font-bold text-white shadow-2xs"
              aria-hidden="true"
            >
              P
            </span>
            PrepMate
          </a>
          <span className="hidden sm:inline-block rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-slate-700">
            Mock Interview
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Navigation Links */}
          <nav aria-label="Mock Interview Primary" className="hidden sm:flex items-center gap-1.5">
            <a
              href="/mock-interview"
              className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs transition-all duration-150 active:scale-95 ${
                isSetup
                  ? 'bg-slate-950 text-white border-slate-950 font-bold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-950 hover:border-slate-300'
              }`}
            >
              Setup
            </a>
            <a
              href="/mock-interview/history"
              className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs transition-all duration-150 active:scale-95 ${
                isHistory
                  ? 'bg-slate-950 text-white border-slate-950 font-bold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-950 hover:border-slate-300'
              }`}
            >
              History
            </a>
            <a
              href="/mock-interview/progress"
              className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs transition-all duration-150 active:scale-95 ${
                isProgress
                  ? 'bg-slate-950 text-white border-slate-950 font-bold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-950 hover:border-slate-300'
              }`}
            >
              Progress
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 hover:border-slate-300 transition-all duration-150 active:scale-95"
            >
              Dashboard
            </a>
          </nav>

          {user && (
            <div className="hidden md:flex flex-col text-right leading-tight">
              <span className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
                {user.fullName || 'Candidate'}
              </span>
              <span className="text-2xs text-slate-500 truncate max-w-[140px]">
                {user.email}
              </span>
            </div>
          )}

          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
            title={user?.fullName || 'User'}
          >
            {(user?.fullName || 'U').charAt(0).toUpperCase()}
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 hover:border-slate-300 transition-all duration-150 active:scale-95"
            aria-label="Sign out of account"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (Responsive for 375px screens) */}
      <nav
        aria-label="Mock Interview Mobile Sub-Navigation"
        className="sm:hidden border-t border-slate-200 bg-slate-50/80 px-3 py-1.5 flex items-center justify-around text-2xs font-semibold"
      >
        <a
          href="/mock-interview"
          className={`px-2.5 py-1 rounded transition-colors ${
            isSetup ? 'bg-slate-950 text-white font-bold' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          Setup
        </a>
        <a
          href="/mock-interview/history"
          className={`px-2.5 py-1 rounded transition-colors ${
            isHistory ? 'bg-slate-950 text-white font-bold' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          History
        </a>
        <a
          href="/mock-interview/progress"
          className={`px-2.5 py-1 rounded transition-colors ${
            isProgress ? 'bg-slate-950 text-white font-bold' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          Progress
        </a>
        <a
          href="/dashboard"
          className="px-2.5 py-1 rounded text-slate-600 hover:text-slate-950 transition-colors"
        >
          Dashboard
        </a>
      </nav>
    </header>
  )
}

export default MockInterviewHeader
