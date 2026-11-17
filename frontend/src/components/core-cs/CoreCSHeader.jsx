import { useState } from 'react'

export function CoreCSHeader({ user, logout, breadcrumb, activeSection }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Subjects', href: '/core-cs', id: 'subjects' },
    { label: 'Practice', href: '/core-cs/practice', id: 'practice' },
    { label: 'Full Tests', href: '/core-cs/test', id: 'test' },
    { label: 'My Progress', href: '/core-cs/progress', id: 'progress' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand and Breadcrumbs */}
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2.5 text-base sm:text-lg font-semibold tracking-tight text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 rounded-md"
          >
            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-slate-950 text-xs sm:text-sm font-bold text-white">
              P
            </span>
            <span className="hidden xs:inline">PrepMate</span>
          </a>
          <span className="text-slate-300">/</span>
          <a
            href="/core-cs"
            className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-slate-950 transition-colors"
          >
            Core CS
          </a>
          {breadcrumb && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-xs sm:text-sm font-medium text-slate-600 truncate max-w-[140px] sm:max-w-[240px]">
                {breadcrumb}
              </span>
            </>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Core CS Sections">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id
            return (
              <a
                key={link.id}
                href={link.href}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2">
          <a
            href="/dashboard"
            className="hidden sm:inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Dashboard
          </a>

          {user?.role === 'admin' && (
            <a
              href="/admin/core-cs"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Admin Portal
            </a>
          )}

          {user && (
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-600">
              <span className="font-medium text-slate-900">{user.fullName || user.email}</span>
            </div>
          )}

          {logout && (
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Sign Out
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-1.5 text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`px-3 py-2 text-center text-xs font-semibold rounded-md ${
                  activeSection === link.id
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1 text-xs">
            <a href="/dashboard" className="font-medium text-slate-600 hover:text-slate-950">
              ← Return to Dashboard
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

export default CoreCSHeader
