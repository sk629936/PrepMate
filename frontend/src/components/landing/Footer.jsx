const navigationGroups = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Preparation', href: '#preparation' },
      { label: 'Mock Tests' },
      { label: 'AI Interview', href: '#ai' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'DSA' },
      { label: 'Aptitude' },
      { label: 'Core CS' },
      { label: 'Interview' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'About' },
      { label: 'Contact' },
      { label: 'Privacy' },
      { label: 'Terms' },
    ],
  },
]

function FooterLink({ label, href }) {
  const isPlaceholder = !href

  const handlePlaceholderClick = (event) => {
    if (isPlaceholder) {
      event.preventDefault()
    }
  }

  return (
    <a
      href={href || '#future-module'}
      onClick={handlePlaceholderClick}
      className="inline-flex min-h-8 items-center text-sm text-slate-500 transition-colors duration-200 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
      title={isPlaceholder ? 'Available in a future module' : undefined}
      aria-label={isPlaceholder ? `${label} (available in a future module)` : label}
    >
      {label}
    </a>
  )
}

function Footer() {
  return (
    <footer className="bg-white" role="contentinfo">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr] lg:gap-12">
          <div className="max-w-sm">
            <a
              href="#top"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-950 transition-colors duration-200 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-700 text-sm font-bold text-white" aria-hidden="true">P</span>
              PrepMate
            </a>
            <p className="mt-4 text-sm font-medium text-slate-700">Prepare smarter. Get placement ready.</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">A focused placement preparation platform for students building the skills they need for technical and placement assessments.</p>
          </div>

          {navigationGroups.map((group) => (
            <nav key={group.title} aria-label={`${group.title.toLowerCase()} links`}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900">{group.title}</h2>
              <div className="mt-4 flex flex-col items-start gap-1">
                {group.links.map((link) => (
                  <FooterLink key={link.label} {...link} />
                ))}
              </div>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 PrepMate. All rights reserved.</p>
          <p>Built for placement preparation.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
