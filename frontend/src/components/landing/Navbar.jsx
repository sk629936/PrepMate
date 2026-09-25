import { useState } from 'react'

const navigationLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'AI', href: '#ai' },
  { label: 'Resources', href: '#resources' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
        aria-label="Primary navigation"
      >
        <a
          href="#top"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-950 transition-colors duration-200 hover:text-primary-700"
          onClick={closeMenu}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-700 text-sm font-bold text-white"
            aria-hidden="true"
          >
            P
          </span>
          PrepMate
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {navigationLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-950"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <a
            href="/login"
            className="btn-secondary min-h-10 px-3.5"
          >
            Login
          </a>
          <a
            href="#get-started"
            className="btn-primary min-h-10 px-4"
          >
            Get Started
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-primary-300 md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span className="h-0.5 w-full bg-current" />
            <span className="h-0.5 w-full bg-current" />
            <span className="h-0.5 w-full bg-current" />
          </span>
        </button>
      </nav>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-gray-100 transition-[max-height,opacity] duration-200 md:hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col px-5 pb-5 pt-2 sm:px-8">
          {navigationLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-950"
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-5 pt-4">
            <a
              href="/login"
              className="btn-secondary min-h-10 px-3.5"
              onClick={closeMenu}
            >
              Login
            </a>
            <a
              href="#get-started"
              className="btn-primary min-h-10 px-4"
              onClick={closeMenu}
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
